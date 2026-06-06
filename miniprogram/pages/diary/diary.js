Page({
  data: {
    isLoggedIn: false,
    diaries: []
  },



  onLoad() {
    this.initializePage();
  },

  onShow() {
    this.initializePage();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
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
    this.setData({ isLoggedIn });
    
    if (isLoggedIn) {
      const currentIdol = app.globalData.currentIdol;
      const diaries = app.globalData.diaries
        .filter(d => d.idolId == currentIdol?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(d => ({
          ...d,
          moodText: this.getMoodText(d.mood),
          displayDate: d.createdAt.replace(/-/g, '.'),
          gridClass: this.getGridClass(d.images?.length || 0)
        }));
      this.setData({ diaries });
    }
  },

  getGridClass(imageCount) {
    if (imageCount === 1) {
      return 'grid-cols-1 media-large';
    } else if (imageCount === 2) {
      return 'grid-cols-2 media-medium';
    } else if (imageCount >= 3) {
      return 'grid-cols-3 media-small';
    }
    return '';
  },

  getMoodText(mood) {
    const map = {
      'heart': '心动',
      'excited': '狂喜',
      'healing': '治愈',
      'missing': '想念',
      'breakdown': '破防'
    };
    return map[mood] || '心动';
  },

  onAddDiary() {
    wx.navigateTo({ url: '/pages/diary-editor/diary-editor' });
  },

  onEntryClick(e) {
    const index = e.currentTarget.dataset.index;
    const diary = this.data.diaries[index];
    wx.navigateTo({ url: '/pages/diary-detail/diary-detail?id=' + diary.id });
  },

  onShare(e) {
    const index = e.currentTarget.dataset.index;
    const app = getApp();
    const diary = this.data.diaries[index];
    app.globalData.sharingEntry = diary;
    wx.navigateTo({ url: '/pages/card-generator/card-generator' });
  },

  onMore(e) {
    const index = e.currentTarget.dataset.index;
    wx.showActionSheet({
      itemList: ['编辑日记', '删除日记'],
      itemColor: '#000000',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.onEdit(index);
        } else if (res.tapIndex === 1) {
          this.onDelete(index);
        }
      }
    });
  },

  onEdit(index) {
    const diary = this.data.diaries[index];
    const app = getApp();
    app.globalData.editingDiary = diary;
    wx.navigateTo({ url: '/pages/diary-editor/diary-editor?mode=edit' });
  },

  onDelete(index) {
    const diary = this.data.diaries[index];
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇日记吗？',
      confirmText: '删除',
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.diaries = app.globalData.diaries.filter(d => d.id != diary.id);
          this.loadData();
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  }
})
