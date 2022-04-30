const compose = require('koa-compose');

function MethodMap(list) {
	return list.reduce((map, name) => (map[name] = true, map), {});
}

class Router {
	constructor(options, features) {
		const { name, test, resolver, methods, middlewares, children } = options;

		this.name = name;
		this.test = test;
		this.resolver = resolver;
		this.methods = MethodMap(methods);
		this.middlewares = middlewares;

		this.childRouterList = children
			.map(childOptions => new Router(childOptions, features));
	}

	use(...middlewares) {
		this.middlewares.push(...middlewares);

		return this;
	}

	appendChild(router) {
		this.childRouterList.push(router);

		return this;
	}

	compile() {
		const composed = compose(this.middlewares);
		const finalName = `${this.name}RouteMiddleware`;
		const childMiddlewareList = this.childRouterList.map(router => router.Middleware());

		/**
		 * Naming middleware function name dynamicly
		 */
		const assembly = {
			[finalName](ctx, next) {
				const { params, pathNodeQueue } = ctx;
				const node = pathNodeQueue.shift();

				childMiddlewareList.find();

				return composed(ctx, next);
			}
		};

		return assembly[finalName];
	}
}

require('http').METHODS.forEach(name => {
	const lowerCaseName = name.toLowerCase();

	Router.prototype[lowerCaseName] = function appendChildByMethod(options) {
		options.methods = [name];

		return this.appendChild(options);
	};
});

module.exports = Router;