const assert = require('assert');
const { describe, it } = require('mocha');

const normalizePath = require('../src/normalize/path');

describe('Normalize::', function () {
	describe('Path()', function () {
		it('should be [] in default.', function () {
			const path = normalizePath();

			assert.deepStrictEqual(path, []);
		});

		it('should be an array from "/a".', function () {
			const path = normalizePath('/a');

			assert.deepStrictEqual(path, [
				{ id: 'a', params: {}, test: path[0].test }
			]);
		});

		it('should be an array from "/a/" with end slashes.', function () {
			const path = normalizePath('/a/');

			assert.deepStrictEqual(path, [
				{ id: 'a', params: {}, test: path[0].test }
			]);
		});

		it('should be an array from "/a/b".', function () {
			const path = normalizePath('/a/b');

			assert.deepStrictEqual(path, [
				{ id: 'a', params: {}, test: path[0].test },
				{ id: 'b', params: {}, test: path[1].test }
			]);
		});

		it('should be an array from "/a//b/" with redundant slashes.', function () {
			const path = normalizePath('/a//b/');

			assert.deepStrictEqual(path, [
				{ id: 'a', params: {}, test: path[0].test },
				{ id: 'b', params: {}, test: path[1].test }
			]);
		});

		it('should be an array from "[a, b]".', function () {
			const path = normalizePath(['a', 'b']);

			assert.deepStrictEqual(path, [
				{ id: 'a', params: {}, test: path[0].test },
				{ id: 'b', params: {}, test: path[1].test }
			]);
		});

		it('should be an array from "[\'a/b\', \'c\']".', function () {
			const path = normalizePath(['a/b', 'c']);

			assert.deepStrictEqual(path, [
				{ id: 'a', params: {}, test: path[0].test },
				{ id: 'b', params: {}, test: path[1].test },
				{ id: 'c', params: {}, test: path[2].test }
			]);
		});
	});
});