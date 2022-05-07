const Reference = require('../reference');
const Path = require('../path');
const Node = require('./NodeTree');
const PathDefinitionTree = require('./DefinitionTree');
const PathSearchTree = require('./SearchTree');

const toPathDefinitionTreeMap = new WeakMap();

function PassageList(path) {
	return path.replace(Path.REG.TAIL_SLASH, '').split(Path.REG.SEPARATOR);
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
				const list = PassageList(ctx.path);
				const length = list.length;
				const paramStack = [];

				let current = root;

				for (let index = 0; index < length; index++) {
					const passageValue = list[index];
					const self = current;

					for (const child of current.childList) {
						if (child.test(passageValue)) {
							current = child;

							if (child.hasParams) {
								paramStack.push(passageValue);
							}

							break;
						}
					}

					if (self === current) {
						return next(); //404
					}
				}

				ctx.params = {};
				ctx.allowedMethods = current.allowedMethods;
				Reference.ctxParamStackMap(ctx, paramStack);

				return current.methods[ctx.method](ctx, next);
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