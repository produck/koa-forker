const Component = require('../Component');
const Node = require('./Node');

module.exports = class Route {
	constructor() {
		this.map = new Map();
		this.stack = [];
	}

	compile(router) {
		const root = new Node.Path('*');

		(function resolveRouter(router, last) {
			const current = new Node.Path(null);

			last.append(current);

			function queryOrCreateNodeByPath(path) {
				const componentNode = new Node.Path(path);

				current.append(componentNode);

				return componentNode;
			}

			for (const component of router.componentList) {
				const componentNode = queryOrCreateNodeByPath(component.path);

				if (component instanceof Component.Use) {
					for (const member of component.sequence) {
						if (typeof member === 'function') {
							componentNode.put(member);
						} else {
							resolveRouter(member, componentNode);
						}
					}
				} else {
					for (const methodName of component.methods) {
						const methodNode = new Node.Method(methodName);

						componentNode.append(methodNode);

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