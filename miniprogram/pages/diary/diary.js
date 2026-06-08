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
      
      // 后端已经按 pinned DESC, createTime DESC 排序，前端不再排序
      const diaries = app.globalData.diaries
        .filter(d => d.idolId == currentIdol?.id)
        .map(d => ({
          ...d,
          moodText: this.getMoodText(d.mood),
          displayDate: this.formatDateTime(d.createTime || d.createdAt),
          gridClass: this.getGridClass(d.images?.length || 0)
        }));
      
      console.log('[Diary List] Loaded diaries:');
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
      
      console.log('[Diary List] 收集到的标签:', allTags);
      
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
    // pinned 是数字 0 或 1，需要明确判断
    const isPinned = diary.pinned === 1 || diary.pinned === true;
    
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
    
    // 切换置顶状态 - pinned 是数字类型
    const isPinned = diary.pinned === 1 || diary.pinned === true;
    const newPinnedState = !isPinned;
    
    // 显示加载提示
    wx.showLoading({ title: '处理中...', mask: true });
    
    // 调用后端接口
    app.request({
      url: `/diaries/${diary.id}/pin`,
      method: 'PUT',
      data: { pinned: newPinnedState ? 1 : 0 }
    }).then(() => {
      // 重新从后端获取数据（包含正确的排序）
      return app.fetchDiariesFromServer();
    }).then(() => {
      // 添加短暂延迟，避免渲染层警告
      return new Promise(resolve => setTimeout(resolve, 100));
    }).then(() => {
      wx.hideLoading();
      
      // 重新加载列表
      this.loadData();
      
      wx.showToast({ 
        title: newPinnedState ? '已置顶' : '已取消置顶', 
        icon: 'success' 
      });
    }).catch((err) => {
      wx.hideLoading();
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
    
    console.log('[Tag Select] tag:', tag, 'selectedTag:', selectedTag);
    console.log('[Tag Select] 事件触发了！');
    
    // 立即显示一个提示，验证事件是否触发
    wx.showToast({ 
      title: `点击了标签: ${tag}`, 
      icon: 'none',
      duration: 1000
    });
    
    // 如果点击的是已选中的标签，则取消筛选
    if (selectedTag === tag) {
      console.log('[Tag Select] 取消筛选');
      this.setData({
        selectedTag: null,
        filteredDiaries: diaries
      });
    } else {
      // 筛选包含该标签的日记
      const filteredDiaries = diaries.filter(d => {
        return d.tags && Array.isArray(d.tags) && d.tags.includes(tag);
      });
      console.log('[Tag Select] 筛选结果:', filteredDiaries.length, '条日记');
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
