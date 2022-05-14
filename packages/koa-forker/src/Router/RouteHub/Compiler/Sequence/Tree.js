const Node = require('./Node');
const Path = require('./Path');

function SequenceTree(router) {
	const root = new Node.Passage('');

	const Strategy = {
		UseComponent: function (component, passageNode) {
			let currentMiddlewareNode = new Node.Middleware();

			for (const member of component.sequence) {
				if (typeof member === 'function') {
					currentMiddlewareNode.put(member);
				} else {
					if (currentMiddlewareNode.size > 0) {
						passageNode.append(currentMiddlewareNode);
						currentMiddlewareNode = new Node.Middleware();
					}

					NodeTree(member, passageNode);
				}
			}

			if (currentMiddlewareNode.size > 0) {
				passageNode.append(currentMiddlewareNode);
			}
		},
		MethodComponent: function (component, passageNode) {
			for (const methodName of component.methods) {
				const methodNode = new Node.Method(methodName);

				passageNode.append(methodNode);

				if (router.name) {
					methodNode.routerNames[router.name] = true;
				}

				for (const member of component.sequence) {
					methodNode.put(member);
				}
			}
		}
	};

	function createPassageNode(passageList, sourcePassageNode, name = null) {
		let currentPassageNode = sourcePassageNode;

		for (const passage of passageList) {
			const newPassageNode = new Node.Passage(passage);

			currentPassageNode.append(newPassageNode);
			currentPassageNode = newPassageNode;
		}

		if (name !== null) {
			currentPassageNode.pathNames[name] = true;
		}

		return currentPassageNode;
	}

	function NodeTree(router, parentPassageNode) {
		const prefixPassageList = Path.toPassageList(router.prefix);
		const routerPassageNode = createPassageNode(prefixPassageList, parentPassageNode);

		for (const component of router.componentList) {
			const { name, passageList } = component;
			const passageNode = createPassageNode(passageList, routerPassageNode, name);

			Strategy[component.constructor.name](component, passageNode);
		}
	}

	NodeTree(router, root);

	return root;
}

exports.create = SequenceTree;