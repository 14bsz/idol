Page({
  data: {
    isLoggedIn: false,
    collections: [],
    filteredCollections: [],
    selectedCategory: '全部',
    categories: ['全部', '神图', '小卡', '物料', '语录'],
    showDetail: false,
    currentDetail: {}
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

  goToLogin() {
    wx.reLaunch({ url: '/pages/login/login' });
  },

  loadData() {
    const app = getApp();
    const isLoggedIn = app.isLoggedIn();
    this.setData({ isLoggedIn });
    
    if (isLoggedIn) {
      const currentIdol = app.globalData.currentIdol;
      const collections = app.globalData.collections
        .filter(c => c.idolId === currentIdol?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      this.setData({ collections });
      this.updateFilteredCollections();
    }
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
