const Component = require('./Component');

class RouterContext {
	constructor(options) {
		const { name, prefix } = options;

		this.name = name;
		this.prefix = prefix;

		this.componentList = [];
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
}

module.exports = RouterContext;