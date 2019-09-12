import wepy from 'wepy';
import wafer from '../wafer/wafer'

export default class PushMixin extends wepy.mixin {
  methods = {
    async updateInfo() {
            wx.showLoading({
                title: '正在更新资料',
                mask: true
            })
            try {
                let {
                    userInfo
                } = await wepy.getUserInfo()
                let newNickname = userInfo.nickName
                let avatarUrl = userInfo.avatarUrl
                //调用小程序接口，不鉴权，拿到实时用户名和头像地址
                let {
                    tempFilePath
                } = await wepy.downloadFile({
                    url: avatarUrl
                })
                let {
                    data
                } = await wepy.uploadFile({
                    url: 'wx/uploadimage',
                    filePath: tempFilePath,
                    name: 'file',
                    formData:{
                      dir: 'wx'
                    }
                })
                //先下载，再上传头像到cos，通过wafer node的上传接口
                data = JSON.parse(data).data
                if(!data){throw Error()}
                await wafer.request('userinfo', 'put', {
                    avatarurl: data,
                    nickname: newNickname
                })
                //把头像地址和昵称更新到数据库
                this.nickName = newNickname
                this.avatarurl = data
                //刷新视图 结束
                this.$apply()
                wx.hideLoading()
                wx.showToast({
                    title: '资料已刷新',
                    icon: 'none',
                    duration: 1500
                })
            } catch (e) {
                console.log(e)
                wx.hideLoading()
                wx.showToast({
                    title: '资料更新出错了，请重试',
                    icon: 'none',
                    duration: 2000
                })
            }
        }
  }
}
