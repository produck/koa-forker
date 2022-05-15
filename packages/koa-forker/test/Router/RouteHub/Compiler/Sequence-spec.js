const assert = require('assert');
const { describe, it } = require('mocha');

const Path =	require('../../../../src/Router/RouteHub/Compiler/Sequence/Path');
const Tree =	require('../../../../src/Router/RouteHub/Compiler/Sequence/Tree');

describe('Router::RouteHub::Compiler::Sequence::', function () {
	describe('Path::', function () {
		describe('toPassageList()', function () {
			it('should be [] if \'\'', function () {
				const passageList = Path.toPassageList('');

				assert.deepStrictEqual(passageList, []);
			});

			it('should be [\'\'] if /.', function () {
				const passageList = Path.toPassageList('/');

				assert.deepStrictEqual(passageList, ['']);
			});

			it('should be [a,b] if \'a/b\'', function () {
				const passageList = Path.toPassageList('a/b');

				assert.deepStrictEqual(passageList, ['a', 'b']);
			});
		});
	});

	describe('Tree::', function () {

	});
});