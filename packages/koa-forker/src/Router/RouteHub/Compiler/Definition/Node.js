function PassageNode(passage) {
	return {
		parent: null,
		passage,
		methods: {},
		childList: [],
		pathNames: {},
		depth: 0
	};
}

function MethodNode() {
	return {
		middlewares: [],
		passageIndexList: [],
		count: 0,
		routerNames: {}
	};
}

exports.Method = MethodNode;
exports.Passage = PassageNode;