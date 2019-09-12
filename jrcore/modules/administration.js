const Koa = require('koa');
const Router = require('koa-router');
const admin = require('../routes/administration');
const app = new Koa();
const router = new Router();
const koaJwt = require('koa-jwt');

router.post('login', admin.login)
  .put('config/password', admin.editPassword)
  //登录
  .get('config/global', admin.getConfig)
  .put('config/global', admin.editConfig)
  //设置
  .get('utils/costoken', admin.getCosToken)
  //组件
  .post('image', admin.appendImage)
  .delete('image', admin.dropImage)
  .get('imagelist', admin.getImages)
  //日签图片
  .post('resource', admin.appendResource)
  .put('resource', admin.saveResource)
  .get('resource', admin.getResource)
  .delete('resource', admin.dropResource)
  .get('resourcelist', admin.getResources)
  //日签资源
  .post('riqian', admin.riqianCombine)
  .delete('riqian', admin.dropRiqian)
  .get('riqian', admin.getRiqian)
  .put('riqian', admin.putRiqian)
  .get('riqians', admin.getRiqiansByMonth)
  //日签
  .get('feedbacks', admin.getFeedbacks)
  //反馈
  .get('ssn', admin.getSSNByMonth)
  .put('ssn', admin.editSSN)
  .delete('ssn', admin.dropSSN)
  //碎碎念
  .post('changelog', admin.appendChangelog)
  .get('changelogs', admin.getChangelogs)
  //更新记录

app.use(koaJwt({
  secret: 'ilikesinging'
}).unless({
  path: [/^\/v3\/console\/login/]
}))
app.use(router.routes())

module.exports = app
