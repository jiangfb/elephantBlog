/* https://dev.yinxiang.com/doc/reference/NoteStore.html#Fn_NoteStore_getNote*/

const noteStore = require('../api/noteStore');
const { blogNoteBookName } = require('../../config');

module.exports = () => {

	return async (ctx, next) => {

		const { auth, nodeCache } = ctx;

		if (!auth.blogBookGuid) {

			console.log('no blog book guid,now get it');

			try {
				const notebooks = await noteStore.listNotebooks();
				notebooks.some(book => {
					if (book.name === blogNoteBookName) {
						auth.blogBookGuid = book.guid;
						nodeCache.set('auth', auth);
						ctx.auth = auth;
						return true;
					}
				});
				await next();
			}
			catch (e) {
				console.log(e);
				await ctx.render('error', { errorCode: e.errorCode, message: e.parameter || '未知错误' });
			}
		} else { await next() }
	}
}
