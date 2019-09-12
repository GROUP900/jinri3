const jwt = require('jsonwebtoken');
const p = require('../db/db');
const costoken = require('../common/cos');
const md5 = require('md5');
const cryptoRandomString = require('crypto-random-string');

class UserController {

  //管理员登录
  async login(ctx) {
    let user = ctx.request.body
    if (!user.username || !user.password) {
      ctx.throw(400, '登录时非法操作');
    }
    let [
      [result]
    ] = await p.query('select salt,password from administrators where username = ?', [user.username])
    if (!result) {
      ctx.throw(401, '用户名或密码错误');
    }
    if (md5(user.password + result.salt) == result.password) {
      let data = {
        jwt: jwt.sign({
          username: user.username
        }, 'ilikesinging',{
          expiresIn:'24h'
        }),
      }
      ctx.response.body = data
    } else {
      ctx.throw(401, '用户名或密码错误');
    }
  }

  //管理员改密码
  async editPassword(ctx) {
    let pw = ctx.request.body
    let username = ctx.state.user.username
    let [
      [result]
    ] = await p.query('select salt,password from administrators where username = ?', [username]);
    if (md5(pw.password + result.salt) == result.password) {
      let salt = cryptoRandomString(10)
      let newpassword = md5(pw.newpassword + salt)
      await p.query('update administrators set password = ?,salt = ? where username = ?', [newpassword, salt, username])
      ctx.response.status = 200
    } else {
      ctx.throw(401, '错误的旧密码');
    }
  }

  //获取全局配置
  async getConfig(ctx) {
    let [result] = await p.query('select * from globalsetting')
    ctx.response.body = result
  }

  //编辑全局配置
  async editConfig(ctx) {
    let config = ctx.request.body
    await p.query('replace into globalsetting (item,value) values ?', [config])
    let [globalsetting] = await p.query('select * from globalsetting')
    let result = {}
    globalsetting.forEach((item)=>{
      result[item.item] = item.value
    })
    global.jrsetting = result
    ctx.response.status = 200
  }

  //获取对象存储钥匙
  async getCosToken(ctx) {
    let params = ctx.query
    ctx.response.body = costoken(params.method, params.pathname)
  }

  //新增日签图片
  async appendImage(ctx) {
    let data = ctx.request.body;
    await p.query('insert into picture set ?', data);
    ctx.response.status = 200
  }

  //删除日签图片
  async dropImage(ctx) {
    let {
      id
    } = ctx.query;
    await p.query('delete from picture where id = ?', id);
    ctx.response.status = 200
  }

  //获取日签图片列表
  async getImages(ctx) {
    let [result] = await p.query('SELECT * FROM picture WHERE id NOT IN (SELECT imageid FROM riqian where imageid IS NOT NULL) ORDER BY picture.date DESC');
    ctx.response.body = result
  }

  //新增资源
  async appendResource(ctx) {
    let data = ctx.request.body;
    await p.query('insert into resources set ?', data);
    ctx.response.status = 200
  }

  //保存资源
  async saveResource(ctx) {
    let {
      id
    } = ctx.query
    let data = ctx.request.body;
    await p.query('update resources set ? where id = ?', [data, id]);
    ctx.response.status = 200
  }

  //删除资源
  async dropResource(ctx) {
    let {
      id
    } = ctx.query;
    await p.query('delete from resources where id = ?', id);
    ctx.response.status = 200
  }

  //获取单个资源
  async getResource(ctx) {
    let {
      id
    } = ctx.query;
    let [
      [result]
    ] = await p.query('select * from resources where id =  ?', id);
    ctx.response.body = result
  }

  //获取资源列表
  async getResources(ctx) {
    let [result] = await p.query('SELECT * FROM resources WHERE id NOT IN (SELECT resourceid FROM riqian where resourceid IS NOT NULL) ORDER BY resources.date DESC');
    ctx.response.body = result
  }

  //日签合成
  async riqianCombine(ctx) {
    let data = ctx.request.body;
    await p.query('insert into riqian set ?', data);
    ctx.response.status = 200
  }

  //删除日签
  async dropRiqian(ctx) {
    let {
      id
    } = ctx.query;
    await p.query('delete from riqian where id = ?', id);
    ctx.response.status = 200
  }

  //获取单个日签
  async getRiqian(ctx) {
    let {
      id
    } = ctx.query;
    let [[result]] = await p.query('select riqian.id,picture.id as pictureid,picture.fronturl,resources.id as resourceid,resources.type,resources.title from riqian inner join picture on picture.id = riqian.imageid left outer join resources on resources.id = riqian.resourceid where riqian.id =  ?', id);
    ctx.response.body = result
  }

  //更新日签
  async putRiqian(ctx) {
    let {
      id
    } = ctx.query
    let data = ctx.request.body;
    await p.query('update riqian set ? where id = ?', [data, id]);
    ctx.response.status = 200
  }

  //按月份获取多个日签
  async getRiqiansByMonth(ctx) {
    let {
      year,month
    } = ctx.query;
    let [result] = await p.query('select riqian.*,picture.fronturl from riqian,picture where year(riqian.date) = ? and month(riqian.date) = ? and riqian.imageid = picture.id ORDER BY riqian.date', [year,month]);
    ctx.response.body = result
  }

  //获取反馈信息
  async getFeedbacks(ctx){
    let {
      pager = 0
    } = ctx.query;
    let [result] = await p.query('select * from feedback order by id DESC limit ?,30',[pager*30])
    ctx.response.body = result
  }

  //按月获取碎碎念
  async getSSNByMonth(ctx){
    let {
      year,month,page
    } = ctx.query;
    let [result] = await p.query('select ssn.showing,ssn.id,ssn.date,ssn.anonymous,ssn.nocopy,ssn.liked,ssn.funny,ssn.content,user.nickname from ssn,user where year(ssn.date) = ? and month(ssn.date) = ? and ssn.uid = user.id order by ssn.date DESC limit ?,60', [year,month,page*60]);
    ctx.response.body = result
  }
  //修改碎碎念
  async editSSN(ctx){
    let {
      id,ifshow
    } = ctx.request.body;
    await p.query('update ssn set showing = ? where id = ?',[ifshow,id]);
    ctx.response.status = 200
  }

  //删除碎碎念
  async dropSSN(ctx){
    let {
      id
    } = ctx.query;
    await p.query('delete from ssn where id = ?', id);
    ctx.response.status = 200
  }

  //增加更新记录
  async appendChangelog(ctx){
    let data = ctx.request.body;
    await p.query('insert into changelog set ?', [data]);
    ctx.response.status = 200
  }

  //获取更新记录
  async getChangelogs(ctx){
    let [records] = await p.query('select title,detail from changelog order by date DESC');
    ctx.response.body = records
  }


}

module.exports = new UserController();
