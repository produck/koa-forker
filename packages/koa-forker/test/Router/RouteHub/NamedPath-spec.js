const assert = require('assert');
const { describe, it } = require('mocha');

const Sequence =	require('../../../src/Router/RouteHub/Compiler/Sequence');
const Definition =	require('../../../src/Router/RouteHub/Compiler/Definition');
const NamedPath =	require('../../../src/Router/RouteHub/NamedPath');

describe('Router::RouteHub::NamedPath()', function () {
	function SampleTree() {
		function foo() {}
		function bar() {}
		function qux() {}

		const rootPassage = new Sequence.Node.Passage('');
		const middlewareRoot = new Sequence.Node.Middleware();
		const methodNode = new Sequence.Node.Method('GET');
		const apiPassage = new Sequence.Node.Passage('api');
		const middlewareChild = new Sequence.Node.Middleware();
		const apiPassage2 = new Sequence.Node.Passage('api');
		const apiBarPassage = new Sequence.Node.Passage('{bar}');

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
		apiBarPassage.pathNames.hasParam = true;

		return rootPassage;
	}

	it('should create a NamedPathMap.', function () {
		const sample = new SampleTree();
		const definition = Definition.Tree.create(sample);
		const namedPathMap = NamedPath(definition);

		assert.ok(namedPathMap.a);
		assert.ok(namedPathMap.b);
		assert.ok(namedPathMap.hasParam);
	});

	it('should render a static path.', function () {
		const sample = new SampleTree();
		const definition = Definition.Tree.create(sample);
		const namedPathMap = NamedPath(definition);

		assert.strictEqual(namedPathMap.a.render({}), '/api');
	});

	it('should render a path with params.', function () {
		const sample = new SampleTree();
		const definition = Definition.Tree.create(sample);
		const namedPathMap = NamedPath(definition);

		namedPathMap.hasParam.assert({ bar: 'test' });
		assert.strictEqual(namedPathMap.hasParam.render({ bar: 'test' }), '/api/test');
	});

	it('should throws if params NOT matching assert().', function () {
		const sample = new SampleTree();
		const definition = Definition.Tree.create(sample);
		const namedPathMap = NamedPath(definition);

		assert.throws(() => {
			namedPathMap.hasParam.assert({});
		}, {
			name: 'Error',
			message: 'Invalid params.bar value, a string matched /[^/]+/ expected'
		});
	});
});