const shareUtil = require('../../utils/share.js');
const util = require('../../utils/util.js');

Page({
  data: {
    isLoggedIn: false,
    currentIdol: null,
    daysInLove: 0,
    diaryCount: 0,
    showMenu: false,
    anniversaries: [],
    isHovering: false,
    showGuestTip: false  // 游客提示
  },

  dateRefreshTimer: null,

  onLoad() {
    this.initializePage();
    this.scheduleDateRefresh();
  },

  onShow() {
    this.initializePage();
    this.setData({ showMenu: false });
    this.scheduleDateRefresh();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  onHide() {
    this.clearDateRefreshTimer();
  },

  onUnload() {
    this.clearDateRefreshTimer();
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

  // 引导用户登录（而不是强制跳转）
  goToLogin() {
    wx.showModal({
      title: '登录提示',
      content: '登录后可以记录你的追星时光，是否现在登录？',
      confirmText: '立即登录',
      cancelText: '随便看看',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/login/login' });
        }
      }
    });
  },

  // 显示游客提示
  showGuestTipModal() {
    this.setData({ showGuestTip: true });
  },

  hideGuestTip() {
    this.setData({ showGuestTip: false });
  },

  loadData() {
    const app = getApp();
    const isLoggedIn = app.isLoggedIn();
    const currentIdol = app.globalData.currentIdol;
    const diaries = app.globalData.diaries.filter(d => d.idolId === currentIdol?.id);

    this.setData({ isLoggedIn });

    if (isLoggedIn && currentIdol) {
      const daysInLove = this.calculateDaysInLove(currentIdol.entryDate);
      const anniversaries = this.calculateAnniversaries(currentIdol);

      this.setData({
        currentIdol,
        daysInLove,
        diaryCount: diaries.length,
        anniversaries
      });
    } else if (isLoggedIn) {
      this.setData({
        currentIdol: null,
        daysInLove: 0,
        diaryCount: 0,
        anniversaries: []
      });
    }
  },

  calculateDaysInLove(entryDate) {
    const entry = util.parseDate(entryDate);
    const today = new Date();
    const diff = Math.floor((today - entry) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  },

  getDisplayColor(color) {
    if (!color) return '#87CEEB';
    if (color === 'bg-pink-300' || color === 'pink') return '#f9a8d4';
    if (color === 'bg-purple-200' || color === 'lavender') return '#e9d5ff';
    if (color === 'blue') return '#87CEEB';
    if (color.startsWith('#')) return color;
    return '#87CEEB';
  },

  calculateAnniversaries(idol) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const getNextDate = (dateStr) => {
      if (!dateStr) {
        const defaultDate = new Date(today);
        defaultDate.setDate(defaultDate.getDate() + 30);
        return defaultDate;
      }
      const monthDay = dateStr.slice(5);
      let targetDate = util.parseDate(`${currentYear}-${monthDay}`);
      if (today > targetDate) {
        targetDate = new Date(currentYear + 1, targetDate.getMonth(), targetDate.getDate());
      }
      return targetDate;
    };

    const all = [];
    
    if (idol.birthday) {
      const nextBirthday = getNextDate(idol.birthday);
      all.push({ 
        title: `${idol.name}生日`, 
        date: nextBirthday, 
        label: this.formatDate(nextBirthday), 
        color: 'pink',
        displayColor: '#f9a8d4',
        iconText: "生",
        days: this.calculateDaysDiff(nextBirthday, today),
        isCustom: false
      });
    }
    
    if (idol.debutDate) {
      const nextDebut = getNextDate(idol.debutDate);
      all.push({ 
        title: "出道纪念日", 
        date: nextDebut, 
        label: this.formatDate(nextDebut), 
        color: 'lavender',
        displayColor: '#e9d5ff',
        iconText: "出",
        days: this.calculateDaysDiff(nextDebut, today),
        isCustom: false
      });
    }

    const app = getApp();
    const customAnniversaries = app.globalData.anniversaries.filter(a => a.idolId === idol.id);
    for (const item of customAnniversaries) {
      if (!item.date) continue;
      const nextDate = getNextDate(item.date);
      const iconText = (item.iconText || item.title.charAt(0) || '纪');
      const displayColor = this.getDisplayColor(item.color);
      all.push({
        title: item.title,
        date: nextDate,
        label: this.formatDate(nextDate),
        color: item.color,
        displayColor,
        iconText,
        days: this.calculateDaysDiff(nextDate, today),
        isCustom: true
      });
    }

    return all.sort((a, b) => a.date - b.date).slice(0, 4);
  },

  formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  },

  calculateDaysDiff(date1, date2) {
    return Math.ceil((date1 - date2) / (1000 * 60 * 60 * 24));
  },

  scheduleDateRefresh() {
    this.clearDateRefreshTimer();
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const delay = Math.max(1000, nextMidnight.getTime() - now.getTime() + 1000);

    this.dateRefreshTimer = setTimeout(() => {
      this.loadData();
      this.scheduleDateRefresh();
    }, delay);
  },

  clearDateRefreshTimer() {
    if (this.dateRefreshTimer) {
      clearTimeout(this.dateRefreshTimer);
      this.dateRefreshTimer = null;
    }
  },

  onBannerClick() {
    this.setData({ showMenu: true });
  },

  onCloseMenu() {
    this.setData({ showMenu: false });
  },

  onSwitchIdol() {
    this.setData({ showMenu: false });
    wx.navigateTo({ url: '/pages/switch-idol/switch-idol' });
  },

  onChangeBanner() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        that.openCropper(tempFilePath, 'banner', (croppedPath) => {
          that.uploadAndSaveBanner(croppedPath);
        });
      },
      fail(err) {
        console.error('选择壁纸失败:', err);
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  },

  openCropper(filePath, type, onSuccess) {
    wx.navigateTo({
      url: `/pages/image-cropper/image-cropper?type=${type}&src=${encodeURIComponent(filePath)}`,
      events: {
        cropSuccess: (result) => {
          if (result && result.tempFilePath && typeof onSuccess === 'function') {
            onSuccess(result.tempFilePath);
          }
        }
      }
    });
  },

  uploadAndSaveBanner(filePath) {
    const app = getApp();
    wx.showLoading({ title: '上传中...' });
    
    app.uploadFile(filePath).then((uploadRes) => {
      const imageUrl = uploadRes.data.url;
      const updatedIdol = { ...this.data.currentIdol, bannerImage: imageUrl };
      
      return app.saveIdolToServer(updatedIdol).then(() => {
        wx.hideLoading();
        this.setData({ 
          currentIdol: app.globalData.currentIdol,
          showMenu: false 
        });
        wx.showToast({ title: '更新成功', icon: 'success' });
      }).catch((err) => {
        console.error('保存到后端失败:', err);
        wx.hideLoading();
        if (err && err.message && err.message.includes('登录已过期')) {
          return;
        }
        wx.showToast({ title: '保存失败', icon: 'none' });
      });
    }).catch((err) => {
      console.error('上传失败:', err);
      wx.hideLoading();
      wx.showToast({ title: '上传失败', icon: 'none' });
    });
  },

  onAnniversaryClick() {
    wx.navigateTo({ url: '/pages/anniversary/anniversary' });
  },

  onHoverStart() {
    this.setData({ isHovering: true });
  },

  onHoverEnd() {
    this.setData({ isHovering: false });
  },

  onAddFirstIdol() {
    wx.navigateTo({ url: '/pages/switch-idol/switch-idol' });
  },

  // 分享给朋友
  onShareAppMessage(res) {
    const idol = this.data.currentIdol;
    const idolName = idol ? idol.name : '我的爱豆';
    return {
      title: `我在追${idolName}，一起来记录追星的美好时光吧！`,
      path: '/pages/home/home',
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    };
  },

  // 分享到朋友圈
  onShareTimeline(res) {
    const idol = this.data.currentIdol;
    const idolName = idol ? idol.name : '我的爱豆';
    return {
      title: `爱豆时光日记 - 记录追${idolName}的每一刻`,
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    };
  }
})
