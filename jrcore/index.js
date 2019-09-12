const Koa = require('koa');
const compose = require('koa-compose');
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const app = new Koa();
const administration = require('./modules/administration');
const commonRead = require('./modules/commonread');
const commonWrite = require('./modules/commonwrite');
const wx = require('./modules/wx');
const p = require('./db/db');

(async function(){
  let [globalsetting] = await p.query('select * from globalsetting')
  let result = {}
  globalsetting.forEach((item)=>{
    result[item.item] = item.value
  })
  global.jrsetting = result
})()

var all = compose([
  cors(),
  bodyParser(),
  mount('/v3/console/', administration),
  mount('/v3/common/', commonRead),
  mount('/v3/common/', commonWrite),
  mount('/v3/wx/', wx)
])
app.use(all)

app.on('error', (err, ctx) => console.error('server error', err));

app.listen(4041);
console.log('新今日API运行在端口4041');
