const compose = require('koa-compose');

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

function PathDefinitionNode(passage) {
	return {
		passage,
		methods: {},
		childList: []
	};
}

function createPathTree(nodeTree) {
	const root = PathDefinitionNode(nodeTree.passage);

	function findOrCreateDefinitionNode(passage, parent) {
		const existed = parent.childList
			.find(node => node.passage.id === passage.id);

		if (existed) {
			return existed;
		}

		const newNode = PathDefinitionNode(passage);

		parent.childList.push(newNode);

		return newNode;
	}

	(function buildPathDefinitionTreeNode(currentPassageNode, current) {
		for (const node of currentPassageNode.childNodeList) {
			if (node instanceof Node.Method) {
				current.methods[node.method] = [];
			} else if (node instanceof Node.Passage) {
				const child = findOrCreateDefinitionNode(node.passage, current);

				buildPathDefinitionTreeNode(node, child);
			}
		}
	})(nodeTree, root);

	function loadMiddlewaresFromNode(node, middlewares) {
		(function append(current) {
			for (const name in current.methods) {
				current.methods[name].push(...middlewares);
			}

			for (const childNode of current.childList) {
				append(childNode);
			}
		})(node);
	}

	(function loadPathDefinitionTreeNode(currentPassageNode, current) {
		for (const node of currentPassageNode.childNodeList) {
			if (node instanceof Node.Method) {
				current.methods[node.method].push(...node.middlewares);
			} else if (node instanceof Node.Middleware) {
				loadMiddlewaresFromNode(current, node.middlewares);
			} else if (node instanceof Node.Passage) {
				const child = current.childList
					.find(child => child.passage.id === node.passage.id);

				loadPathDefinitionTreeNode(node, child);
			}
		}
	})(nodeTree, root);

	return root;
}

function PathSearchNode(rootDefinitionNode) {
	const methods = {};

	for (const name in rootDefinitionNode.methods) {
		methods[name] = compose(rootDefinitionNode.methods[name]);
	}

	return {
		test: rootDefinitionNode.passage.test,
		methods: methods,
		childList: rootDefinitionNode.childList.map(child => PathSearchNode(child))
	};
}

const routePathTreeMap = new WeakMap();
const END_SLASH_REG = /(^\/+)|(\/+$)/g;
const SEPARATOR_REG = /\/+/g;

function PassageList(path) {
	return path.replace(END_SLASH_REG, '').split(SEPARATOR_REG);
}

module.exports = class Route {
	constructor(routerName) {
		this.routerName = routerName;
		Object.freeze(this);
	}

	get abstract() {
		return this.pathTree;
	}

	Middleware(options) {
		const finalName = `${this.routerName}RouteMiddleware`;
		const root = PathSearchNode(routePathTreeMap.get(this), options);

		const middleware = {
			[finalName](ctx, next) {
				const list = PassageList(ctx.path);
				const length = list.length;

				let current = root;

				for (let index = 0; index < length; index++) {
					const passageValue = list[index];
					const self = current;

					for (const child of current.childList) {
						if (child.test(passageValue)) {
							current = child;

							break;
						}
					}

					if (self === current) {
						return next(); //404
					}
				}

				return current.methods[ctx.method](ctx, next);
			}
		}[finalName];

		routePathTreeMap.add(middleware);

		return middleware;
	}

	static compile(router) {
		const nodeTree = createNodeTree(router);
		const pathTree = createPathTree(nodeTree);
		const route = new Route(router.name);

		routePathTreeMap.set(route, pathTree);

		return route;
	}
};