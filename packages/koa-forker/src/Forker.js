const Router = require('./Router');
const Normalize = require('./normalize');

const SEPARATOR_REG = /\/+/g;

module.exports = class Forker {
	constructor(options) {
		const finalOptions = Normalize.Forker(options);

		this.prefix = finalOptions.prefix;

		this.rootRouter = new Router({
			name: 'ForkerRoot',
			children: [...finalOptions.children]
		}, this);

		Object.freeze(this);
	}

	Router(options) {
		return new Router(options, this);
	}

	Middleware() {
		// leaf NodeRoute -> ComposedRouteMiddleware
		const composedRouteSet = new Map();

		const match = nodeQueue => {

		};

		//TODO compile composed routes

		return function forkerRootRouteMiddleware(ctx, next) {
			const nodeQueue = ctx.path.split(SEPARATOR_REG).slice(1);
			const leafRoute = match(nodeQueue);

			if (leafRoute) {
				ctx.params = {};

				return composedRouteSet.get(leafRoute)(ctx, next);
			} else {
				return ctx.throw(404);
			}
		};
	}
};