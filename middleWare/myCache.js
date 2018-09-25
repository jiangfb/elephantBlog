const NodeCache = require("node-cache");
const nodeCache = new NodeCache({ stdTTL: 3600 * 12 });//默认12小时过期时间


module.exports = function () {

	return async (ctx, next) => {
		ctx.nodeCache = nodeCache;
		const cacheValue = nodeCache.mget(['auth']);
		ctx.auth = cacheValue.auth || {};
		console.log('auth========',ctx.auth);
		await next()
	}
}

