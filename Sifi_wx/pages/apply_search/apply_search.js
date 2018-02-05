// pages/apply_search/apply_search.js
var Promise = require('../../utils/bluebird.min.js')
var tool = require('../../utils/util.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   * precent:进度条进度
   */
  data: {
    inputValue: null,
    array: [1],
    index: 0,//下标页码
    totals: 0,//总记录数
    pageNum: 1,//页码
    pages: 1,//总页数
    openid: null,
    userType: null,
    list: null,//数组集合
    percent: 20, //进度条
    showModel1: false,
    hasTimeOut: false    //下拉刷新间隔2S
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    tool.pageFiter(app, getCurrentPages()[getCurrentPages().length - 1].route)
    this.setData({
      openid: app.globalData.openid,
      userType: app.globalData.userType
    })
    this.getSearch()

  },
  inputChange: function (e) {
    this.setData({
      inputValue: parseInt(e.detail.value)
    })
  },
  bindPickerChange: function (e) {
    this.setData({
      index: parseInt(e.detail.value),
      pageNum: parseInt(e.detail.value) + 1
    })

    this.getSearch();
  },
  precentPage: function () {
    if (this.data.index <= 0) {
      wx.showToast({
        title: '当前页已是首页',
      })
    } else {
      this.setData({
        index: this.data.index - 1,
        pageNum: this.data.pageNum - 1
      })
      this.getSearch()

    }
  },
  nextPage: function () {
    if (this.data.index >= (this.data.pages - 1)) {
      wx.showToast({
        title: '当前页已是末页',
      })
    } else {
      this.setData({
        index: this.data.index + 1,
        pageNum: this.data.pageNum + 1
      })

      this.getSearch()
    }

  },
  addpercent: function () {
    if (this.data.percent <= 100) {
      this.setData({
        percent: this.data.percent + 1
      })
      this.addpercent()
    }
  },
  pickPage: function () {
    this.setData({
      showModel1: true,
      inputValue: this.data.pageNum
    })
  },
  modelCancel: function () {
    this.setData({
      showModel1: false
    })
  },
  modelOk: function () {
    this.setData({
      showModel1: false
    })

    if (!this.data.inputValue || this.data.inputValue > this.data.pages || this.data.inputValue < 0) {
      wx.showToast({
        title: '页码超出范围',
        image: '/images/fail.png',
        duration: 2000,
        mask: true
      })
    } else {
      this.setData({
        index: this.data.inputValue - 1,
        pageNum: this.data.inputValue
      })

      this.getSearch()
    }

  },
  show_detail: function (res) {
    wx.navigateTo({
      url: '/pages/apply_search_detail/apply_search_detail?model=' + encodeURIComponent(JSON.stringify(this.data.list[res.currentTarget.dataset.id])),
    })
  },
  getSearch: function () {
    //console.log("当前选择页面" + this.data.pageNum)
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    const promise = new Promise((resolve, reject) => {
      wx.request({
        url: app.data.url + 'wx/search',
        data: { openid: this.data.openid, userType: this.data.userType, pageNum: this.data.pageNum },
        success: (res) => { resolve(res) },
        fail: (res) => { reject(res) }
      })
    })
    const that = this
    promise.then(function (res) {
      if (res.statusCode == 200) {
        that.addpercent()
        if (res.data.status == 1) {
          that.setData({
            array: res.data.array,
            pages: res.data.pages,
            totals: res.data.totals,
            list: res.data.list
          })
        
        } else if (res.data.status == -3) {
          wx.showModal({
            title: '查询失败',
            content: '您当前的账号尚未绑定企业信息,请与客服人员联系进行企业绑定',
          })
        }
        else if (res.data.status == -4) {
          wx.showModal({
            title: '查询失败',
            content: '您当前的账号已被禁用,如有疑问请联系客服人员',
          })
        }
        else if (res.data.status == -5) {
          wx.showModal({
            title: '查询失败',
            content: '您当前所在的企业已经被拉入黑名单或者不存在,如有疑问请联系客服人员',
          })
        }
      } else if (res.statusCode == 404) {
        tool.err_404()
      } else { tool.err_failconnect() };
      wx.hideLoading()
    }, function (error) {
      tool.err_failconnect()
      wx.hideLoading()
      that.addpercent()
    });

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
    if (this.data.hasTimeOut) {
      wx.showToast({
        image: '/images/fail.png',
        title: '刷新过于频繁',
        mask: true
      })
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      return
    } else {
      wx.showNavigationBarLoading()
      const promise = new Promise((resolve, reject) => {
        wx.request({
          url: app.data.url + 'wx/search',
          data: { openid: this.data.openid, userType: this.data.userType, pageNum: this.data.pageNum },
          success: (res) => { resolve(res) },
          fail: (res) => { reject(res) }
        })
      })
      const that = this
      promise.then(function (res) {

        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            that.setData({
              array: res.data.array,
              pages: res.data.pages,
              totals: res.data.totals,
              list: res.data.list
            })
            wx.showToast({
              icon: 'success',
              title: '刷新成功',
              mask: true
            })
          } else if (res.data.status == -3) {
            wx.showModal({
              title: '查询失败',
              content: '您当前的账号尚未绑定企业信息,请与客服人员联系进行企业绑定',
            })
          }
          else if (res.data.status == -4) {
            wx.showModal({
              title: '查询失败',
              content: '您当前的账号已被禁用,如有疑问请联系客服人员',
            })
          }
          else if (res.data.status == -5) {
            wx.showModal({
              title: '查询失败',
              content: '您当前所在的企业已经被拉入黑名单或者不存在,如有疑问请联系客服人员',
            })
          }

        } else if (res.statusCode == 404) {
          tool.err_404()
        } else { tool.err_failconnect() };
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
      }, function (error) {
        tool.err_failconnect()
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
      });
      this.setData({
        hasTimeOut: true
      })
      setTimeout(() => {
        this.setData({
          hasTimeOut: false
        })
      }, 20000)
    }
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