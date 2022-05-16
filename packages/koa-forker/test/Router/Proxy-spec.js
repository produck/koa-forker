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
		it('should create a new RouteHub.', function () {
			new RouterProxy().RouteHub();
		});
	});

	describe('param()', function () {
		it('should create a param resolving middleware.', function () {
			new RouterProxy().param('id', function (value, ctx, next) {
				return next();
			});
		});

		it('should throws if a invalid param name.', function () {
			assert.throws(() => {
				new RouterProxy().param(null, function (value, ctx, next) {
					return next();
				});
			}, {
				name: 'TypeError',
				message: 'Invalid name, a string expected.'
			});
		});

		it('should throws if a invalid param middleware.', function () {
			assert.throws(() => {
				new RouterProxy().param('id', 0);
			}, {
				name: 'TypeError',
				message: 'Invalid paramMiddleware, a function expected.'
			});
		});
	});

	describe('redirect()', function () {
		it('should create a redirect.', function () {
			new RouterProxy()
				.redirect('/api', 'foo')
				.redirect('/api', 'foo', {});
		});

		it('should throws if no pathOptionsList.', function () {
			assert.throws(() => {
				new RouterProxy().redirect(0, 'abc');
			}, {
				name: 'TypeError',
				message: 'Invalid path, object, string, (object|string)[] expected.'
			});
		});

		it('should throws if no pathOptionsList.', function () {
			assert.throws(() => {
				new RouterProxy().redirect('abc', 0);
			}, {
				name: 'TypeError',
				message: 'Invalid destinationName, a string expected.'
			});
		});
	});

	describe('Middleware()', function () {
		it('should create a new Middleware by default.', function () {
			new RouterProxy().Middleware();
		});

		it('should create a new Middleware by options.', function () {
			new RouterProxy().Middleware({});
		});

		it('should throws if invalid options.', function () {
			assert.throws(() => {
				new RouterProxy().Middleware(null);
			}, {
				name: 'TypeError',
				message: 'Invalid options, an object expected.'
			});
		});
	});

	describe('use()', function () {
		it('should use nothing.', function () {
			new RouterProxy().use();
		});

		it('should use a middleware.', function () {
			new RouterProxy().use(() => {});
		});

		it('should use a middleware to a specific path.', function () {
			new RouterProxy().use('/api', () => {});
		});

		it('should use a nested Router.', function () {
			new RouterProxy().use(new RouterProxy());
		});

		it('should throws if there is an invalid middleware.', function () {
			assert.throws(() => {
				new RouterProxy().use('/api', false);
			}, {
				name: 'TypeError',
				message: 'Invalid sequence[0], a function or Router expected.'
			});
		});

		it('should throws if invalid pahtOptions.', function () {
			assert.throws(() => {
				new RouterProxy().use(false, () => {});
			}, {
				name: 'TypeError',
				message: 'Invalid path, object, string, (object|string)[] expected.'
			});
		});

		it('should throws if there is a Route Middleware.', function () {
			const middleware = new RouterProxy().Middleware();

			assert.throws(() => {
				new RouterProxy().use(() => {}, middleware);
			}, {
				name: 'TypeError',
				message: 'The sequence[1] COULD NOT be a Route Middleware.'
			});
		});
	});

	describe('all()', function () {
		it('should register all methods without anything.', function () {
			new RouterProxy().all();
		});

		it('should register all methods by path without anything.', function () {
			new RouterProxy().all('/api');
		});

		it('should register all methods with a middleware.', function () {
			new RouterProxy().all(() => {});
		});

		it('should register all methods by path with a middleware.', function () {
			new RouterProxy().all('/api', () => {});
		});

		it('should throws if invalid middleware in method sequence', function () {
			assert.throws(() => {
				new RouterProxy().all('/api', () => {}, 0);
			}, {
				name: 'TypeError',
				message: 'Invalid sequence[1], a function expected.'
			});
		});
	});

	for (const Name of METHODS.RESTful) {
		const name = Name.toLowerCase();

		describe(`${name}()`, function () {
			it(`should register ${Name} without anything.`, function () {
				new RouterProxy()[name]();
			});

			it(`should register ${Name} by path without anything.`, function () {
				new RouterProxy()[name]('/api');
			});

			it(`should register ${Name} with a middleware.`, function () {
				new RouterProxy()[name](() => {});
			});

			it(`should register ${Name} by path with a middleware.`, function () {
				new RouterProxy()[name]('/api', () => {});
			});

			it(`should throws if invalid middleware in ${Name} sequence`, function () {
				assert.throws(() => {
					new RouterProxy()[name]('/api', () => {}, 0);
				}, {
					name: 'TypeError',
					message: 'Invalid sequence[1], a function expected.'
				});
			});

		});
	}
});