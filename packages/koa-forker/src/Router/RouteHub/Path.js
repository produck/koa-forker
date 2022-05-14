const REG = {
	TAIL_SLASH:  /\/+$/g,
	END_SLASH: /(^\/+)|(\/+$)/g,
	SEPARATOR: /\/+/g,
	EXP_WITH_PARAM: /{(?<key>[a-zA-Z_$][a-zA-Z_$0-9]*)(\((?<exp>.+)\))?}/,
	DEFAULT_PARAM_REG: /[^/]+/
};

function splitPathToPassageList(path) {
	return path === '' ? [] : path.replace(REG.END_SLASH, '').split(REG.SEPARATOR);
}

exports.PassageList = splitPathToPassageList;
exports.REG = REG;