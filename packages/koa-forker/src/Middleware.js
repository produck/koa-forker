exports.Document = function ForkerDocumentMiddleware(ctx) {
	ctx.body = ctx.route.abstract;
};

exports.DefaultMethodNotAllowed = null;
exports.DefaultNotImplemented = null;