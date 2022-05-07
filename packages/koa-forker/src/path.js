exports.REG = {
	TAIL_SLASH:  /\/+$/g,
	END_SLASH: /(^\/+)|(\/+$)/g,
	SEPARATOR: /\/+/g,
	EXP_WITH_PARAM: /{([a-zA-Z_$][a-zA-Z_$0-9]*)(\((.+)\))?}/
};