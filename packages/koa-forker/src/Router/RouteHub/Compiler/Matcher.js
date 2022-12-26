module.exports = class Matcher {
	constructor(searchTree) {
		this.root = {
			childList: [searchTree]
		};
	}

	find(passageValueList, params) {
		let current = this.root;

		for (const passageValue of passageValueList) {
			const self = current;

			for (const child of current.childList) {
				if (child.test(passageValue)) {
					current = child;
					child.resolve(passageValue, params);

					break;
				}
			}

			if (self === current) {
				// No matched path.
				return null;
			}
		}

		return current;
	}
};
