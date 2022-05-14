const Node = require('./Node');

function findOrCreatePassageNode(passage, parent) {
	const existed = parent.childList.find(node => node.passage === passage);

	if (existed) {
		return existed;
	}

	const newNode = Node.Passage(passage);

	newNode.parent = parent;
	newNode.depth = parent.depth + 1;
	parent.childList.push(newNode);

	return newNode;
}

const BuildBySequenceNode = {
	MethodNode: (node, current) => {
		current.methods[node.method] = Node.Method();
	},
	PassageNode: (node, current) => {
		const child = findOrCreatePassageNode(node.passage, current);

		buildDefinitionTree(node, child);
	},
	MiddlewareNode: () => {}
};

function buildDefinitionTree(currentPassageNode, current) {
	for (const node of currentPassageNode.childNodeList) {
		BuildBySequenceNode[node.constructor.name](node, current);
	}
}

function loadMiddlewaresFromNode(node, middlewares) {
	(function append(current) {
		for (const name in current.methods) {
			current.methods[name].middlewares.push(...middlewares);
		}

		for (const childNode of current.childList) {
			append(childNode);
		}
	})(node);
}

function markPassageFirstMethod(node) {
	(function mark(current) {
		for (const name in current.methods) {
			const { passageIndexList, middlewares } = current.methods[name];

			passageIndexList.push(middlewares.length);
		}

		for (const childNode of current.childList) {
			mark(childNode);
		}
	})(node);
}

const LoadBySequenceNode = {
	MethodNode: (node, current) => {
		const method = current.methods[node.method];

		method.middlewares.push(...node.middlewares);
		Object.assign(method.routerNames, node.routerNames);
		method.count += node.middlewares.length;
	},
	PassageNode: (node, current) => {
		const child = current.childList
			.find(child => child.passage === node.passage);

		loadDefinitionTree(node, child);
	},
	MiddlewareNode: (node, current) => {
		loadMiddlewaresFromNode(current, node.middlewares);
	}
};

const indexMarkedPassageNodeSet = new WeakSet();

function loadDefinitionTree(currentPassageNode, current) {
	Object.assign(current.pathNames, currentPassageNode.pathNames);

	if (!indexMarkedPassageNodeSet.has(current)) {
		markPassageFirstMethod(current);
		indexMarkedPassageNodeSet.add(current);
	}

	for (const node of currentPassageNode.childNodeList) {
		LoadBySequenceNode[node.constructor.name](node, current);
	}
}

function create(passageSequenceTree) {
	const root = Node.Passage(passageSequenceTree.passage);

	buildDefinitionTree(passageSequenceTree, root);
	loadDefinitionTree(passageSequenceTree, root);

	return root;
}

exports.create = create;