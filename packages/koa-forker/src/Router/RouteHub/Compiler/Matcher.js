module.exports = class Matcher {
	constructor(searchTree) {
		this.root = {
			childList: [searchTree]
		};
	}

	find(passageValueList) {
		const length = passageValueList.length;

		let current = this.root;

		for (let index = 0; index < length; index++) {
			const passageValue = passageValueList[index];
			const self = current;

			for (const child of current.childList) {
				if (child.test(passageValue)) {
					current = child;

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
