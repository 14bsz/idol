const util = require('../../utils/util.js');
const app = getApp();

const CATEGORIES = ['神图', '小卡', '物料', '语录', '线下'];

Page({
  data: {
    category: '神图',
    categories: CATEGORIES,
    imageUrl: '',
    notes: '',
    tags: [],
    tagInput: '',
    showTagInput: false,
    tagSuggestions: ['绝美', '演唱会', '生日', '神颜', '打歌舞台', '机场', '杂志', '签名', '见面会', 'LiveHouse', '音乐节'],
    isUploading: false,
    navHeight: 0,
    navTop: 0,
    eventDate: '',  // 活动日期
    showDatePicker: false,
    maxDate: ''  // 最大日期（今天）
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    
    // 计算导航栏高度
    const navTop = menuButtonInfo.top;
    const navHeight = menuButtonInfo.height + (menuButtonInfo.top - systemInfo.statusBarHeight) * 2;
    const totalNavHeight = systemInfo.statusBarHeight + navHeight;
    
    // 获取屏幕宽度用于计算
    const screenWidth = systemInfo.screenWidth;
    const pxToRpx = 750 / screenWidth;
    
    // 计算今天的日期作为最大可选日期
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    
    this.setData({
      navTop: navTop,
      navHeight: menuButtonInfo.height,
      statusBarHeight: systemInfo.statusBarHeight,
      totalNavHeight: totalNavHeight,
      menuButtonWidth: menuButtonInfo.width,
      menuButtonRight: (screenWidth - menuButtonInfo.right) * pxToRpx,
      maxDate: maxDate  // 设置最大日期
    });

    this.loadCategories();
  },

  goBack() {
    wx.navigateBack();
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ category });
  },

  loadCategories() {
    const currentIdol = app.globalData.currentIdol;
    if (!currentIdol || !currentIdol.id) {
      this.setData({ categories: CATEGORIES });
      return;
    }

    const fallbackCategories = app.getCollectionCategoriesForIdol(currentIdol.id);
    this.setData({ categories: fallbackCategories });

    app.fetchCollectionCategories(currentIdol.id).then((categories) => {
      this.setData({ categories });
      if (!categories.includes(this.data.category)) {
        this.setData({ category: categories[0] || CATEGORIES[0] });
      }
    }).catch((error) => {
      console.warn('获取收藏分类失败，已使用本地分类回退', error);
    });
  },

  addCustomCategory() {
    const currentIdol = app.globalData.currentIdol;
    if (!currentIdol || !currentIdol.id) {
      util.showToast('请先选择爱豆');
      return;
    }

    wx.showModal({
      title: '新增分类',
      editable: true,
      placeholderText: '例如：舞台饭拍',
      success: (res) => {
        if (!res.confirm) {
          return;
        }

        const categoryName = (res.content || '').trim();
        if (!categoryName) {
          util.showToast('分类名称不能为空');
          return;
        }

        app.createCollectionCategory(currentIdol.id, categoryName).then((categories) => {
          this.setData({
            categories,
            category: categoryName
          });
          util.showToast('分类已添加', 'success');
        }).catch((error) => {
          util.showToast(error.message || '新增分类失败');
        });
      }
    });
  },

  onUrlInput(e) {
    this.setData({ imageUrl: e.detail.value });
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  showTagInputBox() {
    this.setData({ showTagInput: true, tagInput: '' });
  },

  hideTagInputBox() {
    this.setData({ showTagInput: false, tagInput: '' });
  },

  onTagInput(e) {
    this.setData({ tagInput: e.detail.value });
  },

  addTag() {
    const { tagInput, tags } = this.data;
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag) {
      this.hideTagInputBox();
      return;
    }
    
    if (tags.includes(trimmedTag)) {
      util.showToast('该标签已存在哦');
      return;
    }
    
    if (tags.length >= 5) {
      util.showToast('最多添加5个标签');
      return;
    }
    
    this.setData({
      tags: [...tags, trimmedTag],
      showTagInput: false,
      tagInput: ''
    });
  },

  removeTag(e) {
    const index = e.currentTarget.dataset.index;
    const newTags = this.data.tags.filter((_, i) => i !== index);
    this.setData({ tags: newTags });
  },

  selectSuggestion(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({ tagInput: tag });
  },

  uploadImage() {
    const that = this;
    this.setData({ isUploading: true });
    
    const randomImages = [
      'https://picsum.photos/400/400?random=8',
      'https://picsum.photos/400/400?random=9',
      'https://picsum.photos/400/400?random=10',
      'https://picsum.photos/400/400?random=11',
      'https://picsum.photos/400/400?random=12'
    ];
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        that.setData({
          imageUrl: res.tempFilePaths[0],
          isUploading: false
        });
      },
      fail: () => {
        const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
        that.setData({
          imageUrl: randomImage,
          isUploading: false
        });
      }
    });
  },

  clearImage() {
    this.setData({ imageUrl: '' });
  },

  // 选择活动日期
  onDateChange(e) {
    this.setData({ 
      eventDate: e.detail.value,
      showDatePicker: false 
    });
  },

  // 清除活动日期
  clearEventDate() {
    this.setData({ eventDate: '' });
  },

  saveCollection() {
    const { category, imageUrl, notes, tags, eventDate } = this.data;
    
    if (!imageUrl) {
      util.showToast('请先上传或粘贴图片链接哦');
      return;
    }

    util.showLoading('正在珍藏中...');
    const currentIdol = app.globalData.currentIdol;
    const newItem = {
      idolId: currentIdol.id,
      imageUrl: imageUrl,
      category: category,
      notes: notes,
      tags: tags.join(','),
      eventDate: eventDate || null  // 活动日期（可选）
    };

    app.saveCollectionToServer(newItem).then(() => {
      util.hideLoading();
      util.showToast('珍藏成功', 'success');
      
      // 发送全局事件通知收藏夹更新
      const eventChannel = this.getOpenerEventChannel();
      if (eventChannel && eventChannel.emit) {
        eventChannel.emit('collectionUpdated');
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    }).catch((err) => {
      util.hideLoading();
      console.error('保存到后端失败:', err);
      util.showToast(err.message || '珍藏失败', 'error');
    });
  },

  goBack() {
    wx.navigateBack();
  }
})
