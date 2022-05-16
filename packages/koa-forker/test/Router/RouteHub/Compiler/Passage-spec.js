const assert = require('assert');
const { describe, it } = require('mocha');

const Passage =	require('../../../../src/Router/RouteHub/Compiler/Passage');

describe('Router::RouteHub::Compiler::Passage::Executor()', function () {
	it('should create static passage.', function () {
		const executor = Passage.Executor('foo');
		const params = {};

		assert.strictEqual(executor.test('foo'), true);
		assert.strictEqual(executor.test('bar'), false);

		executor.resolver('any', params);

		assert.deepStrictEqual(params, {});
	});

	it('should create a passage with single param.', function () {
		const executor = Passage.Executor('{id}');
		const params = {};

		assert.strictEqual(executor.test('foo'), true);
		assert.strictEqual(executor.test('bar'), true);

		executor.resolver('baz', params);

		assert.deepStrictEqual(params, { id: 'baz' });
	});

	it('should create a passage with multiple params.', function () {
		const executor = Passage.Executor('{category}-{year=\\d{4}}-{month=\\d{2}}.png');
		const params = {};

		assert.strictEqual(executor.test('foo'), false);
		assert.strictEqual(executor.test('bar'), false);
		assert.strictEqual(executor.test('baz-2022-05.png'), true);

		executor.resolver('baz-2022-05.png', params);

		assert.deepStrictEqual(params, {
			category: 'baz',
			year: '2022',
			month: '05'
		});
	});
});