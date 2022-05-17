const assert = require('assert');
const { describe, it } = require('mocha');

const Sequence =	require('../../../../src/Router/RouteHub/Compiler/Sequence');
const Definition =	require('../../../../src/Router/RouteHub/Compiler/Definition');
const Search = require('../../../../src/Router/RouteHub/Compiler/Search');

describe('Router::RouteHub::Compiler::Search::', function () {
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

	describe('Tree::create()', function () {
		it('should create a root search tree.', function () {
			const sequence = new Sequence.Node.Passage('');
			const definition = Definition.Tree.create(sequence);
			const search = Search.create(definition);

			assert.deepEqual(search, {
				allowedMethods: '',
				childList: [],
				depth: 0,
				methods: {},
				passage: '',
				test: search.test
			});
		});

		it('should create a sample definition.', function () {
			const sample = new SampleTree();
			const definition = Definition.Tree.create(sample);

			const onMethodNotAllowed = () => {};
			const onNotImplemented = () => {};

			const search = Search.create(definition, {
				onMethodNotAllowed: onMethodNotAllowed,
				onNotImplemented: onNotImplemented
			});

			assert.deepStrictEqual(search, {
				allowedMethods: '',
				childList: [
					{
						allowedMethods: 'GET, POST',
						childList: [
							{
								allowedMethods: '',
								childList: [],
								depth: 2,
								methods: {},
								passage: 'bar',
								test: search.childList[0].childList[0].test
							}
						],
						depth: 1,
						methods: Object.assign({}, search.childList[0].methods),
						passage: 'api',
						test: search.childList[0].test
					}
				],
				depth: 0,
				methods: {},
				passage: '',
				test: search.test
			});
		});
	});
});