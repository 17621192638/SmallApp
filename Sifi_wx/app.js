//app.js
const util = require("/utils/util.js")
App({
  globalData: {
    user: null,//数据库信息
    userInfo: null,//微信端信息
    userType: "游客",
    openid: null,
    enterPath: "pages/home/home"
  },
  data: {
    map_sifi: { latitude: 31.21497, longitude: 121.44141, name: "上海市纤维检验所", address: "上海市长乐路1228号", scale: 18 },
    phone_sifi: { phoneNumber: "021-62481029" },
    url2: "https://wx.sifi.com.cn/Maven2/",//默认maven2
    url: "https://wx.sifi.com.cn/Sifi_wx/",
    url3: "https://wx.sifi.com.cn/SifiWeb/",
    //  url: "http://localhost:8080/Sifi_wx/",
    // url3: "http://localhost:8080/SifiWeb/",

  },
  onLaunch: function (options) {
    this.globalData.enterPath = options.path
    if (!wx.getStorageSync('user')) {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.request({
              url: this.data.url + "wx/login",
              data: {
                code: res.code
              },
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: res => {

                if (res.statusCode == 200) {
                  this.globalData.openid = res.data.openid;
                  this.globalData.user = res.data;
                  this.globalData.userType = res.data.usertype;

                  if (this.callback_home) {
                    this.callback_home(res)
                  }
                  if (this.callback_user) {
                    this.callback_user(res)
                  }
                  wx.setStorageSync('user', res.data)
                } else {
                  util.err_failconnect()
                  return
                }
              },
              fail: res => {
                console.log(res)
                util.err_failconnect()
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '获取用户登录态失败！' + res.errMsg
            })
          }
        }
      })
    } else {
      var user = wx.getStorageSync('user');
      this.globalData.user = user;
      this.globalData.userType = user.usertype;
      this.globalData.openid = user.openid;
      // console.log(this.globalData)
      wx.request({
        url: this.data.url + 'wx/insert/log',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          openid: this.globalData.openid
        },
        success: function (res) {
        }
      })
    }
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })

  },
  onShow: function () {
    //console.log("小程序显示...")
  },
  onHide: function () {
    // console.log("小程序隐藏...")

  },
  onError: function (msg) {
    //  console.log("小程序出现错误(app.js)...")
  }
})