//index.js
//获取应用实例
const app = getApp()
var util = require('../..//utils/util.js')

Page({
  data: {
    adviceDay: -1,
    adviceCard: '',
    cardTotal: 0,
    recordTotal: 0,
    chartData: {
      title: '近三月数据统计',
      categories: [],
      consume: {
        data: [0, 0, 0],
      },
      cash: {
        data: [0, 0, 0],
      }
    },

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.data.chartData.categories = util.calMonth(new Date)
    wx.showLoading({
      title: '加载中',
    })
    //获取数据前需保证先获取到token，即id
    var userToken = wx.getStorageSync('userToken')
    if (!userToken) {
      app.getToken().then(function (res) {
        that.getSummaryData()
        that.getChartData()
        wx.hideLoading()
      })
    } else {
      console.log(userToken)
      that.getSummaryData()
      that.getChartData()
      wx.hideLoading()
    }

  },

  getSummaryData: function () {
    var that = this
    app.request('/credit/summaryInfo?userId=' + wx.getStorageSync('userToken'), 'GET', null).then((res) => {
      if (res && res.data) {
        var summary = res.data
        that.setData({
          adviceDay: summary.adviceDay,
          adviceCard: summary.adviceCard,
          cardTotal: summary.cardTotal,
          recordTotal: summary.recordTotal,
        })
      }
    }).catch((errMsg) => {
      console.log(errMsg)//错误提示信息
    })
    app.globalData.isCreditCardChange = false
  },

  getChartData: function () {
    var that = this
    var chartData = that.data.chartData
    var param = {
      userId: wx.getStorageSync('userToken'),
      startMonth: chartData.categories[0],
      endMonth: chartData.categories[2],
    }
    app.request('/consume/getConsumeStatsForm', 'GET', param).then((res) => {
      if (res && res.data) {
        var chartDatas = res.data
        for (var i = 0; i < chartDatas.lens; i++) {
          chartData.consume.data[i] = chartDatas[chartDatas.lens - i].bill
          chartData.cash.data[i] = chartDatas[chartDatas.lens - i].sheep
        }
      }
    }).catch((errMsg) => {
      console.log(errMsg)//错误提示信息
    })
  },

  /**
   * 生命周期函数--监听页面渲染
   */
  onReady: function (e) {
    var that = this
    var charts = require('../../utils/wxcharts.js')
    var columnChart = null
    var chartData = that.data.chartData
    console.log(chartData)
    var windowWidth = 320
    try {
      var res = wx.getSystemInfoSync()
      windowWidth = res.windowWidth
    } catch (e) {
      console.error('getSystemInfoSync failed!')
    }
    columnChart = new charts({
      canvasId: 'columnCanvas',
      type: 'column',
      animation: true,
      categories: chartData.categories,
      series: [{
        name: '账单(万)',
        data: chartData.consume.data,
        format: function (val, name) {
          return val.toFixed(2)
        }
      }, {
        name: '羊(万)',
        data: chartData.cash.data,
        format: function (val, name) {
          return val.toFixed(2)
        }
      }],
      yAxis: {
        format: function (val) {
          return val
        },
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      width: windowWidth,
      height: 200,
    })
  },

  touchHandler: function (e) {
    var index = columnChart.getCurrentDataIndex(e)
    if (index > -1 && index < chartData.sub.length) {
      //TODO：跳转到相应月份的查询记录上
      console.log("11111")
    }
  },


  addCreditCard: function () {
    wx.navigateTo({
      url: '../credit/edit/edit'
    })

  },


  onShow: function (e) {
    var that = this
    if (app.globalData.isCreditCardChange) {
      that.getSummaryData()
      app.globalData.isCreditCardChange = false
    }
  }



})



