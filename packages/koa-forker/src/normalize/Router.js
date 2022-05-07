const normalizePath = require('./path');

const DEFAULT_NAME = '<anonymous>';

module.exports = function normalizeRouterOptions(_options = {}) {
	const options = {
		name: DEFAULT_NAME,
		prefix: []
	};

	const {
		name: _name = options.name,
		prefix: _prefix = options.prefix
	} = _options;

	if (typeof _name !== 'string') {
		throw new TypeError('Invalid .name, a string expected');
	}

	options.prefix = normalizePath(_prefix);
	options.name = _name;

	return options;
};