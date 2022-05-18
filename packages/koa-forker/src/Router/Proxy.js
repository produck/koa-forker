const Normalizer = require('./Normalizer');
const RouteHub = require('./RouteHub');
const RouterContext = require('./Context');

const ref = new WeakMap();
const _ = proxy => ref.get(proxy);

function isLikePathOptions(any) {
	if (typeof any === 'function') {
		return false;
	}

	if (any instanceof RouterProxy) {
		return false;
	}

	return true;
}

function resolveArgs(args) {
	const path = args.length > 0 && isLikePathOptions(args[0]) ? args.shift() : '';

	return { pathOptionsList: Normalizer.Path(path), sequence: args };
}

function assertNotRouteHubMiddleware(middleware, index) {
	if (RouteHub.Reference.routeMiddlewareSet.has(middleware)) {
		throw new TypeError(`The sequence[${index}] COULD NOT be a Route Middleware.`);
	}
}

function assertMethodSequence(sequence) {
	for (const index in sequence) {
		const middleware = sequence[index];

		if (typeof middleware !== 'function') {
			throw new TypeError(`Invalid sequence[${index}], a function expected.`);
		}

		assertNotRouteHubMiddleware(middleware, index);
	}
}

class RouterProxy {
	constructor(options = {}) {
		if (typeof options !== 'object') {
			throw new TypeError('Invalid options, an object expected.');
		}

		const finalOptions = Normalizer.Router(options);

		ref.set(this, new RouterContext(finalOptions));
	}

	get name() {
		return _(this).name;
	}

	get prefix() {
		return _(this).prefix;
	}

	set prefix(value) {
		if (typeof value !== 'string') {
			throw new TypeError('Invalid prefix, a string expected.');
		}

		_(this).prefix = value;
	}

	RouteHub() {
		return RouteHub.create(_(this));
	}

	param(name, paramMiddleware) {
		if (typeof name !== 'string') {
			throw new TypeError('Invalid name, a string expected.');
		}

		if (typeof paramMiddleware !== 'function') {
			throw new TypeError('Invalid paramMiddleware, a function expected.');
		}

		return this.use(function paramMiddlewareProxy(ctx, next) {
			const paramValue = ctx.params[name];

			return paramValue ? paramMiddleware(paramValue, ctx, next) : next();
		});
	}

	redirect(pathOptionsList, destinationName, options = {}) {
		if (typeof destinationName !== 'string') {
			throw new TypeError('Invalid destinationName, a string expected.');
		}

		const finalOptions = Normalizer.Redirect(options);

		return this.all(pathOptionsList, function redirectMiddleware(ctx) {
			const { queryString } = ctx;
			const path = ctx.route.url(destinationName, ctx.param, { queryString });

			ctx.redirect(path);
			ctx.status = finalOptions.code;
		});
	}

	Middleware(options = {}) {
		if (options === null || typeof options !== 'object') {
			throw new TypeError('Invalid options, an object expected.');
		}

		const finalOptions = RouteHub.Normalizer.Middleware(options);

		return this.RouteHub().Middleware(finalOptions);
	}

	use(...args) {
		const { pathOptionsList, sequence } = resolveArgs(args);

		for (const index in sequence) {
			const middleware = sequence[index];

			if (typeof middleware !== 'function' && !(middleware instanceof RouterProxy)) {
				throw new TypeError(`Invalid sequence[${index}], a function or Router expected.`);
			}

			assertNotRouteHubMiddleware(middleware, index);
		}

		const _sequence = sequence
			.map(member => member instanceof RouterProxy ? _(member) : member);

		_(this).use(pathOptionsList, _sequence);

		return this;
	}

	all(...args) {
		const { pathOptionsList, sequence } = resolveArgs(args);

		assertMethodSequence(sequence);
		_(this).method(RouteHub.METHODS.RESTful, pathOptionsList, sequence);

		return this;
	}
}

RouteHub.METHODS.RESTful.forEach(name => {
	const lowerCaseName = name.toLowerCase();

	RouterProxy.prototype[lowerCaseName] = function (...args) {
		const { pathOptionsList, sequence } = resolveArgs(args);

		assertMethodSequence(sequence);
		_(this).method([name], pathOptionsList, sequence);

		return this;
	};
});

module.exports = RouterProxy;