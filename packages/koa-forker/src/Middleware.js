const {
	DEFAULT_METHOD_NOT_ALLOWED,
	DEFAULT_NOT_IMPLEMENTED
} = require('./Router/RouteHub/Normalizer/middleware');

function ForkerDocumentMiddleware(ctx) {
	ctx.body = ctx.route.abstract;
}

exports.DefaultMethodNotAllowed = DEFAULT_METHOD_NOT_ALLOWED;
exports.DefaultNotImplemented = DEFAULT_NOT_IMPLEMENTED;
exports.SimpleDocument = ForkerDocumentMiddleware;