const { Lang, Type } = require('@produck/charon');
const compose = require('koa-compose');

const Normalize = require('./normalize');

function MethodMap(list) {
	return list.reduce((map, name) => (map[name] = true, map), {});
}

class Router {
	constructor(options, forker) {
		const { name, test, resolver, methods, middlewares, children } = options;

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
		const composed = compose(this.middlewares);
		const childRouteList = this.childRouterList.map(router => router.compile());

		/**
		 * Naming middleware function name dynamicly
		 */
		const assembly = {
			[finalName](ctx, next) {
				const node = ctx.pathNodeQueue.shift();

				for (const childRoute of childRouteList) {
					if (childRoute.test(node, ctx.method, ctx)) {
						childRoute.resolver(ctx.params, node);

						return composed(ctx, next);
					}
				}
			}
		};

		return {
			middleware: assembly[finalName],
			resolver: this.resolver,
			test: (node, method, ctx) => method in this.methods && this.test(node, ctx)
		};
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