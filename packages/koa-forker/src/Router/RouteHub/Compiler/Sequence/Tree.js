const Node = require('./Node');
const Path = require('./Path');

const AppendByComponent = {
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

				SequenceTree(member, passageNode);
			}
		}

		if (currentMiddlewareNode.size > 0) {
			passageNode.append(currentMiddlewareNode);
		}
	},
	MethodComponent: function (component, passageNode, routerName) {
		for (const methodName of component.methods) {
			const methodNode = new Node.Method(methodName);

			passageNode.append(methodNode);

			if (routerName) {
				methodNode.routerNames[routerName] = true;
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

function SequenceTree(router, parentPassageNode) {
	const prefixPassageList = Path.toPassageList(router.prefix);
	const routerPassageNode = createPassageNode(prefixPassageList, parentPassageNode);

	for (const component of router.componentList) {
		const { name, passageList } = component;
		const passageNode = createPassageNode(passageList, routerPassageNode, name);
		const type = component.constructor.name;

		AppendByComponent[type](component, passageNode, router.name);
	}
}

function create(router) {
	const root = new Node.Passage('');

	SequenceTree(router, root);

	return root;
}

exports.create = create;