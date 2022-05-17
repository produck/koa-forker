const assert = require('assert');
const { describe, it } = require('mocha');

const RouterContext =	require('../../../src/Router/Context');
const RouteHubProxy =	require('../../../src/Router/RouteHub/Proxy');

describe('Router::RouteHub::Proxy', function () {
	const emptyPreset = { name: 'any', prefix: '' };

	describe('constructor()', function () {
		it('should create a RouteHubProxy.', function () {
			new RouteHubProxy(new RouterContext(emptyPreset));
		});
	});

	describe('abstract', function () {
		it('should get a new route abstract.', function () {
			const route = new RouteHubProxy(new RouterContext(emptyPreset));

			assert.notStrictEqual(route.abstract, route.abstract);
		});
	});

	describe('has()', function () {
		it('should true if named path existed.', function () {
			const router = new RouterContext(emptyPreset);

			router.use([{ name: 'Use1', path: '/use/{id=\\d+}' }], [() => {}]);

			const route = new RouteHubProxy(router);

			assert.ok(route.has('Use1') === true);
		});

		it('should false if named path existed.', function () {
			const router = new RouterContext(emptyPreset);

			router.use([{ name: 'Use1', path: '/use/{id=\\d+}' }], [() => {}]);

			const route = new RouteHubProxy(router);

			assert.ok(route.has('Use') === false);
		});

		it('should throws if invalid name NOT string', function () {
			const router = new RouterContext(emptyPreset);

			router.use([{ name: 'Use1', path: '/use/{id=\\d+}' }], [() => {}]);

			const route = new RouteHubProxy(router);

			assert.throws(() => {
				route.has(1);
			}, {
				name: 'TypeError',
				message: 'Invalid name, a string expected.'
			});
		});
	});

	describe('url()', function () {
		const router = new RouterContext({
			name: 'Test',
			prefix: '/api'
		});

		router.use([{ name: 'Use1', path: '/use/{id=\\d+}' }], [() => {}]);

		const route = new RouteHubProxy(router);

		it('should be `/api/use/1`', function () {
			const url = route.url('Use1', { id: '1' }, { queryString: '' });

			assert.strictEqual(url, '/api/use/1');
		});

		it('should throws if name invalid.', function () {
			assert.throws(() => route.url(0), {
				name: 'TypeError',
				message: 'Invalid name, a string expected.'
			});
		});

		it('should throws if named path NOT existed.', function () {
			assert.throws(() => route.url('Use'), {
				name: 'Error',
				message: 'A path named "Use" is NOT existed.'
			});
		});

		it('should throws if params invalid.', function () {
			assert.throws(() => route.url('Use1', 0), {
				name: 'TypeError',
				message: 'Invalid params, an object expected.'
			});
		});
	});

	describe('Middleware()', function () {
		it('shoud create a Middleware named by Router.', function () {
			const route = new RouteHubProxy(new RouterContext(emptyPreset));
			const middleware = route.Middleware();

			assert.strictEqual(middleware.name, 'anyRouteMiddleware');
		});

		it('should throws if invalid options.', function () {
			const route = new RouteHubProxy(new RouterContext(emptyPreset));

			const expectedError = {
				name: 'TypeError',
				message: 'Invalid options, an object expected.'
			};

			assert.throws(() => route.Middleware(null), expectedError);
			assert.throws(() => route.Middleware(false), expectedError);
		});
	});
});