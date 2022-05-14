const Compiler = require('./Compiler');
const NamedPath = require('./NamedPath');

const TAIL = /\/+$/g;
const SEPARATOR = Compiler.Path.REG.SEPARATOR;

module.exports = class RouteHub {
	constructor(router, proxy) {
		this.$ = proxy;

		const sequence = Compiler.Sequence.create(router);
		const definition = Compiler.Definition.create(sequence);
		const namedPathMap = NamedPath(definition);

		this.router = router;
		this.definition = definition;
		this.namedPathMap = namedPathMap;

		Object.freeze(this);
	}

	Middleware(options) {
		const finalName = `${this.router.name}RouteMiddleware`;
		const route = this;

		const root = {
			childList: [Compiler.Matcher.create(this.definition, options)]
		};

		function find(passageValueList) {
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
					// No matched path.
					return null;
				}
			}

			return current;
		}

		const middleware = {
			[finalName](ctx, next) {
				const passageValueList = ctx.path.replace(TAIL, '').split(SEPARATOR);
				const destination = find(passageValueList);

				if (destination === null) {
					return next();
				}

				const matchedMethod = destination.methods[ctx.method];

				if (!matchedMethod) {
					return next();
				}

				ctx.route = route;
				ctx.params = {};
				ctx.allowedMethods = destination.allowedMethods;
				Compiler.Reference.ctxParamStackMap.set(ctx, passageValueList);

				return matchedMethod.middleware(ctx, next);
			}
		}[finalName];

		Compiler.Reference.routeMiddlewareSet.add(middleware);

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