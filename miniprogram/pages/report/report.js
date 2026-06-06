Page({
  data: {
    currentIdol: null,
    stats: {
      count: 0,
      collectionCount: 0,
      imageCount: 0,
      topMood: 'heart',
      monthName: ''
    },
    progressData: {
      percent: 0,
      daysLeft: 0,
      nextTitle: '下一个纪念日'
    }
  },

  onLoad() {
    this.loadData();
  },

  loadData() {
    const app = getApp();
    const currentIdol = app.globalData.currentIdol;
    const entries = app.globalData.diaries.filter(d => d.idolId === currentIdol?.id);
    const collections = app.globalData.collections.filter(c => c.idolId === currentIdol?.id);

    if (currentIdol) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const anniversaries = this.buildAnniversaries(currentIdol, app.globalData.anniversaries);
      
      const monthlyEntries = entries.filter(e => {
        const date = new Date(e.createdAt);
        return date >= monthStart && date <= monthEnd;
      });

      const monthlyCollections = collections.filter(c => {
        const date = new Date(c.createdAt);
        return date >= monthStart && date <= monthEnd;
      });

      const moodCounts = monthlyEntries.reduce((acc, e) => {
        acc[e.mood] = (acc[e.mood] || 0) + 1;
        return acc;
      }, {});

      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

      const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      const monthName = monthNames[now.getMonth()];
      
      const { progress, nextDays, nextTitle } = this.calculateAnniversaryProgress(now, anniversaries);

      // --- New Stats Calculation ---
      const activeDaysSet = new Set();
      monthlyEntries.forEach(e => activeDaysSet.add(e.createdAt.split('T')[0]));
      monthlyCollections.forEach(c => activeDaysSet.add(c.createdAt.split('T')[0]));
      const activeDays = activeDaysSet.size;

      const tagCounts = {};
      monthlyEntries.forEach(e => {
        (e.tags || []).forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(t => t[0]).slice(0, 3);
      const topTags = sortedTags.length > 0 ? sortedTags : ['心动', '日常'];

      const wordsCount = monthlyEntries.reduce((acc, e) => acc + (e.content ? e.content.length : 0), 0);

      const allImages = [
        ...monthlyEntries.reduce((acc, e) => {
          const images = e.images || [];
          return acc.concat(images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean));
        }, []),
        ...monthlyCollections.map(c => c.imageUrl).filter(Boolean)
      ];
      const bestMoments = allImages.sort(() => 0.5 - Math.random());

      const quotes = [
        "因为有你，所有的日子都闪闪发亮。",
        "不仅是你的偶像，更是我平淡生活里的英雄。",
        "山河远阔，人间星河，无一不是你。",
        "喜欢你这件事，本身就是一种超能力。",
        "在最美的时刻遇见你，是这辈子最幸运的事。",
        "你是我的满目星河，也是我的万物复苏。",
        "追星不仅仅是在追那个人，也是在追逐那个更好的自己。",
        "你是我疲惫生活里的英雄梦想。",
        "追着光，靠近光，成为光。",
        "每一帧关于你的画面，都值得我珍藏。",
        "感谢你出现在我的青春里。",
        "你是治愈一切的良药。",
        "喜欢是藏不住的，捂住嘴巴也会从眼睛里跑出来。",
        "你是我平凡生活里的一束光。",
        "星河璀璨，你是人间理想。",
        "你逆光而来，配得上这世间所有的美好。",
        "喜欢你的每一天，都闪闪发光。",
        "你是我冗长岁月里的小确幸。",
        "无论世界如何，你永远是我的首选。",
        "遇见你，是我最美丽的意外。",
        "你是我疲惫生活中的温柔梦想。",
        "每一个喜欢你的日子，都值得被纪念。",
        "你是我平淡生活里的调味剂。",
        "星光不问赶路人，时光不负有心人。",
        "你是我藏在心底的温柔。",
        "喜欢你，是我做过最棒的事。",
        "你是我黯淡生活里的星辰大海。",
        "感谢你的出现，温柔了我的岁月。",
        "你是我永远的光和热。",
        "喜欢的人，闪闪发光。",
        "你是我生命中最美的遇见。"
      ];
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const quoteIndex = dayOfYear % quotes.length;
      const todayQuote = quotes[quoteIndex];
      
      const moodConfigMap = {
        'heart': { text: '满怀心动', emoji: '🥰', color: 'pink' },
        'crying': { text: '泪目感动', emoji: '😭', color: 'blue' },
        'healing': { text: '治愈温暖', emoji: '✨', color: 'amber' },
        'excited': { text: '狂喜不断', emoji: '🎉', color: 'rose' },
        'missing': { text: '深情想念', emoji: '🥺', color: 'purple' }
      };
      const finalMood = topMood ? topMood[0] : 'heart';
      const moodConfig = moodConfigMap[finalMood] || moodConfigMap['heart'];
      // ----------------------------

      this.setData({
        currentIdol,
        stats: {
          count: monthlyEntries.length,
          collectionCount: monthlyCollections.length,
          imageCount: allImages.length,
          topMood: finalMood,
          moodConfig,
          monthName,
          activeDays,
          topTags,
          wordsCount,
          bestMoments,
          quote: todayQuote
        },
        progressData: {
          percent: progress,
          daysLeft: nextDays,
          nextTitle
        }
      });
    }
  },

  buildAnniversaries(currentIdol, customAnniversaries = []) {
    const list = [];

    if (currentIdol?.birthday) {
      list.push({
        title: `${currentIdol.name}生日`,
        date: currentIdol.birthday
      });
    }

    if (currentIdol?.debutDate) {
      list.push({
        title: '出道纪念日',
        date: currentIdol.debutDate
      });
    }

    const customList = (customAnniversaries || [])
      .filter(item => item.idolId === currentIdol?.id && item.date)
      .map(item => ({
        title: item.title || '自定义纪念日',
        date: item.date
      }));

    return [...list, ...customList];
  },

  calculateAnniversaryProgress(now, anniversaries) {
    if (!anniversaries || anniversaries.length === 0) {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      const yearTotalDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
      const daysPassed = (now - startOfYear) / (1000 * 60 * 60 * 24);
      
      return {
        progress: Math.min(100, Math.max(0, Math.round((daysPassed / yearTotalDays) * 100))),
        nextDays: Math.ceil(yearTotalDays - daysPassed),
        nextTitle: '今年结束'
      };
    }

    let upcomingAnniversaries = [];
    const currentYear = now.getFullYear();

    anniversaries.forEach(ann => {
      const annDate = new Date(ann.date);
      const thisYearAnnDate = new Date(currentYear, annDate.getMonth(), annDate.getDate());
      
      if (thisYearAnnDate >= now) {
        upcomingAnniversaries.push({
          date: thisYearAnnDate,
          title: ann.title
        });
      } else {
        upcomingAnniversaries.push({
          date: new Date(currentYear + 1, annDate.getMonth(), annDate.getDate()),
          title: ann.title
        });
      }
    });

    upcomingAnniversaries.sort((a, b) => a.date - b);
    const nextAnn = upcomingAnniversaries[0];
    
    const daysLeft = Math.ceil((nextAnn.date - now) / (1000 * 60 * 60 * 24));
    let progress = Math.round(((365 - daysLeft) / 365) * 100);
    
    progress = Math.min(100, Math.max(0, progress));

    return {
      progress,
      nextDays: daysLeft,
      nextTitle: nextAnn.title
    };
  },

  onBack() {
    wx.navigateBack();
  },

  onShare() {
    wx.showToast({ title: '分享功能开发中', icon: 'none' });
  },

  getTopMoodText(mood) {
    const map = {
      'heart': '满怀心动',
      'excited': '狂喜不断',
      'healing': '治愈温暖',
      'missing': '深情想念'
    };
    return map[mood] || '满怀心动';
  }
})
