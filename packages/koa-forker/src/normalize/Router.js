const DEFAULT_NAME = '<anonymous>';

module.exports = function normalizeRouterOptions(_options = {}) {
	const options = {
		name: DEFAULT_NAME,
		prefix: null
	};

	const {
		name: _name = options.name,
		prefix: _prefix = options.prefix
	} = _options;

	options.name = _name;
	options.prefix = _prefix;

	return options;
};