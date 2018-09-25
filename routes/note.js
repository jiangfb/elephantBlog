const elephantBlogApi = require('../evernote/api/elephantBlogApi');

module.exports = (router) => {
	router.get('/note/:noteGuid', async (ctx, next) => {
		try {
			const note = await elephantBlogApi.getNote(ctx);
			let state = {};
			if (note) {
				state = { ...note }
			}
			await ctx.render('note', state)
		} catch (e) {
			console.error(e);
			await ctx.render('error', { message: e })
		}
	})
}