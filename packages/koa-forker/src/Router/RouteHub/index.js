const Proxy = require('./Proxy');
const Compiler = require('./Compiler');

function createRouteHubProxy(router) {
	return new Proxy(router);
}

exports.Path = require('./Path');
exports.METHODS = Compiler.METHODS;
exports.Reference = Compiler.Reference;
exports.Normalizer = require('./Normalizer');
exports.create = createRouteHubProxy;