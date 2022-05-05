const Forker = require('../');

const router = new Forker.Router();

router.use(function parseBody(ctx, next) {
	return next();
}, function auth(ctx, next) {
	return next();
});

const childRouter = new Forker.Router();

router.use(childRouter, function send(ctx) {
	ctx.body = {};
});

childRouter.get('/child', function queryChildList(ctx, next) {

}).post('/child', function createChild(ctx, next) {

}).use(function check1(ctx) {
	ctx.body = true;
}).all('/child/toy', function queryChildToyList(ctx) {

});

router.Middleware();
