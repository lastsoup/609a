//获取应用实例
const app = getApp()

Page({
    data: {
        //判断小程序的API，回调，参数，组件等是否在当前版本可用。
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        isHide: false,
        isLocation:true,
        websrc:''
    },
    onLoad: function() {
        var that = this;
        that.loadLoaction1();
        that.loadLogOn();
    },
    bindGetUserInfo: function(e) {
        if (e.detail.userInfo) {
            //用户按了允许授权按钮
            var that = this;
            that.loadWebView(e.detail.userInfo);
        } else {
            //用户按了拒绝按钮
            wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!',
                showCancel: false,
                confirmText: '返回授权',
                success: function(res) {
                    // 用户没有授权成功，不需要改变 isHide 的值
                    if (res.confirm) {
                        console.log('用户点击了“返回授权”');
                    }
                }
            });
        }
    },
  getLocation: function (){
     var that = this;
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          //弹框
          console.log("x:" + longitude + ",y:" + latitude);
          that.setData({
            location: {x:longitude,y:latitude}
          })
          // wx.showModal({
          //   title: '当前位置',
          //   content: "纬度:" + latitude + ",经度:" + longitude,
          // });
        }
      })
    },
    loadLoaction1: function (){
      var that = this;
      wx.getSetting({
        success: function (res) {
          var statu = res.authSetting;
          //没有授权调用授权窗口
          if (!statu['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success: (res) => {
                console.log('成功：', res);
                //直接实时定位
                if(that.data.isLocation){
                  that.getLocation();
                }
                else{
                  //再调用chooseLocation选择地方
                  wx.chooseLocation({
                    success: function (res) {
                      console.log(res);
                      wx.setStorageSync("addr", res.address);
                      wx.setStorageSync("location", { x: res.longitude,y:res.latitude});
                    }
                  })
                }
              },
              fail: (res) => {
                console.log('失败：', res);
              }
            })
          }else{
            //授权成功
            if (that.data.isLocation){
              that.getLocation();
            } else if (!wx.getStorageSync("addr")){
              wx.chooseLocation({
                success: function (res) {
                  console.log(res);
                  wx.setStorageSync("addr", res.address);
                  wx.setStorageSync("location", { x: res.longitude, y: res.latitude });
                }
              })
            }
          }
        },
        fail: function (res) {
          wx.showToast({
            title: '调用授权窗口失败',
            icon: 'success',
            duration: 1000
          })
        }
      })
    },
    loadLoaction:function(){
      wx.chooseLocation({
        success(res) {
          console.log("1:"+res)
          that.setData({
            // hasLocation: true,
            location: formatLocation(res.longitude, res.latitude),
            address: res.address
          })
        },
        fail: function () {
          wx.getSetting({
            success: function (res) {
              var statu = res.authSetting;
              console.log("2:" + statu)
              if (!statu['scope.userLocation']) {
                wx.showModal({
                  title: '是否授权当前位置',
                  content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                  success: function (tip) {
                    if (tip.confirm) {
                      wx.openSetting({
                        success: function (data) {
                          if (data.authSetting["scope.userLocation"] === true) {
                            wx.showToast({
                              title: '授权成功',
                              icon: 'success',
                              duration: 1000
                            })
                            //授权成功之后，再调用chooseLocation选择地方
                            wx.chooseLocation({
                              success: function (res) {
                                obj.setData({
                                  addr: res.address
                                })
                              },
                            })
                          } else {
                            wx.showToast({
                              title: '授权失败',
                              icon: 'success',
                              duration: 1000
                            })
                          }
                        }
                      })
                    }
                  }
                })
              }
            },
            fail: function (res) {
              wx.showToast({
                title: '调用授权窗口失败',
                icon: 'success',
                duration: 1000
              })
            }
          })
        }
      })
    },
    loadLogOn:function(){
      var that = this;
      // 查看是否授权登录
      wx.getSetting({
        success: function (res) {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: function (res) {
                // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
                that.loadWebView(res.userInfo);
              }
            });
          } else {
            // 用户没有授权
            // 改变 isHide 的值，显示授权页面
            that.setData({
              isHide: true
            });
          }
        }
      });
    },
    loadWebView: function (userInfo){
      var that = this;
       //设置标题
       wx.setNavigationBarTitle({
        title: "首页"
       })
       // 获取到用户的信息了，打印到控制台上看下
       console.log(userInfo);
       // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code  
      wx.login({
        success: res => {
          // 获取到用户的 code 之后：res.code
          console.log(that.data.location);
          var addr = encodeURI(wx.getStorageSync("addr"));
          var city = encodeURI(userInfo.city);
          var avatarUrl = encodeURIComponent(userInfo.avatarUrl);
          var nickName = encodeURI(userInfo.nickName);
          if (that.data.isLocation) {
            var location = that.data.location;
          }else{
            var location = wx.getStorageSync("location");
          }
          var x = location.x;
          var y = location.y; 
          //传递给webview网页
          var url = 'https://cqy.kaoshicat.com/index.htm?version=' + (new Date()).valueOf() + '&code=' + res.code + '&avatarUrl=' + avatarUrl + '&nickName=' + nickName +'&city='+city+'&addr='+addr+"&x="+x+"&y="+y;
          console.log(url);
          that.setData({
            websrc: url
          });
        }
      });
       //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
       that.setData({
         isHide: false
       });
    }
})
