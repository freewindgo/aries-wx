// pages/credit/edit/edit.js

var id = -1

var app = getApp()
Page({

  data: {
    loadingStatus: false,
    /**以下为与存储相关数据**/
    id:'',
    bankArray: [],
    bankIndex: 0,
    levelArray: ['普卡', '金卡', '白金卡', '无限卡', '其他'],
    levelIndex: 0,
    cardNo:'',
    cardName:'',
    creditLimit:'',
    creditTempLimit:'',
    creditOtherLimit:'',
    creditTotalLimit:'',
    billDay:'',
    payDay:'',
    expireDay:'-1',
    billCycle:'',

  },

  //银行选择
  bindBankChange: function (e) {
    var that = this
    var bankIndex = e.detail.value
    console.log(bankIndex)
    var cardNo = that.data.cardNo
    that.setData({
      bankIndex: bankIndex
    })
    if (cardNo) {
      var bankShortName = that.data.bankArray[bankIndex].shortName
      if (bankShortName) {
        that.setData({
          cardName: bankShortName + cardNo,
        })
      }
    }
  },

  //卡等级选择
  bindLevelChange: function (e) {
    var that = this
    that.setData({
      levelIndex: e.detail.value
    })
  },

  //卡名称自动赋值
  bindCardNoInput: function(e){
    var that = this
    var cardNo = e.detail.value
    var bankIndex = that.data.bankIndex
    that.setData({
      cardNo: cardNo
    })

    var bankShortName = that.data.bankArray[bankIndex].shortName
    var cardName = bankShortName + cardNo
    if (bankShortName) {
      that.setData({
        cardName: cardName,
      })
    }

  },

  //额度输入
  bindLimitInput: function(e){
    var that = this
    var money = e.detail.value
    if(e.target.id == 'creditLimit'){
      that.setData({
        creditLimit: money
      })
    } else if (e.target.id == 'creditTempLimit'){
      that.setData({
        creditTempLimit: money
      })
    } else if (e.target.id == 'creditOtherLimit'){
      that.setData({
        creditOtherLimit: money
      })
    }

    that.calTotal()
  },


  calTotal: function(){
    var that = this
    var limit = parseInt(that.data.creditLimit)
    limit = isNaN(limit) ? 0 : limit
    var tempLimit = parseInt(that.data.creditTempLimit)
    tempLimit = isNaN(tempLimit) ? 0 : tempLimit
    var otherLimit = parseInt(that.data.creditOtherLimit)
    otherLimit = isNaN(otherLimit) ? 0 : otherLimit
    var total = limit + tempLimit + otherLimit
    that.setData({
      creditTotalLimit: total
    })
  },

  //过期日选择
  bindDateChange: function (e) {
    var that = this
    that.setData({
      expireDay: e.detail.value
    })
  },

  //检查输入有效性
  bindDayBlur: function(e){
    var that = this
    var date = e.detail.value
    if(parseInt(date) > 31){
      wx.showToast({
        title: '日期超出啦',
        image: '../../../images/common/hint.png',
        mask: true,
        duration: 2000
      })
      date = 31
    }
    if (e.target.id == 'billDay') {
      that.setData({
        billDay: date
      })
    } else if (e.target.id == 'payDay') {
      that.setData({
        payDay: date
      })
    }
    var billDay = parseInt(that.data.billDay)
    var payDay = parseInt(that.data.payDay)
    if(!isNaN(billDay) && !isNaN(payDay)){
      var billCycle = ((payDay - billDay) < 0 ? (payDay - billDay + 30) : (payDay - billDay)) + 30
      that.setData({
        billCycle: billCycle
      })
    }else{
      that.setData({
        billCycle: ''
      })
    }

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
    var that = this
    var checkResult = true
    //存储项
    var bankIndex = e.detail.value.bankId
    var cardName = e.detail.value.cardName
    var cardLevel = e.detail.value.cardLevel
    //金额项转为分
    var creditTempLimit = e.detail.value.creditTempLimit
    var creditOtherLimit = e.detail.value.creditOtherLimit
    var creditTotalLimit = e.detail.value.creditTotalLimit

    var billCycle = e.detail.value.billCycle
    var expireDay = e.detail.value.expireDay
    //校验项
    var cardNo = e.detail.value.cardNo
    var creditLimit = e.detail.value.creditLimit
    var billDay = e.detail.value.billDay
    var payDay = e.detail.value.payDay

    if(cardNo == ''){
      checkResult = false
      wx.showToast({
        title: '记上卡号后四位吧',
        image: '../../../images/common/hint.png',
        mask: true,
        duration: 2000
      })
      return
    }

    if (creditLimit == '') {
      checkResult = false
      wx.showToast({
        title: '忘填额度啦',
        image: '../../../images/common/hint.png',
        mask: true,
        duration: 2000
      })
      return
    }

    if (billDay == '') {
      checkResult = false
      wx.showToast({
        title: '账单日是哪天',
        image: '../../../images/common/hint.png',
        mask: true,
        duration: 2000
      })
      return
    }

    if (payDay == '') {
      checkResult = false
      wx.showToast({
        title: '还款日是哪天',
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
        id:data.id,
        userId: wx.getStorageSync('userToken'),
        bankId: data.bankArray[bankIndex].id,
        cardNo: cardNo,
        cardName: cardName,
        cardLevel: cardLevel,
        creditLimit: creditLimit*100,
        creditTempLimit: creditTempLimit*100,
        creditOtherLimit: creditOtherLimit*100,
        creditTotalLimit: creditTotalLimit*100,
        billDay: billDay,
        payDay: payDay,
        expireDay: expireDay,
        billCycle: billCycle,
        type: data.bankArray[bankIndex].type,
      }

      //调用接口存储
      app.request('/credit/saveCreditCard', 'POST', param).then((res) => {
        //设置全局修改标记位
        app.globalData.isCreditCardChange = true
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
    
    //银行列表获取
    wx.getStorage({
      key: 'bankCache',
      success: function (res) {
        that.setData({
          bankArray: res.data
        });
        that.inputData(options)
      },
      fail: function (res) {
        app.request('/admin/getAllBank', 'GET', null).then((res) => {
          if (res && res.data) {
            that.setData({
              bankArray: res.data
            });
            wx.setStorage({
              key: 'bankCache',
              data: that.data.bankArray
            })
            that.inputData(options)
          }
        }).catch((errMsg) => {
          console.log(errMsg);
        });
      }
    })

  },

  inputData: function(options){
    let that = this
    id = typeof (options.id) == 'undefined' ? -1 : options.id
    if (id > 0) {
      that.setData({
        //从option中获取数据
        id: id,
        cardName: options.cardName,
        cardNo: options.cardNo,
        creditLimit: options.creditLimit/100,
        creditTempLimit: options.creditTempLimit/100,
        creditOtherLimit: options.creditOtherLimit/100,
        creditTotalLimit: options.creditTotalLimit/100,
        billDay: options.billDay,
        payDay: options.payDay,
        expireDay: options.expireDay,
        billCycle: options.billCycle,
        levelIndex: options.levelId,
      })

      var bankId = options.bankId
      for (var i = 0; i < that.data.bankArray.length; i++) {
        console.log(that.data.bankArray[i].id)
        if (that.data.bankArray[i].id == bankId) {
          that.setData({
            bankIndex: i
          })
          break;
        }
      }
    }

  }



})