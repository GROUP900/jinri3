const p = require('../db/db');
const cos = require('../common/cosupload')
class wx {
  //微信用户登录
  async login(ctx) {
    if (ctx.state.$wxInfo.loginState) {
        ctx.state.data = ctx.state.$wxInfo.userinfo
        let openId = ctx.state.$wxInfo.userinfo.userinfo.openId
        let [[target]] = await p.query('select * from user where wxopenid = ?',[openId])
        if(!target){
          let data = ctx.state.$wxInfo.userinfo.userinfo
          let newuser = {
            nickname:data.nickName,
            wxopenid:data.openId
          }
          await p.query('insert into user set ?',[newuser])
        }
        ctx.state.data['time'] = Math.floor(Date.now() / 1000)
    }
  }

  //微信用户登录态校验
  async validate(ctx) {
    if (ctx.state.$wxInfo.loginState === 1) {
        ctx.state.data = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
    }
  }

  //用户增加收藏
  async addToCollection(ctx) {
    let {openId} = ctx.state.$wxInfo.userinfo
    let {id} = ctx.query;
    let [[{collection:list}]] = await p.query('select collection from user where wxopenid = ?',[openId])
    if(list!=null){
      list = list.split(',')
      list.push(id)
      list = [...new Set(list)].toString()
      await p.query('update user set collection = ? where wxopenid = ?',[list,openId])
    }else{
      await p.query('update user set collection = ? where wxopenid = ?',[id,openId])
    }

  }

  //判断用户是否收藏
  async isCollected(ctx) {
    let {openId} = ctx.state.$wxInfo.userinfo
    let {id} = ctx.query;
    let [[{collection}]] = await p.query('select collection from user where wxopenid = ?',[openId])
    let result = (collection)?collection.split(',').includes(id):false;
    ctx.state.data = {result}
  }

  //删除收藏
  async dropCollection(ctx) {
    let {openId} = ctx.state.$wxInfo.userinfo
    let {id} = ctx.query;
    let [[{collection:list}]] = await p.query('select collection from user where wxopenid = ?',[openId])
    if(list!=null){
      list = new Set(list.split(','))
      list.delete(id)
      list = [...list].toString()
      list = (list)?list:null
      await p.query('update user set collection = ? where wxopenid = ?',[list,openId])
    }

  }

  //获取收藏列表
  async getCollections(ctx) {
    let {openId} = ctx.state.$wxInfo.userinfo
    // 如果是加载更多，那么会传入要排除的日签id数组，这里转换成Set备用
    let {exclude} = ctx.request.body;
    exclude = new Set(exclude)
    let [[{collection:list}]] = await p.query('select collection from user where wxopenid = ?',[openId])
    if(list!=null){
      //如果列表不为空，都执行一个差集操作，把排除的日签从列表中拿出去
      let diff = new Set(list.split(',').filter(x => !exclude.has(x)));
      list = Array.from(diff)
      if(!list[0]){
        ctx.state.data = []
        return
      }
      let [result] =await p.query('select riqian.date,riqian.id,picture.fronturl from riqian,picture where riqian.imageid = picture.id and riqian.id in (?) order by id DESC limit 18',[list])
      ctx.state.data = result
    }else{
      ctx.state.data = 'empty'
    }
  }

  //获取我方服务器上保存的用户信息
  async getUserInfo(ctx){
    let {openId} = ctx.state.$wxInfo.userinfo
    let [[user]] = await p.query('select id,avatarurl,nickname from user where wxopenid = ?',[openId])
    ctx.state.data = user
  }

  //更新我方服务器上用户信息
  async updateUserInfo(ctx){
    let data = ctx.request.body;
    let {openId} = ctx.state.$wxInfo.userinfo
    let [[user]] = await p.query('select * from user where wxopenid = ?',[openId])
    //更新前取得用户的信息
    await p.query('update user set ? where id = ?',[data,user.id])
    cos.drop(user.avatarurl)
    //如果更新前用户就有头像，删掉旧头像物理文件
  }

  //上传图片
  async uploadImage(ctx){
      let data = await cos.upload(ctx.req)
      ctx.state.data = data.Key
  }

  //发布碎碎念
  async appendSsn(ctx){
      let setting = global.jrsetting
      let data = ctx.request.body;
      data.showing = (setting.ssnaudit==1)?0:1;
      let [{insertId}] = await p.query('insert into ssn set ?', data);
      let [[user]] = await p.query('select ssn,likedssn from user where id = ?',[data.uid])
      let ssn = (user.ssn)?user.ssn.split(','):[]
      let likedssn = (user.likedssn)?user.likedssn.split(','):[]
      ssn.push(insertId)
      likedssn.push(insertId)
      let userdata = {
        ssn:[...new Set(ssn)].toString(),
        likedssn:[...new Set(likedssn)].toString()
      }
      await p.query('update user set ? where id = ?',[userdata,data.uid])

  }

  //获取最新碎碎念
  async getLatestSSN(ctx){
    let {
      page
    } = ctx.query;
    let {openId} = ctx.state.$wxInfo.userinfo
    let [[{likedssn}]] = await p.query('select likedssn from user where wxopenid = ?',[openId])
    let [result] = await p.query('select ssn.id,if(ssn.id in ('+likedssn+'),1,0) as liked,ssn.image,ssn.content,ssn.anonymous,ssn.funny,ssn.liked as likecount,user.nickname,user.avatarurl from ssn,user where date >= now()-interval 3 month and ssn.uid = user.id and ssn.showing = 1 order by date DESC limit ?,60',[page*60])
    ctx.state.data = result
  }

  //获取喜欢的碎碎念
  async getLikedSSN(ctx){
    let {
      page
    } = ctx.query;
    let {openId} = ctx.state.$wxInfo.userinfo
    let [[{likedssn}]] = await p.query('select likedssn from user where wxopenid = ?',[openId])
    let result = []
    if(likedssn){
      [result] = await p.query('select ssn.id,1 as liked,ssn.image,ssn.content,ssn.anonymous,ssn.funny,ssn.liked as likecount,user.nickname,user.avatarurl from ssn,user where ssn.id in ('+likedssn+') and ssn.uid = user.id and ssn.showing = 1 order by date DESC limit ?,60',[page*60])
    }
    ctx.state.data = result
  }

  //获取日榜碎碎念
  async getDailyBestSSN(ctx){
    let {openId} = ctx.state.$wxInfo.userinfo
    let [[{likedssn}]] = await p.query('select likedssn from user where wxopenid = ?',[openId])
    let [result] = await p.query('select ssn.id,if(ssn.id in ('+likedssn+'),1,0) as liked,ssn.image,ssn.content,ssn.anonymous,ssn.funny,ssn.liked as likecount,user.nickname,user.avatarurl from ssn,user where date >= now()-interval 24 hour and ssn.uid = user.id and ssn.showing = 1 order by (select (likecount*10)+(ssn.funny*3)) DESC limit 30')
    ctx.state.data = result
  }

  //增加funny值
  async deride(ctx){
    let {
      id
    } = ctx.query;
    await p.query('update ssn set funny = funny+1 where id = ?',[id])
  }

  //收藏碎碎念
  async ssnlike(ctx){
    let {
      id
    } = ctx.query;
    await p.query('update ssn set liked = liked+1 where id = ?',[id])
    let {openId} = ctx.state.$wxInfo.userinfo
    let [[{likedssn}]] = await p.query('select likedssn from user where wxopenid = ?',[openId]);
    likedssn = (likedssn)?likedssn.split(','):[]
    likedssn.push(id)
    likedssn = [...new Set(likedssn)].toString()
    await p.query('update user set likedssn = ? where wxopenid = ?',[likedssn,openId])
  }

  //取消收藏碎碎念
  async ssndislike(ctx){
    let {
      id
    } = ctx.query;
    await p.query('update ssn set liked = liked-1 where id = ?',[id])
    let {openId} = ctx.state.$wxInfo.userinfo
    let [[{likedssn}]] = await p.query('select likedssn from user where wxopenid = ?',[openId]);
    likedssn = (likedssn)?likedssn.split(','):[]
    likedssn = likedssn.filter((item)=>{
      return item!=id
    })
    if(likedssn.length){
      likedssn = [...new Set(likedssn)].toString()
    }else{
      likedssn = null
    }
    await p.query('update user set likedssn = ? where wxopenid = ?',[likedssn,openId])
  }
}

module.exports = new wx();
