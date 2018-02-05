// pages/user/user.js
const app = getApp()
Page({
  data: {
    user: null,
    userInfo: null,
    userType: '游客'
  },
  getCall: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.number
    })
  },
  cancel_userInfo: function () {
    wx.getSetting({
      success: res => {
        wx.openSetting({
          success: res => {
            if (res.authSetting['scope.userInfo'] == false) {
              app.globalData.userInfo = res.userInfo
              this.setData({ userInfo: null })
            }
          }
        }
        )
      }
    })
  },
  show_bind: function () {
    if (this.data.userInfo) {
      wx.navigateTo({
        url: '/pages/bind/bind',
      })
    } else {
      wx.showModal({
        title: '尚未授权',
        content: '请先点击下方的【点击授权】,授权登录后才能进行用户认证',
      })
    }

  },
  show_companyname: function (e) {
    wx.showModal({
      title: '机构名称',
      content: e.target.dataset.companyname,
    })

  },
  show_power:function(){
wx.navigateTo({
  url: '/pages/power/power',
})
  },
  get_userInfo: function () {
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo;
        this.setData({
          userInfo: res.userInfo
        })
      },
      fail: res => {
        wx.showModal({
          title: '提示',
          content: '您好,没有您的授权。我们将无法提供在线报验等诸多服务,若要使用更多服务,请点击【确定】进行再次授权。',
          success: res => {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                      success: res => {
                        app.globalData.userInfo = res.userInfo;
                        this.setData({
                          userInfo: res.userInfo
                        })
                      }
                    })
                  }
                }
              })
            }

          }
        })
      }
    })
  },

  onLoad: function (options) {
    if (app.globalData.user) {
      this.setData({
        userType: app.globalData.userType,
        user: app.globalData.user
      })
    } else {
      app.callback_user = (res) => {
        this.setData({
          userType: res.data.usertype,
          user: res.data
        })
      }

    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        userType: app.globalData.userType
      })
    } else {
    }

  },
  clear:function(){
    try {
      wx.clearStorageSync()
      wx.showToast({
        title: '缓存清除完毕',
      })
    } catch (e) {
      wx.showModal({
        title: '清除失败',
        content: '缓存同步清除失败,请联系管理员。',
      })
    }
  },

  showReply:function(){
wx.navigateTo({
  url: '/pages/reply/reply',
})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})