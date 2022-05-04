const Forker = require('../');

const router = new Forker.Router();

router.use(function auth(ctx, next) {
	return next();
});

const childRouter = new Forker.Router();

router.use(childRouter, function send(ctx) {
	ctx.body = {};
});

childRouter.get('/child', function queryChildList(ctx, next) {

}).post('/child', function createChild(ctx, next) {

}).use(function check(ctx) {
	ctx.body = true;
});

router.Middleware();
