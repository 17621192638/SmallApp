// pages/apply_search_detail/apply_search_detail.js
const app=getApp()
const Promise = require('../../utils/bluebird.min.js')
const util=require('../../utils/util.js')
Page({
  data: {
    model: null,
    url: "https://wx.sifi.com.cn/Maven2/FileDownLoad/",
    showModel1: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.pageFiter(app,getCurrentPages()[getCurrentPages().length - 1].route)
    this.setData({
      model: JSON.parse(decodeURIComponent(options.model))
    })
  },
  show_name: function (e) {
    wx.showModal({
      title: '内容提示',
      content: e.target.dataset.text,
    })
  },
  checkNet: function () {
    if (!wx.getStorageSync("searchDetailPage_tips")) {
      const promise = new Promise((resolve, reject) => {
        wx.getNetworkType({
          success: function (res) {
            resolve(res.networkType)
          }
        })
      })
      promise.then((netType) => {
        if (netType == 'none') {
          wx.showModal({
            title: '网络错误',
            content: '当前无网络连接,请检查您的网络',
          })
        } else if (netType == 'wifi') {
          this.open_file()
        } else {
          this.setData({
            showModel1: true
          })
        }
      })
    } else { this.open_file() }
  },
  open_file: function () {
    wx.showToast({
      title: '正在打开证书..',
      icon: 'success',
      duration: 10000,
      mask: true
    })
    const downfile = new Promise((resolve, reject) => {
      wx.downloadFile({
        url: this.data.url + this.data.model.certificateNo + "/"
        + this.data.model.encryptCheckCode + "/certDownLoad.do",
        success: function (res) {
          resolve(res)
        },
        fail: function (res) { reject(res) }
      })
    })
    downfile.then((res) => {
      wx.hideToast()
      var filePath = res.tempFilePath
      wx.openDocument({
        filePath: filePath,
        success: function (res) {
          wx.hideToast()
        },
        fail: () => {
          wx.hideToast()
          wx.showToast({
            title: '证书打开失败',
            image: '/images/fail.png',
            duration: 1500,
            mask: true
          })
        }
      })
    }, () => {
      wx.hideToast()
      wx.showToast({
        title: '证书下载失败',
        image: '/images/fail.png',
        duration: 1500,
        mask: true
      })
    })

  },

  modelOk: function () {
    this.setData({
      showModel1: false
    })
    this.open_file()
  },
  modelCancel: function () {
    this.setData({
      showModel1: false
    })
  },
  checkboxChange: function (res) {
    if (res.detail.value[0]) {
      wx.setStorageSync('searchDetailPage_tips', 'on')
    } else {
      wx.setStorageSync('searchDetailPage_tips', null)
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