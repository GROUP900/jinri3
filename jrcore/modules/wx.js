const Koa = require('koa');
const Router = require('koa-router');
const wx = require('../routes/wx');
const app = new Koa();
const router = new Router();
const wafer = require('../common/wafer');
const { auth: { authorizationMiddleware, validationMiddleware } } = wafer

router.get('login', authorizationMiddleware, wx.login)
  .get('validate', validationMiddleware, wx.validate)
  .put('collection', validationMiddleware, wx.addToCollection)
  .get('collection', validationMiddleware, wx.isCollected)
  .delete('collection',validationMiddleware, wx.dropCollection)
  .post('collections', validationMiddleware, wx.getCollections)
  .get('userinfo', validationMiddleware, wx.getUserInfo)
  .put('userinfo', validationMiddleware, wx.updateUserInfo)
  .post('uploadimage', wx.uploadImage)
  .post('ssn', validationMiddleware,wx.appendSsn)
  .get('ssn/latest',validationMiddleware,wx.getLatestSSN)
  .get('ssn/liked',validationMiddleware,wx.getLikedSSN)
    .get('ssn/dailybest',validationMiddleware,wx.getDailyBestSSN)
  .put('ssn/deride',validationMiddleware,wx.deride)
  .get('ssn/like',validationMiddleware,wx.ssnlike)
  .get('ssn/dislike',validationMiddleware,wx.ssndislike)

async function response (ctx, next) {
      try {
          // 调用下一个 middleware
          await next()

          // 处理响应结果
          // 如果直接写入在 body 中，则不作处理
          // 如果写在 ctx.body 为空，则使用 state 作为响应
          ctx.body = ctx.body ? ctx.body : {
              code: ctx.state.code !== undefined ? ctx.state.code : 0,
              data: ctx.state.data !== undefined ? ctx.state.data : {}
          }
      } catch (e) {
          // 设置状态码为 200 - 服务端错误
          ctx.status = 200

          // 输出详细的错误信息
          ctx.body = {
              code: -1,
              error: e && e.message ? e.message : e.toString()
          }
      }
  }
//为了符合wafer返回的格式 增加一个response中间件给返回结果附加一个响应code
app.use(response)
app.use(router.routes())

module.exports = app
