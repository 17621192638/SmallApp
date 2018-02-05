// pages/charge/charge.js
const Promise = require('../../utils/bluebird.min.js')
const wxCharts = require('../../utils/wxcharts.js')
const util = require('../../utils/util.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    feeList: [],//证书收费列表
    model: null,//当前列表信息
    totalList: [],//总价列表,不精确到万
    totalList2: [],//精确到万
    dateList: [],//日期列表
    totalModel: null,
    bTime: null,
    eTime: null,
    checkTypeIndex: 0,
    currentTime: null,
    ring: null,//环状图对象,
    lineChart: null,//折线图
    showColor: 0,//点击变色状态 index
    showTongji: false,//统计
    checkDate: [],
    checkTypeArray: ['全部', '委托', '执法', '抽查'],
    startTime: '2011-01-01'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var currentYear = (new Date).getFullYear(), checkDate = []
    checkDate.push((currentYear).toString() + '年当前汇总')
    checkDate.push((currentYear - 1).toString() + '年年度汇总')
    checkDate.push((currentYear - 2).toString() + '年年度汇总')
    checkDate.push((currentYear - 3).toString() + '年年度汇总')
    this.setData({
      bTime: util.getbTime(new Date()),
      eTime: util.formatTime2(new Date()),
      currentTime: util.formatTime2(new Date()),
      checkDate: checkDate
    })
    this.getCertFee()

  },

  getCertFee: function () {
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    })
    var that = this
    const promise = new Promise((resolve, reject) => {
      wx.request({
        url: app.data.url + 'wx/get/CertFee',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: { openid:app.globalData.openid,bTime: that.data.bTime, eTime: that.data.eTime, checkType: that.data.checkTypeArray[that.data.checkTypeIndex] },
        success: (res) => {
          if (res.statusCode == 200) { resolve(res) } else {
            util.fail()

          }
          wx.hideLoading()
        },
        fail: () => {
          reject()
          wx.hideLoading()
        }
      })
    })
    promise.then((res) => {
      const list = res.data.list
      var totalList = [], dateList = [], totalList2 = []
      if (list.length) {
        for (var i = 0; i < list.length; i++) {
          var total = parseFloat(list[i].totalMoney) + parseFloat(list[i].printPay);
          totalList.push(total.toFixed(3)),
            dateList.push(list[i].receivedate)
          totalList2.push(parseFloat((total / 10000).toFixed(2)))
        }
        that.setData({
          totalList: totalList,
          dateList: dateList,
          totalList2: totalList2,
          feeList: list,
          model: list[0],
          showColor: 0,
          showTongji: false,
          totalModel: res.data.model
        })
        this.showRing()
        this.showLine()

      } else {
        wx.showToast({
          image: '/images/fail.png',
          title: '当前无收费信息',
          duration: 5000
        })
      }
    }, () => {
      util.err_failconnect()

    })
  },

  showRing: function () {
    const model = this.data.model
    // 310rpx/750rpx=0.41333
    var ringWidth = wx.getSystemInfoSync().windowWidth * 0.413333333
    this.data.ring = new wxCharts({
      animation: true,
      canvasId: 'ringCanvas',
      type: 'ring',
      extra: {
        ringWidth: 25,
        pie: {
          offsetAngle: -45
        }
      },
      series: [{
        color: '#2ecc71',
        data: this.formatMoney(model.allInMoney),
        stroke: false
      }, {
        color: '#3498db',
        data: this.formatMoney(model.invoicedMoney),
        stroke: false
      }, {
        color: '#e74c3c',
        data: this.formatMoney(model.noInvoiceMoney),
        stroke: false
      }, {
        color: '#f39c12',
        data: this.formatMoney(model.noOrderMoney),
        stroke: false
      }],
      disablePieStroke: true,
      width: ringWidth,
      height: ringWidth,
      dataLabel: false,
      legend: false,
      padding: 0,
    });
  },
  updateRing: function (model) {
    this.data.ring.updateData({
      series: [{
        color: '#2ecc71',
        data: this.formatMoney(model.allInMoney),
        stroke: false
      }, {
        color: '#3498db',
        data: this.formatMoney(model.invoicedMoney),
        stroke: false
      }, {
        color: '#e74c3c',
        data: this.formatMoney(model.noInvoiceMoney),
        stroke: false
      }, {
        color: '#f39c12',
        data: this.formatMoney(model.noOrderMoney),
        stroke: false
      }],
    });
  },
  showLine: function () {
    // 310rpx/750rpx=0.41333
    var lineHeight = wx.getSystemInfoSync().windowWidth * 0.413333333
    var lineWidth = wx.getSystemInfoSync().windowWidth * 0.826666666
    this.data.lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: this.data.dateList,
      animation: true,
      series: [{
        name: '收费总额',
        data: this.data.totalList2,
        format: function (val, name) {
          return val.toFixed(2) + '万';
        }
      }],
      xAxis: {
        disableGrid: false
      },
      yAxis: {
        title: '收费总额 (万元)',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: lineWidth,
      height: lineHeight,
      dataLabel: true,
      dataPointShape: true,
      enableScroll: true,
      legend: false,
      extra: {
        lineStyle: 'curve'
      }
    });
  },
  touchHandler: function (e) {
    this.data.lineChart.scrollStart(e);
  },
  moveHandler: function (e) {
    this.data.lineChart.scroll(e);
  },
  touchEndHandler: function (e) {
    this.data.lineChart.scrollEnd(e);
    this.data.lineChart.showToolTip(e, {
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  TongjiClick: function () {
    this.setData({
      showTongji: true,
      showColor: null
    })
    this.data.lineChart.updateData({
    });
    this.updateRing(this.data.totalModel)
  },
  bTimeChange: function (res) {
    var bTime = res.detail.value
    if (bTime > this.data.eTime) {
      wx.showToast({
        image: '/images/fail.png',
        title: '起始日期太大',
      })
    }
    else {
      this.setData({
        bTime: bTime,
      })
    }
  },
  eTimeChange: function (res) {
    var eTime = res.detail.value
    if (eTime < this.data.bTime) {
      wx.showToast({
        image: '/images/fail.png',
        title: '截止日期太小',
      })
    }
    else {
      this.setData({
        eTime: eTime,
      })
      this.getCertFee()
    }
  },
  dateChange: function (res) {
    var year = '', currentYear = (new Date()).getFullYear()
    if (res.detail.value == 0) {
      this.setData({
        bTime: util.getbTime(new Date()),
        eTime: util.formatTime2(new Date()),
      })
    } else {
      if (res.detail.value == 1) {
        year = currentYear - 1
      } else if (res.detail.value == 2) {
        year = currentYear - 2
      } else if (res.detail.value == 3) {
        year = currentYear - 3
      }
      this.setData({
        bTime: year.toString() + '-01-01',
        eTime: year.toString() + '-12-31'
      })
    }
    this.getCertFee()
  },
  checkTypeChange: function (res) {
    this.setData({
      checkTypeIndex: res.detail.value,
    })
    this.getCertFee()
  },
  modelChange: function (res) {
    this.setData({
      model: this.data.feeList[res.currentTarget.dataset.index],
      showColor: res.currentTarget.dataset.index,
      showTongji: false
    })
    this.updateRing(this.data.model)
  },
  formatMoney: function (money
  ) {
    return money && money != "0.000" ? parseFloat(money) : 0;
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