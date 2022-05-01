const Router = require('./Router');
const Normalize = require('./normalize');

const SEPARATOR_REG = /\/+/g;

module.exports = class Forker {
	constructor(options) {
		const finalOptions = Normalize.Forker(options);

		this.prefix = finalOptions.prefix;

		this.rootRouter = new Router({
			name: 'Forker.Root',
			children: [...finalOptions.children]
		}, this);

		Object.freeze(this);
	}

	Router(options) {
		return new Router(options, this);
	}

	Middleware() {
		const composed = this.rootRouter.compile();
		const prefix = this.prefix;

		return function forkerRootRouteMiddleware(ctx, next) {
			const nodeQueue = ctx.path.split(SEPARATOR_REG).slice(1);

			if (prefix !== '' && nodeQueue.shift() !== prefix) {
				return next();
			}

			Object.assign(ctx, {
				params: {},
				nodeQueue
			});

			return composed(ctx, next);
		};
	}
};