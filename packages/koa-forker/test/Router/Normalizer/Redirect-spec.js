const assert = require('assert');
const { describe, it } = require('mocha');

const normalizeRedirectOptions = require('../../../src/Router/Normalizer/redirect');

describe('Router::Normalizer::Redirect()', function () {
	it('should be a default options.', function () {
		const options = normalizeRedirectOptions({});

		assert.deepStrictEqual(options, {
			code: 301,
			params: {}
		});
	});

	it('should be an options by specific code number.', function () {
		const options = normalizeRedirectOptions(302);

		assert.deepStrictEqual(options, {
			code: 302,
			params: {}
		});
	});

	it('should be an options by specific object.', function () {
		const options = normalizeRedirectOptions({
			code: 303,
			params: {
				a: 1
			}
		});

		assert.deepStrictEqual(options, {
			code: 303,
			params: {
				a: 1
			}
		});
	});

	it('should be an options by an object without params.', function () {
		const options = normalizeRedirectOptions({ code: 303 });

		assert.deepStrictEqual(options, { code: 303, params: {} });
	});

	it('should throws by a invalid code.', function () {
		assert.throws(() => {
			normalizeRedirectOptions(304);
		}, {
			name: 'TypeError',
			message: 'Invalid code, a number in 301, 302, 303, 307, 308 expected.'
		});
	});

	it('should throws by a specific options with invalid code.', function () {
		assert.throws(() => {
			normalizeRedirectOptions({
				code: 305
			});
		}, {
			name: 'TypeError',
			message: 'Invalid code, a number in 301, 302, 303, 307, 308 expected.'
		});
	});
});