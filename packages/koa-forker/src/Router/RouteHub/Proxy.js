const Normalizer = require('./Normalizer');
const RouteHubContext = require('./Context');
const Abstract = require('./Abstract');

const map = new WeakMap();
const _ = proxy => map.get(proxy);

class RouteHubProxy {
	constructor(routerContext) {
		map.set(this, new RouteHubContext(routerContext, this));
	}

	get abstract() {
		return Abstract(_(this));
	}

	has(name) {
		if (typeof name !== 'string') {
			throw new TypeError('Invalid name, a string expected.');
		}

		return name in _(this).namedPathMap;
	}

	url(name, params = {}) {
		if (!this.has(name)) {
			throw new Error(`A path named "${name}" is NOT existed.`);
		}

		if (params === null || typeof params !== 'object') {
			throw new TypeError('Invalid params, an object expected.');
		}

		// const finalOptions = Normalizer.Url(options);

		return _(this).url(name, params);
	}

	Middleware(options = {}) {
		if (options === null || typeof options !== 'object') {
			throw new TypeError('Invalid options, an object expected.');
		}

		const finalOptions = Normalizer.Middleware(options);

		return _(this).Middleware(finalOptions);
	}
}

module.exports = RouteHubProxy;