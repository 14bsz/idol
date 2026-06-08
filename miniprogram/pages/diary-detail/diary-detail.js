Page({
  data: {
    diaryId: null,
    diary: null,
    displayDate: '',
    moodText: '',
    moodIcon: '',
    imageGridClass: '',
    imageUrls: []
  },

  getGridClass(images) {
    const imageCount = images ? images.length : 0;
    if (imageCount === 1) {
      return 'cols-1';
    } else if (imageCount === 2) {
      return 'cols-2';
    }
    return 'cols-3';
  },

  getImageUrls(images) {
    const app = getApp();
    if (!images) return [];
    return images.map(img => {
      if (typeof img === 'string') {
        return app.resolveMediaUrl(img);
      }
      return app.resolveMediaUrl(img.url);
    }).filter(url => url);
  },

  onLoad(options) {
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.setData({ 
      diaryId: options.id,
      navPaddingTop: menuButtonInfo.top
    });

    // 从分享链接打开时，确保数据已加载
    const app = getApp();
    app.loadDataFromStorage();

    // 如果有 idolId 参数，先设置 currentIdol
    if (options.idolId && !app.globalData.currentIdol) {
      const idols = app.globalData.idols || [];
      const foundIdol = idols.find(i => String(i.id) === String(options.idolId));
      if (foundIdol) {
        app.globalData.currentIdol = foundIdol;
      }
    }

    this.loadData();
  },

  onShow() {
    if (this.data.diaryId) {
      this.loadData();
    }
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  },

  loadData() {
    const app = getApp();
    const rawDiary = app.globalData.diaries.find(d => d.id == this.data.diaryId);
    
    if (!rawDiary) {
      wx.showToast({ title: '日记不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    app.ensureDiaryMediaPersisted(rawDiary).then((persistedDiary) => {
      const diary = persistedDiary || rawDiary;
      const moodMap = {
        'heart': { text: '心动', icon: '💗' },
        'excited': { text: '狂喜', icon: '🎉' },
        'healing': { text: '治愈', icon: '🌈' },
        'missing': { text: '想念', icon: '💭' },
        'breakdown': { text: '破防', icon: '😭' }
      };
      const mood = moodMap[diary.mood] || moodMap['heart'];
      const imageUrls = this.getImageUrls(diary.images);

      this.setData({
        diary,
        displayDate: this.formatDateTime(diary.createTime || diary.createdAt),
        moodText: mood.text,
        moodIcon: mood.icon,
        imageGridClass: this.getGridClass(diary.images),
        imageUrls
      });
    });
  },

  goBack() {
    // 检查页面栈，如果只有当前页，就返回首页
    const pages = getCurrentPages();
    if (pages.length <= 1) {
      wx.switchTab({ url: '/pages/diary/diary' });
    } else {
      wx.navigateBack();
    }
  },

  previewImage(e) {
    const current = e.currentTarget.dataset.url;
    const urls = e.currentTarget.dataset.urls;
    wx.previewImage({
      current,
      urls
    });
  },

  onShare() {
    const app = getApp();
    app.globalData.sharingEntry = this.data.diary;
    wx.navigateTo({ url: '/pages/card-generator/card-generator' });
  },

  onMore() {
    wx.showActionSheet({
      itemList: ['编辑日记', '删除日记'],
      itemColor: '#000000',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.onEdit();
        } else if (res.tapIndex === 1) {
          this.onDelete();
        }
      }
    });
  },

  onEdit() {
    const app = getApp();
    app.globalData.editingDiary = this.data.diary;
    wx.navigateTo({ url: '/pages/diary-editor/diary-editor?mode=edit' });
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇日记吗？',
      confirmText: '删除',
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.diaries = app.globalData.diaries.filter(d => d.id != this.data.diary.id);
          wx.showToast({ title: '删除成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  }
})
