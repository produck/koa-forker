const assert = require('assert');
const { describe, it } = require('mocha');

const {
	DEFAULT_METHOD_NOT_ALLOWED,
	DEFAULT_NOT_IMPLEMENTED,
	DEFAULT_PASSTHROUGH,
	normalize
} =	require('../../../../src/Router/RouteHub/Normalizer/middleware');

describe('Router::RouteHub::Normalizer::Middleware()', function () {
	it('should be a default options.', function () {
		const options = normalize({});

		assert.deepStrictEqual(options, {
			onMethodNotAllowed: DEFAULT_METHOD_NOT_ALLOWED,
			onNotImplemented: DEFAULT_NOT_IMPLEMENTED
		});
	});

	it('should be a default options from { true, true }.', function () {
		const options = normalize({
			onMethodNotAllowed: true,
			onNotImplemented: true
		});

		assert.deepStrictEqual(options, {
			onMethodNotAllowed: DEFAULT_METHOD_NOT_ALLOWED,
			onNotImplemented: DEFAULT_NOT_IMPLEMENTED
		});
	});

	it('should be a passthrough options from { false, false }.', function () {
		const options = normalize({
			onMethodNotAllowed: false,
			onNotImplemented: false
		});

		assert.deepStrictEqual(options, {
			onMethodNotAllowed: DEFAULT_PASSTHROUGH,
			onNotImplemented: DEFAULT_PASSTHROUGH
		});
	});

	it('should be an options from { fn, fn }.', function () {
		const test = () => {};

		const options = normalize({
			onMethodNotAllowed: test,
			onNotImplemented: test
		});

		assert.deepStrictEqual(options, {
			onMethodNotAllowed: test,
			onNotImplemented: test
		});
	});

	it('should be an options from { [], [] }.', function () {
		const options = normalize({
			onMethodNotAllowed: [],
			onNotImplemented: []
		});

		assert.ok(typeof options.onMethodNotAllowed === 'function');
		assert.ok(typeof options.onNotImplemented === 'function');
	});

	it('should throws if invalid onMethodNotAllowed.', function () {
		assert.throws(() => {
			normalize({
				onMethodNotAllowed: 0,
				onNotImplemented: () => {}
			});
		}, {
			name: 'TypeError',
			message: 'Invalid .onMethodNotAllowed, a boolean, function or function[] expected.'
		});
	});

	it('should throws if invalid onNotImplemented.', function () {
		assert.throws(() => {
			normalize({
				onMethodNotAllowed: () => {},
				onNotImplemented: 0
			});
		}, {
			name: 'TypeError',
			message: 'Invalid .onNotImplemented, a boolean, function or function[] expected.'
		});
	});

	it('should throws if invalid in onMethodNotAllowed[].', function () {
		assert.throws(() => {
			normalize({
				onMethodNotAllowed: [() => {}, 0],
				onNotImplemented: () => {}
			});
		}, {
			name: 'TypeError',
			message: 'Invalid .onMethodNotAllowed[1], a function expected.'
		});
	});

	it('should throws if invalid in onNotImplemented[].', function () {
		assert.throws(() => {
			normalize({
				onMethodNotAllowed: () => {},
				onNotImplemented: [() => {}, 0]
			});
		}, {
			name: 'TypeError',
			message: 'Invalid .onNotImplemented[1], a function expected.'
		});
	});
});