Page({
  data: {
    loading: false
  },

  onLoad() {
    const app = getApp();
    if (app.globalData.token) {
      app.restoreSession().then((isLoggedIn) => {
        if (isLoggedIn && app.isLoggedIn()) {
          wx.switchTab({ url: '/pages/home/home' });
        }
      });
    }
  },

  onWechatLogin() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    const app = getApp();
    app.wechatLogin().then(() => {
      this.setData({ loading: false });
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' });
      }, 1500);
    }).catch((err) => {
      this.setData({ loading: false });
      wx.showModal({
        title: '登录失败',
        content: err.message || '请稍后重试',
        showCancel: false
      });
    });
  }
})
