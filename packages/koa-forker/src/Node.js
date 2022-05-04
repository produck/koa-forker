class Node {
	constructor() {
		this.middlewares = [];
	}

	put(...middlewares) {
		this.middlewares.push(...middlewares);
	}
}

exports.Path = class PathNode extends Node {
	constructor(path) {
		super();

		this.path = path;
		this.childNodeList = [];
	}

	append(node) {
		this.childNodeList.push(node);
	}
};

exports.Method = class MethodNode extends Node {
	constructor(method) {
		super();

		this.method = method;
	}
};