const Proxy = require('./Proxy');

exports.Reference = require('./Reference');
exports.Method = require('./methods');
exports.Normalize = require('./normalize');

exports.compile = function createRouteHunProxy(router) {
	return new Proxy(router);
};