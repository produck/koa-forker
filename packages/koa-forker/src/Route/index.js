const Component = require('../Component');
const Node = require('./Node');

module.exports = class Route {
	constructor() {
		this.map = new Map();
		this.stack = [];
	}

	compile(router) {
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

			function findOrCreatePassageNodeByPath(path) {
				let currentPassageNode = routerPassageNode;

				for (const passage of path) {
					const existed = currentPassageNode.childNodeList.find(node => {
						return node instanceof Node.Passage &&
							node.passage.id === passage.id;
					});

					if (existed) {
						currentPassageNode = existed;
					} else {
						const newPassageNode = new Node.Passage(passage);

						currentPassageNode.append(newPassageNode);
						currentPassageNode = newPassageNode;
					}
				}

				return currentPassageNode;
			}

			for (const component of router.componentList) {
				const passageNode = findOrCreatePassageNodeByPath(component.path);

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

		return this;
	}
};