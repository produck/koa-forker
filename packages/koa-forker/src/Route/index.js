const Component = require('../Component');
const Node = require('./Node');

function createNodeTree(router) {
	const root = new Node.Passage({
		id: 'root',
		test: () => true,
		params: {}
	});

	(function NodeTree(router, parentPassageNode) {
		const routerPassageNode = router.hasPrefix
			? new Node.Passage('prefix') //TODO a serial passage
			: parentPassageNode;

		if (routerPassageNode !== parentPassageNode) {
			parentPassageNode.append(routerPassageNode);
		}

		function createPassageNodeByPath(path) {
			let currentPassageNode = routerPassageNode;

			for (const passage of path) {
				const newPassageNode = new Node.Passage(passage);

				currentPassageNode.append(newPassageNode);
				currentPassageNode = newPassageNode;
			}

			return currentPassageNode;
		}

		for (const component of router.componentList) {
			const passageNode = createPassageNodeByPath(component.path);

			if (component instanceof Component.Use) {
				let middlewareNode = new Node.Middleware();

				for (const member of component.sequence) {
					if (typeof member === 'function') {
						middlewareNode.put(member);
					} else {
						if (middlewareNode.size > 0) {
							passageNode.append(middlewareNode);
							middlewareNode = new Node.Middleware();
						}

						NodeTree(member, passageNode);
					}
				}

				if (middlewareNode.size > 0) {
					passageNode.append(middlewareNode);
				}
			} else if (component instanceof Component.Method) {
				for (const methodName of component.methods) {
					const methodNode = new Node.Method(methodName);

					passageNode.append(methodNode);

					for (const member of component.sequence) {
						methodNode.put(member);
					}
				}
			}
		}
	})(router, root);

	return root;
}

function SearchNode(passage) {
	return {
		id: passage.id,
		test: passage.test,
		methods: {},
		childList: []
	};
}

function createPathSearchTree(nodeTree) {
	const middlewaresStack = [];
	const stack = [SearchNode({})];

	function findOrCreateSearchNode(passage) {
		const currentChildList = stack[0].childList;
		const existed = currentChildList.find(node => node.id === passage.id);

		if (existed) {
			return existed;
		}

		const newSearchNode = SearchNode(passage);

		currentChildList.push(newSearchNode);

		return newSearchNode;
	}

	(function PathSearchTree(currentPassageNode) {
		const { childNodeList, passage } = currentPassageNode;
		const current = findOrCreateSearchNode(passage);

		stack.unshift(current);

		for (const node of childNodeList) {
			if (node instanceof Node.Method) {
				const { method, middlewares } = node;

				if (!current.methods[method]) {
					current.methods[method] = [];
				}

				current.methods[method]
					.push(...middlewaresStack.flat(), ...middlewares);
			} else if (node instanceof Node.Middleware) {
				middlewaresStack.push(node.middlewares);
				//TODO append existed
			} else if (node instanceof Node.Passage) {
				PathSearchTree(node);
			}
		}

		stack.shift();
	})(nodeTree);

	return stack[0];
}

module.exports = class Route {
	constructor(pathSearchTree) {
		this.root = pathSearchTree;
	}

	match(path) {
		const passageList = path.split('/');
	}

	static compile(router) {
		const nodeTree = createNodeTree(router);
		const pathSearchTree = createPathSearchTree(nodeTree);

		return pathSearchTree;
	}
};