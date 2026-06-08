const { CLOUD_ENV_ID, CLOUD_SERVICE_NAME, getRuntimeEnvVersion, getApiBaseUrl, getUploadUrl, getApiConfigError, useCloudContainer } = require('./utils/env');

App({
  globalData: {
    userInfo: null,
    token: null,
    userId: null,
    authChecked: false,
    currentIdol: null,
    idols: [],
    diaries: [],
    collections: [],
    anniversaries: []
  },

  baseUrl: '',
  uploadUrl: '',
  envVersion: 'develop',
  useCloud: false,      // 是否走云托管调用
  apiConfigError: '',
  restoreSessionPromise: null,

  onLaunch() {
    console.log('[App] 启动，开始初始化');
    this.initApiConfig();
    console.log('[App] API配置完成:', {
      envVersion: this.envVersion,
      useCloud: this.useCloud,
      baseUrl: this.baseUrl,
      uploadUrl: this.uploadUrl,
      apiConfigError: this.apiConfigError
    });
    
    // 初始化云开发（云托管调用依赖 wx.cloud）
    if (wx.cloud) {
      try {
        wx.cloud.init({ 
          env: CLOUD_ENV_ID, 
          traceUser: true 
        });
        console.log('[App] 云开发初始化成功, env:', CLOUD_ENV_ID);
      } catch (e) {
        console.error('[App] 云开发初始化失败:', e);
      }
    } else {
      console.warn('[App] wx.cloud 不可用，可能影响云托管功能');
    }
    
    this.loadAuthFromStorage();
    this.restoreSession();
  },

  initApiConfig() {
    this.envVersion = getRuntimeEnvVersion();
    this.useCloud = useCloudContainer(this.envVersion);
    this.baseUrl = getApiBaseUrl(this.envVersion);
    this.uploadUrl = getUploadUrl(this.envVersion);
    this.apiConfigError = getApiConfigError(this.baseUrl, this.envVersion);
  },

  ensureApiReady(actionText) {
    // 云托管模式不依赖 baseUrl，始终可用
    if (this.useCloud) return '';
    if (!this.baseUrl || this.apiConfigError) {
      return this.apiConfigError || `当前环境未配置可用接口地址，无法${actionText || '发起请求'}。`;
    }
    return '';
  },

  loadAuthFromStorage() {
    try {
      const token = wx.getStorageSync('token');
      const userId = wx.getStorageSync('userId');
      const userInfo = wx.getStorageSync('userInfo');

      if (token) {
        this.globalData.token = token;
        if (userId) this.globalData.userId = userId;
        if (userInfo) this.globalData.userInfo = userInfo;
      } else {
        this.globalData.authChecked = true;
        this.globalData.userInfo = null;
        this.globalData.token = null;
        this.globalData.userId = null;
        this.globalData.currentIdol = null;
        this.globalData.idols = [];
        this.globalData.diaries = [];
        this.globalData.collections = [];
        this.globalData.anniversaries = [];
      }
    } catch (e) {
      console.error('加载本地数据失败', e);
    }
  },

  saveAuthToStorage() {
    wx.setStorageSync('token', this.globalData.token);
    wx.setStorageSync('userId', this.globalData.userId);
    wx.setStorageSync('userInfo', this.globalData.userInfo);
  },

  resolveMediaUrl(url) {
    if (!url) {
      return url;
    }
    if (/^(https?:|data:|wxfile:|file:)/.test(url)) {
      return url;
    }
    if (url.startsWith('/')) {
      if (this.useCloud) {
        // 云托管模式：使用公网 HTTPS 地址拼接（文件访问走公网）
        return 'https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com' + url;
      }
      if (!this.baseUrl) {
        return url;
      }
      return this.baseUrl.replace(/\/api$/, '') + url;
    }
    return url;
  },

  normalizeIdol(idol) {
    return {
      id: idol.id,
      name: idol.name,
      nickname: idol.nickname,
      avatar: this.resolveMediaUrl(idol.avatar),
      bannerImage: this.resolveMediaUrl(idol.bannerImage),
      supportColor: idol.supportColor,
      debutDate: idol.debutDate,
      birthday: idol.birthday,
      entryDate: idol.entryDate
    };
  },

  normalizeCollection(collection) {
    return {
      id: collection.id,
      idolId: collection.idolId,
      imageUrl: this.resolveMediaUrl(collection.imageUrl),
      category: collection.category,
      notes: collection.notes,
      createdAt: collection.createdAt
    };
  },

  normalizeDiaryMediaItem(media) {
    if (!media) {
      return null;
    }
    if (typeof media === 'string') {
      return {
        type: 'image',
        url: this.resolveMediaUrl(media)
      };
    }
    const type = media.type || 'image';
    return {
      ...media,
      type,
      url: this.resolveMediaUrl(media.url)
    };
  },

  normalizeDiary(diary) {
    let tagsArray = [];
    if (diary.tags) {
      if (typeof diary.tags === 'string') {
        try {
          tagsArray = JSON.parse(diary.tags);
        } catch (e) {
          tagsArray = [];
        }
      } else if (Array.isArray(diary.tags)) {
        tagsArray = diary.tags;
      }
    }

    let imagesArray = [];
    if (diary.images) {
      if (typeof diary.images === 'string') {
        try {
          imagesArray = JSON.parse(diary.images);
        } catch (e) {
          imagesArray = [];
        }
      } else if (Array.isArray(diary.images)) {
        imagesArray = diary.images;
      }
    }

    return {
      id: diary.id,
      idolId: diary.idolId,
      content: diary.content,
      mood: diary.mood,
      template: diary.template,
      tags: tagsArray,
      images: imagesArray
        .map(item => this.normalizeDiaryMediaItem(item))
        .filter(item => item && item.url),
      pinned: diary.pinned || 0,
      createdAt: diary.createdAt,
      createTime: diary.createTime,
      updateTime: diary.updateTime
    };
  },

  isTemporaryMediaUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    return /^(wxfile:|file:|http:\/\/tmp\/|https:\/\/tmp\/)/i.test(url);
  },

  hasTemporaryDiaryMedia(images) {
    if (!Array.isArray(images) || !images.length) {
      return false;
    }
    return images.some(item => {
      const url = typeof item === 'string' ? item : item?.url;
      return this.isTemporaryMediaUrl(url);
    });
  },

  prepareDiaryImagesForSave(images) {
    if (!Array.isArray(images) || !images.length) {
      return Promise.resolve([]);
    }

    return Promise.all(images.map((item) => {
      const media = this.normalizeDiaryMediaItem(item);
      if (!media || !media.url) {
        return Promise.resolve(null);
      }
      if (!this.isTemporaryMediaUrl(media.url)) {
        return Promise.resolve(media);
      }
      return this.uploadFile(media.url).then((uploadRes) => ({
        ...media,
        url: this.resolveMediaUrl(uploadRes.data.url)
      }));
    })).then(items => items.filter(item => item && item.url));
  },

  ensureDiaryMediaPersisted(diary) {
    if (!diary || !this.hasTemporaryDiaryMedia(diary.images) || !diary.id) {
      return Promise.resolve(this.normalizeDiary(diary));
    }

    return this.saveDiaryToServer(diary)
      .then(() => {
        const latestDiary = this.globalData.diaries.find(item => item.id == diary.id);
        return latestDiary || this.normalizeDiary(diary);
      })
      .catch((err) => {
        console.error('修复日记媒体失败:', err);
        return this.normalizeDiary(diary);
      });
  },

  clearAllData() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userId');
    wx.removeStorageSync('userInfo');
    this.globalData = {
      userInfo: null,
      token: null,
      userId: null,
      authChecked: true,
      currentIdol: null,
      idols: [],
      diaries: [],
      collections: [],
      anniversaries: []
    };
  },

  saveData() {
    try {
      wx.setStorageSync('idols', this.globalData.idols);
      wx.setStorageSync('diaries', this.globalData.diaries);
      wx.setStorageSync('collections', this.globalData.collections);
      wx.setStorageSync('anniversaries', this.globalData.anniversaries);
      if (this.globalData.currentIdol) {
        wx.setStorageSync('currentIdol', this.globalData.currentIdol);
      }
    } catch (e) {
      console.error('保存数据失败', e);
    }
  },

  loadDataFromStorage() {
    try {
      const idols = wx.getStorageSync('idols');
      const diaries = wx.getStorageSync('diaries');
      const collections = wx.getStorageSync('collections');
      const anniversaries = wx.getStorageSync('anniversaries');
      const currentIdol = wx.getStorageSync('currentIdol');
      
      if (idols) this.globalData.idols = idols.map(idol => this.normalizeIdol(idol));
      if (diaries) this.globalData.diaries = diaries.map(diary => this.normalizeDiary(diary));
      if (collections) this.globalData.collections = collections.map(collection => this.normalizeCollection(collection));
      if (anniversaries) this.globalData.anniversaries = anniversaries;
      if (currentIdol) this.globalData.currentIdol = this.normalizeIdol(currentIdol);
    } catch (e) {
      console.error('加载本地数据失败', e);
    }
  },

  checkLoginAndRedirect() {
    if (this.globalData.authChecked && !this.globalData.token) {
      wx.reLaunch({ url: '/pages/login/login' });
    }
  },

  isLoggedIn() {
    return this.globalData.authChecked && !!this.globalData.token;
  },

  restoreSession() {
    if (this.restoreSessionPromise) {
      return this.restoreSessionPromise;
    }

    if (!this.globalData.token) {
      this.globalData.authChecked = true;
      this.checkLoginAndRedirect();
      return Promise.resolve(false);
    }

    this.globalData.authChecked = false;
    this.restoreSessionPromise = this.fetchAllDataFromServer()
      .then(() => true)
      .catch((err) => {
        console.error('恢复登录态失败:', err);
        return false;
      })
      .finally(() => {
        this.globalData.authChecked = true;
        this.restoreSessionPromise = null;
        this.checkLoginAndRedirect();
      });

    return this.restoreSessionPromise;
  },

  wechatLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            this.sendCodeToServer(res.code).then(resolve).catch(reject);
          } else {
            reject(new Error('获取登录凭证失败'));
          }
        },
        fail: () => {
          reject(new Error('微信登录失败'));
        }
      });
    });
  },

  sendCodeToServer(code) {
    return new Promise((resolve, reject) => {
      const apiError = this.ensureApiReady('登录');
      if (apiError) {
        reject(new Error(apiError));
        return;
      }

      const handleResponse = (data) => {
        if (data.code === 200) {
          const { token, userId, nickname, avatarUrl } = data.data;
          this.globalData.token = token;
          this.globalData.userId = userId;
          this.globalData.userInfo = { nickname, avatarUrl };
          this.globalData.authChecked = false;

          this.saveAuthToStorage();

          this.fetchAllDataFromServer().then(() => {
            this.globalData.authChecked = true;
            resolve();
          }).catch((err) => {
            console.error('从服务器拉取数据失败:', err);
            this.globalData.authChecked = true;
            resolve();
          });
        } else {
          reject(new Error(data.message || '登录失败'));
        }
      };

      if (this.useCloud) {
        // ── 云托管调用 ──
        wx.cloud.callContainer({
          config: { env: CLOUD_ENV_ID },
          path: '/api/auth/login',
          header: { 'X-WX-SERVICE': CLOUD_SERVICE_NAME, 'Content-Type': 'application/json' },
          method: 'POST',
          data: { code },
          success: (res) => {
            console.log('[云托管登录] statusCode:', res.statusCode, 'data:', JSON.stringify(res.data));
            if (res.statusCode === 200) {
              handleResponse(res.data);
            } else {
              reject(new Error((res.data && res.data.message) || '登录失败'));
            }
          },
          fail: (error) => {
            console.error('[云托管登录] fail:', JSON.stringify(error));
            reject(new Error('网络请求失败，请稍后重试'));
          }
        });
      } else {
        // ── 开发环境直连 ──
        wx.request({
          url: this.baseUrl + '/auth/login',
          method: 'POST',
          data: { code },
          success: (response) => {
            if (response.statusCode === 200) {
              handleResponse(response.data);
            } else {
              reject(new Error(response.data.message || '登录失败'));
            }
          },
          fail: (error) => {
            console.error('登录请求失败', error);
            reject(new Error(this.apiConfigError || '网络请求失败，请检查网络连接'));
          }
        });
      }
    });
  },

  fetchAllDataFromServer() {
    return Promise.all([
      this.fetchIdolsFromServer(),
      this.fetchDiariesFromServer(),
      this.fetchCollectionsFromServer(),
      this.fetchAnniversariesFromServer()
    ]);
  },

  fetchIdolsFromServer() {
    return new Promise((resolve, reject) => {
      this.request({ url: '/idols', method: 'GET' })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            this.globalData.idols = res.data.map(idol => this.normalizeIdol(idol));
            if (this.globalData.idols.length > 0) {
              let savedCurrentIdol = null;
              try {
                savedCurrentIdol = wx.getStorageSync('currentIdol');
              } catch (e) {
                console.error('读取保存的当前爱豆失败', e);
              }
              
              if (savedCurrentIdol && savedCurrentIdol.id) {
                const matchedIdol = this.globalData.idols.find(i => i.id == savedCurrentIdol.id);
                if (matchedIdol) {
                  this.globalData.currentIdol = matchedIdol;
                } else {
                  this.globalData.currentIdol = this.globalData.idols[0];
                }
              } else {
                this.globalData.currentIdol = this.globalData.idols[0];
              }
            }
          }
          resolve();
        })
        .catch((err) => {
          console.error('获取爱豆列表失败:', err);
          reject(err);
        });
    });
  },

  fetchDiariesFromServer() {
    return new Promise((resolve, reject) => {
      this.request({ url: '/diaries', method: 'GET' })
        .then((res) => {
          if (res.data) {
            this.globalData.diaries = res.data.map(diary => this.normalizeDiary(diary));
          }
          resolve();
        })
        .catch((err) => {
          console.error('获取日记列表失败:', err);
          reject(err);
        });
    });
  },

  fetchCollectionsFromServer() {
    return new Promise((resolve, reject) => {
      this.request({ url: '/collections', method: 'GET' })
        .then((res) => {
          if (res.data) {
            this.globalData.collections = res.data.map(collect => this.normalizeCollection(collect));
          }
          resolve();
        })
        .catch((err) => {
          console.error('获取收藏列表失败:', err);
          reject(err);
        });
    });
  },

  fetchAnniversariesFromServer() {
    return new Promise((resolve, reject) => {
      this.request({ url: '/anniversaries', method: 'GET' })
        .then((res) => {
          if (res.data) {
            this.globalData.anniversaries = res.data.map(ann => ({
              id: ann.id,
              idolId: ann.idolId,
              title: ann.title,
              date: ann.date,
              iconText: ann.iconText,
              color: ann.color
            }));
          }
          resolve();
        })
        .catch((err) => {
          console.error('获取纪念日列表失败:', err);
          reject(err);
        });
    });
  },

  saveIdolToServer(idol) {
    return new Promise((resolve, reject) => {
      const data = {
        name: idol.name,
        nickname: idol.nickname,
        avatar: idol.avatar,
        bannerImage: idol.bannerImage,
        supportColor: idol.supportColor,
        debutDate: idol.debutDate,
        birthday: idol.birthday,
        entryDate: idol.entryDate
      };
      
      if (idol.id) {
        this.request({ 
          url: '/idols/' + idol.id, 
          method: 'PUT', 
          data 
        }).then((res) => {
          this.fetchIdolsFromServer().then(() => resolve(res));
        }).catch(reject);
      } else {
        this.request({ 
          url: '/idols', 
          method: 'POST', 
          data 
        }).then((res) => {
          this.fetchIdolsFromServer().then(() => resolve(res));
        }).catch(reject);
      }
    });
  },

  deleteIdolFromServer(id) {
    return new Promise((resolve, reject) => {
      this.request({ url: '/idols/' + id, method: 'DELETE' })
        .then((res) => {
          this.fetchIdolsFromServer().then(() => resolve(res));
        }).catch(reject);
    });
  },

  saveDiaryToServer(diary) {
    return new Promise((resolve, reject) => {
      this.prepareDiaryImagesForSave(diary.images || [])
        .then((preparedImages) => {
          const data = {
            idolId: diary.idolId,
            content: diary.content,
            mood: diary.mood,
            template: diary.template,
            tags: diary.tags || [],
            images: preparedImages
          };
          
          if (diary.id) {
            this.request({ 
              url: '/diaries/' + diary.id, 
              method: 'PUT', 
              data 
            }).then((res) => {
              this.fetchDiariesFromServer().then(() => {
                const savedDiary = this.globalData.diaries.find(item => item.id == (res.data?.id || diary.id));
                resolve(savedDiary || this.normalizeDiary({ ...diary, ...res.data, images: preparedImages }));
              });
            }).catch(reject);
          } else {
            this.request({ 
              url: '/diaries', 
              method: 'POST', 
              data 
            }).then((res) => {
              this.fetchDiariesFromServer().then(() => {
                const savedDiary = this.globalData.diaries.find(item => item.id == res.data?.id);
                resolve(savedDiary || this.normalizeDiary({ ...diary, ...res.data, images: preparedImages }));
              });
            }).catch(reject);
          }
        })
        .catch(reject);
    });
  },

  deleteDiaryFromServer(id) {
    return new Promise((resolve, reject) => {
      this.request({ url: '/diaries/' + id, method: 'DELETE' })
        .then((res) => {
          this.fetchDiariesFromServer().then(() => resolve(res));
        }).catch(reject);
    });
  },

  saveCollectionToServer(collection) {
    return new Promise((resolve, reject) => {
      const data = {
        idolId: collection.idolId,
        imageUrl: collection.imageUrl,
        category: collection.category,
        notes: collection.notes,
        tags: collection.tags || ''
      };
      
      if (collection.id) {
        this.request({ 
          url: '/collections/' + collection.id, 
          method: 'PUT', 
          data 
        }).then((res) => {
          this.fetchCollectionsFromServer().then(() => resolve(res));
        }).catch(reject);
      } else {
        this.request({ 
          url: '/collections', 
          method: 'POST', 
          data 
        }).then((res) => {
          this.fetchCollectionsFromServer().then(() => resolve(res));
        }).catch(reject);
      }
    });
  },

  deleteCollectionFromServer(id) {
    return new Promise((resolve, reject) => {
      this.request({ url: '/collections/' + id, method: 'DELETE' })
        .then((res) => {
          this.fetchCollectionsFromServer().then(() => resolve(res));
        }).catch(reject);
    });
  },

  saveAnniversaryToServer(anniversary) {
    return new Promise((resolve, reject) => {
      const data = {
        idolId: anniversary.idolId,
        title: anniversary.title,
        date: anniversary.date,
        iconText: anniversary.iconText,
        color: anniversary.color || '#FFB6C1'
      };
      
      if (anniversary.id) {
        this.request({ 
          url: '/anniversaries/' + anniversary.id, 
          method: 'PUT', 
          data 
        }).then((res) => {
          this.fetchAnniversariesFromServer().then(() => resolve(res));
        }).catch(reject);
      } else {
        this.request({ 
          url: '/anniversaries', 
          method: 'POST', 
          data 
        }).then((res) => {
          this.fetchAnniversariesFromServer().then(() => resolve(res));
        }).catch(reject);
      }
    });
  },

  deleteAnniversaryFromServer(id) {
    return new Promise((resolve, reject) => {
      this.request({ url: '/anniversaries/' + id, method: 'DELETE' })
        .then((res) => {
          this.fetchAnniversariesFromServer().then(() => resolve(res));
        }).catch(reject);
    });
  },

  updateUserInfo(updateData) {
    return new Promise((resolve, reject) => {
      const currentUserInfo = this.globalData.userInfo || {};
      const data = {
        ...currentUserInfo,
        ...updateData
      };
      
      this.request({ 
        url: '/auth/user/info', 
        method: 'PUT', 
        data 
      }).then((res) => {
        this.globalData.userInfo = {
          ...this.globalData.userInfo,
          ...updateData
        };
        this.saveAuthToStorage();
        resolve(res);
      }).catch(reject);
    });
  },

  getReminderSubscribeConfig() {
    return this.request({
      url: '/reminder-subscriptions/config',
      method: 'GET'
    }).then(res => res.data);
  },

  saveReminderSubscription(payload) {
    return this.request({
      url: '/reminder-subscriptions/subscribe',
      method: 'POST',
      data: payload
    });
  },

  disableReminderSubscription(sourceKey, sourceType) {
    return this.request({
      url: '/reminder-subscriptions/unsubscribe',
      method: 'POST',
      data: {
        sourceKey,
        sourceType
      }
    });
  },

  checkReminderSubscriptionStatus(sourceKey, sourceType) {
    return this.request({
      url: '/reminder-subscriptions/status',
      method: 'GET',
      data: {
        sourceKey: sourceKey,
        sourceType: sourceType
      }
    });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '确定退出',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          this.clearAllData();
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/login/login' });
          }, 1500);
        }
      }
    });
  },

  uploadFile(filePath) {
    return new Promise((resolve, reject) => {
      const apiError = this.ensureApiReady('上传文件');
      if (apiError) {
        reject(new Error(apiError));
        return;
      }

      const header = {};

      if (this.globalData.token) {
        header['Authorization'] = this.globalData.token;
      }

      console.log('[文件上传] 开始上传', {
        uploadUrl: this.uploadUrl,
        useCloud: this.useCloud,
        envVersion: this.envVersion,
        filePath: filePath
      });

      // 云托管模式仍走 wx.uploadFile，但使用云托管公网 HTTPS 地址
      // wx.cloud.callContainer 不支持文件上传
      wx.uploadFile({
        url: this.uploadUrl,
        filePath: filePath,
        name: 'file',
        header: header,
        success: (response) => {
          console.log('[文件上传] 完整响应', {
            statusCode: response.statusCode,
            data: response.data,
            header: response.header
          });
          
          // 检查 HTTP 状态码
          if (response.statusCode !== 200) {
            console.error('[文件上传] HTTP错误', {
              statusCode: response.statusCode,
              data: response.data
            });
            reject(new Error(`上传失败 (HTTP ${response.statusCode}): ${response.data || '服务器错误'}`));
            return;
          }
          
          // 解析响应数据
          try {
            const data = JSON.parse(response.data);
            console.log('[文件上传] 解析后的数据', data);
            
            if (data.code === 200) {
              resolve(data);
            } else {
              reject(new Error(data.message || '上传失败'));
            }
          } catch (parseError) {
            console.error('[文件上传] JSON解析失败', {
              parseError: parseError.message,
              rawData: response.data
            });
            reject(new Error('服务器响应格式错误'));
          }
        },
        fail: (error) => {
          console.error('[文件上传] 网络请求失败', {
            error: error,
            uploadUrl: this.uploadUrl,
            useCloud: this.useCloud,
            envVersion: this.envVersion
          });
          reject(new Error('文件上传失败，请检查网络连接'));
        }
      });
    });
  },

  request(options) {
    return new Promise((resolve, reject) => {
      const apiError = this.ensureApiReady('请求数据');
      if (apiError) {
        reject(new Error(apiError));
        return;
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      if (this.globalData.token) {
        headers['Authorization'] = this.globalData.token;
      }

      const handleResponse = (statusCode, data) => {
        if (statusCode === 200) {
          if (data.code === 200) {
            resolve(data);
          } else {
            reject(new Error(data.message || '请求失败'));
          }
        } else if (statusCode === 401) {
          this.clearAllData();
          wx.reLaunch({ url: '/pages/login/login' });
          reject(new Error('登录已过期，请重新登录'));
        } else {
          reject(new Error('请求失败'));
        }
      };

      if (this.useCloud) {
        // ── 云托管调用 ──
        const requestPath = '/api' + options.url;
        console.log('[云托管请求] path:', requestPath, 'method:', options.method, 'data:', JSON.stringify(options.data));
        
        wx.cloud.callContainer({
          config: { env: CLOUD_ENV_ID },
          path: requestPath,
          header: { ...headers, 'X-WX-SERVICE': CLOUD_SERVICE_NAME },
          method: options.method || 'GET',
          data: options.data,
          success: (res) => {
            console.log('[云托管响应] statusCode:', res.statusCode, 'data:', JSON.stringify(res.data));
            handleResponse(res.statusCode, res.data);
          },
          fail: (error) => {
            console.error('[云托管请求失败] path:', requestPath, 'error:', JSON.stringify(error));
            reject(new Error('网络请求失败: ' + (error.errMsg || '请稍后重试')));
          }
        });
      } else {
        // ── 开发环境直连 ──
        wx.request({
          url: this.baseUrl + options.url,
          method: options.method || 'GET',
          data: options.data,
          header: headers,
          success: (response) => {
            handleResponse(response.statusCode, response.data);
          },
          fail: (error) => {
            console.error('接口请求失败', error);
            reject(new Error(this.apiConfigError || '网络请求失败，请检查网络连接或合法域名配置'));
          }
        });
      }
    });
  }
})
