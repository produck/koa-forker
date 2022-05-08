const Reference = require('../reference');
const Path = require('../path');
const Node = require('./NodeTree');
const PathDefinitionTree = require('./DefinitionTree');
const PathSearchTree = require('./SearchTree');

const toPathDefinitionTreeMap = new WeakMap();

function PassageValueList(pathValue) {
	return pathValue.replace(Path.REG.TAIL_SLASH, '').split(Path.REG.SEPARATOR);
}

module.exports = class Route {
	constructor(routerName) {
		this.routerName = routerName;
		Object.freeze(this);
	}

	get abstract() {
		//TODO return a list
		return this.pathTree;
	}

	Middleware(options) {
		const finalName = `${this.routerName}RouteMiddleware`;

		const root = {
			childList: [PathSearchTree(toPathDefinitionTreeMap.get(this), options)]
		};

		const middleware = {
			[finalName](ctx, next) {
				const list = PassageValueList(ctx.path);
				const length = list.length;
				const paramStack = [];

				let current = root;

				for (let index = 0; index < length; index++) {
					const passageValue = list[index];
					const self = current;

					for (const child of current.childList) {
						if (child.test(passageValue)) {
							current = child;
							paramStack.push(passageValue);

							break;
						}
					}

					if (self === current) {
						return next(); //404
					}
				}

				const matchedMethod = current.methods[ctx.method];

				if (!matchedMethod) {
					return next();
				}

				ctx.params = {};
				ctx.allowedMethods = current.allowedMethods;
				Reference.ctxParamStackMap.set(ctx, paramStack);

				return matchedMethod(ctx, next);
			}
		}[finalName];

		Reference.routeMiddlewareSet.add(middleware);

		return middleware;
	}

	static compile(router) {
		const nodeTree = Node.createTree(router);
		const pathTree = PathDefinitionTree(nodeTree);
		const route = new Route(router.name);

		toPathDefinitionTreeMap.set(route, pathTree);

		return route;
	}
};