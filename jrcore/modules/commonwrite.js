const Koa = require('koa');
const Router = require('koa-router');
const common = require('../routes/commonwrite');
const app = new Koa();
const router = new Router();

router.put('riqian/like', common.like)
  .put('riqian/share', common.onshare)
  .post('feedback',common.sendFeedBack)

app.use(router.routes())

module.exports = app
