
const AVAILABLE_REDIRECT_CODE = [301, 302, 303, 307, 308];

if (!AVAILABLE_REDIRECT_CODE.includes(code)) {
	const availables = AVAILABLE_REDIRECT_CODE.join(', ');

	throw new TypeError(`Invalid code, ${availables} expected.`);
}