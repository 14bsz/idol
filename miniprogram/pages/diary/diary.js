Page({
  data: {
    isLoggedIn: false,
    diaries: [],
    filteredDiaries: [],
    allTags: [],
    selectedTag: null
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
      
      console.log('[Diary List] Before sort, total diaries:', app.globalData.diaries.length);
      app.globalData.diaries.forEach((d, i) => {
        console.log(`[Diary ${i}] id=${d.id}, createTime=${d.createTime}, createdAt=${d.createdAt}, pinned=${d.pinned}`);
      });
      
      const diaries = app.globalData.diaries
        .filter(d => d.idolId == currentIdol?.id)
        .sort((a, b) => {
          // 置顶日记优先
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          
          // 都置顶或都不置顶时，按创建时间倒序（新的在前）
          // 优先使用 createTime（包含完整时间），如果没有则使用 createdAt
          const timeA = new Date(a.createTime || a.createdAt).getTime();
          const timeB = new Date(b.createTime || b.createdAt).getTime();
          const result = timeB - timeA;
          
          if (Math.abs(timeB - timeA) > 1000) { // 只记录时间差大于1秒的
            console.log(`[Sort] Compare id=${a.id}(${timeA}) vs id=${b.id}(${timeB}), result=${result}`);
          }
          
          return result;
        })
        .map(d => ({
          ...d,
          moodText: this.getMoodText(d.mood),
          displayDate: (d.createdAt || d.createTime).replace(/-/g, '.').substring(0, 10).replace(/-/g, '.'),
          gridClass: this.getGridClass(d.images?.length || 0)
        }));
      
      console.log('[Diary List] After sort:');
      diaries.forEach((d, i) => {
        console.log(`[Position ${i}] id=${d.id}, createTime=${d.createTime}, pinned=${d.pinned}`);
      });
      
      // 收集所有标签
      const tagSet = new Set();
      diaries.forEach(d => {
        if (d.tags && Array.isArray(d.tags)) {
          d.tags.forEach(tag => tagSet.add(tag));
        }
      });
      const allTags = Array.from(tagSet);
      
      // 重新加载数据时清除筛选状态，显示所有日记
      this.setData({ 
        diaries,
        filteredDiaries: diaries,
        allTags,
        selectedTag: null
      });
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
    const diary = this.data.filteredDiaries[index];
    wx.navigateTo({ url: '/pages/diary-detail/diary-detail?id=' + diary.id });
  },

  onShare(e) {
    const index = e.currentTarget.dataset.index;
    const app = getApp();
    const diary = this.data.filteredDiaries[index];
    app.globalData.sharingEntry = diary;
    wx.navigateTo({ url: '/pages/card-generator/card-generator' });
  },

  onMore(e) {
    const index = e.currentTarget.dataset.index;
    const diary = this.data.filteredDiaries[index];
    const isPinned = diary.pinned || false;
    
    wx.showActionSheet({
      itemList: [
        isPinned ? '取消置顶' : '置顶日记',
        '编辑日记', 
        '删除日记'
      ],
      itemColor: '#000000',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.onTogglePin(index);
        } else if (res.tapIndex === 1) {
          this.onEdit(index);
        } else if (res.tapIndex === 2) {
          this.onDelete(index);
        }
      }
    });
  },

  onTogglePin(index) {
    const diary = this.data.filteredDiaries[index];
    const app = getApp();
    
    // 切换置顶状态
    const newPinnedState = !diary.pinned;
    
    // 调用后端接口
    app.request({
      url: `/diaries/${diary.id}/pin`,
      method: 'PUT',
      data: { pinned: newPinnedState ? 1 : 0 }
    }).then(() => {
      // 更新本地数据
      const globalDiary = app.globalData.diaries.find(d => d.id == diary.id);
      if (globalDiary) {
        globalDiary.pinned = newPinnedState;
      }
      
      // 重新加载列表
      this.loadData();
      
      wx.showToast({ 
        title: newPinnedState ? '已置顶' : '已取消置顶', 
        icon: 'success' 
      });
    }).catch((err) => {
      console.error('置顶操作失败:', err);
      wx.showToast({ title: '操作失败', icon: 'error' });
    });
  },

  onEdit(index) {
    const diary = this.data.filteredDiaries[index];
    const app = getApp();
    app.globalData.editingDiary = diary;
    wx.navigateTo({ url: '/pages/diary-editor/diary-editor?mode=edit' });
  },

  onDelete(index) {
    const diary = this.data.filteredDiaries[index];
    
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
  },

  onTagSelect(e) {
    const tag = e.currentTarget.dataset.tag;
    const { selectedTag, diaries } = this.data;
    
    // 如果点击的是已选中的标签，则取消筛选
    if (selectedTag === tag) {
      this.setData({
        selectedTag: null,
        filteredDiaries: diaries
      });
    } else {
      // 筛选包含该标签的日记
      const filteredDiaries = diaries.filter(d => {
        return d.tags && Array.isArray(d.tags) && d.tags.includes(tag);
      });
      this.setData({
        selectedTag: tag,
        filteredDiaries
      });
    }
  },

  clearTagFilter() {
    this.setData({
      selectedTag: null,
      filteredDiaries: this.data.diaries
    });
  }
})
