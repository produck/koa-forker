const http = require('http');

const DEFAULT_NAME = '<anonymous>';
const DEFAULT_TEST = () => true;
const DEFAULT_RESOLVER = raw => raw;
const NOT_IMPLEMENTED = (ctx) => ctx.throw(501);

function normalizeRouterOptions(_options = {}) {
	const options = {
		name: DEFAULT_NAME,
		test: DEFAULT_TEST,
		resolver: DEFAULT_RESOLVER,
		methods: http.METHODS,
		middlewares: [],
		childList: []
	};

	const {
		name: _name = options.name,
		test: _test = options.test,
		resolver: _resolver = options.resolver,
		methods: _methods = options.methods,
		middlewares: _middlewares = options.middlewares,
		children: _childList = options.childList
	} = _options;

	options.childList = _childList
		.map(childOptions => normalizeRouterOptions(childOptions));

	if (_childList.length === 0) {
		options.middlewares = [NOT_IMPLEMENTED];
	}

	options.name = _name;
	options.test = _test;
	options.resolver = _resolver;
	options.methods = _methods;
	options.middlewares = _middlewares;

	return options;
}

function normalizeForkerOptions(_options) {
	const options = {
		prefix: '',
		children: [],
		features: {
			onNotImplemented: true,
			onMethodNotAllowed: true
		}
	};

	const {
		prefix: _prefix = options.prefix,
		children: _children = options.children
	} = _options;

	options.children = _children
		.map(childOptions => normalizeRouterOptions(childOptions));

	options.prefix = _prefix;

	return options;
}

exports.Router = normalizeRouterOptions;
exports.Forker = normalizeForkerOptions;