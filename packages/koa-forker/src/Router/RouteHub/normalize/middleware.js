const compose = require('koa-compose');

function DEFAULT_METHOD_NOT_ALLOWED(ctx) {
	ctx.set('Allow', ctx.allowedMethods);
	ctx.status = 405;
}

function DEFAULT_NOT_IMPLEMENTED(ctx) {
	ctx.throw(501);
}

function DEFAULT_PASSTHROUGH(_ctx, next) {
	return next();
}

const assertStatusCodeOptions = (any, role) => {
	if (Array.isArray(any)) {
		for (const index in any) {
			if (typeof any[index] !== 'function') {
				throw new TypeError(`Invalid .${role}[${index}], a function expected.`);
			}
		}
	} else if (typeof any !== 'boolean' && typeof any !== 'function') {
		throw new TypeError(`Invalid .${role}, a boolean, function or function[] expected.`);
	}
};

module.exports = function normalizeRouteMiddleware(_options = {}) {
	const options = {
		onMethodNotAllowed: DEFAULT_METHOD_NOT_ALLOWED,
		onNotImplemented: DEFAULT_NOT_IMPLEMENTED
	};

	const {
		onMethodNotAllowed: _onMethodNotAllowed = options.onMethodNotAllowed,
		onNotImplemented: _onNotImplemented = options.onNotImplemented
	} = _options;

	assertStatusCodeOptions(_onMethodNotAllowed, 'onMethodNotAllowed');
	assertStatusCodeOptions(_onNotImplemented, 'onNotImplemented');

	if (typeof _onMethodNotAllowed === 'boolean') {
		options.onMethodNotAllowed = _onMethodNotAllowed
			? DEFAULT_METHOD_NOT_ALLOWED
			: DEFAULT_PASSTHROUGH;
	} else if (typeof _onMethodNotAllowed === 'function') {
		options.onMethodNotAllowed = _onMethodNotAllowed;
	} else {
		options.onMethodNotAllowed = compose(_onMethodNotAllowed);
	}

	if (typeof _onNotImplemented === 'boolean') {
		options.onNotImplemented = _onNotImplemented
			? DEFAULT_NOT_IMPLEMENTED
			: DEFAULT_PASSTHROUGH;
	} else if (typeof _onNotImplemented === 'function') {
		options.onNotImplemented = _onNotImplemented;
	} else {
		options.onNotImplemented = compose(_onNotImplemented);
	}

	return options;
};
