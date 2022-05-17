const { REG } = require('./Compiler').Path;

function PassageRenderer(passage) {
	const template = {
		render: null,
		regexpMap: {}
	};

	if (REG.EXP_WITH_PARAM.test(passage)) {
		const paramExpList = passage.match(REG.G_EXP_WITH_PARAM);
		const pattern = passage.replace(REG.G_EXP_WITH_PARAM, '#');
		const sectionList = pattern.split('#').map(section => () => section);

		paramExpList.forEach((exp, index) => {
			const { groups } = exp.match(REG.EXP_WITH_PARAM);

			const {
				key: _key,
				exp: _exp = REG.DEFAULT_PARAM.source
			} = groups;

			sectionList.splice(index + 1, 0, (params) => params[_key]);
			template.regexpMap[_key] = new RegExp(_exp);
		});

		template.render = (params) => {
			return sectionList.map(section => section(params)).join('');
		};
	} else {
		template.render = () => passage;
	}

	return template;
}

function NamedPathMap(definitionTree) {
	const map = {};

	(function visit(node) {
		node.childList.forEach(childNode => visit(childNode));

		const nameList = Object.keys(node.pathNames);

		if (nameList.length === 0) {
			return;
		}

		const paramRegexpMap = {}, passageTemplateList = [];

		let current = node;

		while (current !== null) {
			const { render, regexpMap } = PassageRenderer(current.passage);

			passageTemplateList.unshift(render);
			Object.assign(paramRegexpMap, regexpMap);
			current = current.parent;
		}

		function render(params) {
			return passageTemplateList.map(render => render(params)).join('/');
		}

		function assert(params) {
			for (const key in paramRegexpMap) {
				const regexp = paramRegexpMap[key];
				const value = params[key];

				if (value === undefined || !regexp.test(params[key])) {
					throw new Error(
						`Invalid params.${key} value, a string matched ${regexp} expected`
					);
				}
			}
		}

		nameList.forEach(name => map[name] = { node, render, assert });
	})(definitionTree);

	return map;
}

module.exports = NamedPathMap;