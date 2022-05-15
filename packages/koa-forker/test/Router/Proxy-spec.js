const assert = require('assert');
const { describe, it } = require('mocha');

const RouterProxy =	require('../../src/Router/Proxy');
const Component = require('../../src/Router/Component');
const METHODS = require('../../src/Router/RouteHub/Compiler/methods');

describe('Router::Proxy', function () {
	describe('constructor()', function () {
		it('should create a new default RouterProxy.', function () {
			new RouterProxy();
		});

		it('should create a new RouterProxy by a specific options.', function () {
			new RouterProxy({
				name: 'test',
				prefix: '/api'
			});
		});

		it('should throws if invalid options.', function () {
			assert.throws(() => {
				new RouterProxy(false);
			}, {
				name: 'TypeError',
				message: 'Invalid options, an object expected.'
			});
		});
	});

	describe('name', function () {
		it('should be <anonymous> of a default RouterProxy.', function () {
			const router = new RouterProxy();

			assert.strictEqual(router.name, '<anonymous>');
		});

		it('should be the specific name of a RouterProxy.', function () {
			const router = new RouterProxy({ name: 'test' });

			assert.strictEqual(router.name, 'test');
		});

		it('should NOT set a name by `RouterProxy.name=`.', function () {
			const router = new RouterProxy({ name: 'test' });

			router.name = 'foo';
			assert.strictEqual(router.name, 'test');
		});
	});

	describe('prefix', function () {
		it('should be a \'\' of a default RouterProxy.', function () {
			const router = new RouterProxy();

			assert.strictEqual(router.prefix, '');
		});

		it('should be the specific name of a RouterProxy.', function () {
			const router = new RouterProxy({ prefix: '/api' });

			assert.strictEqual(router.prefix, '/api');
		});

		it('should set a prefix by `RouterProxy.prefix=`.', function () {
			const router = new RouterProxy({});

			assert.strictEqual(router.prefix, '');
			router.prefix = '/api';
			assert.strictEqual(router.prefix, '/api');
		});

		it('should throws if invalid prefix value.', function () {
			assert.throws(() => {
				new RouterProxy({}).prefix = false;
			}, {
				name: 'TypeError',
				message: 'Invalid prefix, a string expected.'
			});
		});
	});

	describe('RouteHub()', function () {

	});

	describe('param()', function () {

	});

	describe('redirect()', function () {

	});

	describe('Middleware()', function () {

	});

	describe('use()', function () {

	});

	describe('all()', function () {

	});

	for (const name of METHODS.RESTful) {
		describe(`${name.toLowerCase()}()`, function () {

		});
	}
});