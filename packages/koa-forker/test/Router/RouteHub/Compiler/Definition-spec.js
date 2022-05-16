const assert = require('assert');
const { describe, it } = require('mocha');

const Sequence =	require('../../../../src/Router/RouteHub/Compiler/Sequence');
const Definition =	require('../../../../src/Router/RouteHub/Compiler/Definition');

describe('Router::RouteHub::Compiler::Definition::', function () {
	function foo() {}
	function bar() {}
	function qux() {}

	function SampleTree() {
		const rootPassage = new Sequence.Node.Passage('');
		const middlewareRoot = new Sequence.Node.Middleware();
		const methodNode = new Sequence.Node.Method('GET');
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

		rootPassage.append(apiPassage);
		rootPassage.append(apiPassage2);
		apiPassage2.append(apiBarPassage);

		return rootPassage;
	}

	describe('Tree::create()', function () {
		it('should create a root definition.', function () {
			const sequence = new Sequence.Node.Passage('');
			const definition = Definition.Tree.create(sequence);

			assert.deepStrictEqual(definition, {
				childList: [],
				depth: 0,
				methods: {},
				parent: null,
				passage: '',
				pathNames: {}
			});
		});

		it('should create a sample definition.', function () {
			const sample = new SampleTree();
			const definition = Definition.Tree.create(sample);

			const rootNode = {
				childList: [],
				depth: 0,
				methods: {},
				parent: null,
				passage: '',
				pathNames: {}
			};

			const apiNode = {
				childList: [],
				depth: 1,
				methods: {
					GET: {
						count: 1,
						middlewares: [foo, qux, bar],
						passageIndexList: [0, 0],
						routerNames: { baz: true }
					}
				},
				parent: rootNode,
				passage: 'api',
				pathNames: { a: true, b: true }
			};

			const barNode = {
				childList: [],
				depth: 2,
				methods: {},
				parent: apiNode,
				passage: 'bar',
				pathNames: {}
			};

			rootNode.childList.push(apiNode);
			apiNode.childList.push(barNode);

			assert.deepStrictEqual(definition, rootNode);
		});
	});
});