//index.js
const app = getApp()

const formatMonth = n => {
  n.month = parseInt(n.month.substring(n.month.indexOf("-")+1))
}

Page({
  data: {
    searchValue: '',  //需要搜索的字符  
    dataList: [], //放置返回数据的数组  
    isFromSearch: true,   // 用于判断dataList数组是不是空数组，默认true，空的数组  
    start: 0,   // 设置加载的第几次，默认是第一次  
    size: 15,      //返回数据的个数  
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏  
    monthColor:[
      ["#19CAAD", "#BEE7E9"], ["#D1BA74", "#E6CEAC"], ["#A0EEE1", "#BEEDC7"], ["#F4606C","#ECAD9E"]
    ],
    isPayFlag:true
  },

  //输入框事件
  bindSearchInput: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  //获取数据  
  getDataList: function (values) {
    let that = this;

    //处理
    let param = {
      searchValue:that.data.searchValue,
      start: that.data.start,
      size:that.data.size,
      userId:wx.getStorageSync('userToken'),
    } 

    if (values) {
      param.month = values
    }

    //调用接口查询
    app.request('/consume/getConsumeInfos', 'POST', param).then((res) => {
      let data = res.data
      if (data){
        let resultList = []
        that.data.isFromSearch ? resultList = data : resultList = that.data.dataList.concat(data);
        resultList.map(formatMonth)
        that.setData({
          dataList:resultList,
          searchLoading: true
        })
        
        //第一页查询如果数据长度小于size，则显示没有数据
        if (resultList.length < that.data.size) {
          that.setData({
            dataList: resultList,
            searchLoadingComplete: true, //把“没有数据”设为true，显示  
            searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
          })
        }

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

  //编辑
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

  //删除
  bindToDel : function(e){
    let that = this
    let id = e.currentTarget.id

    wx.showModal({
      title: '删除确认',
      content: '确认删除吗？',
      success: function (res) {
        if (res.confirm) {
          //调用接口查询
          app.request('/consume/deleteConsumeInfo?id=' + id, 'GET', null).then((res) => {
            console.log("delete consume success")
          }).catch((errMsg) => {
            console.log(errMsg)
          })

          //页面数据删除
          let dataList = that.data.dataList
          for (let index in dataList) {
            if (dataList[index].id == id) {
              dataList.splice(index, 1)
              break
            }
          }

          that.setData({
            dataList: dataList
          })
        }
      }
    })

  },


  //点击搜索按钮，触发事件  
  bindToPay: function (e) {
    let that = this
    let id = e.currentTarget.id

    wx.showModal({
      title: '还款确认',
      content: '确认已还了吗？',
      success: function (res) {
        if (res.confirm) {
          let param = {
            id: id,
            isPay: 1
          }

          //后台数据修改
          app.request('/consume/saveConsumeInfo', 'POST', param).then((res) => {
            console.log("consume update success")
          }).catch((errMsg) => {
            console.log(errMsg)
          })

          //页面数据修改
          let dataList = that.data.dataList
          for (let index in dataList) {
            if (dataList[index].id == id) {
              dataList[index].isPay = 1
              break
            }
          }
          that.setData({
            dataList: dataList
          })
        }
      }
    })
    


  },

  //新增
  bindAdd: function(e){
    wx.navigateTo({
      url: "../edit/edit"
    })
  },

  //页面加载
  onLoad: function (options){
    let that = this
    if (app.globalData.chartToRecord){
      let month = app.globalData.chartMonth
      that.getDataList(month)
      app.globalData.chartToRecord = false
    }else{
      that.getDataList()
    }
    app.globalData.isConsumeInfoChange = false
  },

  onShow: function (options){
    var that = this
    if (app.globalData.isConsumeInfoChange) {
      that.setData({
        start: 0,   //第一次加载，设置1  
        dataList: [],  //清空数据 
        isFromSearch: true,  //第一次加载，设置true  
        searchLoading: true,  //把"上拉加载"的变量设为true，显示  
        searchLoadingComplete: false //把“没有数据”设为false，隐藏  
      })
      that.getDataList()
      app.globalData.isConsumeInfoChange = false
    }

  }

})  

