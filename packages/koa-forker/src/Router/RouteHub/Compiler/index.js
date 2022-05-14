const Sequence = require('./Sequence');
const Definition = require('./Definition');

exports.Sequence = Sequence.Tree;
exports.Definition = Definition.Tree;
exports.Matcher = require('./Matcher');

exports.METHODS = require('./methods');
exports.Reference = require('./Reference');

const Passage = require('./Passage');

exports.Path = {
	toPassageList: Sequence.Path.toPassageList,
	REG: {
		DEFAULT_PARAM: Passage.DEFAULT_PARAM,
		EXP_WITH_PARAM: Passage.EXP_WITH_PARAM,
		G_EXP_WITH_PARAM: Passage.G_EXP_WITH_PARAM,
		SEPARATOR: Sequence.Path.SEPARATOR,
		END_SLASH: Sequence.Path.END_SLASH
	}
};