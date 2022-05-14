const Forker = require('../');

const router = new Forker.Router({
	name: 'API_ROOT',
	prefix: 'api'
});

router.use(function parseBody(ctx, next) {
	return next();
}, function auth(ctx, next) {
	return next();
});

const childRouter = new Forker.Router({
	name: 'child'
});

router.use('/child/toy', function onlyToy() {

}).use(childRouter, function send(ctx) {
	ctx.body = {};
});

childRouter
	.get({ name: '501', path: '/501/{id}/{id2}'})
	.get({
		name: 'queryChild', path: '/child'
	}, function queryChildList(ctx, next) {

	})
	.post('/child', function ensure() {

	}, function createChild(ctx, next) {

	})
	.use(function check1(ctx) {
		ctx.body = true;
	}).all('/child/toy', function queryChildToyList(ctx) {

	});

router.Middleware();

// const route = router.Route();

// console.log(route);

// const url = route.url('501', { id: '1', id2: '2' });
// const url = route.url('queryChild');

// console.log(url);