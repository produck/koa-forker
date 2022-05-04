const Component = require('./Component');

module.exports = class Route {
	constructor() {
		this.map = new Map();
		this.stack = [];
	}

	compile(router) {
		for (const component of router.components()) {
			if (component instanceof Component.Passage) {
				for (const member of component.sequence) {
					if (typeof member === 'function') {
						this.stack.push(member);
					} else {
						this.compile(member);
					}
				}
			} else {

			}
		}

		return this;
	}
};