// pages/user/index/index.js


Page({
  data: {
    userInfo: {},
    dataList: [/*"隐私记录",*/ "我的卡片", "我的统计"],
    scrollHeight: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  //跳转
  bindToNavigate : function(e){
    //index对应dataList的各项
    let index = e.currentTarget.id
    if(index == 0){
      wx.navigateTo({
        url: '../../credit/index/index'
      })
    }

    if(index == 1){
      wx.navigateTo({
        url: '../../statistic/index/index'
      })
    }

  },

  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
  },

  onLoad: function () {

    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log(res.userInfo)
            }
          })
        }
      }
    })
  },

  onShow: function (options) {

  }
})
