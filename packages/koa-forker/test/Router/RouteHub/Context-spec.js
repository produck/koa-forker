const assert = require('assert');
const { describe, it } = require('mocha');

const RouterContext =	require('../../../src/Router/Context');
const RouteHubContext =	require('../../../src/Router/RouteHub/Context');

describe('Router::RouteHub::Context', function () {
	const emptyPreset = { name: 'any', prefix: '' };

	describe('constructor()', function () {
		it('should create a RouteHub from a Router.', function () {
			new RouteHubContext(new RouterContext(emptyPreset));
		});
	});

	describe('Middleware()', function () {
		it('shoud create a Middleware named by Router.', function () {
			const route = new RouteHubContext(new RouterContext(emptyPreset));
			const middleware = route.Middleware({});

			assert.strictEqual(middleware.name, 'anyRouteMiddleware');
		});
	});

	describe('url()', function () {
		it('should be `/api/use/1`', function () {
			const router = new RouterContext({
				name: 'Test',
				prefix: '/api'
			});

			router.use([{ name: 'Use1', path: '/use/{id=\\d+}' }], [() => {}]);

			const route = new RouteHubContext(router);
			const url = route.url('Use1', { id: '1' }, { queryString: '' });

			assert.strictEqual(url, '/api/use/1');
		});

		it('should throws if invalid params.', function () {
			const router = new RouterContext({
				name: 'Test',
				prefix: '/api'
			});

			router.use([{ name: 'Use1', path: '/use/{id=\\d+}' }], [() => {}]);

			const route = new RouteHubContext(router);

			assert.throws(() => {
				route.url('Use1', { id: 'aaa' }, { queryString: '' });
			}, {
				name: 'Error',
				message: 'Invalid params.id value, a string matched /\\d+/ expected'
			});
		});
	});
});