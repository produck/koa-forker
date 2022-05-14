class MiddlewareNode {
	constructor() {
		this.middlewares = [];
	}

	get size() {
		return this.middlewares.length;
	}

	put(...middlewares) {
		this.middlewares.push(...middlewares);
	}
}

class PassageNode {
	constructor(passage) {
		this.passage = passage;
		this.pathNames = {};
		this.childNodeList = [];
	}

	append(node) {
		this.childNodeList.push(node);
	}
}

class MethodNode extends MiddlewareNode {
	constructor(method) {
		super();

		this.method = method;
		this.routerNames = {};
	}
}

exports.Middleware = MiddlewareNode;
exports.Method = MethodNode;
exports.Passage = PassageNode;