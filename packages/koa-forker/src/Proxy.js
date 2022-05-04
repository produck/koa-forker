const Normalize = require('./normalize');
const METHODS = require('./methods');
const RouterContext = require('./Context');

const ref = new WeakMap();
const _ = proxy => ref.get(proxy);

function isPathOptions(any) {
	// array, object, string, regexp
	return typeof any !== 'function' && !(any instanceof RouterProxy);
}

function normalizeArgs(args) {
	const pathOptions = isPathOptions(args[0]) ? args.shift() : [];

	return { pathOptions: Normalize.Path(pathOptions), sequence: args };
}

class RouterProxy {
	constructor(options) {
		const finalOptions = Normalize.Router(options);

		ref.set(this, new RouterContext(finalOptions));
	}

	get abstract() {
		return _(this).compile().abstract;
	}

	get _() {
		return _(this);
	}

	param(param, ...paramMiddlewares) {
		_(this).param(param, paramMiddlewares);

		return this;
	}

	Middleware(compilerOptions) {
		return _(this).Middleware(compilerOptions);
	}

	use(...args) {
		const { pathOptions, sequence } = normalizeArgs(args);

		const _sequence = sequence.map(member => {
			return typeof member === 'function' ? member : _(member);
		});

		_(this).use(pathOptions, _sequence);

		return this;
	}

	all(...args) {
		const { pathOptions, sequence } = normalizeArgs(args);

		_(this).method(METHODS.RESTful, pathOptions, sequence);

		return this;
	}
}

METHODS['RESTful'].forEach(name => {
	const lowerCaseName = name.toLowerCase();

	RouterProxy.prototype[lowerCaseName] = function (...args) {
		const { pathOptions, sequence } = normalizeArgs(args);

		_(this).method([name], pathOptions, sequence);

		return this;
	};
});

module.exports = RouterProxy;