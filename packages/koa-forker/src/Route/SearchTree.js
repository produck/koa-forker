const compose = require('koa-compose');

const Path = require('../path');
const METHODS = require('../methods');

module.exports = function createPathSearchTree(rootDefinitionNode, options) {
	return (function PathSearchNode(definitionNode) {
		const methods = {};

		for (const name in definitionNode.methods) {
			const method = definitionNode.methods[name];

			if (method.count > 0) {
				methods[name] = compose(method.middlewares);
			} else {
				methods[name] = options.onNotImplemented;
			}
		}

		for (const name of METHODS.RESTful.filter(name => !methods[name])) {
			methods[name] = options.onMethodNotAllowed;
		}

		//TODO compile test()

		return {
			test: definitionNode.test,
			hasParams: definitionNode.resolver !== null,
			methods,
			allowedMethods: Object.keys(methods).join(', '),
			childList: definitionNode.childList.map(child => PathSearchNode(child))
		};
	})(rootDefinitionNode);
};
