const RouteHub = require('./RouteHub');

class UseComponent {
	constructor({ sequence, pathOptions }) {
		this.name = pathOptions.name;
		this.passageList = RouteHub.Path.PassageList(pathOptions.path);
		this.sequence = sequence;
	}
}

class MethodComponent extends UseComponent {
	constructor({ sequence, pathOptions, methods }) {
		super({ sequence, pathOptions });

		this.methods = methods;
	}
}

exports.Use = UseComponent;
exports.Method = MethodComponent;