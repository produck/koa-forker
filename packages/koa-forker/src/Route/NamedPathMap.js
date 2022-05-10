const { REG } = require('../path');

const G_EXP_WITH_PARAM = new RegExp(REG.EXP_WITH_PARAM, 'g');

function resolvePassage(passage) {
	const template = {
		render: () => '',
		testMap: {}
	};

	if (REG.EXP_WITH_PARAM.test(passage)) {
		const paramExpList = passage.match(G_EXP_WITH_PARAM);
		const pattern = passage.replace(G_EXP_WITH_PARAM, '#');
		const sectionList = pattern.split('#').map(section => () => section);

		paramExpList.forEach((exp, index) => {
			const { groups } = exp.match(REG.EXP_WITH_PARAM);

			const {
				key: _key,
				exp: _exp = REG.DEFAULT_PARAM_REG.source
			} = groups;

			const finalRegExp = new RegExp(_exp);

			sectionList.splice(index + 1, 0, (params) => params[_key]);
			template.testMap[_key] = sectionValue => finalRegExp.test(sectionValue);
		});

		template.render = (params) => {
			return sectionList.map(section => section(params)).join('');
		};
	} else {
		template.render = () => passage;
	}

	return template;
}

module.exports = function NamedPathMap(definitionTree) {
	const map = {};

	(function visit(node) {
		node.childList.forEach(childNode => visit(childNode));

		const nameList = Object.keys(node.pathNames);

		if (nameList.length === 0) {
			return;
		}

		const paramTestMap = {}, passageTemplateList = [];

		let current = node;

		while (current !== null) {
			const { render, testMap } = resolvePassage();

			passageTemplateList.unshift(render);
			Object.assign(paramTestMap, testMap);
			current = current.parent;
		}

		function render(params) {
			return passageTemplateList.map(render => render(params)).join('/');
		}

		function assert(params) {
			for (const key in paramTestMap) {
				if (paramTestMap[key](params[key])) {
					throw new Error(`Invalid params.${key} value.`);
				}
			}
		}

		nameList.forEach(name => map[name] = { node, render, assert });
	})(definitionTree);

	return map;
};
