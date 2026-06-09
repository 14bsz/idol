Page({
  data: {
    currentIdol: null,
    yearGroups: {},
    groupedEntries: [],
    collapsedYears: [],
    monthlyStats: {},
    yearlyStats: {},
    yearOptions: [],
    availableYears: [],
    selectedYear: 'all',
    yearFilterOptions: ['全部年份'],
    yearFilterIndex: 0,
    timelineSummary: {
      totalEntries: 0,
      totalImages: 0,
      totalYears: 0,
      latestDate: '',
      topMoodText: '满怀心动'
    },
    selectedYearSummary: {
      label: '全部年份',
      entryCount: 0,
      imageCount: 0,
      topMoodText: '满怀心动'
    }
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const app = getApp();
    const currentIdol = app.globalData.currentIdol;
    const entries = app.globalData.diaries.filter(d => d.idolId === currentIdol?.id);

    if (!currentIdol) {
      this.setData({
        currentIdol: null,
        yearGroups: {},
        groupedEntries: [],
        collapsedYears: [],
        monthlyStats: {},
        yearlyStats: {},
        yearOptions: [],
        availableYears: [],
        selectedYear: 'all',
        timelineSummary: {
          totalEntries: 0,
          totalImages: 0,
          totalYears: 0,
          latestDate: '',
          topMoodText: '满怀心动'
        },
        selectedYearSummary: {
          label: '全部年份',
          entryCount: 0,
          imageCount: 0,
          topMoodText: '满怀心动'
        }
      });
      return;
    }

    const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const yearGroups = {};
    const monthlyStats = {};
    const yearlyStats = {};
    const overallMoods = {};
    let totalImages = 0;

    sorted.forEach((entry, idx) => {
      const dateInfo = this.parseEntryDate(entry.createdAt);
      const year = dateInfo.year;
      const month = dateInfo.month;
      const yearMonth = `${year}-${month}`;
      const images = Array.isArray(entry.images) ? entry.images : [];
      const tags = Array.isArray(entry.tags) ? entry.tags : [];
      const mood = entry.mood || 'heart';

      if (!yearGroups[year]) yearGroups[year] = [];
      if (!yearlyStats[year]) {
        yearlyStats[year] = { count: 0, images: 0, moods: {} };
      }
      if (!monthlyStats[yearMonth]) {
        monthlyStats[yearMonth] = { count: 0, images: 0, moods: {} };
      }

      const cardType = this.getCardType({ ...entry, images }, idx);
      const moodEmoji = this.getMoodEmoji(mood);

      yearGroups[year].push({
        ...entry,
        createdAt: dateInfo.dateOnly,
        displayDate: dateInfo.displayDate,
        monthLabel: `${month} 月`,
        moodText: this.getMoodText(mood),
        moodEmoji,
        cardType,
        hasImages: images.length > 0,
        images,
        tags
      });

      totalImages += images.length;
      overallMoods[mood] = (overallMoods[mood] || 0) + 1;
      yearlyStats[year].count++;
      yearlyStats[year].images += images.length;
      yearlyStats[year].moods[mood] = (yearlyStats[year].moods[mood] || 0) + 1;
      monthlyStats[yearMonth].count++;
      monthlyStats[yearMonth].images += images.length;
      monthlyStats[yearMonth].moods[mood] = (monthlyStats[yearMonth].moods[mood] || 0) + 1;
    });

    const availableYears = Object.keys(yearGroups).sort((a, b) => b.localeCompare(a));
    const yearOptions = availableYears.map(year => ({
      year,
      count: yearlyStats[year]?.count || 0
    }));
    const selectedYear = this.getValidSelectedYear(this.data.selectedYear, availableYears);
    const yearFilterOptions = ['全部年份', ...availableYears.map(year => `${year} 年`)];
    const yearFilterIndex = this.getYearFilterIndex(selectedYear, availableYears);
    const timelineSummary = {
      totalEntries: sorted.length,
      totalImages,
      totalYears: availableYears.length,
      latestDate: sorted[0] ? this.parseEntryDate(sorted[0].createdAt).displayDate : '',
      topMoodText: this.getTopMoodText(overallMoods)
    };
    const groupedEntries = this.buildGroupedEntries(yearGroups, selectedYear, yearlyStats);
    const selectedYearSummary = this.buildSelectedYearSummary(
      selectedYear,
      availableYears,
      yearlyStats,
      timelineSummary
    );

    this.setData({
      currentIdol,
      yearGroups,
      groupedEntries,
      collapsedYears: selectedYear === 'all'
        ? this.data.collapsedYears.filter(year => availableYears.includes(year))
        : [],
      monthlyStats,
      yearlyStats,
      yearOptions,
      availableYears,
      selectedYear,
      yearFilterOptions,
      yearFilterIndex,
      timelineSummary,
      selectedYearSummary
    });
  },

  parseEntryDate(createdAt) {
    const raw = String(createdAt || '');
    const dateOnly = raw.split('T')[0].split(' ')[0];
    const parts = dateOnly.split('-');
    const year = parts[0] || '未知';
    const month = parts[1] || '01';
    const day = parts[2] || '01';

    return {
      dateOnly,
      year,
      month,
      day,
      displayDate: `${year}.${month}.${day}`
    };
  },

  getValidSelectedYear(selectedYear, availableYears) {
    if (selectedYear === 'all') {
      return 'all';
    }
    return availableYears.includes(selectedYear) ? selectedYear : 'all';
  },

  buildGroupedEntries(yearGroups, selectedYear, yearlyStats) {
    const targetYears = selectedYear === 'all'
      ? Object.keys(yearGroups)
      : [selectedYear];

    return targetYears
      .filter(year => year && yearGroups[year])
      .sort((a, b) => b.localeCompare(a))
      .map(year => ({
        year,
        entries: yearGroups[year],
        entryCount: yearlyStats[year]?.count || 0,
        imageCount: yearlyStats[year]?.images || 0,
        topMoodText: this.getTopMoodText(yearlyStats[year]?.moods)
      }));
  },

  getYearFilterIndex(selectedYear, availableYears) {
    if (selectedYear === 'all') {
      return 0;
    }

    const yearIndex = availableYears.findIndex(year => year === selectedYear);
    return yearIndex === -1 ? 0 : yearIndex + 1;
  },

  applySelectedYear(year) {
    const validYear = this.getValidSelectedYear(year, this.data.availableYears);
    const groupedEntries = this.buildGroupedEntries(this.data.yearGroups, validYear, this.data.yearlyStats);
    const selectedYearSummary = this.buildSelectedYearSummary(
      validYear,
      this.data.availableYears,
      this.data.yearlyStats,
      this.data.timelineSummary
    );

    this.setData({
      selectedYear: validYear,
      groupedEntries,
      collapsedYears: validYear === 'all' ? this.data.collapsedYears : [],
      selectedYearSummary,
      yearFilterIndex: this.getYearFilterIndex(validYear, this.data.availableYears)
    });
  },

  buildSelectedYearSummary(selectedYear, availableYears, yearlyStats, timelineSummary) {
    if (!availableYears.length) {
      return {
        label: '暂无记录',
        entryCount: 0,
        imageCount: 0,
        topMoodText: '等待记录'
      };
    }

    if (selectedYear === 'all') {
      return {
        label: '全部年份',
        entryCount: timelineSummary.totalEntries,
        imageCount: timelineSummary.totalImages,
        topMoodText: timelineSummary.topMoodText
      };
    }

    const currentYearStat = yearlyStats[selectedYear] || {};
    return {
      label: `${selectedYear} 年`,
      entryCount: currentYearStat.count || 0,
      imageCount: currentYearStat.images || 0,
      topMoodText: this.getTopMoodText(currentYearStat.moods)
    };
  },

  getCardType(entry, index) {
    const imageCount = entry.images?.length || 0;
    if (imageCount >= 3) return 'large';
    if (imageCount === 2) return 'medium';
    if (imageCount === 1) return 'small-image';
    if (index % 3 === 0) return 'highlight';
    return 'default';
  },

  getMoodEmoji(mood) {
    const map = {
      'heart': '💗',
      'excited': '🎉',
      'healing': '🌙',
      'missing': '💭',
      'breakdown': '😢'
    };
    return map[mood] || '💗';
  },

  onBack() {
    wx.navigateBack();
  },

  selectYear(e) {
    const year = e.currentTarget.dataset.year || 'all';
    this.applySelectedYear(year);
  },

  onYearFilterChange(e) {
    const index = Number(e.detail.value || 0);
    const year = index === 0 ? 'all' : this.data.availableYears[index - 1];
    this.applySelectedYear(year);
  },

  toggleYear(e) {
    if (this.data.selectedYear !== 'all') {
      return;
    }

    const year = e.currentTarget.dataset.year;
    const collapsedYears = this.data.collapsedYears.includes(year)
      ? this.data.collapsedYears.filter(y => y !== year)
      : [...this.data.collapsedYears, year];
    this.setData({ collapsedYears });
  },

  getMoodText(mood) {
    const map = {
      'heart': '满怀心动',
      'excited': '激动上头',
      'healing': '治愈时刻',
      'missing': '想念满格',
      'breakdown': '感动落泪'
    };
    return map[mood] || '满怀心动';
  },

  getTopMood(moods) {
    if (!moods) return 'heart';
    const sorted = Object.entries(moods).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : 'heart';
  },

  getTopMoodText(moods) {
    return this.getMoodText(this.getTopMood(moods));
  },

  // 分享给朋友
  onShareAppMessage(res) {
    const app = getApp();
    const idol = this.data.currentIdol;
    const idolName = idol ? idol.name : '爱豆';
    return {
      title: `${idolName}的时光轴 - 记录每个重要时刻`,
      path: '/pages/timeline/timeline',
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    };
  },

  // 分享到朋友圈
  onShareTimeline(res) {
    const app = getApp();
    const idol = this.data.currentIdol;
    const idolName = idol ? idol.name : '爱豆';
    return {
      title: `${idolName}的时光轴 - 爱豆时光日记`,
      imageUrl: idol && idol.bannerImage ? idol.bannerImage : ''
    };
  }
})
