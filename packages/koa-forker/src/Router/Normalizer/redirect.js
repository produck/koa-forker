
const AVAILABLE_REDIRECT_CODE = [301, 302, 303, 307, 308];

module.exports = function normalizeRedirectOptions(_options) {
	const options = {
		code: 301,
		params: {}
	};

	const {
		code: _code = options.code
	} = _options;

	if (!AVAILABLE_REDIRECT_CODE.includes(_code)) {
		const availables = AVAILABLE_REDIRECT_CODE.join(', ');

		throw new TypeError(`Invalid .code, ${availables} expected.`);
	}

	return options;
};