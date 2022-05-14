
const AVAILABLE_REDIRECT_CODE = [301, 302, 303, 307, 308];

function assertCode(code) {
	if (!AVAILABLE_REDIRECT_CODE.includes(code)) {
		const availables = AVAILABLE_REDIRECT_CODE.join(', ');

		throw new TypeError(`Invalid code, a number in ${availables} expected.`);
	}
}

function normalizeRedirectCode(code) {
	assertCode(code);

	return { code, params: {} };
}

module.exports = function normalizeRedirectOptions(_options) {
	if (typeof _options === 'number') {
		return normalizeRedirectCode(_options);
	}

	const options = {
		code: 301,
		params: {}
	};

	const {
		code: _code = options.code,
		params: _params = options.params
	} = _options;

	assertCode(_code);

	options.code = _code;
	options.params = _params;

	return options;
};