const p = require('../db/db');
class CommonWrite {
  //用户反馈
  async sendFeedBack(ctx) {
    let data = ctx.request.body;
    await p.query('insert into feedback set ?',data)
    ctx.response.status = 200
  }

  //日签点赞
  async like(ctx) {
    let {
      id
    } = ctx.query;
    await p.query('update riqian set likecount = likecount+1 where id = ?',[id])
    let [[result]] = await p.query('select likecount from riqian where id = ?',[id])
    ctx.response.body = result
  }

  //日签分享
  async onshare(ctx) {
    let {
      id
    } = ctx.query;
    await p.query('update riqian set sharecount = sharecount+1 where id = ?',[id])
    let [[result]] = await p.query('select sharecount from riqian where id = ?',[id])
    ctx.response.body = result
  }

}

module.exports = new CommonWrite();
