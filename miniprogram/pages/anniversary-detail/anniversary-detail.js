Page({
  data: {
    scheduleId: '',
    isCustom: false,
    currentIdol: null,
    anniversaryDetail: null,
    backgroundImage: '',
    displayFullDate: '',
    showEditModal: false,
    subscribeConfig: null,
    reminderStatus: {
      wechatReminder: false,
      calendarReminder: false
    },
    newAnniversary: {
      id: null,
      title: '',
      date: '',
      iconText: '',
      wechatReminder: false,
      calendarReminder: false
    }
  },

  onLoad(options) {
    this.setData({
      scheduleId: options.id || '',
      isCustom: options.isCustom === 'true'
    });
    this.loadData();
    this.preloadSubscribeConfig();
  },

  onShow() {
    if (this.data.scheduleId) {
      this.loadData();
    }
  },

  preloadSubscribeConfig() {
    if (this.data.subscribeConfig) {
      return;
    }

    const app = getApp();
    app.getReminderSubscribeConfig().then((config) => {
      this.setData({ subscribeConfig: config });
    }).catch((err) => {
      console.error('获取订阅配置失败:', err);
    });
  },

  loadData() {
    const app = getApp();
    const currentIdol = app.globalData.currentIdol;

    if (!currentIdol) {
      wx.showToast({ title: '未找到当前爱豆', icon: 'none' });
      return;
    }

    const anniversaryDetail = this.getAnniversaryDetail(currentIdol, this.data.scheduleId, this.data.isCustom);
    if (!anniversaryDetail) {
      wx.showToast({ title: '纪念日不存在', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1200);
      return;
    }

    // 优先使用自定义封面图
    const customCover = this.getCustomCoverImage(currentIdol.id, anniversaryDetail.id, anniversaryDetail.isCustom);
    const defaultBg = this.resolveBackgroundImage(currentIdol);

    this.setData({
      currentIdol,
      anniversaryDetail,
      backgroundImage: customCover || defaultBg,
      displayFullDate: this.formatFullDate(anniversaryDetail.date)
    });

    this.loadReminderStatus(anniversaryDetail);
  },

  getAnniversaryDetail(idol, id, isCustom) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isCustom) {
      const customItem = (getApp().globalData.anniversaries || []).find((item) => (
        String(item.id) === String(id) && String(item.idolId) === String(idol.id)
      ));

      if (!customItem || !customItem.date) {
        return null;
      }

      const nextDate = this.getNextDate(customItem.date, today);
      return {
        id: customItem.id,
        idolId: customItem.idolId,
        title: customItem.title,
        rawDate: customItem.date,
        date: nextDate,
        label: this.formatMonthDay(nextDate),
        color: customItem.color || 'blue',
        iconText: this.getFirstDisplayChar(customItem.iconText, this.getFirstDisplayChar(customItem.title, '纪')),
        days: this.calculateDaysDiff(nextDate, today),
        isCustom: true,
        typeText: '自定义纪念日',
        categoryText: '自定义提醒',
        noteText: '可以自由修改名称、日期和提醒方式',
        badgeStyle: this.getBadgeStyle(customItem.color || 'blue')
      };
    }

    const builtInItems = this.buildBuiltInAnniversaries(idol, today);
    return builtInItems.find((item) => String(item.id) === String(id)) || null;
  },

  buildBuiltInAnniversaries(idol, today) {
    const items = [];

    if (idol.birthday) {
      const nextBirthday = this.getNextDate(idol.birthday, today);
      items.push({
        id: 'birthday',
        idolId: idol.id,
        title: `${idol.name}生日`,
        rawDate: idol.birthday,
        date: nextBirthday,
        label: this.formatMonthDay(nextBirthday),
        color: 'pink',
        iconText: '生',
        days: this.calculateDaysDiff(nextBirthday, today),
        isCustom: false,
        typeText: '系统纪念日',
        categoryText: '生日',
        noteText: '跟随爱豆资料自动生成，可修改日期',
        badgeStyle: this.getBadgeStyle('pink')
      });
    }

    if (idol.debutDate) {
      const nextDebut = this.getNextDate(idol.debutDate, today);
      items.push({
        id: 'debut',
        idolId: idol.id,
        title: '出道纪念日',
        rawDate: idol.debutDate,
        date: nextDebut,
        label: this.formatMonthDay(nextDebut),
        color: 'lavender',
        iconText: '出',
        days: this.calculateDaysDiff(nextDebut, today),
        isCustom: false,
        typeText: '系统纪念日',
        categoryText: '出道',
        noteText: '跟随爱豆资料自动生成，可修改日期',
        badgeStyle: this.getBadgeStyle('lavender')
      });
    }

    return items;
  },

  getNextDate(dateStr, today = null) {
    const baseDate = today ? new Date(today.getTime()) : new Date();
    baseDate.setHours(0, 0, 0, 0);

    if (!dateStr) {
      return baseDate;
    }

    const currentYear = baseDate.getFullYear();
    const monthDay = String(dateStr).slice(5);
    let targetDate = new Date(`${currentYear}-${monthDay}`);

    if (baseDate > targetDate) {
      targetDate = new Date(currentYear + 1, targetDate.getMonth(), targetDate.getDate());
    }

    return targetDate;
  },

  getBadgeStyle(color) {
    if (color === 'pink') {
      return 'background: #f9a8d4; color: #ffffff;';
    }
    if (color === 'lavender') {
      return 'background: #c084fc; color: #ffffff;';
    }
    return 'background: #7dd3fc; color: #ffffff;';
  },

  resolveBackgroundImage(idol) {
    return idol.bannerImage
      || idol.avatar
      || 'https://picsum.photos/900/1600?random=18';
  },

  getCoverStorageKey(idolId, scheduleId, isCustom) {
    return `customCover_${idolId}_${scheduleId}_${isCustom ? '1' : '0'}`;
  },

  getCustomCoverImage(idolId, scheduleId, isCustom) {
    try {
      return wx.getStorageSync(this.getCoverStorageKey(idolId, scheduleId, isCustom)) || '';
    } catch (e) {
      return '';
    }
  },

  setCustomCoverImage(idolId, scheduleId, isCustom, url) {
    try {
      wx.setStorageSync(this.getCoverStorageKey(idolId, scheduleId, isCustom), url);
    } catch (e) {
      console.error('保存自定义封面失败:', e);
    }
  },

  onChangeCover() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        wx.showLoading({ title: '上传中...' });
        const app = getApp();
        app.uploadFile(tempFilePath).then((uploadRes) => {
          wx.hideLoading();
          const imageUrl = app.resolveMediaUrl(uploadRes.data.url);
          const detail = that.data.anniversaryDetail;
          const idol = that.data.currentIdol;
          that.setCustomCoverImage(idol.id, detail.id, detail.isCustom, imageUrl);
          that.setData({ backgroundImage: imageUrl });
          wx.showToast({ title: '封面已更新', icon: 'success' });
        }).catch((err) => {
          wx.hideLoading();
          console.error('封面上传失败:', err);
          wx.showToast({ title: '上传失败，请重试', icon: 'none' });
        });
      }
    });
  },

  getFirstDisplayChar(value, fallback = '') {
    const text = String(value || '').trim();
    return Array.from(text)[0] || fallback;
  },

  calculateDaysDiff(date1, date2) {
    return Math.ceil((date1 - date2) / (1000 * 60 * 60 * 24));
  },

  formatMonthDay(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  },

  formatFullDate(date) {
    const targetDate = this.normalizeReminderDate(date);
    if (!targetDate) {
      return '';
    }

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  },

  goBack() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    const detail = this.data.anniversaryDetail;
    if (!detail) {
      return {
        title: '纪念日详情',
        path: '/pages/anniversary/anniversary'
      };
    }

    return {
      title: `${detail.title} | 还有 ${detail.days} 天`,
      path: `/pages/anniversary-detail/anniversary-detail?id=${encodeURIComponent(detail.id)}&isCustom=${detail.isCustom ? 'true' : 'false'}`,
      imageUrl: this.data.backgroundImage
    };
  },

  onShareTimeline() {
    const detail = this.data.anniversaryDetail;
    if (!detail) {
      return {
        title: '纪念日详情'
      };
    }

    return {
      title: `${detail.title} | 还有 ${detail.days} 天`,
      query: `id=${encodeURIComponent(detail.id)}&isCustom=${detail.isCustom ? 'true' : 'false'}`
    };
  },

  onMore() {
    const itemList = this.data.anniversaryDetail && this.data.anniversaryDetail.isCustom
      ? ['编辑纪念日', '删除纪念日']
      : ['编辑纪念日'];

    wx.showActionSheet({
      itemList,
      success: (res) => {
        if (res.tapIndex === 0) {
          this.onEdit();
        } else if (res.tapIndex === 1) {
          this.onDelete();
        }
      }
    });
  },

  onEdit() {
    const detail = this.data.anniversaryDetail;
    if (!detail) {
      return;
    }

    this.loadReminderStatusAndOpen(!detail.isCustom, detail.id, {
      id: detail.id,
      title: detail.title,
      date: detail.rawDate || this.formatReminderDateValue(detail.date),
      iconText: detail.iconText || ''
    });
  },

  onDelete() {
    const detail = this.data.anniversaryDetail;
    if (!detail || !detail.isCustom) {
      return;
    }

    const app = getApp();
    wx.showModal({
      title: '删除纪念日',
      content: '确定要删除这个纪念日吗？',
      confirmText: '删除',
      confirmColor: '#dc2626',
      success: (res) => {
        if (!res.confirm) {
          return;
        }

        wx.showLoading({ title: '删除中...' });
        app.deleteAnniversaryFromServer(detail.id).then(() => {
          wx.hideLoading();
          wx.showToast({ title: '删除成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1200);
        }).catch((err) => {
          wx.hideLoading();
          console.error('删除失败:', err);
          wx.showToast({ title: '删除失败，请重试', icon: 'none' });
        });
      }
    });
  },

  onCloseModal() {
    this.setData({ showEditModal: false });
  },

  stopPropagation() {},

  onTitleInput(e) {
    this.setData({
      'newAnniversary.title': e.detail.value
    });
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

  onWechatReminderToggle(e) {
    const isChecked = e.detail.value;
    const detail = this.data.anniversaryDetail;
    if (!detail) return;

    if (isChecked) {
      const config = this.data.subscribeConfig;
      if (!config || !config.enabled || !config.templateId) {
        wx.showToast({ title: '订阅消息未配置', icon: 'none' });
        return;
      }

      const templateId = String(config.templateId).trim();
      wx.requestSubscribeMessage({
        tmplIds: [templateId],
        success: (res) => {
          const status = res[templateId];
          if (status === 'accept') {
            this.setData({ 'reminderStatus.wechatReminder': true });
            const app = getApp();
            app.saveReminderSubscription(this.buildReminderSubscribePayload(detail)).catch((err) => {
              console.error('保存订阅提醒失败:', err);
            });
            wx.showToast({ title: '已授权提醒', icon: 'success' });
          } else {
            wx.showToast({ title: '已取消订阅', icon: 'none' });
          }
        },
        fail: (err) => {
          console.error('请求订阅消息失败:', err);
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
        }
      });
    } else {
      this.setData({ 'reminderStatus.wechatReminder': false });
      const app = getApp();
      app.disableReminderSubscription(
        this.getReminderSourceKey(detail),
        detail.isCustom ? 'custom' : 'builtin'
      ).catch((err) => {
        console.error('关闭订阅提醒失败:', err);
      });
      wx.showToast({ title: '已关闭提醒', icon: 'none' });
    }
  },

  onCalendarReminderToggle(e) {
    const isChecked = e.detail.value;
    const detail = this.data.anniversaryDetail;
    if (!detail) return;

    if (isChecked) {
      this.addReminderToPhoneCalendar(detail, false);
      this.setData({ 'reminderStatus.calendarReminder': true });
    } else {
      const calendarKey = this.getLocalCalendarKey(detail);
      let hadCalendarReminder = false;
      try {
        hadCalendarReminder = wx.getStorageSync(calendarKey) === true;
        wx.removeStorageSync(calendarKey);
      } catch (err) {
        console.error('清除日历提醒状态失败:', err);
      }
      this.setData({ 'reminderStatus.calendarReminder': false });
      if (hadCalendarReminder) {
        wx.showModal({
          title: '日历提醒已关闭',
          content: '已关闭小程序内的日历提醒状态。如果之前已经加入手机系统日历，请前往系统日历手动删除对应事件。',
          showCancel: false
        });
      }
    }
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

      const templateId = String(config.templateId).trim();
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

  onCalendarReminderChange(e) {
    this.setData({ 'newAnniversary.calendarReminder': e.detail.value });
  },

  loadReminderStatus(detail) {
    if (!detail) {
      return;
    }

    const app = getApp();
    const keyItem = {
      id: detail.id,
      isCustom: detail.isCustom
    };

    let localCalendarStatus = false;
    try {
      localCalendarStatus = wx.getStorageSync(this.getLocalCalendarKey(keyItem)) === true;
    } catch (err) {
      console.error('读取本地日历状态失败:', err);
    }

    this.setData({
      reminderStatus: {
        ...this.data.reminderStatus,
        calendarReminder: localCalendarStatus
      }
    });

    app.checkReminderSubscriptionStatus(
      this.getReminderSourceKey(keyItem),
      detail.isCustom ? 'custom' : 'builtin'
    ).then((res) => {
      this.setData({
        reminderStatus: {
          wechatReminder: Boolean(res.data),
          calendarReminder: localCalendarStatus
        }
      });
    }).catch((err) => {
      console.error('查询订阅状态失败:', err);
      this.setData({
        reminderStatus: {
          wechatReminder: false,
          calendarReminder: localCalendarStatus
        }
      });
    });
  },

  loadReminderStatusAndOpen(isBuiltIn, id, basicData) {
    this.setData({
      showEditModal: true,
      newAnniversary: {
        ...basicData,
        wechatReminder: false,
        calendarReminder: false
      }
    });
  },

  onSaveAnniversary() {
    const app = getApp();
    const detail = this.data.anniversaryDetail;
    const { newAnniversary, currentIdol } = this.data;
    const title = String(newAnniversary.title || '').trim();
    const date = String(newAnniversary.date || '').trim();

    if (!detail || !title || !date) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    if (!detail.isCustom) {
      const updatedIdol = { ...currentIdol };
      if (detail.id === 'birthday') {
        updatedIdol.birthday = date;
      } else if (detail.id === 'debut') {
        updatedIdol.debutDate = date;
      }

      app.saveIdolToServer(updatedIdol).then(() => {
        wx.hideLoading();
        this.setData({ showEditModal: false });
        this.loadData();
        wx.showToast({ title: '修改成功', icon: 'success' });
      }).catch((err) => {
        wx.hideLoading();
        console.error('修改失败:', err);
        wx.showToast({ title: '修改失败，请重试', icon: 'none' });
      });
      return;
    }

    const iconText = this.getFirstDisplayChar(
      newAnniversary.iconText,
      this.getFirstDisplayChar(title, '纪')
    );

    app.saveAnniversaryToServer({
      id: detail.id,
      idolId: currentIdol.id,
      title,
      date,
      iconText,
      color: detail.color
    }).then(() => {
      wx.hideLoading();
      this.setData({ showEditModal: false });
      this.loadData();
      wx.showToast({ title: '修改成功', icon: 'success' });
    }).catch((err) => {
      wx.hideLoading();
      console.error('修改失败:', err);
      wx.showToast({ title: '修改失败，请重试', icon: 'none' });
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
      this.addReminderToPhoneCalendar(item, true);
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

  addReminderToPhoneCalendar(item, isAutoSet = false) {
    if (typeof wx.addPhoneCalendar !== 'function') {
      if (!isAutoSet) {
        wx.showToast({ title: '当前微信版本不支持', icon: 'none' });
      }
      return;
    }

    // 先检查权限状态
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.addPhoneCalendar']) {
          // 已有权限，直接添加日历
          this.createPhoneCalendarEvent(item, isAutoSet);
        } else {
          // 无权限，引导授权
          if (isAutoSet) return;
          this.setData({ 'reminderStatus.calendarReminder': false });

          wx.showModal({
            title: '需要日历权限',
            content: '开启后可把这条纪念日加入手机日历，并由系统在到期时提醒你。',
            confirmText: '去开启',
            success: (modalRes) => {
              if (!modalRes.confirm) return;

              wx.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting['scope.addPhoneCalendar']) {
                    wx.showToast({ title: '权限已开启，请重新点击开关', icon: 'none' });
                  } else {
                    wx.showToast({ title: '未开启日历权限', icon: 'none' });
                  }
                }
              });
            }
          });
        }
      },
      fail: () => {
        if (!isAutoSet) {
          wx.showToast({ title: '获取权限状态失败', icon: 'none' });
        }
      }
    });
  },

  createPhoneCalendarEvent(item, isAutoSet = false) {
    const eventDate = this.normalizeReminderDate(item.date);
    if (!eventDate) {
      if (!isAutoSet) {
        wx.showToast({ title: '提醒日期无效', icon: 'none' });
      }
      return;
    }

    const startTime = new Date(eventDate);
    startTime.setHours(9, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(10, 0, 0, 0);

    const idolName = this.data.currentIdol ? this.data.currentIdol.name : '爱豆';
    const dateLabel = this.formatReminderDateValue(eventDate);
    const localKey = this.getLocalCalendarKey(item);

    wx.addPhoneCalendar({
      title: item.title,
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      description: `和 ${idolName} 有关的重要日程：${item.title}\n日期：${dateLabel}\n来自：爱豆时光日记`,
      alarm: true,
      alarmOffset: 3600,
      success: () => {
        try {
          wx.setStorageSync(localKey, true);
        } catch (err) {
          console.error('保存日历状态失败:', err);
        }
        wx.showToast({ title: '已加入系统日历', icon: 'success' });
      },
      fail: (err) => {
        if (err && err.errMsg && err.errMsg.includes('cancel')) {
          return;
        }
        console.error('添加系统日历失败:', err);
        if (!isAutoSet) {
          wx.showToast({ title: '添加失败，请重试', icon: 'none' });
        }
      }
    });
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
  }
});
