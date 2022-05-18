const { describe, it } = require('mocha');
const Koa = require('koa');
const request = require('supertest');

const Forker = require('../');

describe('A sample application.', function () {
	const root = new Forker.Router({ name: 'Root', prefix: 'api' });
	const user = new Forker.Router({ name: 'User', prefix: 'user' });

	root
		.use(function validateAuthenticate(ctx, next) {
			return next();
		})
		.use('/user', function isAdministrator(ctx, next) {

			return next();
		})
		.redirect('/account', 'User')
		.use(user);

	user
		.get({ name: 'User' }, function queryAllUserList(ctx) {
			ctx.body = 'UserList';
		})
		.post() //501
		.param('notExisted', function preHandleId(value, ctx, next) {
			ctx.state.id = value;

			return next();
		})
		.param('id', function preHandleId(value, ctx, next) {
			ctx.state.id = value;

			return next();
		})
		.put('{id}')
		.get({ name: 'getUser', path: '{id}' }, function getUser(ctx) {
			ctx.body = `User: ${ctx.params.id}`;
		});

	describe('Default Middlewares', function () {
		const app = new Koa();
		let server = null;

		app.use(root.Middleware());

		this.beforeAll(() => server = app.listen());

		it('should be a good work to GET /api/user/1 200 OK.', function (done) {
			request(server).get('/api/user/1').expect(200, 'User: 1', done);
		});

		it('should be 301 from /account to /user.', function (done) {
			request(server)
				.get('/api/account')
				.expect('Location', '/api/user')
				.expect(301, done);
		});

		it('should be 404 from /abc', function (done) {
			request(server)
				.get('/abc')
				.expect(404, done);
		});

		it('should be 404 from GET /api', function (done) {
			request(server)
				.get('/api')
				.expect(404, done);
		});

		it('should be 405 POST /api/user/1', function (done) {
			request(server)
				.delete('/api/user/1')
				.expect('Allow', 'GET, PUT')
				.expect(405, done);
		});

		it('should be 501 POST /api/user', function (done) {
			request(server)
				.post('/api/user')
				.expect(501, done);
		});

		this.afterAll(() => server.close());
	});

	describe('Passthrough Middlewares', function () {
		const app = new Koa();
		let server = null;

		app.use(root.Middleware({
			onMethodNotAllowed: false,
			onNotImplemented: false
		}));

		this.beforeAll(() => server = app.listen());

		it('should be 404 not 405 POST /api/user/1', function (done) {
			request(server)
				.delete('/api/user/1')
				.expect(404, done);
		});

		it('should be 404 not 501 POST /api/user', function (done) {
			request(server)
				.post('/api/user')
				.expect(404, done);
		});

		this.afterAll(() => server.close());
	});
});
