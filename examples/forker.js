const Koa = require('koa');
const Forker = require('@produck/koa-forker');

const router = new Forker.Router({
	prefix: 'api'
}).use(function hello(ctx, next) {
	console.log('hello');

	return next();
}).post('/user', function (ctx) {
	ctx.body = {
		message: 'nb'
	};
}).get('/user/{userId}', function (ctx) {
	ctx.body = {
		message: 'hello, world!',
		userId: ctx.params.userId
	}
});

const app = new Koa();

app.use(router.Middleware()).listen(3000);
