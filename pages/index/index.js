//获取应用实例
const app = getApp()

Page({
    data: {
        //判断小程序的API，回调，参数，组件等是否在当前版本可用。
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        isHide: false,
        websrc:'',
        version: (new Date()).valueOf()
    },
    onShow:function(){
      
    },
    onLoad: function() {
        var that = this;
        // 查看是否授权
        wx.getSetting({
            success: function(res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: function(res) {
                          // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
                          // 根据自己的需求有其他操作再补充
                          //设置标题
                          wx.setNavigationBarTitle({
                            title: "首页"
                          })
                          //获取用户信息
                          console.log(res.userInfo);
                          var userInfo = res.userInfo;
                          // that.setData({
                          //   nickName: res.userInfo.nickName,
                          //   avatarUrl: encodeURIComponent(res.userInfo.avatarUrl)
                          // });
// 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code         
                            wx.login({
                                success: res => {
                                    // 获取到用户的 code 之后：res.code
                                    console.log("用户的code:" + res.code);
                                    //传递给webview网页
                                  var url = 'https://abc.kaoshicat.com/index.htm?version=' + (new Date()).valueOf() + '&code=' + res.code + '&avatarUrl=' + encodeURIComponent(userInfo.avatarUrl) + '&nickName=' + encodeURI(userInfo.nickName);
                                  console.log(url);
                                    that.setData({
                                      websrc: url
                                    });
                                    // 可以传给后台，再经过解析获取用户的 openid
                                    // 或者可以直接使用微信的提供的接口直接获取 openid ，方法如下：
                                    // wx.request({
                                    //     // 自行补上自己的 APPID 和 SECRET
                                    //   url: 'https://api.weixin.qq.com/sns/jscode2session?appid=wxbb92ec4b66f5656d&secret=c159656720b5c8797a0b4b64ed098b6c&js_code=' + res.code + '&grant_type=authorization_code',
                                    //     success: res => {
                                    //         // 获取到用户的 openids
                                    //         console.log("用户的openid:" + res.data.openid);
                                    //     }
                                    // });
                                }
                            });
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

    bindGetUserInfo: function(e) {
        if (e.detail.userInfo) {
            //用户按了允许授权按钮
            var that = this;
            // 获取到用户的信息了，打印到控制台上看下
            console.log("用户的信息如下：");
            console.log(e.detail.userInfo);
            //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
            that.setData({
                isHide: false
            });
        } else {
            //用户按了拒绝按钮
            wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
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
    }
})
