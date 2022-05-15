const assert = require('assert');
const { describe, it } = require('mocha');

const RouterContext =	require('../../src/Router/Context');
const Component = require('../../src/Router/Component');

describe('Router::Context', function () {
	const presetOptions = { name: 'root', prefix: '/api' };

	function MockUseMiddleware() {}
	function MockMethodMiddleware() {}

	describe('constructor()', function () {
		it('should create a new RouterContext.', function () {
			const routerContext = new RouterContext(presetOptions);

			assert.deepEqual(routerContext, {
				name: 'root',
				prefix: '/api',
				componentList: []
			});
		});
	});

	describe('use()', function () {
		it('should append a new UseComponent.', function () {
			const routerContext = new RouterContext(presetOptions);

			routerContext.use([{ name: null, path: 'foo' }], [MockUseMiddleware]);

			assert.deepEqual(routerContext, {
				name: 'root',
				prefix: '/api',
				componentList: [
					new Component.Use({
						pathOptions: { name: null, path: 'foo' },
						sequence: [MockUseMiddleware]
					})
				]
			});
		});
	});

	describe('method()', function () {
		it('should append a new MethodComponent.', function () {
			const routerContext = new RouterContext(presetOptions);

			routerContext.method([
				'GET'
			], [
				{ name: null, path: 'foo' }
			], [
				MockMethodMiddleware
			]);

			assert.deepEqual(routerContext, {
				name: 'root',
				prefix: '/api',
				componentList: [
					new Component.Method({
						methods: ['GET'],
						pathOptions: { name: null, path: 'foo' },
						sequence: [MockMethodMiddleware]
					})
				]
			});
		});
	});

	it('should append a new UseComponent & a new MethodComponent', function () {
		const context = new RouterContext(presetOptions);

		context.use([{ name: null, path: 'foo' }], [MockUseMiddleware]);
		context.method(['GET'], [{ name: null, path: 'bar' }], [MockMethodMiddleware]);

		assert.deepEqual(context, {
			name: 'root',
			prefix: '/api',
			componentList: [
				new Component.Use({
					pathOptions: { name: null, path: 'foo' },
					sequence: [MockUseMiddleware]
				}),
				new Component.Method({
					methods: ['GET'],
					pathOptions: { name: null, path: 'bar' },
					sequence: [MockMethodMiddleware]
				})
			]
		});
	});
});
