const assert = require('assert');
const { describe, it } = require('mocha');

const normalizeRouterOptions = require('../../../src/Router/Normalizer/router');

describe('Router::Normalizer::Router()', function () {
	it('should be a default options.', function () {
		const defaultOptions = normalizeRouterOptions({});

		assert.deepStrictEqual(defaultOptions, {
			name: '<anonymous>',
			prefix: ''
		});
	});

	it('should be specificed name & prefix options', function () {
		const options = normalizeRouterOptions({
			name: 'foo',
			prefix: 'bar'
		});

		assert.deepStrictEqual(options, {
			name: 'foo',
			prefix: 'bar'
		});
	});

	it('should throw if invalid `.name` NOT string', function () {
		assert.throws(() => {
			normalizeRouterOptions({ name: false });
		}, {
			name: 'TypeError',
			message: 'Invalid .name, a string expected.'
		});
	});

	it('should throw if invalid `.prefix` NOT string', function () {
		assert.throws(() => {
			normalizeRouterOptions({ prefix: null });
		}, {
			name: 'TypeError',
			message: 'Invalid .prefix, a string expected.'
		});
	});
});