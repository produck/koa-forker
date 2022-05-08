const Normalize = require('./normalize');
const METHODS = require('./methods');
const RouterContext = require('./Context');
const Reference = require('./reference');

const ref = new WeakMap();
const _ = proxy => ref.get(proxy);

function isLikePathOptions(any) {
	if (typeof any === 'function' || any instanceof RouterProxy) {
		return false;
	}

	return true;
}

function normalizeArgs(args) {
	const path = isLikePathOptions(args[0]) ? args.shift() : '';

	return { pathOptionsList: Normalize.Path(path), sequence: args };
}

function assertMethodSequence(sequence) {
	for (const index in sequence) {
		const middleware = sequence[index];

		if (typeof middleware !== 'function') {
			throw new TypeError(`Invalid sequence[${index}], a function expected.`);
		}

		if (Reference.routeMiddlewareSet.has(middleware)) {
			throw new TypeError(`The sequence[${index}] COULD NOT be a Route Middleware.`);
		}
	}
}

function assertUseSequence(sequence) {
	for (const index in sequence) {
		const middleware = sequence[index];

		if (typeof middleware !== 'function' && !(middleware instanceof RouterProxy)) {
			throw new TypeError(`Invalid sequence[${index}], a function or Router expected.`);
		}

		if (Reference.routeMiddlewareSet.has(middleware)) {
			throw new TypeError(`The sequence[${index}] COULD NOT be a Route Middleware.`);
		}
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
		return _(this).compile();
	}

	param(param, paramMiddleware) {
		if (typeof param !== 'string') {
			throw new TypeError('Invalid param, a string expected.');
		}

		if (typeof paramMiddleware !== 'function') {
			throw new TypeError('Invalid paramMiddleware, a function expected.');
		}

		return this.use(function ParamMiddleware(ctx, next) {
			const value = ctx.params[param];

			if (value) {
				return paramMiddleware(value, ctx, next);
			}
		});
	}

	redirect(pathOptionsList, name, code = 301) {
		return this.all(pathOptionsList, function ForkerRedirectMiddleware(ctx) {
			const { queryString, origin } = ctx;
			const path = ctx.route.url(name, ctx.param, { queryString, origin });

			ctx.redirect(path);
			ctx.status = code;
		});
	}

	Middleware(options) {
		const finalOptions = Normalize.Middleware(options);

		return _(this).Middleware(finalOptions);
	}

	use(...args) {
		const { pathOptionsList, sequence } = normalizeArgs(args);

		assertUseSequence(sequence);

		const _sequence = sequence.map(member => {
			return typeof member === 'function' ? member : _(member);
		});

		_(this).use(pathOptionsList, _sequence);

		return this;
	}

	all(...args) {
		const { pathOptionsList, sequence } = normalizeArgs(args);

		assertMethodSequence(sequence);
		_(this).method(METHODS.RESTful, pathOptionsList, sequence);

		return this;
	}
}

METHODS['RESTful'].forEach(name => {
	const lowerCaseName = name.toLowerCase();

	RouterProxy.prototype[lowerCaseName] = function (...args) {
		const { pathOptionsList, sequence } = normalizeArgs(args);

		assertMethodSequence(sequence);
		_(this).method([name], pathOptionsList, sequence);

		return this;
	};
});

module.exports = RouterProxy;