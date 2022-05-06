const Component = require('../Component');

class MiddlewareNode {
	constructor() {
		this.middlewares = [];
	}

	get size() {
		return this.middlewares.length;
	}

	put(...middlewares) {
		this.middlewares.push(...middlewares);
	}
}

class PassageNode {
	constructor(passage) {
		this.passage = passage;
		this.childNodeList = [];
	}

	append(node) {
		this.childNodeList.push(node);
	}
}

class MethodNode extends MiddlewareNode {
	constructor(method) {
		super();

		this.method = method;
	}
}

function createNodeTree(router) {
	const root = new PassageNode({
		id: 'root',
		test: () => true,
		params: {}
	});

	(function NodeTree(router, parentPassageNode) {
		const routerPassageNode = router.hasPrefix
			? new PassageNode('prefix') //TODO a serial passage
			: parentPassageNode;

		if (routerPassageNode !== parentPassageNode) {
			parentPassageNode.append(routerPassageNode);
		}

		function createPassageNodeByPath(path) {
			let currentPassageNode = routerPassageNode;

			for (const passage of path) {
				const newPassageNode = new PassageNode(passage);

				currentPassageNode.append(newPassageNode);
				currentPassageNode = newPassageNode;
			}

			return currentPassageNode;
		}

		for (const component of router.componentList) {
			const passageNode = createPassageNodeByPath(component.path);

			if (component instanceof Component.Use) {
				let middlewareNode = new MiddlewareNode();

				for (const member of component.sequence) {
					if (typeof member === 'function') {
						middlewareNode.put(member);
					} else {
						if (middlewareNode.size > 0) {
							passageNode.append(middlewareNode);
							middlewareNode = new MiddlewareNode();
						}

						NodeTree(member, passageNode);
					}
				}

				if (middlewareNode.size > 0) {
					passageNode.append(middlewareNode);
				}
			} else if (component instanceof Component.Method) {
				for (const methodName of component.methods) {
					const methodNode = new MethodNode(methodName);

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

exports.Middleware = MiddlewareNode;
exports.Method = MethodNode;
exports.Passage = PassageNode;
exports.createTree = createNodeTree;