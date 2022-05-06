const compose = require('koa-compose');

module.exports = function PathSearchNode(rootDefinitionNode, options) {
	const methods = {};

	for (const name in rootDefinitionNode.methods) {
		methods[name] = compose(rootDefinitionNode.methods[name]);
	}

	//TODO compile test()
	//TODO 405, 501

	return {
		test: rootDefinitionNode.passage.test,
		methods: methods,
		allowedMethods: Object.freeze([]),
		childList: rootDefinitionNode.childList.map(child => PathSearchNode(child))
	};
};
