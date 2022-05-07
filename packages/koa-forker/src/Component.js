const Path = require('./path');

class Component {
	constructor({ sequence, pathOptions = null }) {
		this.name = pathOptions.name;
		this.path = Path.PassageList(pathOptions.path);
		this.sequence = sequence;
	}
}

exports.Use = class UseComponent extends Component {};

exports.Method = class MethodComponent extends Component {
	constructor({ sequence, pathOptions, methods }) {
		super({ sequence, pathOptions });

		this.methods = methods;
	}
};
