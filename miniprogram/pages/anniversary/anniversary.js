const util = require('../../utils/util.js');

Page({
  data: {
    currentIdol: null,
    anniversaries: [],
    customAnniversaries: [],
    allAnniversaries: [],
    showAddModal: false,
    editingBuiltInId: null,
    subscribeConfig: null,
    newAnniversary: {
        id: null,
        title: '',
        date: '',
        iconText: '',
        wechatReminder: false,
        calendarReminder: false
      },
    isSubmitting: false  // 防重复提交标记
  },

  dateRefreshTimer: null,

  onLoad() {
    this.loadData();
    this.scheduleDateRefresh();
  },

  onShow() {
    this.loadData();
    this.scheduleDateRefresh();
  },

  onHide() {
    this.clearDateRefreshTimer();
  },

  onUnload() {
    this.clearDateRefreshTimer();
  },

  loadData() {
    const app = getApp();
    const currentIdol = app.globalData.currentIdol;

    if (currentIdol) {
      const anniversaries = this.calculateAnniversaries(currentIdol);
      const customAnniversaries = this.loadCustomAnniversaries(currentIdol.id);
      
      this.setData({
        currentIdol,
        anniversaries,
        customAnniversaries
      });
      
      this.refreshAllAnniversaries();
    }
    
    // 提前拉取订阅配置，防止在 switch 事件中异步获取导致丢失 TAP 标识
    if (!this.data.subscribeConfig) {
      app.getReminderSubscribeConfig().then(config => {
        this.setData({ subscribeConfig: config });
      }).catch(err => console.error('获取订阅配置失败:', err));
    }
  },

  refreshAllAnniversaries() {
    const all = this.getAllAnniversaries();
    this.setData({ allAnniversaries: all });
  },

  loadCustomAnniversaries(idolId) {
    const app = getApp();
    return app.globalData.anniversaries.filter(a => a.idolId === idolId) || [];
  },

  calculateAnniversaries(idol) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const getNextDate = (dateStr) => {
      if (!dateStr) {
        return today;
      }
      const monthDay = dateStr.slice(5);
      let targetDate = util.parseDate(`${currentYear}-${monthDay}`);
      if (today > targetDate) {
        targetDate = new Date(currentYear + 1, targetDate.getMonth(), targetDate.getDate());
      }
      return targetDate;
    };

    const all = [];
    
    if (idol.birthday) {
      const nextBirthday = getNextDate(idol.birthday);
      all.push({ 
        id: 'birthday',
        title: `${idol.name}生日`, 
        date: nextBirthday, 
        label: this.formatDate(nextBirthday), 
        color: 'pink',
        iconText: '生',
        days: this.calculateDaysDiff(nextBirthday, today),
        isCustom: false
      });
    }
    
    if (idol.debutDate) {
      const nextDebut = getNextDate(idol.debutDate);
      all.push({ 
        id: 'debut',
        title: '出道纪念日', 
        date: nextDebut, 
        label: this.formatDate(nextDebut), 
        color: 'lavender',
        iconText: '出',
        days: this.calculateDaysDiff(nextDebut, today),
        isCustom: false
      });
    }
    
    all.sort((a, b) => a.date - b.date);

    return all;
  },

  formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  },

  calculateDaysDiff(date1, date2) {
    return Math.ceil((date1 - date2) / (1000 * 60 * 60 * 24));
  },

  scheduleDateRefresh() {
    this.clearDateRefreshTimer();
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const delay = Math.max(1000, nextMidnight.getTime() - now.getTime() + 1000);

    this.dateRefreshTimer = setTimeout(() => {
      this.loadData();
      this.scheduleDateRefresh();
    }, delay);
  },

  clearDateRefreshTimer() {
    if (this.dateRefreshTimer) {
      clearTimeout(this.dateRefreshTimer);
      this.dateRefreshTimer = null;
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onAddClick() {
    this.setData({ 
      showAddModal: true,
      editingBuiltInId: null,
      newAnniversary: {
        id: null,
        title: '',
        date: '',
        iconText: '',
        wechatReminder: false,
        calendarReminder: false
      }
    });
  },

  onCloseModal() {
    this.setData({ 
      showAddModal: false,
      editingBuiltInId: null 
    });
  },

  stopPropagation() {},

  onTitleInput(e) {
    this.setData({
      'newAnniversary.title': e.detail.value
    });
  },

  getFirstDisplayChar(value, fallback = '') {
    const text = String(value || '').trim();
    return Array.from(text)[0] || fallback;
  },

  onIconTextInput(e) {
    this.setData({
      'newAnniversary.iconText': e.detail.value
    });
  },

  onDateInput(e) {
    this.setData({
      'newAnniversary.date': e.detail.value
    });
  },

  toggleWechatReminder() {
    // 拦截整行点击，防止与 switch 冲突
  },

  onWechatReminderChange(e) {
    const isChecked = e.detail.value;
    if (isChecked) {
      const config = this.data.subscribeConfig;
      if (!config || !config.enabled || !config.templateId) {
        wx.showToast({ title: '订阅消息未配置', icon: 'none' });
        this.setData({ 'newAnniversary.wechatReminder': false });
        return;
      }

      // 确保 templateId 是字符串且去除了可能包含的空格
        const templateId = String(config.templateId).trim();
        console.log('准备请求订阅消息，模板ID:', templateId);

        // 同步直接调用，确保不会丢失 user TAP gesture 标识
        wx.requestSubscribeMessage({
          tmplIds: [templateId],
          success: (res) => {
            const status = res[templateId];
            if (status === 'accept') {
              this.setData({ 'newAnniversary.wechatReminder': true });
              wx.showToast({ title: '已授权提醒', icon: 'success' });
            } else {
              wx.showToast({ title: '已取消订阅', icon: 'none' });
              this.setData({ 'newAnniversary.wechatReminder': false });
            }
          },
          fail: (err) => {
            console.error('请求订阅消息失败详情:', err);
            // 针对 Windows 开发者工具常见的 Failed to fetch 报错给出明确提示
            if (err.errMsg && err.errMsg.includes('Failed to fetch')) {
               wx.showModal({
                 title: '开发者工具网络提示',
                 content: '请在手机上预览测试，或在开发者工具右上角【详情】-【本地设置】中勾选"不校验合法域名"。',
                 showCancel: false
               });
            } else if (err.errCode === 20004) {
               wx.showToast({ title: '请在手机端测试该功能', icon: 'none' });
            } else {
               wx.showToast({ title: '请求订阅失败', icon: 'none' });
            }
            this.setData({ 'newAnniversary.wechatReminder': false });
          }
        });
    } else {
      this.setData({ 'newAnniversary.wechatReminder': false });
    }
  },

  toggleCalendarReminder() {
    // 拦截整行点击
  },

  onCalendarReminderChange(e) {
    const isChecked = e.detail.value;
    // 只是简单地切换开关状态，不立即请求权限，等保存时再处理
    this.setData({ 'newAnniversary.calendarReminder': isChecked });
  },

  onSaveAnniversary() {
    // 防止重复提交
    if (this.data.isSubmitting) {
      console.log('[Anniversary] 正在保存中,忽略重复点击');
      return;
    }

    const app = getApp();
    const { newAnniversary, customAnniversaries, currentIdol, editingBuiltInId } = this.data;
    const title = String(newAnniversary.title || '').trim();
    const date = String(newAnniversary.date || '').trim();
    
    if (!title || !date) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    // 设置提交状态锁
    this.setData({ isSubmitting: true });
    console.log('[Anniversary] 开始保存纪念日...');

    if (editingBuiltInId) {
      const updatedIdol = { ...currentIdol };
      if (editingBuiltInId === 'birthday') {
        updatedIdol.birthday = newAnniversary.date;
      } else if (editingBuiltInId === 'debut') {
        updatedIdol.debutDate = newAnniversary.date;
      }
      
      wx.showLoading({ title: '保存中...', mask: true });
      app.saveIdolToServer(updatedIdol).then(() => {
        wx.hideLoading();
        this.setData({ 
          showAddModal: false,
          editingBuiltInId: null,
          currentIdol: app.globalData.currentIdol
        });
        this.loadData();
        wx.showToast({ title: '修改成功', icon: 'success' });
        
        // 处理提醒逻辑
        // 为内置纪念日手动构造 item
        const item = {
          id: editingBuiltInId,
          title: editingBuiltInId === 'birthday' ? `${currentIdol.name}生日` : '出道纪念日',
          date: newAnniversary.date,
          isCustom: false
        };
        this.handleSaveReminders(item, newAnniversary.wechatReminder, newAnniversary.calendarReminder);
      }).catch((err) => {
        wx.hideLoading();
        console.error('修改失败:', err);
        wx.showToast({ title: '修改失败，请重试', icon: 'none' });
      }).finally(() => {
        // 释放提交锁
        this.setData({ isSubmitting: false });
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const monthDay = date.slice(5);
    let targetDate = util.parseDate(`${currentYear}-${monthDay}`);
    if (today > targetDate) {
      targetDate = new Date(currentYear + 1, targetDate.getMonth(), targetDate.getDate());
    }

    const iconText = this.getFirstDisplayChar(
      newAnniversary.iconText,
      this.getFirstDisplayChar(title, '纪')
    );

    const newItem = {
      id: newAnniversary.id || null,
      idolId: currentIdol.id,
      title,
      date,
      iconText,
      color: '#FFB6C1'
    };

    wx.showLoading({ title: '保存中...', mask: true });

    app.saveAnniversaryToServer(newItem).then((res) => {
      wx.hideLoading();
      this.setData({ 
        customAnniversaries: app.globalData.anniversaries.filter(a => a.idolId === currentIdol.id),
        showAddModal: false 
      });
      
      this.refreshAllAnniversaries();
      wx.showToast({ title: '保存成功', icon: 'success' });
      
      const savedId = res && res.data && res.data.id ? res.data.id : (newItem.id || null);

      // 处理提醒逻辑
      // 注意：这里需要从刚保存的结果或者重新刷新的列表中找到对应的项
      setTimeout(() => {
        // 如果是新创建的，需要通过匹配title和date找到新项（因为res可能不包含处理好的日历项结构）
        let itemToRemind = null;
        if (savedId) {
           itemToRemind = this.getAnniversaryItem(savedId, true);
        } 
        
        if (!itemToRemind) {
           // 备用查找策略：找最近添加的同名同日期的自定义项
           itemToRemind = this.data.allAnniversaries.find(a => a.isCustom && a.title === newItem.title && this.formatDate(a.date) === this.formatDate(targetDate));
        }

        if (itemToRemind) {
          this.handleSaveReminders(itemToRemind, newAnniversary.wechatReminder, newAnniversary.calendarReminder);
        }
      }, 500);

    }).catch((err) => {
      wx.hideLoading();
      console.error('保存失败:', err);
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }).finally(() => {
      // 释放提交锁
      this.setData({ isSubmitting: false });
    });
  },

  handleSaveReminders(item, wechatReminder, calendarReminder) {
    const app = getApp();

    if (wechatReminder) {
      app.saveReminderSubscription(this.buildReminderSubscribePayload(item)).catch((err) => {
        console.error('保存订阅提醒失败:', err);
      });
    } else {
      app.disableReminderSubscription(
        this.getReminderSourceKey(item),
        item.isCustom ? 'custom' : 'builtin'
      ).catch((err) => {
        console.error('关闭订阅提醒失败:', err);
      });
    }

    if (calendarReminder) {
      wx.showModal({
        title: '系统日历提醒需手动开启',
        content: '纪念日已保存。由于微信限制，系统日历只能在用户直接点击开关时添加。请保存后进入详情页打开“系统日历提醒”。',
        showCancel: false
      });
    } else {
      const calendarKey = this.getLocalCalendarKey(item);
      let hadCalendarReminder = false;
      try {
        hadCalendarReminder = wx.getStorageSync(calendarKey) === true;
        wx.removeStorageSync(calendarKey);
      } catch (err) {
        console.error('清除日历提醒状态失败:', err);
      }

      if (hadCalendarReminder) {
        wx.showModal({
          title: '日历提醒已关闭',
          content: '已关闭小程序内的日历提醒状态。如果之前已经加入手机系统日历，请前往系统日历手动删除对应事件。',
          showCancel: false
        });
      }
    }
  },

  onCardClick(e) {
    const id = e.currentTarget.dataset.id;
    const isCustom = e.currentTarget.dataset.iscustom;
    const item = this.getAnniversaryItem(id, isCustom);

    if (!item) {
      wx.showToast({ title: '未找到该提醒', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/anniversary-detail/anniversary-detail?id=${encodeURIComponent(id)}&isCustom=${isCustom ? 'true' : 'false'}`
    });
  },

  getAnniversaryItem(id, isCustom) {
    return this.data.allAnniversaries.find(item => (
      String(item.id) === String(id) && Boolean(item.isCustom) === Boolean(isCustom)
    ));
  },

  addReminderToPhoneCalendar(item, isAutoSet = false) {
    if (typeof wx.addPhoneCalendar !== 'function') {
      if (!isAutoSet) wx.showToast({ title: '当前微信版本不支持', icon: 'none' });
      return;
    }

    wx.authorize({
      scope: 'scope.addPhoneCalendar',
      success: () => {
        this.createPhoneCalendarEvent(item, isAutoSet);
      },
      fail: () => {
        if (isAutoSet) return; // 自动设置时不强弹提示框，避免连弹干扰
        wx.showModal({
          title: '需要日历权限',
          content: '开启后可把这条纪念日加入手机日历，并由系统在到期时提醒你。',
          confirmText: '去开启',
          success: (res) => {
            if (!res.confirm) {
              return;
            }

            wx.openSetting({
              success: (settingRes) => {
                if (settingRes.authSetting['scope.addPhoneCalendar']) {
                  this.createPhoneCalendarEvent(item, isAutoSet);
                } else {
                  wx.showToast({ title: '未开启日历权限', icon: 'none' });
                }
              }
            });
          }
        });
      }
    });
  },

  subscribeWechatReminder(item, callback = null) {
    const app = getApp();

    app.getReminderSubscribeConfig().then((config) => {
      if (!config || !config.enabled || !config.templateId) {
        wx.showToast({ title: '订阅消息未配置', icon: 'none' });
        if (callback) callback();
        return;
      }

      wx.requestSubscribeMessage({
        tmplIds: [config.templateId],
        success: (res) => {
          const status = res[config.templateId];
          if (status !== 'accept') {
            wx.showToast({ title: '你还没有同意本次订阅', icon: 'none' });
            if (callback) callback();
            return;
          }

          app.saveReminderSubscription(this.buildReminderSubscribePayload(item)).then(() => {
            wx.showToast({ title: '本次微信提醒已订阅', icon: 'success' });
            if (callback) callback();
          }).catch((err) => {
            console.error('保存订阅提醒失败:', err);
            wx.showToast({ title: '订阅保存失败', icon: 'none' });
            if (callback) callback();
          });
        },
        fail: (err) => {
          console.error('请求订阅消息失败:', err);
          wx.showToast({ title: '请求订阅失败', icon: 'none' });
          if (callback) callback();
        }
      });
    }).catch((err) => {
      console.error('获取订阅配置失败:', err);
      wx.showToast({ title: '订阅配置获取失败', icon: 'none' });
      if (callback) callback();
    });
  },

  buildReminderSubscribePayload(item) {
    return {
      idolId: this.data.currentIdol.id,
      sourceKey: this.getReminderSourceKey(item),
      sourceType: item.isCustom ? 'custom' : 'builtin',
      title: item.title,
      date: this.formatReminderDateValue(item.date)
    };
  },

  getReminderSourceKey(item) {
    if (item.isCustom) {
      return `custom-${item.id}`;
    }
    return String(item.id);
  },

  getLocalCalendarKey(item) {
    const sourceType = item.isCustom ? 'custom' : 'builtin';
    const sourceKey = this.getReminderSourceKey(item);
    return `calendar_${sourceType}_${sourceKey}`;
  },

  createPhoneCalendarEvent(item, isAutoSet = false) {
    const calendarRange = this.buildCalendarEventRange(item.date);

    if (!calendarRange) {
      if (!isAutoSet) wx.showToast({ title: '提醒日期无效', icon: 'none' });
      return;
    }

    const idolName = this.data.currentIdol?.name || '爱豆';
    const dateLabel = this.formatReminderDateValue(calendarRange.eventDate);

    const that = this;
    // 先构造好要保存的 key，打印出来
    const localKey = that.getLocalCalendarKey(item);
    console.log('准备保存日历状态，key:', localKey);
    
    wx.addPhoneCalendar({
      title: item.title,
      startTime: this.toUnixSeconds(calendarRange.startTime),
      endTime: this.toUnixSeconds(calendarRange.endTime),
      description: `和 ${idolName} 有关的重要日程：${item.title}\n纪念日：${dateLabel}\n提醒区间：${this.formatCalendarDateTime(calendarRange.startTime)} - ${this.formatCalendarDateTime(calendarRange.endTime)}\n来自：爱豆时光日记`,
      alarm: true,
      alarmOffset: 3600,
      success: () => {
        // 保存状态到本地
        try {
          wx.setStorageSync(localKey, true);
          console.log('日历状态保存成功，key:', localKey);
        } catch (e) {
          console.error('保存日历状态失败:', e);
        }
        wx.showToast({ title: '已加入系统日历', icon: 'success' });
      },
      fail: (err) => {
        if (err && err.errMsg && err.errMsg.includes('cancel')) {
          return;
        }
        console.error('添加系统日历失败:', err);
        if (!isAutoSet) wx.showToast({ title: '添加失败，请重试', icon: 'none' });
      }
    });
  },

  buildCalendarEventRange(dateValue) {
    const eventDate = this.normalizeReminderDate(dateValue);
    if (!eventDate) {
      return null;
    }

    const normalizedEventDate = new Date(eventDate.getTime());
    normalizedEventDate.setHours(0, 0, 0, 0);

    const startTime = new Date(normalizedEventDate.getTime());
    startTime.setDate(startTime.getDate() - 7);
    startTime.setHours(16, 0, 0, 0);

    const endTime = new Date(normalizedEventDate.getTime());
    endTime.setDate(endTime.getDate() - 1);
    endTime.setHours(16, 0, 0, 0);

    return {
      eventDate: normalizedEventDate,
      startTime,
      endTime
    };
  },

  toUnixSeconds(date) {
    return Math.floor(date.getTime() / 1000);
  },

  formatCalendarDateTime(dateValue) {
    const date = this.normalizeReminderDate(dateValue);
    if (!date) {
      return '';
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  normalizeReminderDate(dateValue) {
    if (!dateValue) {
      return null;
    }

    if (dateValue instanceof Date) {
      return new Date(dateValue.getTime());
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  },

  formatReminderDateValue(dateValue) {
    const date = this.normalizeReminderDate(dateValue);
    if (!date) {
      return '';
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  loadReminderStatusAndOpen(isBuiltIn, id, basicData) {
    const app = getApp();
    const sourceType = isBuiltIn ? 'builtin' : 'custom';
    // 不管能不能找到 item，我们直接构造一个统一的 item 对象用来拿 key
    const keyItem = { id: id, isCustom: !isBuiltIn };
    
    // 先打开弹窗，设置基础数据
    this.setData({
      showAddModal: true,
      editingBuiltInId: isBuiltIn ? id : null,
      newAnniversary: {
        ...basicData,
        wechatReminder: false,
        calendarReminder: false
      }
    });

    // 异步查状态
    const that = this;
    // 查本地日历状态
    let localCalendarStatus = false;
    let calendarKey = '';
    try {
      calendarKey = that.getLocalCalendarKey(keyItem);
      console.log('加载日历状态，key:', calendarKey);
      localCalendarStatus = wx.getStorageSync(calendarKey) === true;
      console.log('本地日历状态:', localCalendarStatus);
    } catch (e) {
      console.error('读取本地日历状态失败:', e);
    }

    // 先设置日历状态，让用户先看到
    that.setData({
      'newAnniversary.calendarReminder': localCalendarStatus
    });

    // 构造查询订阅状态用的 item
    let queryItem = null;
    if (isBuiltIn) {
      // 内置纪念日，手动构造一个简单对象
      queryItem = { id: id, isCustom: false };
    } else {
      // 自定义纪念日，从列表里找
      queryItem = this.getAnniversaryItem(id, true);
    }

    // 查后端微信订阅状态
    if (queryItem) {
      const stKey = this.getReminderSourceKey(queryItem);
      app.checkReminderSubscriptionStatus(stKey, sourceType)
        .then((res) => {
          const wechatStatus = Boolean(res.data);
          console.log('查询到微信订阅状态:', wechatStatus);
          that.setData({
            'newAnniversary.wechatReminder': wechatStatus
          });
        })
        .catch((err) => {
          console.error('查询订阅状态失败:', err);
        });
    }
  },

  editBuiltInAnniversary(id) {
    const idol = this.data.currentIdol;
    let title = id === 'birthday' ? `${idol.name}生日` : '出道纪念日';
    let date = id === 'birthday' ? idol.birthday : idol.debutDate;

    this.loadReminderStatusAndOpen(true, id, {
      id: id,
      title: title,
      date: date || ''
    });
  },

  editAnniversary(id) {
    const item = this.data.customAnniversaries.find(a => a.id === id);
    if (item) {
      this.loadReminderStatusAndOpen(false, id, {
        id: item.id,
        title: item.title,
        date: item.date,
        iconText: item.iconText || ''
      });
    }
  },

  deleteAnniversary(id) {
    const app = getApp();
    wx.showModal({
      title: '删除提醒',
      content: '确定要删除这个纪念日吗？',
      confirmText: '删除',
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          
          app.deleteAnniversaryFromServer(id).then(() => {
            wx.hideLoading();
            this.setData({ 
              customAnniversaries: app.globalData.anniversaries.filter(a => a.idolId === this.data.currentIdol.id)
            });
            this.refreshAllAnniversaries();
            wx.showToast({ title: '删除成功', icon: 'success' });
          }).catch((err) => {
            wx.hideLoading();
            console.error('删除失败:', err);
            wx.showToast({ title: '删除失败，请重试', icon: 'none' });
          });
        }
      }
    });
  },

  getAllAnniversaries() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    
    const validCustomAnniversaries = this.data.customAnniversaries.filter(item => item.date);
    
    const all = [...this.data.anniversaries, ...validCustomAnniversaries.map(item => {
      const monthDay = item.date.slice(5);
      let targetDate = util.parseDate(`${currentYear}-${monthDay}`);
      if (today > targetDate) {
        targetDate = new Date(currentYear + 1, targetDate.getMonth(), targetDate.getDate());
      }
      
      return {
        ...item,
        date: targetDate,
        label: this.formatDate(targetDate),
        color: item.color || 'blue',
        iconText: this.getFirstDisplayChar(
          item.iconText,
          this.getFirstDisplayChar(item.title, '纪')
        ),
        days: this.calculateDaysDiff(targetDate, today),
        isCustom: true
      };
    })].sort((a, b) => a.date - b.date);
    
    return all;
  },

  // 分享给朋友
  onShareAppMessage(res) {
    const app = getApp();
    const idol = this.data.currentIdol;
    const idolName = idol ? idol.name : '我的爱豆';
    return {
      title: `${idolName}的重要纪念日，一起记录重要时刻`,
      path: '/pages/anniversary/anniversary',
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    };
  },

  // 分享到朋友圈
  onShareTimeline(res) {
    const app = getApp();
    const idol = this.data.currentIdol;
    const idolName = idol ? idol.name : '我的爱豆';
    return {
      title: `${idolName}的纪念日 - 爱豆时光日记`,
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    };
  }
})
