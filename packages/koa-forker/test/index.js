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

childRouter.get('/501').get({
	name: 'queryChild',
	path: '/child'
}, function queryChildList(ctx, next) {

}).post('/child', function ensure() {

}, function createChild(ctx, next) {

}).use(function check1(ctx) {
	ctx.body = true;
}).all('/child/toy', function queryChildToyList(ctx) {

});

router.Middleware();
