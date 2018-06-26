// pages/statistic/index/index.js
const app = getApp()

const formatMonth = n => {
  n.monthColor = parseInt(n.month.substring(n.month.indexOf("-") + 1))
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
    monthColor: [
      ["#19CAAD", "#BEE7E9"], ["#D1BA74", "#E6CEAC"], ["#A0EEE1", "#BEEDC7"], ["#F4606C", "#ECAD9E"]
    ],
    isPayFlag: true
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
      searchValue: that.data.searchValue,
      start: that.data.start,
      size: that.data.size,
      userId: wx.getStorageSync('userToken'),
    }

    //调用接口查询
    app.request('/consume/getConsumeStats', 'POST', param).then((res) => {
      let data = res.data
      if (data) {
        let resultList = []
        that.data.isFromSearch ? resultList = data : resultList = that.data.dataList.concat(data);
        resultList.map(formatMonth)
        that.setData({
          dataList: resultList,
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

      } else {
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

  //跳转到相应月份的记录
  bindToNavigate: function (e) {
    let month = e.currentTarget.id
    app.globalData.chartToRecord = true
    app.globalData.chartMonth = month
    wx.switchTab({
      url: '../../record/index/index',
      fail: function () {
        console.info("To record index failed")
      }
    })
  },

  //页面加载
  onLoad: function (options) {
    let that = this
    that.getDataList()
  },

  //页面显示
  onShow: function (options) {
    var that = this
    that.getDataList()
  }

})  