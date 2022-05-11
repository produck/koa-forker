const Normalize = require('./normalize');
const METHODS = require('./methods');
const RouterContext = require('./Context');
const Reference = require('./reference');
const Route = require('./Route');

const ref = new WeakMap();
const _ = proxy => ref.get(proxy);

function isLikePathOptions(any) {
	return !(typeof any === 'function' || any instanceof RouterProxy);
}

function resolveArgs(args) {
	const path = isLikePathOptions(args[0]) ? args.shift() : '';

	return { pathOptionsList: Normalize.Path(path), sequence: args };
}

function assertNotRouteHubMiddleware(middleware, index) {
	if (Reference.routeMiddlewareSet.has(middleware)) {
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
		const finalOptions = Normalize.Router(options);

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

	Route() {
		return Route.compile(_(this));
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

		const finalOptions = Normalize.Redirect(options);

		return this.all(pathOptionsList, function redirectMiddleware(ctx) {
			const { queryString } = ctx;
			const path = ctx.route.url(name, ctx.param, { queryString });

			ctx.redirect(path);
			ctx.status = finalOptions.code;
		});
	}

	Middleware(options) {
		const finalOptions = Normalize.Middleware(options);

		return _(this).Middleware(finalOptions);
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
		_(this).method(METHODS.RESTful, pathOptionsList, sequence);

		return this;
	}
}

METHODS['RESTful'].forEach(name => {
	const lowerCaseName = name.toLowerCase();

	RouterProxy.prototype[lowerCaseName] = function (...args) {
		const { pathOptionsList, sequence } = resolveArgs(args);

		assertMethodSequence(sequence);
		_(this).method([name], pathOptionsList, sequence);

		return this;
	};
});

module.exports = RouterProxy;