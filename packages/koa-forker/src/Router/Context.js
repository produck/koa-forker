const Component = require('./Component');
const Route = require('./RouteHub');

class Router {
	constructor(options) {
		const { name, prefix } = options;

		this.name = name;
		this.prefix = prefix;

		this.componentList = [];
		this.paramQueueMap = {};
	}

	use(pathOptionsList, sequence) {
		for (const pathOptions of pathOptionsList) {
			const component = new Component.Use({ pathOptions, sequence });

			this.componentList.push(component);
		}
	}

	method(methods, pathOptionsList, sequence) {
		for (const pathOptions of pathOptionsList) {
			const component = new Component.Method({ methods, pathOptions, sequence });

			this.componentList.push(component);
		}
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