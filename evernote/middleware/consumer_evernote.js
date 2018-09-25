const Evernote = require('evernote');
const _CONFIG = require("../config/consumer.config");
const { Consumer_Key, Consumer_Secret } = _CONFIG;

/* 如果是开发环境sandbox,china为true; */
const isDev = process.env.NODE_ENV === 'development';

console.log('当前环境为' + process.env.NODE_ENV);

const callbackUrl = process.env.HOST ? `${process.env.HOST}/oauth_callback` : "http://localhost:3000/oauth_callback";

const client = new Evernote.Client({
	consumerKey: Consumer_Key,
	consumerSecret: Consumer_Secret,
	sandbox: isDev, // change to false when you are ready to switch to production
	china: false, // change to true if you wish to connect to YXBJ - most of you won't
});


module.exports = () => {
	return async (ctx, next) => {

		if (ctx.nodeCache.oauthToken && ctx.nodeCache.oauthTokenSecret) {
			if (ctx.query.oauth_verifier) {
				client.getAccessToken(ctx.nodeCache.oauthToken,
					ctx.nodeCache.oauthTokenSecret,
					ctx.query.oauth_verifier,
					function (error, oauthToken, oauthTokenSecret, results) {
						console.log(oauthToken);

						if (error) {
							// do your error handling
							console.error(error);
						} else {
							const authenticatedClient = new Evernote.Client({
								token: oauthToken,
								sandbox: isDev,
								china: false
							});
							const noteStore = authenticatedClient.getNoteStore();
							noteStore.listNotebooks().then(function (notebooks) {
								console.log(notebooks); // the user's notebooks!
							}).catch(e => {
								console.log(e);
							})
						}
					})
			}
			await next();
		} else {
			const getAuth = new Promise((resolve, reject) => {
				client.getRequestToken(callbackUrl, (error, oauthToken, oauthTokenSecret, results) => {
					if (error) {
						console.error(error);
						reject(error);
					} else {
						ctx.nodeCache.oauthToken = oauthToken;
						ctx.nodeCache.oauthTokenSecret = oauthTokenSecret;
						let url = client.getAuthorizeUrl(oauthToken);
						url = `${url}&supportLinkedSandbox=true&suggestedNotebookName=EvernoteBlog`
						console.log(url);
						resolve({ url });
					}
				})
			});
			const authUrl = await getAuth;
			if (authUrl.url) {
				ctx.redirect(authUrl.url);
			} else {
				ctx.redirect(process.env.HOST);
			}
		}
	}
}
