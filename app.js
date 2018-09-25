const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('koa2:server')
const path = require('path')

const config = require('./config')
const initRouter = require('./middleWare/initRouter');
const elephantBlog = require('./evernote/middleware/personal');
const myCache = require('./middleWare/myCache');


const port = process.env.PORT || config.port

// error handler
onerror(app)

// middlewares
app.use(bodyparser())
	.use(json())
	.use(logger())
	.use(require('koa-static')(__dirname + '/public',{hidden:true}))
	.use(views(path.join(__dirname, '/views'), {
		options: { settings: { views: path.join(__dirname, 'views') } },
		map: { 'njk': 'nunjucks' },
		extension: 'njk'
	}))
	.use(myCache())
	.use(elephantBlog())
	.use(router.routes())
	.use(router.allowedMethods())

// logger
app.use(async (ctx, next) => {
	const start = new Date()
	await next()
	const ms = new Date() - start
	console.log(`${ctx.method} ${ctx.url} - $ms`)
})


//初始化路由
initRouter(router)
app.on('error', function (err, ctx) {
	console.log(err)
	console.error('server error', err, ctx)
})

module.exports = app.listen(port, () => {
	console.log(`Listening on http://localhost:${config.port}`)
})
