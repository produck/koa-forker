const EXP_WITH_PARAM = /{(?<key>[a-zA-Z_$][a-zA-Z_$0-9]*)(\((?<exp>.+)\))?}/;
const G_EXP_WITH_PARAM = new RegExp(EXP_WITH_PARAM, 'g');
const DEFAULT_PARAM = /[^/]+/;

const DEFAULT_TEST = () => true;
const DEFAULT_RESOLVER = () => {};

function PassageExecutor(passage) {
	const executor = {
		test: DEFAULT_TEST,
		resolver: DEFAULT_RESOLVER
	};

	if (!EXP_WITH_PARAM.test(passage)) {
		return executor;
	}

	const paramExpList = passage.match(G_EXP_WITH_PARAM);
	const template = passage.replace(G_EXP_WITH_PARAM, '#');

	const params = paramExpList.map(exp => {
		const abstract = {
			exp: DEFAULT_PARAM
		};

		const { groups } = exp.match(EXP_WITH_PARAM);

		const {
			key: _key,
			exp: _exp = abstract.exp
		} = groups;

		abstract.key = _key;
		abstract.exp = _exp;

		return abstract;
	});

	let filledCount = 0;

	const finalRexExpString = template.replace(/#/g, () => {
		const { key, exp } = params[filledCount++];

		return `(?<${key}>${exp.source})`;
	});

	const finalRegExp = new RegExp(finalRexExpString);

	executor.test = passageValue => finalRegExp.test(passageValue);

	executor.resolver = (passageValue, params) =>
		Object.assign(params, passageValue.match(finalRegExp).groups);
}

exports.Executor = PassageExecutor;
exports.DEFAULT_PARAM = DEFAULT_PARAM;
exports.EXP_WITH_PARAM = EXP_WITH_PARAM;
exports.G_EXP_WITH_PARAM = G_EXP_WITH_PARAM;