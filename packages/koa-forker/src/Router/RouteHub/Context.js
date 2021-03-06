const Compiler = require('./Compiler');
const NamedPath = require('./NamedPath');

const TAIL = /\/+$/g;
const SEPARATOR = Compiler.Path.REG.SEPARATOR;

module.exports = class RouteHub {
	constructor(routerContext, proxy) {
		this.$ = proxy;

		const sequence = Compiler.Sequence.create(routerContext);
		const definition = Compiler.Definition.create(sequence);
		const namedPathMap = NamedPath(definition);

		this.router = routerContext;
		this.definition = definition;
		this.namedPathMap = namedPathMap;

		Object.freeze(this);
	}

	Middleware(options) {
		const route = this, finalName = `${this.router.name}RouteMiddleware`;
		const searchTree = Compiler.Search.create(this.definition, options);
		const matcher = new Compiler.Matcher(searchTree);

		const middleware = {
			[finalName](ctx, next) {
				const params = {};
				const passageValueList = ctx.path.replace(TAIL, '').split(SEPARATOR);
				const destination = matcher.find(passageValueList, params);

				if (destination === null) {
					return next();
				}

				const matchedMethod = destination.methods[ctx.method];

				if (!matchedMethod) {
					return next();
				}

				ctx.route = route;
				ctx.params = params;
				ctx.allowedMethods = destination.allowedMethods;

				return matchedMethod.middleware(ctx, next);
			}
		}[finalName];

		Compiler.Reference.routeMiddlewareSet.add(middleware);

		return middleware;
	}

	url(name, params) {
		const namedPath = this.namedPathMap[name];

		//TODO paramsMapper & options
		namedPath.assert(params);

		const pathValue = namedPath.render(params);
		const url = new URL(pathValue, 'http://e');

		// url.search = options.queryString;

		return `${url.pathname}${url.search}`;
	}
};