Page({
  data: {
    loading: false,
    agreed: false,
    navTop: 0,
    navHeight: 0,
    navLeft: 0
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.setData({
      navTop: menuButtonInfo.top,
      navHeight: menuButtonInfo.height,
      navLeft: (systemInfo.windowWidth - menuButtonInfo.right) + 4 // 往右微调 4px
    });

    const app = getApp();
    if (app.globalData.token) {
      app.restoreSession().then((isLoggedIn) => {
        if (isLoggedIn && app.isLoggedIn()) {
          // 如果已经登录，返回上一页或跳转首页
          const pages = getCurrentPages();
          if (pages.length > 1) {
            wx.navigateBack();
          } else {
            wx.switchTab({ url: '/pages/home/home' });
          }
        }
      });
    }
  },

  onBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/home/home' });
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
        // 登录成功后，返回上一页或跳转首页
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({ url: '/pages/home/home' });
        }
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
