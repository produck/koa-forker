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
		const matcher = new Compiler.Matcher(this.definition, options);

		const middleware = {
			[finalName](ctx, next) {
				const passageValueList = ctx.path.replace(TAIL, '').split(SEPARATOR);
				const destination = matcher.find(passageValueList);

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