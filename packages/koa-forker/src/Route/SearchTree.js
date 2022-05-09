const compose = require('koa-compose');

const Path = require('../path');
const METHODS = require('../methods');
const Reference = require('../reference');

function getPassageMiddlewareSlot(method, passageDepth) {
	return method.middlewares[method.passageIndexList[passageDepth]];
}

module.exports = function createPathSearchTree(rootDefinitionNode, options) {
	return (function PathSearchNode(definitioneNode) {
		const {
			passage, childList, depth,
			methods: methodDefinitions
		} = definitioneNode;

		const { test, resolver } = Path.compile(passage);

		function resolveParam(ctx, next) {
			const paramStack = Reference.ctxParamStackMap.get(ctx);

			resolver(paramStack[depth], ctx.params);

			return next();
		}

		const methods = {};

		for (const name in methodDefinitions) {
			const method = methodDefinitions[name];

			getPassageMiddlewareSlot(method, depth).push(resolveParam);

			methods[name] = method.count > 0
				? compose(method.middlewares.flat(Infinity))
				: options.onNotImplemented;
		}

		const searchNode = {
			test,
			methods,
			allowedMethods: '',
			childList: childList.map(child => PathSearchNode(child))
		};

		const allowedMethodList = Object.keys(methods);

		if (allowedMethodList.length > 0) {
			searchNode.allowedMethods = Object.keys(methods).join(', ');

			for (const name of METHODS.RESTful.filter(name => !methods[name])) {
				methods[name] = options.onMethodNotAllowed;
			}
		}

		return searchNode;
	})(rootDefinitionNode);
};
