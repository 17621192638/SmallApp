const app = getApp()
const Promise = require('../../utils/bluebird.min.js')
Page({
  data: {
    info: null,
    content: null,
    cursor: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  infoChange: function (e) {
    this.setData({
      info: e.detail.value
    })
  },
  contentChange: function (e) {
    this.setData({
      content: e.detail.value,
      cursor: e.detail.cursor
    })
  },
  infoClear: function () {
    this.setData({
      info: ''
    })
  },
  submit: function () {
    if (!this.data.content) {
      wx.showToast({
        title: '留言不能为空',
        image: '/images/fail.png',
        duration: 1500,
        mask: true
      })
    } else {
      const promise = new Promise((resolve, reject) => {
        wx.request({
          url: app.data.url + 'wx/insert/reply',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            info: this.data.info,
            content: this.data.content, openid: app.globalData.openid
          },
          success: (res) => { resolve(res) },
          fail: () => { reject() }
        })
      })
      promise.then((res) => {
        if (res.statusCode == 200) {
          wx.showToast({
            title: '提交成功！', duration: 2500,
            mask: true
          })
        } else {
          wx.showToast({
            image: '/images/fail.png',
            title: '服务器异常',
            duration: 2000,
            mask: true
          })
        }
      }
        , () => {
          wx.showToast({
            image: '/images/fail.png',
            title: '服务器连接异常',
            duration: 2000,
            mask: true
          })
        }
      )
    }


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