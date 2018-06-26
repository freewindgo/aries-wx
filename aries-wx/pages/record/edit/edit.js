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
    cardIndex: '',
    today: util.formatTime(new Date),
    type: 1,
    types: [
      {
        id: 1,
        name: "还款",
      },
      {
        id: 2,
        name: "领羊",
      },
    ],
    isPay: false,
    bill: '',
    payTime: '',
    isShowSheep: false,
    sheepCycle: '',
  },

  //卡片选择
  bindCardChange: function (e) {
    var that = this
    var cardIndex = e.detail.value
    that.setData({
      cardIndex: cardIndex
    })

    let isShowSheep = that.data.isShowSheep
    let payTime = that.data.payTime
    if (isShowSheep && payTime != "") {
      let sheepCycle = that.calSheepCycle(payTime, cardIndex)
      that.setData({
        sheepCycle: sheepCycle
      })
    }

  },

  //日期选择
  bindDateChange: function (e) {
    var that = this
    let payTime = e.detail.value
    that.setData({
      payTime: e.detail.value
    })

    let cardIndex = that.data.cardIndex
    let isShowSheep = that.data.isShowSheep
    if (cardIndex != "" && isShowSheep) {
      let sheepCycle = that.calSheepCycle(payTime, cardIndex)
      that.setData({
        sheepCycle: sheepCycle
      })
    }
  },

  //类型选择
  bindRadioChange: function (e) {
    let that = this
    if (e.detail.value == 2) {
      let cardIndex = that.data.cardIndex
      let payTime = that.data.payTime
      let sheepCycle = ""
      if(cardIndex != "" && payTime != ""){
        sheepCycle = that.calSheepCycle(payTime, cardIndex)
      }
      that.setData({
        isShowSheep: true,
        sheepCycle: sheepCycle
      })

    } else {
      that.setData({
        isShowSheep: false,
        sheepCycle: ''
      })
    }



  },

  //免息期计算
  calSheepCycle: function(date,cardIndex){
    let that = this
    let today = new Date(date).getDate()
    let card = that.data.cardArray[cardIndex]
    let billDay = card.billDay
    let billCycle = card.billCycle
    return billDay - today >= 0 ? billCycle + billDay - today - 30 : billCycle + billDay - today;
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

    let sheepCycle = e.detail.value.sheepCycle == '' ? -1 : e.detail.value.sheepCycle
    let type = e.detail.value.type
    //是否已还，如果类型为1，默认为2，类型为2，则为-1
    let isPay = type == 2 ? -1 : 2

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
        isPay: isPay,
        payTime: payTime
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