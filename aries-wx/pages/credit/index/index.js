//index.js
const app = getApp()

Page({
  data: {
    searchValue: '',  //需要搜索的字符  
    dataList: [], //放置返回数据的数组  
    isFromSearch: true,   // 用于判断dataList数组是不是空数组，默认true，空的数组  
    start: 0,   // 设置加载的第几次，默认是第一次  
    size: 15,      //返回数据的个数  
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false  //“没有数据”的变量，默认false，隐藏  
  },

  //输入框事件
  bindSearchInput: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  //获取数据  
  getDataList: function () {
    let that = this;
 
    //处理
    let param = {
      searchValue:that.data.searchValue,
      start: that.data.start,
      size:that.data.size,
      userId:wx.getStorageSync('userToken'),
    } 

    //调用接口查询
    app.request('/credit/getCreditCards', 'POST', param).then((res) => {
      let data = res.data
      console.log(data)
      if (data){
        let resultList = []
        that.data.isFromSearch ? resultList = data : resultList = that.data.dataList.concat(data)
        that.setData({
          dataList:resultList,
          searchLoading: true
        })
      }else{
        that.setData({
          searchLoadingComplete: true, //把“没有数据”设为true，显示  
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
        });
      }

    }).catch((errMsg) => {
      console.log(errMsg);
      that.setData({
        searchLoadingComplete: true, //把“没有数据”设为true，显示  
        searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
      });
    })
  },

  //点击搜索按钮，触发事件  
  bindSearch: function (e) {
    let that = this
    that.setData({
      start: 0,   //第一次加载，设置1  
      dataList: [],  //清空数据 
      isFromSearch: true,  //第一次加载，设置true  
      searchLoading: true,  //把"上拉加载"的变量设为true，显示  
      searchLoadingComplete: false //把“没有数据”设为false，隐藏  
    })
    that.getDataList()
  },

  //滚动到底部触发事件  
  searchScrollLower: function () {
    let that = this;
    if (that.data.searchLoading && !that.data.searchLoadingComplete) {
      that.setData({
        start: that.data.start + 1,  //每次触发上拉事件，把searchPageNum+1  
        searchLoading: true,  //把"上拉加载"的变量设为true，显示  
        isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
      });
      that.getDataList()
    }
  },

  bindToEdit : function(e){
    let that = this
    let creditId = e.currentTarget.id
    if(creditId){
      let credit = null
      let dataList = that.data.dataList
      for (var index in dataList){
        if (dataList[index].id == creditId){
          credit = dataList[index]
          break
        }
      }
      console.log(credit)
      let url = "../edit/edit"
      let id = "?id=" + creditId
      let cardName = "&cardName="+credit.cardName
      let cardNo = "&cardNo="+credit.cardNo
      let creditLimit = "&creditLimit=" + credit.creditLimit
      let creditTempLimit = "&creditTempLimit=" + credit.creditTempLimit
      let creditOtherLimit = "&creditOtherLimit=" + credit.creditOtherLimit
      let creditTotalLimit = "&creditTotalLimit=" + credit.creditTotalLimit
      let billDay = "&billDay=" + credit.billDay
      let payDay = "&payDay=" + credit.payDay
      let expireDay = "&expireDay=" + credit.expireDay
      let billCycle = "&billCycle=" + credit.billCycle
      let levelId = "&levelId=" + credit.cardLevel
      let bankId = "&bankId="+ credit.bankId

      url = url+id+cardName+cardNo+creditLimit+creditTempLimit+creditOtherLimit+creditTotalLimit+billDay+payDay+expireDay+billCycle+levelId+bankId
      console.log(url)
      wx.navigateTo({
        url: url,
      })

    }

  },

  //页面加载
  onLoad: function (options){
    let that = this
    that.getDataList()
    app.globalData.isCreditCardChange = false
  },

  onShow: function (options){
    var that = this
    if (app.globalData.isCreditCardChange) {
      that.setData({
        start: 0,   //第一次加载，设置1  
        dataList: [],  //清空数据 
        isFromSearch: true,  //第一次加载，设置true  
        searchLoading: true,  //把"上拉加载"的变量设为true，显示  
        searchLoadingComplete: false //把“没有数据”设为false，隐藏  
      })
      that.getDataList()
      app.globalData.isCreditCardChange = false
    }

  }

})  