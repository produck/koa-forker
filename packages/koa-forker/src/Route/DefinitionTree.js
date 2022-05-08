const Node = require('./NodeTree');

function PathDefinitionNode(passage) {
	return {
		parent: null,
		passage,
		methods: {},
		childList: [],
		depth: 0
	};
}

function MethodDefinition() {
	return {
		middlewares: [],
		passageIndexList: [],
		count: 0,
		passage: null
	};
}

module.exports = function createPathTree(nodeTree) {
	const root = PathDefinitionNode(nodeTree.passage);

	function findOrCreateDefinitionNode(passage, parent) {
		const existed = parent.childList.find(node => node.passage === passage);

		if (existed) {
			return existed;
		}

		const newNode = PathDefinitionNode(passage);

		newNode.parent = parent;
		newNode.depth = parent.depth + 1;
		parent.childList.push(newNode);

		return newNode;
	}

	(function buildPathDefinitionTreeNode(currentPassageNode, current) {
		for (const node of currentPassageNode.childNodeList) {
			if (node instanceof Node.Method) {
				current.methods[node.method] = MethodDefinition();
			} else if (node instanceof Node.Passage) {
				const child = findOrCreateDefinitionNode(node.passage, current);

				buildPathDefinitionTreeNode(node, child);
			}
		}
	})(nodeTree, root);

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
				middlewares.push([]);
			}

			for (const childNode of current.childList) {
				mark(childNode);
			}
		})(node);
	}

	const indexMarkedPassageNodeSet = new Set();

	(function loadPathDefinitionTreeNode(currentPassageNode, current) {
		if (!indexMarkedPassageNodeSet.has(current)) {
			markPassageFirstMethod(current);
			indexMarkedPassageNodeSet.add(current);
		}

		for (const node of currentPassageNode.childNodeList) {
			if (node instanceof Node.Method) {
				const method = current.methods[node.method];

				method.middlewares.push(...node.middlewares);
				method.count += node.middlewares.length;
			} else if (node instanceof Node.Middleware) {
				loadMiddlewaresFromNode(current, node.middlewares);
			} else if (node instanceof Node.Passage) {
				const child = current.childList
					.find(child => child.passage === node.passage);

				loadPathDefinitionTreeNode(node, child);
			}
		}
	})(nodeTree, root);

	return root;
};
