const util = require('../../utils/util.js');
const app = getApp();

const MOODS = [
  { id: 'heart', label: '心动', icon: '❤️' },
  { id: 'excited', label: '狂喜', icon: '✨' },
  { id: 'healing', label: '治愈', icon: '☕' },
  { id: 'missing', label: '想念', icon: '🎵' },
  { id: 'crying', label: '破防', icon: '⭐' }
];

const TAGS = [
  { name: '演唱会', selected: false },
  { name: '生日', selected: false },
  { name: '打歌', selected: false },
  { name: '综艺', selected: false },
  { name: '直播', selected: false },
  { name: '神图', selected: false },
  { name: '语录', selected: false },
  { name: '日常', selected: false }
];



Page({
  data: {
    content: '',
    mood: 'heart',
    images: [],
    moods: MOODS,
    tags: [],
    mode: 'create',
    editingDiary: null,
    totalMediaCount: 0,
    canSave: false,
    navHeight: 0,
    navTop: 0,
    totalNavHeight: 0,
    selectedTagCount: 0,
    maxTagCount: 3
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

    // 初始化标签
    let tags = TAGS.map(tag => ({ ...tag }));

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

        // 设置编辑模式下的标签选中状态
        const savedTags = diary.tags || [];
        
        // 先处理预设标签
        tags = tags.map(tag => ({
          ...tag,
          selected: savedTags.includes(tag.name)
        }));

        // 添加自定义标签（不在预设标签中的）
        const presetTagNames = TAGS.map(t => t.name);
        savedTags.forEach(tagName => {
          if (!presetTagNames.includes(tagName)) {
            tags.push({
              name: tagName,
              selected: true,
              isCustom: true
            });
          }
        });
        
        this.setData({
          mode: 'edit',
          editingDiary: diary,
          content: diary.content,
          mood: diary.mood,
          images: formattedImages,
          tags: tags,
          totalMediaCount: formattedImages.length,
          navTop,
          navHeight,
          totalNavHeight
        }, () => {
          this.updateCanSave();
          this.updateSelectedTagCount();
        });
      }
    } else {
      this.setData({
        tags: tags,
        navTop,
        navHeight,
        totalNavHeight
      }, () => {
        this.updateSelectedTagCount();
      });
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

  toggleTag(e) {
    const index = e.currentTarget.dataset.index;
    let { tags, maxTagCount } = this.data;
    const tag = tags[index];
    
    // 如果是取消选中，直接操作
    if (tag.selected) {
      tag.selected = false;
    } else {
      // 如果是选中，检查数量
      const selectedCount = tags.filter(t => t.selected).length;
      if (selectedCount >= maxTagCount) {
        wx.showToast({ 
          title: `最多选${maxTagCount}个标签`, 
          icon: 'none',
          duration: 1500
        });
        return;
      }
      tag.selected = true;
    }
    
    this.setData({ tags: [...tags] });
    this.updateSelectedTagCount();
  },

  updateSelectedTagCount() {
    const { tags } = this.data;
    const count = tags.filter(t => t.selected).length;
    this.setData({ selectedTagCount: count });
  },

  showAddCustomTag() {
    wx.showModal({
      title: '添加自定义标签',
      editable: true,
      placeholderText: '输入标签名称（最多6字）',
      confirmText: '添加',
      confirmColor: '#EC4899',
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          this.addCustomTag(res.content.trim());
        }
      }
    });
  },

  addCustomTag(tagName) {
    if (tagName.length > 6) {
      wx.showToast({ title: '标签最多6个字', icon: 'none' });
      return;
    }

    let { tags } = this.data;
    
    // 检查标签是否已存在
    const existingTag = tags.find(tag => tag.name === tagName);
    if (existingTag) {
      if (!existingTag.selected) {
        existingTag.selected = true;
        this.setData({ tags: [...tags] });
      }
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }

    // 添加新标签并自动选中
    const newTag = {
      name: tagName,
      selected: true,
      isCustom: true
    };
    tags.push(newTag);
    this.setData({ tags: [...tags] });
    this.updateSelectedTagCount();
    wx.showToast({ title: '标签添加成功', icon: 'success' });
  },

  deleteCustomTag(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    let { tags } = this.data;
    
    wx.showModal({
      title: '删除标签',
      content: '确定删除这个标签吗？',
      confirmText: '删除',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          tags.splice(index, 1);
          this.setData({ tags: [...tags] });
          this.updateSelectedTagCount();
        }
      }
    });
  },

  getSelectedTags() {
    return this.data.tags.filter(tag => tag.selected).map(tag => tag.name);
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
    const { content, mood, images, mode, editingDiary } = this.data;
    const selectedTags = this.getSelectedTags();
    
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
      const newDiary = {
        id: null,
        idolId: currentIdol.id,
        content: content.trim(),
        images: images,
        mood: mood,
        tags: selectedTags
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
