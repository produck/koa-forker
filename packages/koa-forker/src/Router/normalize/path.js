function normalizePathOptions(_pathOptionsNode) {
	const options = {
		name: null,
		path: ''
	};

	const {
		name: _name = options.name,
		path: _path = options.path
	} = _pathOptionsNode;

	if (typeof _name !== 'string' && _name !== null) {
		throw new TypeError('Invalid .name, a string expected.');
	}

	if (typeof _path !== 'string') {
		throw new TypeError('Invalid .path, a string expected.');
	}

	options.name = _name;
	options.path = _path;

	return options;
}

const PATH_FORM = [
	{
		test: raw => typeof raw === 'string',
		normalize(pathString) {
			return normalizePathOptions({
				path: pathString.trim()
			});
		}
	},
	{
		test: raw => Object.getPrototypeOf(raw) === Object.prototype,
		normalize: normalizePathOptions
	}
];

module.exports = function normalizePath(_options = []) {
	if (Array.isArray(_options)) {
		return _options.map((_childOptions, index) => {
			const matched = PATH_FORM.find(form => form.test(_childOptions));

			if (!matched) {
				throw new TypeError(`Invalid pathList[${index}], object, string expected.`);
			}

			return matched.normalize(_childOptions);
		});
	} else {
		const matched = PATH_FORM.find(form => form.test(_options));

		if (!matched) {
			throw new TypeError('Invalid path, object, string, (object|string)[] expected.');
		}

		return [matched.normalize(_options)];
	}
};