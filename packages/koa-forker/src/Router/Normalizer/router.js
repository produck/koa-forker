const DEFAULT_NAME = '<anonymous>';

module.exports = function normalizeRouterOptions(_options) {
	const options = {
		name: DEFAULT_NAME,
		prefix: ''
	};

	const {
		name: _name = options.name,
		prefix: _prefix = options.prefix
	} = _options;

	if (typeof _name !== 'string') {
		throw new TypeError('Invalid .name, a string expected.');
	}

	if (typeof _prefix !== 'string') {
		throw new TypeError('Invalid .prefix, a string expected.');
	}

	options.prefix = _prefix;
	options.name = _name;

	return options;
};
