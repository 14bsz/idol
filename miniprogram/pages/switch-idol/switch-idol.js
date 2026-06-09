const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    idols: [],
    currentIdolId: '',
    showAddForm: false,
    editingIdol: null,
    isManageMode: false,
    showDeleteModal: false,
    deletingIdolId: null,
    deletingIdolName: '',
    newName: '',
    newNickname: '',
    newAvatar: '',
    newAvatarRaw: '',
    newBannerImage: '',
    newBannerImageRaw: '',
    newEntryDate: '',
    newBirthday: '1997-09-01',
    newDebutDate: '2013-06-13',
    newSupportColor: '#FFC0CB',
    selectedColorName: '少女粉',
    showColorModal: false,
    colorCategories: [
      {
        category: '粉色系',
        colors: [
          { name: '樱花粉', value: '#FFB7DD' },
          { name: '蜜桃粉', value: '#FFAEC9' },
          { name: '少女粉', value: '#FFC0CB' },
          { name: '玫瑰粉', value: '#FF69B4' },
          { name: '芭比粉', value: '#FF1493' },
          { name: '热情粉', value: '#FF007F' }
        ]
      },
      {
        category: '紫色系',
        colors: [
          { name: '薰衣草紫', value: '#E6E6FA' },
          { name: '紫罗兰', value: '#EE82EE' },
          { name: '深紫', value: '#9400D3' },
          { name: '浅紫', value: '#DDA0DD' },
          { name: '丁香紫', value: '#B19CD9' },
          { name: '皇家紫', value: '#7851A9' }
        ]
      },
      {
        category: '蓝色系',
        colors: [
          { name: '天蓝色', value: '#87CEEB' },
          { name: '深海蓝', value: '#006994' },
          { name: '婴儿蓝', value: '#89CFF0' },
          { name: '宝石蓝', value: '#191970' },
          { name: '湖蓝色', value: '#4AA0D8' },
          { name: '蔚蓝色', value: '#4F86F7' }
        ]
      },
      {
        category: '绿色系',
        colors: [
          { name: '薄荷绿', value: '#98FF98' },
          { name: '森林绿', value: '#228B22' },
          { name: '牛油果绿', value: '#568203' },
          { name: '青柠绿', value: '#BFFF00' },
          { name: '翡翠绿', value: '#50C878' },
          { name: '草绿色', value: '#7CFC00' }
        ]
      },
      {
        category: '黄色/橙色系',
        colors: [
          { name: '柠檬黄', value: '#FFF44F' },
          { name: '金黄色', value: '#FFD700' },
          { name: '橙色', value: '#FFA500' },
          { name: '珊瑚橙', value: '#FF7F50' },
          { name: '蜜桃橙', value: '#FFCC80' },
          { name: '落日橙', value: '#FD6A02' }
        ]
      },
      {
        category: '红色系',
        colors: [
          { name: '中国红', value: '#DE2910' },
          { name: '珊瑚红', value: '#FF4040' },
          { name: '酒红色', value: '#722F37' },
          { name: '樱桃红', value: '#D2042D' },
          { name: '玫瑰红', value: '#C21E56' },
          { name: '烈焰红', value: '#FF0000' }
        ]
      },
      {
        category: '主流爱豆专属色',
        colors: [
          { name: '阿米紫', value: '#5C2D91' },
          { name: '爱丽棒银', value: '#C0C0C0' },
          { name: '北极星蓝', value: '#0047AB' },
          { name: '浅粉紫', value: '#E0B0FF' },
          { name: '珊瑚粉', value: '#FF7F7F' },
          { name: '薄荷蓝', value: '#B2FFFF' },
          { name: '湖水绿', value: '#50C878' },
          { name: '紫罗兰', value: '#8F00FF' },
          { name: '太阳黄', value: '#FFD700' },
          { name: '玫瑰金', value: '#B76E79' },
          { name: '珍珠白', value: '#F0F0F0' },
          { name: '星空紫', value: '#4B0082' }
        ]
      }
    ]
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const idols = app.globalData.idols;
    const currentIdolId = app.globalData.currentIdol?.id || '';
    const today = util.formatDate(new Date().toISOString());
    
    this.setData({
      idols,
      currentIdolId,
      newEntryDate: today
    });
  },

  switchIdol(e) {
    const id = e.currentTarget.dataset.id;
    const idol = app.globalData.idols.find(i => i.id == id);
    
    if (idol) {
      app.globalData.currentIdol = idol;
      try {
        wx.setStorageSync('currentIdol', idol);
      } catch (e) {
        console.error('保存当前爱豆失败', e);
      }
      util.showToast('已切换', 'success');
      
      setTimeout(() => {
        wx.navigateBack();
      }, 800);
    }
  },

  showAddForm() {
    this.setData({ 
      showAddForm: true,
      editingIdol: null,
      newName: '',
      newNickname: '',
      newAvatar: '',
      newAvatarRaw: '',
      newBannerImage: '',
      newBannerImageRaw: '',
      newBirthday: '1997-09-01',
      newDebutDate: '2013-06-13',
      newSupportColor: '#FFC0CB',
      selectedColorName: '少女粉'
    });
  },

  editIdol(e) {
    const id = e.currentTarget.dataset.id;
    const idol = app.globalData.idols.find(i => i.id == id);
    
    if (idol) {
      let colorName = '少女粉';
      for (const category of this.data.colorCategories) {
        const found = category.colors.find(c => c.value === idol.supportColor);
        if (found) {
          colorName = found.name;
          break;
        }
      }
      
      this.setData({
        showAddForm: true,
        editingIdol: idol,
        newName: idol.name || '',
        newNickname: idol.nickname || '',
        newAvatar: idol.avatar || idol.avatarRaw || '',
        newAvatarRaw: idol.avatarRaw || idol.avatar || '',
        newBannerImage: idol.bannerImage || idol.bannerImageRaw || '',
        newBannerImageRaw: idol.bannerImageRaw || idol.bannerImage || '',
        newEntryDate: idol.entryDate || util.formatDate(new Date().toISOString()),
        newBirthday: idol.birthday || '1997-09-01',
        newDebutDate: idol.debutDate || '2013-06-13',
        newSupportColor: idol.supportColor || '#FFC0CB',
        selectedColorName: colorName
      });
    }
  },

  hideAddForm() {
    this.setData({ 
      showAddForm: false,
      editingIdol: null
    });
  },

  onNameInput(e) {
    this.setData({ newName: e.detail.value });
  },

  onNicknameInput(e) {
    this.setData({ newNickname: e.detail.value });
  },

  onEntryDateChange(e) {
    this.setData({ newEntryDate: e.detail.value });
  },

  onBirthdayChange(e) {
    this.setData({ newBirthday: e.detail.value });
  },

  onDebutDateChange(e) {
    this.setData({ newDebutDate: e.detail.value });
  },

  onChooseAvatar() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        that.openCropper(tempFilePath, 'avatar', (croppedPath) => {
          that.setData({
            newAvatar: croppedPath,
            newAvatarRaw: croppedPath
          });
        });
      },
      fail(err) {
        console.error('选择头像失败:', err);
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  },

  onChooseBanner() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        that.openCropper(tempFilePath, 'banner', (croppedPath) => {
          that.setData({
            newBannerImage: croppedPath,
            newBannerImageRaw: croppedPath
          });
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

  showColorPicker() {
    this.setData({ showColorModal: true });
  },

  hideColorPicker() {
    this.setData({ showColorModal: false });
  },

  onColorSelect(e) {
    const color = e.currentTarget.dataset.color;
    const name = e.currentTarget.dataset.name;
    this.setData({
      newSupportColor: color,
      selectedColorName: name
    });
  },

  stopPropagation() {
  },

  addIdol() {
    const {
      newName,
      newNickname,
      newAvatar,
      newAvatarRaw,
      newBannerImage,
      newBannerImageRaw,
      newEntryDate,
      newBirthday,
      newDebutDate,
      newSupportColor
    } = this.data;
    
    if (!newName.trim()) {
      util.showToast('请输入爱豆姓名');
      return;
    }

    const newIdol = {
      id: null,
      name: newName.trim(),
      nickname: newNickname.trim(),
      avatar: newAvatar,
      avatarRaw: newAvatarRaw,
      supportColor: newSupportColor,
      debutDate: newDebutDate,
      birthday: newBirthday,
      entryDate: newEntryDate || util.formatDate(new Date().toISOString()),
      bannerImage: newBannerImage || 'https://picsum.photos/800/400?random=' + Date.now(),
      bannerImageRaw: newBannerImageRaw || ''
    };

    wx.showLoading({ title: '保存中...' });
    
    app.saveIdolToServer(newIdol).then((res) => {
      wx.hideLoading();
      const createdId = res && res.data ? res.data.id : null;
      const newCurrentIdol = app.globalData.idols.find(item => item.id == createdId) || app.globalData.idols[app.globalData.idols.length - 1];
      if (newCurrentIdol) {
        app.globalData.currentIdol = newCurrentIdol;
        try {
          wx.setStorageSync('currentIdol', newCurrentIdol);
        } catch (e) {
          console.error('保存当前爱豆失败', e);
        }
      }
      util.showToast('添加成功', 'success');
      
      setTimeout(() => {
        this.setData({
          showAddForm: false,
          editingIdol: null
        });
        this.loadData();
      }, 800);
    }).catch((err) => {
      wx.hideLoading();
      console.error('保存失败:', err);
      util.showToast('保存失败，请重试');
    });
  },

  updateIdol() {
    const {
      editingIdol,
      newName,
      newNickname,
      newAvatar,
      newAvatarRaw,
      newBannerImage,
      newBannerImageRaw,
      newEntryDate,
      newBirthday,
      newDebutDate,
      newSupportColor
    } = this.data;
    
    if (!newName.trim()) {
      util.showToast('请输入爱豆姓名');
      return;
    }

    const updatedIdol = {
      ...editingIdol,
      name: newName.trim(),
      nickname: newNickname.trim(),
      avatar: newAvatar,
      avatarRaw: newAvatarRaw,
      bannerImage: newBannerImage || editingIdol.bannerImage || '',
      bannerImageRaw: newBannerImageRaw || editingIdol.bannerImageRaw || editingIdol.bannerImage || '',
      supportColor: newSupportColor,
      debutDate: newDebutDate,
      birthday: newBirthday,
      entryDate: newEntryDate
    };

    wx.showLoading({ title: '保存中...' });
    
    app.saveIdolToServer(updatedIdol).then(() => {
      wx.hideLoading();
      
      // 更新当前爱豆为刚编辑的爱豆
      const savedIdol = app.globalData.idols.find(i => i.id === editingIdol.id);
      if (savedIdol) {
        app.globalData.currentIdol = savedIdol;
        try {
          wx.setStorageSync('currentIdol', savedIdol);
        } catch (e) {
          console.error('保存当前爱豆失败', e);
        }
      }
      
      util.showToast('修改成功', 'success');
      
      setTimeout(() => {
        this.setData({
          showAddForm: false,
          editingIdol: null
        });
        this.loadData();
      }, 800);
    }).catch((err) => {
      wx.hideLoading();
      console.error('保存失败:', err);
      util.showToast('保存失败，请重试');
    });
  },

  goBack() {
    // 如果在管理模式，先退出管理模式
    if (this.data.isManageMode) {
      this.setData({ isManageMode: false });
    } else {
      wx.navigateBack();
    }
  },

  toggleManageMode() {
    this.setData({ 
      isManageMode: !this.data.isManageMode 
    });
  },

  confirmDeleteIdol(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    this.setData({ 
      showDeleteModal: true,
      deletingIdolId: id,
      deletingIdolName: name
    });
  },

  hideDeleteModal() {
    this.setData({ 
      showDeleteModal: false,
      deletingIdolId: null,
      deletingIdolName: ''
    });
  },

  executeDeleteIdol() {
    const { deletingIdolId } = this.data;
    
    if (!deletingIdolId) {
      util.showToast('无法删除，数据异常');
      return;
    }

    wx.showLoading({ title: '删除中...' });
    
    app.deleteIdolFromServer(deletingIdolId).then(() => {
      wx.hideLoading();
      
      // 如果删除的是当前爱豆，切换到第一个爱豆或清空
      if (app.globalData.currentIdol?.id === deletingIdolId) {
        const remainingIdols = app.globalData.idols.filter(i => i.id !== deletingIdolId);
        if (remainingIdols.length > 0) {
          app.globalData.currentIdol = remainingIdols[0];
          try {
            wx.setStorageSync('currentIdol', remainingIdols[0]);
          } catch (e) {
            console.error('保存当前爱豆失败', e);
          }
        } else {
          app.globalData.currentIdol = null;
          try {
            wx.removeStorageSync('currentIdol');
          } catch (e) {
            console.error('清空当前爱豆失败', e);
          }
        }
      }
      
      util.showToast('删除成功', 'success');
      
      setTimeout(() => {
        this.setData({
          showDeleteModal: false,
          deletingIdolId: null,
          deletingIdolName: '',
          isManageMode: false
        });
        this.loadData();
      }, 800);
    }).catch((err) => {
      wx.hideLoading();
      console.error('删除失败:', err);
      util.showToast('删除失败，请重试');
    });
  }
})
