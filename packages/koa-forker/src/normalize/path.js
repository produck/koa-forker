function normalizePathOptionsNode(_pathOptionsNode) {
	const options = {
		params: {}
	};

	const {
		id: _id,
		test: _test,
		params: _params = options.params
	} = _pathOptionsNode;

	if (typeof _id !== 'string') {
		throw new TypeError('Invalid .id, a string expected.');
	}

	if (typeof _test !== 'function') {
		throw new TypeError('Invalid .test, a function expected.');
	}

	options.id = _id;
	options.test = _test;
	options.params = _params;

	return options;
}

const END_SLASH_REG = /(^\/+)|(\/+$)/g;
const SEPARATOR_REG = /\/+/g;
const EXP_WITH_PARAM_REG = /{([a-zA-Z_$][a-zA-Z_$0-9]*)(\((.+)\))?}/;

const PATH_FORM = [
	{
		// 'a', 'a/b', '/a/b/'
		test: raw => typeof raw === 'string',
		normalize(pathString) {
			const trimedPathString = pathString.trim().replace(END_SLASH_REG, '');

			return trimedPathString.split(SEPARATOR_REG).map(pathStringNode => {
				const isComplex = EXP_WITH_PARAM_REG.test(pathStringNode);

				if (!isComplex) {
					return normalizePathOptionsNode({
						id: pathStringNode,
						test: pathnode => pathnode === pathStringNode
					});
				}
			});
		}
	},
	{
		// { userId: /^\d+$/ }
		test: raw => {
			if (typeof raw !== 'object') {
				return false;
			}

			const keyList = Object.keys(raw);

			if (keyList.length !== 1) {
				return false;
			}

			return keyList[0] instanceof RegExp;
		},
		normalize(pathRegExpNode) {
			const name = Object.keys(pathRegExpNode)[0];
			const regexp = pathRegExpNode[name];
			const regExpString = regexp.toString();

			return normalizePathOptionsNode({
				id: `{${name}(${regExpString})}`,
				test: pathnode => pathRegExpNode.test(pathnode)
			});
		}
	},
	{
		test: raw => Object.getPrototypeOf(raw) === Object.prototype,
		normalize: normalizePathOptionsNode
	}
];

module.exports = function normalizePath(_options = []) {
	const matched = PATH_FORM.find(form => form.test(_options));

	if (!Array.isArray(_options) && !matched) {
		throw new TypeError('Invalid path, array, object, string expected.');
	}

	return matched
		? matched.normalize(_options)
		: _options.map(pathNode => normalizePath(pathNode)).flat(Infinity);
};