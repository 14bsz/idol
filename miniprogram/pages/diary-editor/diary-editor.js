const util = require('../../utils/util.js');
const app = getApp();

const MOODS = [
  { id: 'heart', label: '心动', icon: '❤️' },
  { id: 'excited', label: '狂喜', icon: '✨' },
  { id: 'healing', label: '治愈', icon: '☕' },
  { id: 'missing', label: '想念', icon: '🎵' },
  { id: 'crying', label: '破防', icon: '⭐' }
];

const TAGS = ['演唱会', '生日', '打歌', '综艺', '直播', '神图', '语录', '日常'];

const TEMPLATES = [
  { id: 'default', name: '温柔' },
  { id: 'serif', name: '文艺' },
  { id: 'bold', name: '热烈' }
];

Page({
  data: {
    content: '',
    mood: 'heart',
    template: 'default',
    images: [],
    selectedTags: [],
    moods: MOODS,
    tags: TAGS,
    templates: TEMPLATES,
    mode: 'create',
    editingDiary: null,
    totalMediaCount: 0,
    canSave: false,
    navHeight: 0,
    navTop: 0,
    totalNavHeight: 0
  },

  updateCanSave() {
    const { content, mode } = this.data;
    const canSave = (mode === 'edit') || (content && content.trim().length > 0);
    this.setData({ canSave });
  },

  onLoad(options) {
    // 计算导航栏高度，与 collection-add 保持一致
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    const navTop = menuButtonInfo.top;
    const navHeight = menuButtonInfo.height;
    const totalNavHeight = systemInfo.statusBarHeight + navHeight + (menuButtonInfo.top - systemInfo.statusBarHeight) * 2;
    this.setData({ navTop, navHeight, totalNavHeight });

    if (options.mode === 'edit') {
      const app = getApp();
      const diary = app.globalData.editingDiary;
      if (diary) {
        const formattedImages = (diary.images || []).map(img => {
          if (typeof img === 'string') {
            return { type: 'image', url: img };
          }
          return img;
        });
        
        this.setData({
          mode: 'edit',
          editingDiary: diary,
          content: diary.content,
          mood: diary.mood,
          template: diary.template,
          images: formattedImages,
          selectedTags: diary.tags || [],
          totalMediaCount: formattedImages.length
        }, () => {
          this.updateCanSave();
        });
      }
    }
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value }, () => {
      this.updateCanSave();
    });
  },

  selectMood(e) {
    const mood = e.currentTarget.dataset.id;
    this.setData({ mood });
  },

  selectTemplate(e) {
    const template = e.currentTarget.dataset.id;
    this.setData({ template });
  },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    let { selectedTags } = this.data;
    
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter(t => t !== tag);
    } else {
      selectedTags.push(tag);
    }
    
    this.setData({ selectedTags });
  },

  showChooseMedia() {
    wx.showActionSheet({
      itemList: ['选择照片', '选择视频'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.chooseImage();
        } else if (res.tapIndex === 1) {
          this.chooseVideo();
        }
      }
    });
  },

  chooseImage() {
    const { images } = this.data;
    const maxCount = 9 - images.length;
    
    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFilePaths.map(url => ({ type: 'image', url }));
        this.setData({
          images: [...images, ...newImages],
          totalMediaCount: images.length + newImages.length
        });
      }
    });
  },

  chooseVideo() {
    const { images } = this.data;
    if (images.length >= 9) {
      wx.showToast({ title: '最多上传9个文件', icon: 'none' });
      return;
    }
    
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        this.setData({
          images: [...images, { type: 'video', url: res.tempFilePath }],
          totalMediaCount: images.length + 1
        });
      }
    });
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const { images } = this.data;
    images.splice(index, 1);
    this.setData({ 
      images: [...images],
      totalMediaCount: images.length
    });
  },

  saveDiary() {
    const { content, mood, template, images, selectedTags, mode, editingDiary } = this.data;
    
    if (!content.trim()) {
      util.showToast('请写点什么吧');
      return;
    }

    const currentIdol = app.globalData.currentIdol;
    
    const saveToLocalAndBackend = (diary) => {
      const normalizedDiary = app.normalizeDiary ? app.normalizeDiary(diary) : diary;
      const diaryIndex = app.globalData.diaries.findIndex(d => d.id == normalizedDiary.id);
      if (diaryIndex !== -1) {
        app.globalData.diaries[diaryIndex] = normalizedDiary;
      } else {
        app.globalData.diaries.unshift(normalizedDiary);
      }
      app.saveData();
    };

    if (mode === 'edit' && editingDiary) {
      const updatedDiary = {
        ...editingDiary,
        content: content.trim(),
        images: images,
        mood: mood,
        template: template,
        tags: selectedTags
      };
      
      app.saveDiaryToServer(updatedDiary).then((savedDiary) => {
        saveToLocalAndBackend(savedDiary || updatedDiary);
        util.showToast('修改成功', 'success');
        setTimeout(() => wx.navigateBack(), 1000);
      }).catch((err) => {
        console.error('保存到后端失败:', err);
        saveToLocalAndBackend(updatedDiary);
        util.showToast('修改成功（本地）', 'success');
        setTimeout(() => wx.navigateBack(), 1000);
      });
    } else {
      const today = new Date();
      const newDiary = {
        id: null,
        idolId: currentIdol.id,
        content: content.trim(),
        images: images,
        mood: mood,
        template: template,
        tags: selectedTags,
        createdAt: util.formatDate(today.toISOString())
      };

      app.saveDiaryToServer(newDiary).then((savedDiary) => {
        saveToLocalAndBackend(savedDiary || newDiary);
        util.showToast('保存成功', 'success');
        setTimeout(() => wx.navigateBack(), 1000);
      }).catch((err) => {
        console.error('保存到后端失败:', err);
        newDiary.id = util.generateId();
        saveToLocalAndBackend(newDiary);
        util.showToast('保存成功（本地）', 'success');
        setTimeout(() => wx.navigateBack(), 1000);
      });
    }
  },

  goBack() {
    wx.navigateBack();
  }
})
