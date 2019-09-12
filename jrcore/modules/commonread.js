const Koa = require('koa');
const Router = require('koa-router');
const common = require('../routes/commonread');
const app = new Koa();
const router = new Router();

router.get('riqian/latest', common.latest)
  .get('riqian/random', common.random)
  .get('riqians/month', common.bymonth)
  .post('riqians/collection', common.collection)
  .get('resource',common.getResource)
  .get('changelogs', common.getChangelogs)

app.use(router.routes())

module.exports = app
