Page({
  data: {
    isLoggedIn: false,
    collections: [],
    filteredCollections: [],
    selectedCategory: '全部',
    categories: ['全部', '神图', '小卡', '物料', '语录', '线下'],
    showDetail: false,
    currentDetail: {},
    isManageMode: false,      // 是否处于管理模式
    selectedIds: [],          // 已选中的收藏ID列表
    isAllSelected: false      // 是否全选
  },

  onLoad() {
    this.initializePage();
  },

  onShow() {
    this.initializePage();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
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

  // 引导登录（而不是强制跳转）
  goToLogin() {
    wx.showModal({
      title: '登录提示',
      content: '登录后可以收藏爱豆的精彩照片，是否现在登录？',
      confirmText: '立即登录',
      cancelText: '我再看看',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/login/login' });
        }
      }
    });
  },

  // 需要登录时的提示
  requireLogin(action = '此操作') {
    wx.showModal({
      title: '需要登录',
      content: `${action}需要登录，是否前往登录？`,
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/login/login' });
        }
      }
    });
  },

  loadData() {
    const app = getApp();
    const isLoggedIn = app.isLoggedIn();
    this.setData({ isLoggedIn });
    
    if (isLoggedIn) {
      const currentIdol = app.globalData.currentIdol;
      const categories = this.buildCategoryTabs(currentIdol && currentIdol.id);
      const collections = app.globalData.collections
        .filter(c => c.idolId === currentIdol?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      this.setData({ collections, categories });
      this.ensureSelectedCategoryValid(categories);
      this.updateFilteredCollections();
      this.loadCategoriesFromServer(currentIdol && currentIdol.id);
    }
  },

  buildCategoryTabs(idolId) {
    const app = getApp();
    if (!idolId) {
      return ['全部', '神图', '小卡', '物料', '语录', '线下'];
    }
    const categories = app.getCollectionCategoriesForIdol(idolId);
    return ['全部', ...categories];
  },

  ensureSelectedCategoryValid(categories = this.data.categories) {
    if (!categories.includes(this.data.selectedCategory)) {
      this.setData({ selectedCategory: '全部' });
    }
  },

  loadCategoriesFromServer(idolId) {
    if (!idolId) {
      return;
    }

    const app = getApp();
    app.fetchCollectionCategories(idolId).then((categories) => {
      const nextCategories = ['全部', ...categories];
      this.setData({ categories: nextCategories });
      this.ensureSelectedCategoryValid(nextCategories);
      this.updateFilteredCollections();
    }).catch((error) => {
      console.warn('获取收藏分类失败，已使用本地分类回退', error);
    });
  },

  updateFilteredCollections() {
    const { selectedCategory, collections } = this.data;
    let filtered;
    if (selectedCategory === '全部') {
      filtered = collections;
    } else {
      filtered = collections.filter(c => c.category === selectedCategory);
    }
    this.setData({ filteredCollections: filtered });
  },

  onCategorySelect(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ selectedCategory: category });
    this.updateFilteredCollections();
  },

  onAddCollection() {
    const app = getApp();
    if (!app.isLoggedIn()) {
      this.requireLogin('添加收藏');
      return;
    }
    wx.navigateTo({ 
      url: '/pages/collection-add/collection-add',
      events: {
        collectionUpdated: () => {
          this.loadData();
        }
      }
    });
  },

  onItemClick(e) {
    // 管理模式下不打开详情
    if (this.data.isManageMode) {
      return;
    }
    
    const item = e.currentTarget.dataset.item;
    // 解析 tags 字符串为数组
    let tagList = [];
    if (item.tags) {
      tagList = item.tags.split(',').filter(t => t.trim());
    }
    this.setData({
      showDetail: true,
      currentDetail: { ...item, tagList }
    });
  },

  closeDetail() {
    this.setData({
      showDetail: false,
      currentDetail: {}
    });
  },

  // ========== 管理模式相关方法 ==========
  
  // 进入管理模式
  enterManageMode() {
    this.setData({
      isManageMode: true,
      selectedIds: [],
      isAllSelected: false
    });
  },

  // 退出管理模式
  exitManageMode() {
    this.setData({
      isManageMode: false,
      selectedIds: [],
      isAllSelected: false
    });
  },

  // 切换单个收藏的选中状态
  onToggleSelect(e) {
    const id = e.currentTarget.dataset.id;
    let selectedIds = [...this.data.selectedIds];
    
    const index = selectedIds.indexOf(id);
    if (index > -1) {
      // 已选中,取消选中
      selectedIds.splice(index, 1);
    } else {
      // 未选中,添加选中
      selectedIds.push(id);
    }
    
    // 更新全选状态
    const isAllSelected = selectedIds.length === this.data.filteredCollections.length && this.data.filteredCollections.length > 0;
    
    this.setData({
      selectedIds,
      isAllSelected
    });
  },

  // 全选/取消全选
  onToggleSelectAll() {
    const isCurrentlyAllSelected = this.data.isAllSelected;
    
    console.log('[全选] 当前状态:', isCurrentlyAllSelected);
    console.log('[全选] 当前选中ID:', this.data.selectedIds);
    console.log('[全选] 总数:', this.data.filteredCollections.length);
    
    if (isCurrentlyAllSelected) {
      // 当前是全选状态,切换为取消全选
      console.log('[全选] 执行取消全选');
      this.setData({
        selectedIds: [],
        isAllSelected: false
      }, () => {
        console.log('[全选] 取消全选完成, selectedIds:', this.data.selectedIds);
      });
    } else {
      // 当前未全选,切换为全选
      const allIds = this.data.filteredCollections.map(item => item.id);
      console.log('[全选] 执行全选, allIds:', allIds);
      this.setData({
        selectedIds: allIds,
        isAllSelected: true
      }, () => {
        console.log('[全选] 全选完成, selectedIds:', this.data.selectedIds);
      });
    }
  },

  // 兼容checkbox-group的change事件(已弃用,改用onToggleSelectAll)
  onSelectAllChange(e) {
    const values = e.detail.value;
    const isSelectAll = values.includes('all');
    
    if (isSelectAll) {
      // 全选
      const allIds = this.data.filteredCollections.map(item => item.id);
      this.setData({
        selectedIds: allIds,
        isAllSelected: true
      });
    } else {
      // 取消全选
      this.setData({
        selectedIds: [],
        isAllSelected: false
      });
    }
  },

  // 批量删除
  onBatchDelete() {
    const selectedCount = this.data.selectedIds.length;
    
    if (selectedCount === 0) {
      wx.showToast({ title: '请先选择要删除的收藏', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedCount} 个收藏吗？`,
      confirmText: '删除',
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          this.performBatchDelete();
        }
      }
    });
  },

  // 执行批量删除
  performBatchDelete() {
    const app = getApp();
    const selectedIds = [...this.data.selectedIds];
    
    wx.showLoading({ title: `删除中 (0/${selectedIds.length})`, mask: true });
    
    // 串行删除每个收藏
    let deletedCount = 0;
    const deletePromises = selectedIds.map((id, index) => {
      return app.request({
        url: `/collections/${id}`,
        method: 'DELETE'
      }).then(() => {
        deletedCount++;
        wx.showLoading({ 
          title: `删除中 (${deletedCount}/${selectedIds.length})`, 
          mask: true 
        });
      }).catch((err) => {
        console.error(`删除收藏 ${id} 失败:`, err);
        // 继续删除其他项,不中断
      });
    });
    
    // 等待所有删除完成
    Promise.all(deletePromises).then(() => {
      // 重新从后端获取收藏列表
      return app.fetchCollectionsFromServer();
    }).then(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    }).then(() => {
      wx.hideLoading();
      
      // 退出管理模式
      this.setData({
        isManageMode: false,
        selectedIds: [],
        isAllSelected: false
      });
      
      // 重新加载列表
      this.loadData();
      
      wx.showToast({ 
        title: `成功删除 ${deletedCount} 个收藏`, 
        icon: 'success',
        duration: 2000
      });
    }).catch((err) => {
      wx.hideLoading();
      console.error('批量删除失败:', err);
      wx.showToast({ title: '部分删除失败', icon: 'error' });
      
      // 即使失败也刷新列表
      this.loadData();
    });
  },

  onDeleteCollection(e) {
    const collection = this.data.currentDetail;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个收藏吗？',
      confirmText: '删除',
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          
          // 显示加载提示
          wx.showLoading({ title: '删除中...', mask: true });
          
          // 调用后端删除接口
          app.request({
            url: `/collections/${collection.id}`,
            method: 'DELETE'
          }).then(() => {
            // 重新从后端获取收藏列表
            return app.fetchCollectionsFromServer();
          }).then(() => {
            // 添加短暂延迟,避免渲染层警告
            return new Promise(resolve => setTimeout(resolve, 100));
          }).then(() => {
            wx.hideLoading();
            
            // 关闭详情弹窗
            this.closeDetail();
            
            // 重新加载列表
            this.loadData();
            
            wx.showToast({ title: '删除成功', icon: 'success' });
          }).catch((err) => {
            wx.hideLoading();
            console.error('删除收藏失败:', err);
            wx.showToast({ title: '删除失败', icon: 'error' });
          });
        }
      }
    });
  },

  getFilteredCollections() {
    const { selectedCategory, collections } = this.data;
    if (selectedCategory === '全部') return collections;
    return collections.filter(c => c.category === selectedCategory);
  },

  // 分享给朋友
  onShareAppMessage(res) {
    const app = getApp();
    const idol = app.globalData.currentIdol;
    const idolName = idol ? idol.name : '我的爱豆';
    return {
      title: `我的${idolName}收藏，记录珍贵瞬间`,
      path: '/pages/collection/collection',
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    };
  },

  // 分享到朋友圈
  onShareTimeline(res) {
    const app = getApp();
    const idol = app.globalData.currentIdol;
    const idolName = idol ? idol.name : '我的爱豆';
    return {
      title: `${idolName}的珍藏 - 爱豆时光日记`,
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    };
  }
})
