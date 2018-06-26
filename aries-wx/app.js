//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  getToken: function () {
    return new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          
          var code = res.code;
          console.log('user code is ' + code);
          //获取缓存数据
          var userToken = wx.getStorageSync('userToken');
          if (!userToken) {
            // 获取用户信息
            var userInfoDTO = new Object;
            userInfoDTO.code = code;
            var system = wx.getSystemInfoSync();
            userInfoDTO.device = system.model;
            userInfoDTO.system = system.system;
            wx.request({
              url: 'https://www.creativefish.tech/aries-web/user/saveUserInfo',
              data: userInfoDTO,
              method: 'POST',
              header: { 'content-type': 'application/json' },
              success: function (res) {//服务器返回数据
                if (res.data.code == 200) {
                  var userToCache = new Object;
                  wx.setStorageSync('userToken', res.data.data.id);
                } else {//返回错误提示信息
                  console.log(res);
                }
                resolve(res);

              },
              error: function (e) {
                console.log(e);
                reject(res);
              }
            })
          } else {
            console.log('缓存加载成功,token:' + userToken);
          }
          
        }
      })
      
    })
  },

  globalData: {
    userInfo: null,
    isCreditCardChange: false,
    isConsumeInfoChange:false,
    chartToRecord:false,
    chartMonth:'',
  },

  request: function (url, method, data) {
    var promise = new Promise((resolve, reject) => {
      //init
      var that = this;
      //var requestURL = 'https://www.creativefish.tech/aries-web' + url;
      var requestURL = 'http://127.0.0.1:8999/aries-base' + url;
      var requestData = data;
      var requestMethod = method;
      /*
      //自动添加签名字段到postData，makeSign(obj)是一个自定义的生成签名字符串的函数
      postData.signature = that.makeSign(postData);
      */
      //网络请求
      wx.request({
        url: requestURL,
        data: requestData,
        method: requestMethod,
        header: { 'content-type': 'application/json' },
        success: function (res) {//服务器返回数据
          console.log("app.js response:");
          console.log(res);
          if (res.data.code == 200) {
            resolve(res.data);
          } else {//返回错误提示信息
            reject(res.data.message);
          }
        },
        error: function (e) {
          reject('哎呀，网路出问题啦！');
        }
      })
    });
    return promise;
  },

})