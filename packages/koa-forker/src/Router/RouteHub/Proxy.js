const RouteHubContext = require('./Context');
const Normalize = require('./normalize');

const map = new WeakMap();
const _ = proxy => map.get(proxy);

class RouteHubProxy {
	constructor(router) {
		map.set(this, new RouteHubContext(router, this));
	}

	get abstract() {
		return _(this).abstract;
	}

	has(name) {
		if (typeof name === 'string') {
			throw new TypeError('Invalid name, a string expected.');
		}

		return name in _(this).namedPathMap;
	}

	url(name, params = {}, options) {
		if (!this.has(name)) {
			throw new Error(`A path named ${name} is NOT existed.`);
		}

		if (typeof params !== 'object') {
			throw new TypeError('Invalid params, an object expected.');
		}

		const finalOptions = Normalize.Url(options);

		return _(this).url(name, params, finalOptions);
	}

	Middleware(options) {
		const finalOptions = Normalize.middleware(options);

		return _(this).Middleware(finalOptions);
	}
}

module.exports = RouteHubProxy;