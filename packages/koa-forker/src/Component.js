class Component {
	constructor(name, sequence, path = null) {
		this.name = name;
		this.path = path;
		this.sequence = sequence;
	}
}

exports.Passage = class PassageComponent extends Component {};

exports.Method = class MethodComponent extends Component {
	constructor(name, sequence, path, methods) {
		super(name, sequence, path);

		this.methods = methods;
	}
};
