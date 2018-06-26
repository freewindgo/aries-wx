//index.js
//获取应用实例
const app = getApp()
const util = require('../..//utils/util.js')
const charts = require('../../utils/wxcharts.js')
var columnChart = null

Page({
  data: {
    adviceDay: -1,
    adviceCard: '',
    cardTotal: 0,
    recordTotal: 0,
    chartData: {
      title: '近三月数据统计(点击查看更多数据)',
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
      //console.log(userToken)
      that.getSummaryData()
      that.getChartData()
      wx.hideLoading()
    }

  },

  //获取页面上半部分统计数据
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

  //获取图表数据
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
        var months = chartData.categories
        for(var i =0; i < months.length;i++){
          for (var j = 0; j < chartDatas.length; j++){
            if (chartDatas[j].month == months[i]){
              //此处转成万
              chartData.consume.data[i] = chartDatas[j].bill/100
              chartData.cash.data[i] = chartDatas[j].sheep/100
            }
          }
        }
        that.setData({
          chartData:chartData
        })
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

    var chartData = that.data.chartData
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
        name: '账单',
        data: chartData.consume.data,
        format: function (val, name) {
          return val.toFixed(0)
        }
      }, {
        name: '羊',
        data: chartData.cash.data,
        format: function (val, name) {
          return val.toFixed(0)
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

  //点击图表跳转到统计列表
  touchHandler: function (e) {
    let that = this
    wx.navigateTo({
      url: '../statistic/index/index'
    })
  },

  addCreditCard: function () {
    wx.navigateTo({
      url: '../credit/edit/edit'
    })

  },


  onShow: function (e) {
    let that = this

    if (app.globalData.isCreditCardChange) {
      that.getSummaryData()
      if (app.globalData.isConsumeInfoChange) {
        that.getChartData()
        app.globalData.isConsumeInfoChange = false
      }
      app.globalData.isCreditCardChange = false
    } else if (app.globalData.isConsumeInfoChange){
      that.getChartData()
      that.getSummaryData()
      app.globalData.isConsumeInfoChange = false
    }

    
  }



})



