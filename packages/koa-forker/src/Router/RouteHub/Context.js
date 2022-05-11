const Reference = require('../reference');
const { REG } = require('../path');
const Node = require('./NodeTree');
const PathDefinitionTree = require('./DefinitionTree');
const PathSearchTree = require('./SearchTree');
const NamedPathMap = require('./NamedPathMap');

module.exports = class RouteHub {
	constructor(router, proxy) {
		this.$ = proxy;

		const nodeTree = Node.createTree(router);
		const definitionTree = PathDefinitionTree(nodeTree);
		const namedPathMap = NamedPathMap(definitionTree);

		this.router = router;
		this.definitionTree = definitionTree;
		this.namedPathMap = namedPathMap;

		Object.freeze(this);
	}

	get abstract() {
		//TODO return a list
		return this.pathTree;
	}

	Middleware(options) {
		const finalName = `${this.router.name}RouteMiddleware`;
		const route = this;

		const root = {
			childList: [PathSearchTree(this.definitionTree, options)]
		};

		const middleware = {
			[finalName](ctx, next) {
				const passageValueList = ctx.path
					.replace(REG.TAIL_SLASH, '')
					.split(REG.SEPARATOR);

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

				return matchedMethod.middleware(ctx, next);
			}
		}[finalName];

		Reference.routeMiddlewareSet.add(middleware);

		return middleware;
	}

	url(name, params, options) {
		const namedPath = this.namedPathMap[name];

		if (!namedPath) {
			return null;
		}

		//TODO paramsMapper
		namedPath.assert(params);

		const pathValue = namedPath.render(params);
		const url = new URL(pathValue, 'http://e');

		url.search = options.queryString;

		return `${url.pathname}${url.search}`;
	}
};