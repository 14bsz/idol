const util = require('../../utils/util.js');
const app = getApp();

const CATEGORIES = ['神图', '小卡', '物料', '语录'];

Page({
  data: {
    category: '神图',
    categories: CATEGORIES,
    imageUrl: '',
    notes: '',
    tags: [],
    tagInput: '',
    showTagInput: false,
    tagSuggestions: ['绝美', '演唱会', '生日', '神颜', '打歌舞台', '机场', '杂志', '签名'],
    isUploading: false,
    navHeight: 0,
    navTop: 0
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
    
    this.setData({
      navTop: navTop,
      navHeight: menuButtonInfo.height,
      statusBarHeight: systemInfo.statusBarHeight,
      totalNavHeight: totalNavHeight,
      menuButtonWidth: menuButtonInfo.width,
      menuButtonRight: (screenWidth - menuButtonInfo.right) * pxToRpx
    });
  },

  goBack() {
    wx.navigateBack();
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ category });
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

  saveCollection() {
    const { category, imageUrl, notes, tags } = this.data;
    
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
      tags: tags.join(',')
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
