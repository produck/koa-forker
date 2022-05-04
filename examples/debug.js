const Koa = require('koa');
const KoaRouter = require('@koa/router');

const app = new Koa();
const router = new KoaRouter();


router.use((ctx, next) => {
	console.log('1');

	return next();
}).get('/a', function (ctx, next) {
	console.log('2.1');

	return next();
}).get('/b', function (ctx, next) {
	console.log('2.2');

	return next();
}).use('/b', function (ctx, next) {
	console.log('3');

	return next();
}).get('/c', function (ctx, next) {
	console.log('4.1');

	return next();
});


app.use(router.routes());

app.listen(3000);