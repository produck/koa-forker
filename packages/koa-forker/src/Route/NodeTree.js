const Component = require('../Component');
const Path = require('../path');

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
		this.pathNames = {};
		this.routerNames = {};
	}
}

function createNodeTree(router) {
	const root = new PassageNode('');

	(function NodeTree(router, parentPassageNode) {
		function createPassageNodeByPath(passageList, sourcePassageNode) {
			let currentPassageNode = sourcePassageNode;

			for (const passage of passageList) {
				const newPassageNode = new PassageNode(passage);

				currentPassageNode.append(newPassageNode);
				currentPassageNode = newPassageNode;
			}

			return currentPassageNode;
		}

		const routerPassageNode = createPassageNodeByPath(
			Path.PassageList(router.prefix),
			parentPassageNode
		);

		for (const component of router.componentList) {
			const passageNode =
				createPassageNodeByPath(component.passageList, routerPassageNode);

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

					if (router.name) {
						methodNode.routerNames[router.name] = true;
					}

					if (component.name) {
						methodNode.pathNames[component.name] = true;
					}

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