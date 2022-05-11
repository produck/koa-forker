const REG = {
	TAIL_SLASH:  /\/+$/g,
	END_SLASH: /(^\/+)|(\/+$)/g,
	SEPARATOR: /\/+/g,
	EXP_WITH_PARAM: /{(?<key>[a-zA-Z_$][a-zA-Z_$0-9]*)(\((?<exp>.+)\))?}/,
	DEFAULT_PARAM_REG: /[^/]+/
};

const G_EXP_WITH_PARAM = new RegExp(REG.EXP_WITH_PARAM, 'g');
const DEFAULT_TEST = () => true;
const DEFAULT_RESOLVER = () => {};

function compile(passage) {
	const executor = {
		test: DEFAULT_TEST,
		resolver: DEFAULT_RESOLVER
	};

	if (REG.EXP_WITH_PARAM.test(passage)) {
		const paramExpList = passage.match(G_EXP_WITH_PARAM);
		const template = passage.replace(G_EXP_WITH_PARAM, '#');

		const params = paramExpList.map(exp => {
			const abstract = {
				exp: REG.DEFAULT_PARAM_REG
			};

			const { groups } = exp.match(REG.EXP_WITH_PARAM);

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

		executor.resolver = (passageValue, params) => {
			Object.assign(params, passageValue.match(finalRegExp).groups);
		};
	} else {
		executor.test = passageValue => passageValue === passage;
	}

	return executor;
}

function splitPathToPassageList(path) {
	return path === '' ? [] : path.replace(REG.END_SLASH, '').split(REG.SEPARATOR);
}

exports.compile = compile;
exports.PassageList = splitPathToPassageList;
exports.REG = REG;