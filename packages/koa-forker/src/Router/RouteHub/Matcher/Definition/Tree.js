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

const BuildingBySequenceNode = {
	MethodNode: (node, current) => {
		current.methods[node.method] = Node.Method();
	},
	PassageNode: (node, current) => {
		const child = findOrCreatePassageNode(node.passage, current);

		buildPathDefinitionTreeNode(node, child);
	},
	MiddlewareNode: () => {}
};

function buildPathDefinitionTreeNode(currentPassageNode, current) {
	for (const node of currentPassageNode.childNodeList) {
		BuildingBySequenceNode[node.constructor.name](node, current);
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

const LoadingBySequenceNode = {
	MethodNode: (node, current) => {
		const method = current.methods[node.method];

		method.middlewares.push(...node.middlewares);
		Object.assign(method.routerNames, node.routerNames);
		method.count += node.middlewares.length;
	},
	PassageNode: (node, current) => {
		const child = current.childList
			.find(child => child.passage === node.passage);

		loadPathDefinitionTreeNode(node, child);
	},
	MiddlewareNode: (node, current) => {
		loadMiddlewaresFromNode(current, node.middlewares);
	}
};

const indexMarkedPassageNodeSet = new WeakSet();

function loadPathDefinitionTreeNode(currentPassageNode, current) {
	Object.assign(current.pathNames, currentPassageNode.pathNames);

	if (!indexMarkedPassageNodeSet.has(current)) {
		markPassageFirstMethod(current);
		indexMarkedPassageNodeSet.add(current);
	}

	for (const node of currentPassageNode.childNodeList) {
		LoadingBySequenceNode[node.constructor.name](node, current);
	}
}

function DefinitionTree(passageSequenceTree) {
	const root = Node.Passage(passageSequenceTree.passage);

	buildPathDefinitionTreeNode(passageSequenceTree, root);
	loadPathDefinitionTreeNode(passageSequenceTree, root);

	return root;
}

exports.create = DefinitionTree;