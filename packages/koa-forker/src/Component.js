class Component {
	constructor({ sequence, path = null }) {
		this.path = path;
		this.sequence = sequence;
	}
}

exports.Passage = class PassageComponent extends Component {};

exports.Method = class MethodComponent extends Component {
	constructor({ sequence, path, methods }) {
		super({ sequence, path });

		this.methods = methods;
	}
};
