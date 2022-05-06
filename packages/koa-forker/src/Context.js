const Component = require('./Component');
const Route = require('./Route');

class Router {
	constructor(options) {
		const { name, prefix } = options;

		this.name = name;
		this.prefix = prefix; //TODO is a path NOT string

		this.componentList = [];
		this.paramQueueMap = {};
	}

	get hasPrefix() {
		return this.prefix !== null;
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

	Middleware(options) {
		return Route.compile(this).Middleware(options);
	}
}

module.exports = Router;