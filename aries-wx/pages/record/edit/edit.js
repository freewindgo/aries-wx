// pages/record/edit/edit.js

var id = -1
const app = getApp()
const util = require('../../../utils/util.js')

Page({

  data: {
    loadingStatus: false,
    /**以下为与存储相关数据**/
    id: '',
    cardArray: [],
    cardIndex: 0,
    today: util.formatTime(new Date),
    type : 1,
    types: [
      {
        id:1,
        name:"还款",
      },
      {
        id: 2,
        name: "领羊",
      },
    ],
    isPay:false,
    bill: '',
    payTime: '',
    isShowSheep:false,
    sheepCycle: '',
  },

  //卡片选择
  bindCardChange: function (e) {
    var that = this
    var cardIndex = e.detail.value
    console.log(cardIndex)

    that.setData({
      cardIndex: cardIndex
    })

    var isShowSheep = that.data.isShowSheep
    if(isShowSheep){
      //todo:重新选择卡片后重新计算周期
    }

  },

  //日期选择
  bindDateChange: function (e) {
    var that = this
    that.setData({
      payTime: e.detail.value
    })
  },

  bindRadioChange: function (e){
    let that = this
    let isShowSheep = false
    if(e.detail.value == 2){
      isShowSheep = true
    }
    that.setData({
      isShowSheep: isShowSheep
    })
  },
  //返回
  bindBackTo: function (e) {
    wx.showModal({
      title: '提示',
      content: '数据还未保存，确认返回？',
      success: function (res) {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    })
  },

  //保存
  formSave: function (e) {
    let that = this
    let checkResult = true
    //存储项

    let cardIndex = e.detail.value.cardIndex
    let cardArray = that.data.cardArray
    let cardId = cardArray[cardIndex].id
    let cardName = cardArray[cardIndex].cardName
    let bankId = cardArray[cardIndex].bankId

    let payTime = e.detail.value.payTime
    let month = payTime.substring(0, payTime.lastIndexOf("-"))

    let sheepCycle = e.detail.value.sheepCycle
    let type = e.detail.value.type

    //金额项转为分
    let bill = e.detail.value.bill * 100
  
    if (cardName == '') {
      checkResult = false
      wx.showToast({
        title: '需要选择一张卡哦!',
        image: '../../../images/common/hint.png',
        mask: true,
        duration: 2000
      })
      return
    }

    if (bill == '') {
      checkResult = false
      wx.showToast({
        title: '忘记填金额啦!',
        image: '../../../images/common/hint.png',
        mask: true,
        duration: 2000
      })
      return
    }

    if (payTime == '') {
      checkResult = false
      wx.showToast({
        title: '日期标记是哪天?',
        image: '../../../images/common/hint.png',
        mask: true,
        duration: 2000
      })
      return
    }

    if (checkResult) {
      that.setData({
        loadingStatus: true
      })
      var data = that.data;
      var param = {
        id: data.id,
        userId: wx.getStorageSync('userToken'),
        bankId: bankId,
        cardId: cardId,
        cardName: cardName,
        bill: bill,
        month: month,
        type: type,
        sheepCycle: sheepCycle,
      }

      //调用接口存储
      app.request('/consume/saveConsumeInfo', 'POST', param).then((res) => {
        //设置全局修改标记位
        app.globalData.isConsumeInfoChange = true
        wx.navigateBack()
      }).catch((errMsg) => {
        console.log(errMsg);
        wx.showModal({
          title: '警告',
          content: '保存出错啦，请稍后再试',
          success: function (res) {
            wx.navigateBack()
          }
        })
      })

    }
  },

  onLoad: function (options) {
    var that = this

    var param = {
      userId: wx.getStorageSync('userToken'),
    }
    app.request('/credit/getCreditCards', 'POST', param).then((res) => {
      if (res && res.data) {
        that.setData({
          cardArray: res.data
        });

        that.inputData(options)
      }
    }).catch((errMsg) => {
      console.log(errMsg);
    });

  },

  inputData: function (options) {
    let that = this
    id = typeof (options.id) == 'undefined' ? -1 : options.id
    if (id > 0) {
      that.setData({
        //从option中获取数据
        id: id,
        isPay: options.isPay == 1 ? true : false,
        bill: options.bill / 100,
        payTime: options.payTime,
        isShowSheep: options.sheepCycle == '' ? false : true,
        sheepCycle: options.sheepCycle,
        type: options.type,
      })

      var cardId = options.cardId
      for (var i = 0; i < that.data.cardArray.length; i++) {
        if (that.data.cardArray[i].id == cardId) {
          that.setData({
            cardIndex: i
          })
          break;
        }
      }

  
    }

  }



})