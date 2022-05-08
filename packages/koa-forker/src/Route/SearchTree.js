const compose = require('koa-compose');

const Path = require('../path');
const METHODS = require('../methods');
const Reference = require('../reference');

module.exports = function createPathSearchTree(rootDefinitionNode, options) {
	return (function PathSearchNode(definitioneNode) {
		const {
			passage, childList, depth,
			methods: methodDefinitions
		} = definitioneNode;

		const { test, resolver } = Path.compile(passage);
		const methods = {};

		for (const name in methodDefinitions) {
			const method = methodDefinitions[name];

			const resolveParam = function resolveParam(ctx, next) {
				const paramStack = Reference.ctxParamStackMap.get(ctx);

				resolver(paramStack.pop(), ctx.params);

				return next();
			};

			method.middlewares[method.passageIndexList[depth]].push(resolveParam);

			if (method.count > 0) {
				methods[name] = compose(method.middlewares.flat());
			} else {
				methods[name] = options.onNotImplemented;
			}
		}

		for (const name of METHODS.RESTful.filter(name => !methods[name])) {
			methods[name] = options.onMethodNotAllowed;
		}

		return {
			test,
			methods,
			allowedMethods: Object.keys(methods).join(', '),
			childList: childList.map(child => PathSearchNode(child))
		};
	})(rootDefinitionNode);
};
