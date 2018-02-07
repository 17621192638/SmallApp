// pages/home/home.js
const util = require('../../utils/util.js')
const Promise = require('../../utils/bluebird.min.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    userType: null,
    certUrl: "http://203.156.232.83/Maven2/",
    certUrl2: "http://61.129.87.91:8080/Maven2/",
    showModel1: false,
    canUseRefresh: true,//上拉刷新间隔
    newsData: {
      menuid: 301, //综合新闻301,行业资讯302
      https: "https://www.sifi.com.cn/",
      pageNum: 1,
      hasNext: true,//false全部加载
      list: [],
      showNews: 'loading',  //fail失败，loading加载中,success加载更多 

    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    setTimeout(() => {
      if (app.globalData.openid) {
        this.setData({
          openid: app.globalData.openid,
          userType: app.globalData.userType,
        })
      } else {
        app.callback_home = (res) => {
          this.setData({
            openid: res.data.openid,
            userType: res.data.usertype,
          })
        }
      }
    }, 1000)

    this.getNews()
    //console.log("home主界面,渲染完成")
  },
  show_introduce: function () {
    wx.navigateTo({
      url: '/pages/introduce/introduce'
    })
  },
  checkNet: function () {
    if (!wx.getStorageSync("homePage_tips")) {
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
          this.scanQR()
        } else {
          this.setData({
            showModel1: true
          })
        }
      })
    } else { this.scanQR() }
  },
  scanQR: function () {
    wx.scanCode({
      scanType: 'qrCode',
      success: (res) => {
        wx.showToast({
          title: '正在打开证书..',
          mask: true,
          duration: 20000
        })
        var url = res.result
        if (url.indexOf(this.data.certUrl) != -1 || url.indexOf(this.data.certUrl2) != -1) {
          var url2 = url.indexOf(this.data.certUrl) != -1 ? url.replace(this.data.certUrl, app.data.url2) : url.replace(this.data.certUrl2, app.data.url2);
          const downfile = new Promise((resolve, reject) => {
            wx.downloadFile({
              url: url2,
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
              success: function () {
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
        } else {
          wx.hideToast()
          wx.showToast({
            title: '不存在此证书信息',
            image: '/images/fail.png',
            duration: 1500,
            mask: true
          })
        }
      },
      fail: (res) => {
        wx.hideToast()
        wx.showToast({
          title: '扫描失败',
          image: '/images/fail.png',
          duration: 1500,
          mask: true
        })
      }
    })
  },
  show_search: function () {
    if (this.data.userType == "游客") {
      wx.showModal({
        title: '查询失败',
        content: '当前用户尚未通过认证,请前往【用户中心】进行用户认证',
      })
      return
    }
    wx.navigateTo({
      url: '/pages/apply_search/apply_search'
    })
  },
  show_charge: function () {
    if (this.data.userType != "超级管理员") {
      wx.showModal({
        title: '查询失败',
        content: '当前用户不具备此查询权限',
      })
      return
    }
    wx.navigateTo({
      url: '/pages/charge/charge'
    })
  },
  modelOk: function () {
    this.setData({
      showModel1: false
    })
    this.scanQR()
  },
  modelCancel: function () {
    this.setData({
      showModel1: false
    })
  },
  checkboxChange: function (res) {
    if (res.detail.value[0]) {
      wx.setStorageSync('homePage_tips', 'on')
    } else {
      wx.setStorageSync('homePage_tips', null)
    }
  },
  // 新闻部分
  showNewsDetail: function (res) {

    wx.navigateTo({
      url: '/pages/news_detail/news_detail?id=' + this.data.newsData.list[res.currentTarget.dataset.id].id,
    })

  },

  getNews: function () {
    const that = this
    const promise = new Promise((resolve, reject) => {
      wx.request({
        url: app.data.url3 + "wx/getNewsList",
        data: { menuid: that.data.newsData.menuid, pageNum: that.data.newsData.pageNum },
        success: (res) => {
          resolve(res)
        },
        fail: () => { reject() }

      })
    })
    promise.then((res) => {
      if (res.statusCode == 200) {
        that.setData({
          'newsData.hasNext': res.data.hasNextPage,
          'newsData.list': that.data.newsData.menuid == res.data.menuid ? that.data.newsData.list.concat(res.data.list) : that.data.newsData.list,
          canUseRefresh: true
        })
      } else {
        that.setData({
          'newsData.showNews': 'fail'
        })
      }
    }, () => {
      that.setData({
        'newsData.showNews': 'fail'
      })
    })

  },
  changeNewsType: function (res) {
    this.setData({
      'newsData.menuid': res.currentTarget.dataset.menuid,
      'newsData.hasNext': true,
      'newsData.pageNum': 1,
      'newsData.showList': 'loading',
      'newsData.list': []
    })
    this.getNews()
  },
  /**
    * 页面上拉触底事件的处理函数
    */
  onReachBottom: function () {
    if (this.data.newsData.hasNext) {
      if (!this.data.canUseRefresh) {
        wx.showToast({
          image: '/images/fail.png',
          title: '请勿频繁加载',
        })
        return
      }
      this.setData({
        'newsData.pageNum': this.data.newsData.pageNum + 1,
        'newsData.showNews': 'loading',
        'canUseRefresh': false
        , 'canUseRefresh_detailPosition': true,
      })
      setTimeout(() => {
        this.getNews()
      }, 2500)
      setTimeout(() => {
        this.setData({
          canUseRefresh: true
        })
      }, 10000)
    }

  },
  /**
  * 页面下拉
  */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})