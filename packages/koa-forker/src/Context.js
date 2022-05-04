const Component = require('./Component');
const mark = require('./symbol');
const Route = require('./Route');

class Router {
	constructor(options) {
		const { name, prefix } = options;

		this.name = name;
		this.prefix = prefix;

		this.componentList = [];
		this.paramQueueMap = {};
	}

	use(pathOptions, sequence) {
		const component = new Component.Use({
			path: pathOptions, sequence
		});

		this.componentList.push(component);
	}

	method(methods, pathOptions, sequence) {
		const component = new Component.Method({
			methods,
			path: pathOptions,
			sequence
		});

		this.componentList.push(component);
	}

	param(paramName, paramMiddlewareList) {
		if (!this.paramQueueMap[paramName]) {
			this.paramQueueMap[paramName] = [];
		}

		this.paramQueueMap[paramName].push(...paramMiddlewareList);
	}

	Middleware(compilerOptions) {
		const finalName = `${this.name}RouteMiddleware`;
		const route = new Route(compilerOptions).compile(this);

		/**
		 * Naming middleware function name dynamicly
		 */
		return Object.assign({
			[finalName](ctx, next) {
				const middleware = route.match(ctx);

				return middleware ? middleware(ctx, next) : next();
			}
		}[finalName], { [mark]: true });
	}
}

module.exports = Router;