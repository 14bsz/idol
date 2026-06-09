Page({
  data: {
    loading: false,
    agreed: false
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

    if (!this.data.agreed) {
      wx.showToast({
        title: '请先阅读并勾选协议',
        icon: 'none',
        duration: 2000
      });
      return;
    }

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
  },

  onToggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    });
  },

  openAgreementDetail(type) {
    wx.navigateTo({
      url: `/pages/agreement-detail/agreement-detail?type=${type}`
    });
  },

  onOpenUserAgreement() {
    this.openAgreementDetail('user');
  },

  onOpenPrivacyPolicy() {
    if (typeof wx.openPrivacyContract === 'function') {
      wx.openPrivacyContract({
        fail: () => {
          this.openAgreementDetail('privacy');
        }
      });
      return;
    }

    this.openAgreementDetail('privacy');
  }
})
