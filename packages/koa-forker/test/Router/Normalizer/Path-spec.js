const assert = require('assert');
const { describe, it } = require('mocha');

const normalizePath = require('../../src/Router/Normalizer/path');

describe('Router::Normalizer::Path()', function () {
	it('should be [] in default.', function () {
		const path = normalizePath();

		assert.deepStrictEqual(path, []);
	});

	it('should be an array from "/a".', function () {
		const path = normalizePath('/a');

		assert.deepStrictEqual(path, [{ name: null, path: '/a' }]);
	});

	it('should be an array from "/a/" with end slashes.', function () {
		const path = normalizePath('/a/');

		assert.deepStrictEqual(path, [{ name: null, path: '/a/' }]);
	});

	it('should be an array from "/a/b".', function () {
		const path = normalizePath('/a/b');

		assert.deepStrictEqual(path, [{ name: null, path: '/a/b' }]);
	});

	it('should be an array from "[a, b]".', function () {
		const path = normalizePath(['a', 'b']);

		assert.deepStrictEqual(path, [
			{ name: null, path: 'a' },
			{ name: null, path: 'b' },
		]);
	});

	it('should be an array from "[\'a/b\', \'c\']".', function () {
		const path = normalizePath(['a/b', 'c']);

		assert.deepStrictEqual(path, [
			{ name: null, path: 'a/b' },
			{ name: null, path: 'c' }
		]);
	});

	it('should be an array from { name: \'foo\', path: \'a\' }.', function () {
		const path = normalizePath({ name: 'foo', path: 'a' });

		assert.deepStrictEqual(path, [
			{ name: 'foo', path: 'a' },
		]);
	});

	it('should be an array from [\'c\', { name: \'foo\', path: \'a\' }].', function () {
		const path = normalizePath(['c', { name: 'foo', path: 'a' }]);

		assert.deepStrictEqual(path, [
			{ name: null, path: 'c' },
			{ name: 'foo', path: 'a' },
		]);
	});

	it('should throw if name is invalid', function () {
		assert.throws(() => {
			normalizePath({ name: 1, path: 'a' });
		});
	});

	it('should throw if path is invalid', function () {
		assert.throws(() => {
			normalizePath({ name: null, path: null });
		});
	});
});