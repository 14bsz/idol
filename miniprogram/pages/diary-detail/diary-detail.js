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

  async loadImageUrls(images) {
    const app = getApp();
    const urls = this.getImageUrls(images);
    const result = [];
    for (const url of urls) {
      if (url.startsWith('cloud://')) {
        const tempUrl = await app.getCloudTempFileURL(url);
        result.push(tempUrl);
      } else {
        result.push(url);
      }
    }
    return result;
  },

  onLoad(options) {
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.setData({ 
      diaryId: options.id,
      navPaddingTop: menuButtonInfo.top
    });
    this.loadData();
  },

  onShow() {
    if (this.data.diaryId) {
      this.loadData();
    }
  },

  async loadData() {
    const app = getApp();
    const rawDiary = app.globalData.diaries.find(d => d.id == this.data.diaryId);
    
    if (!rawDiary) {
      wx.showToast({ title: '日记不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    const persistedDiary = await app.ensureDiaryMediaPersisted(rawDiary);
    const diary = persistedDiary || rawDiary;
    const moodMap = {
      'heart': { text: '心动', icon: '💗' },
      'excited': { text: '狂喜', icon: '🎉' },
      'healing': { text: '治愈', icon: '🌈' },
      'missing': { text: '想念', icon: '💭' },
      'breakdown': { text: '破防', icon: '😭' }
    };
    const mood = moodMap[diary.mood] || moodMap['heart'];
    const imageUrls = await this.loadImageUrls(diary.images);

    this.setData({
      diary,
      displayDate: diary.createdAt.replace(/-/g, '.'),
      moodText: mood.text,
      moodIcon: mood.icon,
      imageGridClass: this.getGridClass(diary.images),
      imageUrls
    });
  },

  goBack() {
    wx.navigateBack();
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
