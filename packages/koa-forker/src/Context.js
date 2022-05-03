const { Object } = require('@produck/charon');
const Component = require('./Component');
const mark = require('./symbol');

class Router {
	constructor(options) {
		const { name, prefix } = options;

		this.name = name;
		this.prefix = prefix;

		this.componentList = [];
		this.paramQueueMap = {};
	}

	use(pathOptions, sequence) {
		this.componentList.push(new Component.Passage(pathOptions, sequence));

		return this;
	}

	method(methods, pathOptions, sequence) {
		this.componentList.push(new Component.Method(pathOptions, methods, sequence));
	}

	param(paramName, paramMiddlewareList) {
		if (!this.paramQueueMap[paramName]) {
			this.paramQueueMap[paramName] = [];
		}

		this.paramQueueMap[paramName].push(...paramMiddlewareList);
	}

	compile() {

	}

	Middleware(compilerOptions) {
		const finalName = `${this.name}RouteMiddleware`;
		const route = this.compile(compilerOptions);

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