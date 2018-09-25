const elephantBlogApi = require('../evernote/api/elephantBlogApi');

const handle = async (ctx) => {

	try {
		const res = await elephantBlogApi.findNotesMetadata(ctx);
		let state = {};
		const perPage = 10;
		if (res && res.totalNotes) {
			const { startIndex, totalNotes, notes, tags } = res;
			const currentPage = Math.ceil(startIndex / perPage) + 1;
			const totalPage = Math.ceil(totalNotes / perPage);
			state = { currentPage, totalPage, notes, tags, pageTitle: '大象博客' }
		}
		await ctx.render('index', state)
	} catch (e) {
		console.error(e);
		await ctx.render('error', { message: e })
	}
}

module.exports = (router) => {

	router.get('/', async (ctx, next) => {
		await handle(ctx);
	});

	router.get('/page/:pageIndex', async (ctx, next) => {
		await handle(ctx);
	})

}