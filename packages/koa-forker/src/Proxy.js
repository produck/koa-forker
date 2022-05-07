const Normalize = require('./normalize');
const METHODS = require('./methods');
const RouterContext = require('./Context');

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

}

function assertUseSequence(sequence) {

}

class RouterProxy {
	constructor(options) {
		const finalOptions = Normalize.Router(options);

		ref.set(this, new RouterContext(finalOptions));
	}

	Route() {
		return _(this).compile();
	}

	get _() {
		return _(this);
	}

	param(param, ...paramMiddlewares) {
		_(this).param(param, paramMiddlewares);

		return this;
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