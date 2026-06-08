Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    resolvedAvatarUrl: '',
    showWechatAvatarBtn: false,
    menuItems: [
      {
        icon: '📊',
        title: '追星月报',
        desc: '本月的心动指数分析',
        color: 'bg-blue-50 text-blue-500',
        bgColor: '#eff6ff',
        iconColor: '#3b82f6'
      },
      {
        icon: '📜',
        title: '时光轴',
        desc: '回看一路走来的心路历程',
        color: 'bg-purple-50 text-purple-500',
        bgColor: '#faf5ff',
        iconColor: '#a855f7'
      },
      {
        icon: '📅',
        title: '日程提醒',
        desc: '不再错过任何重要的日子',
        color: 'bg-pink-50 text-pink-500',
        bgColor: '#fdf2f8',
        iconColor: '#ec4899'
      }
    ]
  },

  onLoad() {
    this.initializePage();
  },

  onShow() {
    this.initializePage();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  initializePage() {
    const app = getApp();
    app.restoreSession().finally(() => {
      this.checkLogin();
      this.loadData();
    });
  },

  checkLogin() {
    const app = getApp();
    const isLoggedIn = app.isLoggedIn();
    this.setData({ isLoggedIn });
  },

  goToLogin() {
    wx.reLaunch({ url: '/pages/login/login' });
  },

  loadData() {
    const app = getApp();
    const isLoggedIn = app.isLoggedIn();
    const userInfo = app.globalData.userInfo;
    this.setData({ 
      isLoggedIn,
      userInfo,
      resolvedAvatarUrl: app.resolveMediaUrl(userInfo?.avatarUrl)
    });
  },

  onMenuItemClick(e) {
    const index = e.currentTarget.dataset.index;
    if (index === 0) {
      wx.navigateTo({ url: '/pages/report/report' });
    } else if (index === 1) {
      wx.navigateTo({ url: '/pages/timeline/timeline' });
    } else if (index === 2) {
      wx.navigateTo({ url: '/pages/anniversary/anniversary' });
    }
  },

  chooseAvatar() {
    const that = this;
    wx.showActionSheet({
      itemList: ['使用微信头像', '从相册选择'],
      success(res) {
        if (res.tapIndex === 0) {
          // 触发 wxml 中 open-type="chooseAvatar" 的 button
          that.setData({ showWechatAvatarBtn: true });
        } else if (res.tapIndex === 1) {
          that.chooseAlbumAvatar();
        }
      }
    });
  },

  // open-type="chooseAvatar" 回调
  onChooseWechatAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    this.setData({ showWechatAvatarBtn: false });
    this.uploadAndUpdateAvatar(avatarUrl);
  },

  chooseAlbumAvatar() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        that.uploadAndUpdateAvatar(tempFilePath);
      },
      fail(err) {
        console.error('选择图片失败', err);
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  },

  uploadAndUpdateAvatar(filePath) {
    const that = this;
    
    wx.showLoading({ title: '上传中...' });
    that.updateUserInfo({ avatarUrl: filePath });
  },

  editNickname() {
    const that = this;
    const currentNickname = this.data.userInfo?.nickname || '';
    
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      content: currentNickname,
      confirmText: '保存',
      confirmColor: '#ec4899',
      success(res) {
        if (res.confirm && res.content.trim()) {
          that.updateUserInfo({ nickname: res.content.trim() });
        }
      }
    });
  },

  updateUserInfo(updateData) {
    const app = getApp();
    const that = this;
    
    wx.showLoading({ title: '保存中...' });
    
    app.updateUserInfo(updateData)
      .then(() => {
        wx.hideLoading();
        that.loadData();
        wx.showToast({ title: '保存成功', icon: 'success' });
      })
      .catch(err => {
        wx.hideLoading();
        console.error('更新用户信息失败', err);
        wx.showToast({ title: '保存失败', icon: 'none' });
      });
  },

  onLogout() {
    const app = getApp();
    app.logout();
  }
})
