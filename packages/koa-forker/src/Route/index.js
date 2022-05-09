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
		const route = this;

		const root = {
			childList: [PathSearchTree(toPathDefinitionTreeMap.get(this), options)]
		};

		const middleware = {
			[finalName](ctx, next) {
				const passageValueList = PassageValueList(ctx.path);
				const length = passageValueList.length;

				let current = root;

				for (let index = 0; index < length; index++) {
					const passageValue = passageValueList[index];
					const self = current;

					for (const child of current.childList) {
						if (child.test(passageValue)) {
							current = child;

							break;
						}
					}

					if (self === current) {
						// No matched path then passthrough
						return next();
					}
				}

				const matchedMethod = current.methods[ctx.method];

				if (!matchedMethod) {
					// There is not any method in the matched path then passthrough.
					return next();
				}

				ctx.route = route;
				ctx.params = {};
				ctx.allowedMethods = current.allowedMethods;
				Reference.ctxParamStackMap.set(ctx, passageValueList);

				return matchedMethod(ctx, next);
			}
		}[finalName];

		Reference.routeMiddlewareSet.add(middleware);

		return middleware;
	}

	get(name) {
		const definitionTree = toPathDefinitionTreeMap.get(this);

	}

	url(name, params, options) {
		const record = this.get(name);
		const url = new URL();

		return url.href.replace(url.origin, '');
	}

	static compile(router) {
		const nodeTree = Node.createTree(router);
		const definitionTree = PathDefinitionTree(nodeTree);
		const route = new Route(router.name);

		toPathDefinitionTreeMap.set(route, definitionTree);

		return route;
	}
};