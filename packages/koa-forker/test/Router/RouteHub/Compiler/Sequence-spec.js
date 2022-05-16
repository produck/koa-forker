const assert = require('assert');
const { describe, it } = require('mocha');

const RouterContext =	require('../../../../src/Router/Context');
const Node =	require('../../../../src/Router/RouteHub/Compiler/Sequence/Node');
const Tree =	require('../../../../src/Router/RouteHub/Compiler/Sequence/Tree');
const Path =	require('../../../../src/Router/RouteHub/Compiler/Sequence/Path');

describe('Router::RouteHub::Compiler::Sequence::', function () {
	describe('Path::', function () {
		describe('toPassageList()', function () {
			it('should be [] if \'\'', function () {
				const passageList = Path.toPassageList('');

				assert.deepStrictEqual(passageList, []);
			});

			it('should be [\'\'] if /.', function () {
				const passageList = Path.toPassageList('/');

				assert.deepStrictEqual(passageList, ['']);
			});

			it('should be [a,b] if \'a/b\'', function () {
				const passageList = Path.toPassageList('a/b');

				assert.deepStrictEqual(passageList, ['a', 'b']);
			});
		});
	});

	describe('Tree::create()', function () {
		it('should create a new SequenceTree from a blank Router', function () {
			const context = new RouterContext({ prefix: '' });
			const tree = Tree.create(context);

			assert.deepStrictEqual(tree, new Node.Passage(''));
		});

		it('should create a typical SequenceTree.', function () {
			const context = new RouterContext({ prefix: '/api', name: 'baz' });
			const childContext = new RouterContext({ prefix: '', name: 'child' });
			const child2Context = new RouterContext({ prefix: '', name: 'child2' });

			function foo() {}
			function bar() {}
			function qux() {}

			childContext.use([{ name: null, path: '' }], [qux]);
			context.use([{ name: 'a', path: '' }], [foo, childContext]);
			context.method(['GET'], [{ name: 'b', path: '' }], [bar]);
			context.use([{ name: null, path: '' }], [child2Context]);

			const tree = Tree.create(context);

			function ExpectedTree() {
				const rootPassage = new Node.Passage('');
				const middlewareRoot = new Node.Middleware();
				const methodNode = new Node.Method('GET');
				const apiPassage = new Node.Passage('api');
				const middlewareChild = new Node.Middleware();

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

				return rootPassage;
			}

			assert.deepStrictEqual(tree, ExpectedTree());
		});
	});
});