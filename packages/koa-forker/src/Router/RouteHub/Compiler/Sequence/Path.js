const END_SLASH = /(^\/+)|(\/+$)/g;
const SEPARATOR = /\/+/g;

function splitPathToPassageList(path) {
	return path === '' ? [] : path.replace(END_SLASH, '').split(SEPARATOR);
}

exports.END_SLASH = END_SLASH;
exports.SEPARATOR = SEPARATOR;
exports.toPassageList = splitPathToPassageList;