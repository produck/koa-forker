const { Lang, Type } = require('@produck/charon');
const compose = require('koa-compose');

const Normalize = require('./normalize');

function MethodMap(list) {
	return list.reduce((map, name) => (map[name] = true, map), {});
}

class Router {
	constructor(options, forker) {
		const { name, test, resolver, methods, flow } = options;

		this.forker = forker;

		this.name = name;
		this.test = test;
		this.methods = MethodMap(methods);
		this.resolver = resolver;

		this.middlewares = middlewares;

		this.childRouterList = [];

		for (const childOptions of children) {
			this.append(new Router(childOptions, forker));
		}

		Object.freeze(this);
	}

	get isLeaf() {
		return this.childRouterList.length === 0;
	}

	test(pathNodeRaw, ctx) {
		return ctx.method in this.methods && this.test(pathNodeRaw, ctx);
	}

	use(...middlewares) {
		for (const index in middlewares) {
			if (Type.Not.Function(middlewares[index])) {
				Lang.Throw.TypeError(`Invalid middlewares[${index}], a function expected`);
			}
		}

		this.middlewares.push(...middlewares);

		return this;
	}

	append(router) {
		if (!Lang.instanceOf(router, Router)) {
			Lang.Throw.TypeError('Invalid router, a Router instance expected.');
		}

		if (router.forker !== this.forker) {
			Lang.Throw.Error('The router does NOT belongs to this forker.');
		}

		this.childRouterList.push(router);

		return this;
	}

	compile() {
		const finalName = `${this.name}RouteMiddleware`;
		const resolver = this.resolver;
		const middlewareMap = {};

		for (const name in this.methods) {
			middlewareMap[name] = compose(this.middlewares.concat(this.methods[name]));
		}

		/**
		 * Naming middleware function name dynamicly
		 */
		const assembly = {
			async [finalName](ctx, next) {
				const { pathNodeQueue } = ctx;
				const node = pathNodeQueue.shift();
				const middleware = middlewareMap[ctx.method];

				if (middleware) {
					resolver(ctx.params, node);
					await middleware(ctx, next);
				} else {
					ctx.throw(405);
				}
			}
		};

		// Node route
		return assembly[finalName];
	}
}

require('http').METHODS.forEach(name => {
	const lowerCaseName = name.toLowerCase();

	Router.prototype[lowerCaseName] = function appendChildByMethod(options) {
		const finalOptions = Normalize.Router(options);

		finalOptions.methods = [name];

		return this.append(new Router(finalOptions, this.forker));
	};
});

module.exports = Router;