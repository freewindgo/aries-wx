Page({
  data: {
    inputPassword: false,
    isLoading: false,
    password: '',
    username: ''
  },
  username(){
    this.setData({
      inputPassword: false
    })
  },
  pwdFocus() {
    this.setData({
      inputPassword: true
    })
  },
  formSubmit: function (e) {
    this.setData({
      isLoading: true
    })
    console.log(e.detail.value)
    //获得表单数据
    var objData = e.detail.value;
    if (objData.username && objData.password) {
      wx.request({
        url: 'https://guohe3.com/api/studentInfo',
        method	:'POST',
        data: {
          username: objData.username ,
          password: objData.password
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
        
          
          var toastr = require('../../utils/toastr-wxapp.js');
          toastr.ok({
            title: '登录成功',
            duration: 1000,
          });
          if(res.data.code==200){
    
            var result=res.data.info
            result.password= objData.password//?
            console.log(result)
            wx.setStorage({
              key: "account",
              data: result
            })
            wx.reLaunch({
              url: '/pages/index/index',
            })
           
          }else{

             //登录失败
            toastr.error({
              title: '用户名或密码错误',
              duration: 1000,
            });
            
             
             
          }
        }
      })
    } else {
      var toastr = require('../../utils/toastr-wxapp.js');
      toastr.error({
        title: '不能为空',
        duration: 1000,
      });
    }
    setTimeout(() => {
      this.setData({
        isLoading: false
      })
    }, 1000)

  },
  onLoad(){
    //登录前清除缓存
    wx.clearStorageSync()
    console.log('清除缓存')
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#4A699F',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
  }

})
