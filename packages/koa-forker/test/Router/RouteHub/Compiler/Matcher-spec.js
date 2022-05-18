const assert = require('assert');
const { describe, it } = require('mocha');

const Sequence =	require('../../../../src/Router/RouteHub/Compiler/Sequence');
const Definition =	require('../../../../src/Router/RouteHub/Compiler/Definition');
const Search = require('../../../../src/Router/RouteHub/Compiler/Search');
const Matcher =	require('../../../../src/Router/RouteHub/Compiler/Matcher');

describe('Router::RouteHub::Compiler::Passage::Matcher::', function () {
	function foo() {}
	function bar() {}
	function qux() {}

	function SampleTree() {
		const rootPassage = new Sequence.Node.Passage('');
		const middlewareRoot = new Sequence.Node.Middleware();
		const methodNode = new Sequence.Node.Method('GET');
		const methodNodePOST = new Sequence.Node.Method('POST');
		const apiPassage = new Sequence.Node.Passage('api');
		const middlewareChild = new Sequence.Node.Middleware();
		const apiPassage2 = new Sequence.Node.Passage('api');
		const apiBarPassage = new Sequence.Node.Passage('bar');

		middlewareRoot.put(foo);
		methodNode.put(bar);
		methodNode.routerNames.baz = true;

		middlewareChild.put(qux);

		apiPassage.pathNames.a = true;
		apiPassage.pathNames.b = true;
		apiPassage.append(middlewareRoot);
		apiPassage.append(middlewareChild);
		apiPassage.append(methodNode);
		apiPassage.append(methodNodePOST);

		rootPassage.append(apiPassage);
		rootPassage.append(apiPassage2);
		apiPassage2.append(apiBarPassage);

		return rootPassage;
	}

	describe('constructor()', function () {
		it('should create an empty Matcher.', function () {
			const sequence = new Sequence.Node.Passage('');
			const definition = Definition.Tree.create(sequence);
			const search = Search.create(definition);
			const matcher = new Matcher(search);

			assert.deepEqual(matcher, {
				root: {
					childList: [search]
				}
			});
		});

		it('should create a sample Matcher.', function () {
			const sample = new SampleTree();
			const definition = Definition.Tree.create(sample);

			const onMethodNotAllowed = () => {};
			const onNotImplemented = () => {};

			const search = Search.create(definition, {
				onMethodNotAllowed: onMethodNotAllowed,
				onNotImplemented: onNotImplemented
			});

			const matcher = new Matcher(search);

			assert.deepEqual(matcher, {
				root: {
					childList: [search]
				}
			});
		});
	});

	describe('find()', function () {
		const sample = new SampleTree();
		const definition = Definition.Tree.create(sample);

		const onMethodNotAllowed = () => {};
		const onNotImplemented = () => {};

		const search = Search.create(definition, {
			onMethodNotAllowed: onMethodNotAllowed,
			onNotImplemented: onNotImplemented
		});

		const matcher = new Matcher(search);

		it('should find the root passage.', function () {
			const passageNode = matcher.find(['']);

			assert.deepStrictEqual(passageNode, {
				allowedMethods: '',
				childList: search.childList,
				depth: 0,
				methods: {},
				passage: '',
				test: search.test,
				resolve: search.resolve
			});
		});

		it('should find a existed passage.', function () {
			const passageNode = matcher.find(['', 'api']);

			assert.deepStrictEqual(passageNode, {
				allowedMethods: 'GET, POST',
				childList: search.childList[0].childList,
				depth: 1,
				methods: search.childList[0].methods,
				passage: 'api',
				test: search.childList[0].test,
				resolve: search.childList[0].resolve
			});
		});

		it('should NOT find any passage.', function () {
			const passageNode = matcher.find(['', 'api', 'notExisted']);

			assert.deepStrictEqual(passageNode, null);
		});
	});
});