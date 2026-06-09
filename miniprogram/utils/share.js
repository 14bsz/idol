/**
 * 微信小程序分享功能统一管理
 */

const app = getApp();

/**
 * 获取分享给朋友的配置
 * @param {Object} options 自定义配置
 * @returns {Object} 分享配置对象
 */
function getShareConfig(options = {}) {
  const defaultConfig = {
    title: '爱豆时光日记 - 记录追星的每一刻',
    path: '/pages/home/home',
    imageUrl: '' // 可以设置一个默认的分享图片
  };

  return {
    title: options.title || defaultConfig.title,
    path: options.path || defaultConfig.path,
    imageUrl: options.imageUrl || defaultConfig.imageUrl
  };
}

/**
 * 获取分享到朋友圈的配置
 * @param {Object} options 自定义配置
 * @returns {Object} 朋友圈分享配置对象
 */
function getTimelineConfig(options = {}) {
  const defaultConfig = {
    title: '爱豆时光日记 - 记录追星的每一刻',
    query: '',
    imageUrl: '' // 可以设置一个默认的分享图片
  };

  return {
    title: options.title || defaultConfig.title,
    query: options.query || defaultConfig.query,
    imageUrl: options.imageUrl || defaultConfig.imageUrl
  };
}

/**
 * 为页面混入分享功能
 * @param {Object} pageConfig 页面配置
 * @param {Object} shareOptions 分享配置
 * @returns {Object} 混入分享功能后的页面配置
 */
function mixinShare(pageConfig, shareOptions = {}) {
  const originalOnShareAppMessage = pageConfig.onShareAppMessage;
  const originalOnShareTimeline = pageConfig.onShareTimeline;

  // 转发给朋友
  pageConfig.onShareAppMessage = function(res) {
    // 如果原页面有自定义的分享配置，优先使用
    if (originalOnShareAppMessage && typeof originalOnShareAppMessage === 'function') {
      return originalOnShareAppMessage.call(this, res);
    }

    // 使用传入的自定义配置或默认配置
    const config = typeof shareOptions.appMessage === 'function' 
      ? shareOptions.appMessage.call(this, res)
      : shareOptions.appMessage || {};

    return getShareConfig(config);
  };

  // 分享到朋友圈
  pageConfig.onShareTimeline = function(res) {
    // 如果原页面有自定义的分享配置，优先使用
    if (originalOnShareTimeline && typeof originalOnShareTimeline === 'function') {
      return originalOnShareTimeline.call(this, res);
    }

    // 使用传入的自定义配置或默认配置
    const config = typeof shareOptions.timeline === 'function'
      ? shareOptions.timeline.call(this, res)
      : shareOptions.timeline || {};

    return getTimelineConfig(config);
  };

  return pageConfig;
}

/**
 * 首页分享配置
 */
function getHomeShareConfig() {
  return {
    appMessage: function() {
      const idol = app.globalData.currentIdol;
      const idolName = idol ? idol.name : '我的爱豆';
      return {
        title: `我在追${idolName}，一起来记录追星的美好时光吧！`,
        path: '/pages/home/home',
        imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
      };
    },
    timeline: function() {
      const idol = app.globalData.currentIdol;
      const idolName = idol ? idol.name : '我的爱豆';
      return {
        title: `爱豆时光日记 - 记录追${idolName}的每一刻`,
        imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
      };
    }
  };
}

/**
 * 日记详情分享配置
 */
function getDiaryShareConfig(diary) {
  return {
    appMessage: {
      title: diary.title || '我的追星日记',
      path: `/pages/diary-detail/diary-detail?id=${diary.id}`,
      imageUrl: diary.images && diary.images[0] ? diary.images[0] : ''
    },
    timeline: {
      title: diary.title || '我的追星日记',
      query: `id=${diary.id}`,
      imageUrl: diary.images && diary.images[0] ? diary.images[0] : ''
    }
  };
}

/**
 * 纪念日分享配置
 */
function getAnniversaryShareConfig(anniversary) {
  return {
    appMessage: {
      title: `${anniversary.title} - 爱豆时光日记`,
      path: `/pages/anniversary-detail/anniversary-detail?id=${anniversary.id}`,
      imageUrl: anniversary.coverImage || ''
    },
    timeline: {
      title: `${anniversary.title} - 爱豆时光日记`,
      query: `id=${anniversary.id}`,
      imageUrl: anniversary.coverImage || ''
    }
  };
}

/**
 * 收藏分享配置
 */
function getCollectionShareConfig() {
  return {
    appMessage: {
      title: '我的追星收藏，记录那些珍贵的瞬间',
      path: '/pages/collection/collection'
    },
    timeline: {
      title: '爱豆时光日记 - 我的追星收藏'
    }
  };
}

/**
 * 时间轴分享配置
 */
function getTimelineShareConfig() {
  const idol = app.globalData.currentIdol;
  const idolName = idol ? idol.name : '爱豆';
  return {
    appMessage: {
      title: `${idolName}的时光轴 - 记录每一个重要时刻`,
      path: '/pages/timeline/timeline',
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    },
    timeline: {
      title: `${idolName}的时光轴 - 爱豆时光日记`,
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    }
  };
}

module.exports = {
  getShareConfig,
  getTimelineConfig,
  mixinShare,
  getHomeShareConfig,
  getDiaryShareConfig,
  getAnniversaryShareConfig,
  getCollectionShareConfig,
  getTimelineShareConfig
};
