const p = require('../db/db');
const marked = require('marked')
class CommonRead {

  //最新的1个日签
  async latest(ctx) {
    let [[[result]]] = await p.query('call latestriqian(1,null,@prevdate,@nextdate)')
    ctx.response.body = result
  }

  //获取某日日签
  async random(ctx) {
    let {
      day
    } = ctx.query;
    let [[[result]]] = await p.query('call latestriqian(0,?,@prevdate,@nextdate)',[day])
    ctx.response.body = result
  }

  //根据数组返回一组日签
  async collection(ctx) {
    let {list} = ctx.request.body;
    let [result] = await p.query('select riqian.id,riqian.date,picture.fronturl,picture.backurl from riqian,picture where riqian.imageid = picture.id and riqian.id IN (?)',[list])
    ctx.response.body = result
  }

  //根据月份返回一组日签
  async bymonth(ctx) {
    let {
      year,month
    } = ctx.query;
    let [result] = await p.query('select riqian.id,riqian.date,picture.fronturl,picture.backurl from riqian,picture where year(riqian.date) = ? and month(riqian.date) = ? and riqian.imageid = picture.id ORDER BY riqian.date DESC', [year,month]);
    ctx.response.body = result
  }

  //获取发现资源
  async getResource(ctx) {
    let {
      id
    } = ctx.query;
    let [[result]] = await p.query('select resources.title,resources.author,resources.content,resources.type,picture.fronturl,picture.content as poem,riqian.date from resources,picture,riqian where riqian.resourceid = resources.id and riqian.imageid = picture.id and resources.id = ?',[id])
    if(result&&result.type=='post'){
      result.content = marked(result.content)
    }
    ctx.response.body = result
  }

  //获取更新记录
  async getChangelogs(ctx){
    let [records] = await p.query('select id,title,detail from changelog order by date DESC');
    ctx.response.body = records
  }

}

module.exports = new CommonRead();
