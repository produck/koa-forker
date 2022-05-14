const Normalizer = require('./Normalizer');
const RouteHub = require('./RouteHub');
const RouterContext = require('./Context');

const ref = new WeakMap();
const _ = proxy => ref.get(proxy);

function isLikePathOptions(any) {
	return !(typeof any === 'function' || any instanceof RouterProxy);
}

function resolveArgs(args) {
	const path = isLikePathOptions(args[0]) ? args.shift() : '';

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
	constructor(options) {
		const finalOptions = Normalizer.Router(options);

		ref.set(this, new RouterContext(finalOptions));
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

	param(param, paramMiddleware) {
		if (typeof param !== 'string') {
			throw new TypeError('Invalid param, a string expected.');
		}

		if (typeof paramMiddleware !== 'function') {
			throw new TypeError('Invalid paramMiddleware, a function expected.');
		}

		return this.use(function paramMiddleware(ctx, next) {
			const value = ctx.params[param];

			return value ? paramMiddleware(value, ctx, next) : next();
		});
	}

	redirect(pathOptionsList, name, options) {
		if (typeof name !== 'string') {
			throw new TypeError('Invalid path name, a string expected.');
		}

		const finalOptions = Normalizer.Redirect(options);

		return this.all(pathOptionsList, function redirectMiddleware(ctx) {
			const { queryString } = ctx;
			const path = ctx.route.url(name, ctx.param, { queryString });

			ctx.redirect(path);
			ctx.status = finalOptions.code;
		});
	}

	Middleware(options = {}) {
		if (typeof options !== 'object') {
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

		const _sequence = sequence.map(member => {
			if (typeof member === 'function') {
				return member;
			}

			if (member instanceof RouterProxy) {
				return _(member);
			}
		});

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