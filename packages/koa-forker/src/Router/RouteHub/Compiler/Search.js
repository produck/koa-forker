const compose = require('koa-compose');

const Passage = require('./Passage');
const METHODS = require('./methods');
const Reference = require('./Reference');

function MatcherTree(rootDefinitionNode, options) {
	const searchTree = (function PathSearchNode(definitioneNode) {
		const { passage, childList, depth } = definitioneNode;

		const searchNode = {
			test: null,
			passage,
			depth,
			methods: {},
			allowedMethods: '',
			childList: childList.map(child => PathSearchNode(child))
		};

		for (const name in definitioneNode.methods) {
			const method = definitioneNode.methods[name];
			const sequence = [...method.middlewares];
			const slotList = [];

			method.passageIndexList.forEach((slotIndex, depth) => {
				const slot = [];

				sequence.splice(slotIndex + depth, 0, slot);
				slotList.push(slot);
			});

			searchNode.methods[name] = {
				count: method.count,
				sequence,
				slotList: slotList,
				middleware: null
			};
		}

		return searchNode;
	})(rootDefinitionNode);

	function insertParamResolverMiddleware(searchNode, targetDepth, middleware) {
		(function insert(searchNode) {
			const { methods, childList } = searchNode;

			for (const name in methods) {
				methods[name].slotList[targetDepth].push(middleware);
			}

			for (const childSearchNode of childList) {
				insert(childSearchNode);
			}
		})(searchNode);
	}

	(function loadSearchNodeParamResolver(searchNode) {
		const { passage, depth, childList } = searchNode;
		const { test, resolver } = Passage.Executor(passage);

		function resolveParamMiddleware(ctx, next) {
			const paramStack = Reference.ctxParamStackMap.get(ctx);

			resolver(paramStack[depth], ctx.params);

			return next();
		}

		insertParamResolverMiddleware(searchNode, depth, resolveParamMiddleware);

		for (const childSearchNode of childList) {
			loadSearchNodeParamResolver(childSearchNode);
		}

		searchNode.test = test;
	})(searchTree);

	(function composeSearchTree(searchNode) {
		const { methods, childList } = searchNode;

		for (const name in methods) {
			const method = methods[name];

			method.middleware = method.count > 0
				? compose(method.sequence.flat(Infinity))
				: options.onNotImplemented;
		}

		const allowedMethodList = Object.keys(methods);

		if (allowedMethodList.length > 0) {
			searchNode.allowedMethods = Object.keys(methods).join(', ');

			for (const name of METHODS.RESTful.filter(name => !methods[name])) {
				methods[name] = {
					middleware: options.onMethodNotAllowed
				};
			}
		}

		for (const childSearchNode of childList) {
			composeSearchTree(childSearchNode);
		}
	})(searchTree);

	return searchTree;
}

exports.create = MatcherTree;