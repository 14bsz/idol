Component({
  data: {
    selected: 0,
    color: '#94a3b8',
    selectedColor: '#ec4899',
    list: [
      {
        pagePath: '/pages/home/home',
        text: '主页',
        icon: '/images/home.svg',
        selectedIcon: '/images/home-active.svg'
      },
      {
        pagePath: '/pages/diary/diary',
        text: '日记',
        icon: '/images/diary.svg',
        selectedIcon: '/images/diary-active.svg'
      },
      {
        pagePath: '/pages/collection/collection',
        text: '收藏',
        icon: '/images/collection.svg',
        selectedIcon: '/images/collection-active.svg'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '回顾',
        icon: '/images/profile.svg',
        selectedIcon: '/images/profile-active.svg'
      }
    ]
  },

  attached() {
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
    }
  }
})
