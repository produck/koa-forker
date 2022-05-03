const { Type, Lang } = require('@produck/charon');

const Normalize = require('./normalize');
const METHODS = require('./methods');
const RouterContext = require('./Context');

const ref = new WeakMap();
const _ = proxy => ref.get(proxy);

function isPathOptions() {
	// array, object, string, regexp
}

function normalizeArgs(args) {
	const pathOptions = isPathOptions(args[0]) ? args.shift() : null;

	return { pathOptions, sequence: args };
}

class RouterProxy {
	constructor(options) {
		const finalOptions = Normalize.Router(options);

		ref.set(this, new RouterContext(finalOptions));
	}

	get abstract() {
		return _(this).compile().abstract;
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

		for (const index in sequence) {
			const member = sequence[index];

			if (Type.Not.Function(member) || !Lang.instanceOf(member, RouterProxy)) {
				Lang.Throw.TypeError(`Invalid sequence[${index}], a Function or Router expected.`);
			}
		}

		_(this).use(pathOptions, sequence);

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