const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    idols: [],
    currentIdolId: '',
    showAddForm: false,
    editingIdol: null,
    newName: '',
    newNickname: '',
    newAvatar: 'https://picsum.photos/400/400?random=7',
    newEntryDate: '',
    newBirthday: '1997-09-01',
    newDebutDate: '2013-06-13'
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
      newAvatar: 'https://picsum.photos/400/400?random=' + Date.now(),
      newBirthday: '1997-09-01',
      newDebutDate: '2013-06-13'
    });
  },

  editIdol(e) {
    const id = e.currentTarget.dataset.id;
    const idol = app.globalData.idols.find(i => i.id == id);
    
    if (idol) {
      this.setData({
        showAddForm: true,
        editingIdol: idol,
        newName: idol.name || '',
        newNickname: idol.nickname || '',
        newAvatar: idol.avatar || 'https://picsum.photos/400/400?random=' + Date.now(),
        newEntryDate: idol.entryDate || util.formatDate(new Date().toISOString()),
        newBirthday: idol.birthday || '1997-09-01',
        newDebutDate: idol.debutDate || '2013-06-13'
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
        wx.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: 'base64',
          success(fileRes) {
            const base64 = 'data:image/jpeg;base64,' + fileRes.data;
            that.setData({ newAvatar: base64 });
          }
        });
      }
    });
  },

  addIdol() {
    const { newName, newNickname, newAvatar, newEntryDate, newBirthday, newDebutDate } = this.data;
    
    if (!newName.trim()) {
      util.showToast('请输入爱豆姓名');
      return;
    }

    const newIdol = {
      id: null,
      name: newName.trim(),
      nickname: newNickname.trim(),
      avatar: newAvatar,
      supportColor: '#FFC0CB',
      debutDate: newDebutDate,
      birthday: newBirthday,
      entryDate: newEntryDate || util.formatDate(new Date().toISOString()),
      bannerImage: 'https://picsum.photos/800/400?random=' + Date.now()
    };

    wx.showLoading({ title: '保存中...' });
    
    app.saveIdolToServer(newIdol).then(() => {
      wx.hideLoading();
      const newCurrentIdol = app.globalData.idols[app.globalData.idols.length - 1];
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
        wx.navigateBack();
      }, 1000);
    }).catch((err) => {
      wx.hideLoading();
      console.error('保存失败:', err);
      util.showToast('保存失败，请重试');
    });
  },

  updateIdol() {
    const { editingIdol, newName, newNickname, newAvatar, newEntryDate, newBirthday, newDebutDate } = this.data;
    
    if (!newName.trim()) {
      util.showToast('请输入爱豆姓名');
      return;
    }

    const updatedIdol = {
      ...editingIdol,
      name: newName.trim(),
      nickname: newNickname.trim(),
      avatar: newAvatar,
      debutDate: newDebutDate,
      birthday: newBirthday,
      entryDate: newEntryDate
    };

    wx.showLoading({ title: '保存中...' });
    
    app.saveIdolToServer(updatedIdol).then(() => {
      wx.hideLoading();
      util.showToast('修改成功', 'success');
      
      setTimeout(() => {
        this.setData({ 
          showAddForm: false,
          editingIdol: null
        });
        this.loadData();
      }, 1000);
    }).catch((err) => {
      wx.hideLoading();
      console.error('保存失败:', err);
      util.showToast('保存失败，请重试');
    });
  },

  goBack() {
    wx.navigateBack();
  },

  hideAddForm() {
    this.setData({ 
      showAddForm: false,
      editingIdol: null
    });
  }
})
