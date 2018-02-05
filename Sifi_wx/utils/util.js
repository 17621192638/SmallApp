// // 2018/01/01 12:12:12
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
// 2018-01-01
const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}
//得到每月的第一天 2018-01-01
const getbTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return [year, month].map(formatNumber).join('-') + '-01'
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const err_failconnect = () => {
  wx.showModal({
    title: '网络错误',
    content: '连接服务器失败,请检查自身网络或前往【用户中心】联系技术人员',
  })
}
const err_404 = () => {
  wx.showModal({
    title: '网络错误',
    content: '404:服务器访问路径异常,请联系技术人员',
  })
}
const err = () => {
  wx.showLoading({
    image: '/images/fail.png',
    title: '连接服务器异常',
  })
}

const pageFiter = (app, path) => {
  if (app.globalData.enterPath == path) {
    app.globalData.enterPath = '/pages/home/home'
    console.log(app.globalData.enterPath)
    wx.switchTab({
      url: '/pages/home/home',
    })
  }
}

module.exports = {
  formatTime: formatTime,
  formatTime2: formatTime2,
  getbTime: getbTime,
  err_404: err_404,
  err_failconnect: err_failconnect,
  err: err,
  pageFiter: pageFiter
}