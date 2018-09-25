module.exports =  (router) => {
  router.get('/about', async function (ctx, next) {
	  await ctx.render('about')
  })
}
