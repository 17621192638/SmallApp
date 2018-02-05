// pages/bind/bing.js
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    openid: null,
    userInfo: null,
    submitcount: 0
  },

  onLoad: function (options) {
    util.pageFiter(app, getCurrentPages()[getCurrentPages().length - 1].route)
    this.setData({
      userInfo: app.globalData.userInfo,
      openid: app.globalData.openid
    })
  },
  formSubmit: function (e) {
    if (app.globalData.userType != "游客") {
      wx.showToast({
        title: '用户已认证',
        mask: true
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 2000)
      return
    }
    if (!this.data.openid) {
      if (this.data.submitcount <= 5) {
        wx.showModal({
          title: '数据延迟',
          content: '稍等几秒后再次尝试',
        })
        this.setData({
          openid: app.globalData.openid,
          submitcount: this.data.submitcount + 1
        })
      }
      else {
        wx.showModal({
          title: '网络错误',
          content: '连接服务器失败,请联系技术管理人员',
        })

      }
      return
    }
    var val = e.detail.value;
    if (!val.username || !val.password || !val.userType) {
      wx.showModal({
        title: '提交失败',
        content: '信息填写不完整',
      })
    } else {
      wx.request({
        url: app.data.url + "wx/bind",
        data: { val: val, openid: this.data.openid, wxName: this.data.userInfo.nickName },
        success: res => {
          if (res.statusCode == 200) {
            if (!res.data.status) {
              wx.showModal({
                title: '认证失败',
                content: '不存在此用户，请重新认证',
              })
            } else {
              app.globalData.user = res.data.user
              app.globalData.userType = res.data.user['usertype']
              wx.setStorageSync('user', res.data.user)
              wx.showToast({
                title: '认证成功',
                mask: true,
                icon: 'success',
                duration: 2000
              })
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/home/home'
                })
              }, 2000)
            }
          } else {
            util.err_failconnect()
          }
        },
        fail: res => {
          util.err_failconnect()
        }
      })

    }
  },
  formReset: function () {
  },
  go_register: function () {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  }
})