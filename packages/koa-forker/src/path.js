const REG = {
	TAIL_SLASH:  /\/+$/g,
	END_SLASH: /(^\/+)|(\/+$)/g,
	SEPARATOR: /\/+/g,
	EXP_WITH_PARAM: /{([a-zA-Z_$][a-zA-Z_$0-9]*)(\((.+)\))?}/
};

function splitPathToPassageList(path) {
	return path === '' ? [] : path.replace(REG.END_SLASH, '').split(REG.SEPARATOR);
}

function compile(path) {
	return {
		test: () => true,
		resolver: null
	};
}

exports.compile = compile;
exports.PassageList = splitPathToPassageList;
exports.REG = REG;