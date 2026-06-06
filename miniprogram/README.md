# 爱豆时光日记 - 微信小程序版

## 项目说明

这是一个记录追星日记应用的微信小程序版本，已完成基本框架搭建。

## 目录结构

```
miniprogram/
├── app.js              # 小程序入口文件
├── app.json            # 小程序配置文件
├── app.wxss           # 全局样式文件
├── sitemap.json       # 站点地图配置
├── pages/             # 页面目录
│   ├── home/         # 首页
│   ├── diary/        # 日记页
│   ├── collection/   # 收藏页
│   └── profile/     # 个人中心
├── utils/            # 工具函数
└── images/          # 图片资源
```

## 已实现功能

### 1. 首页 (home
- 爱豆信息展示
- 入坑天数统计
- 日记数量统计
- 重要日程展示
- 横幅壁纸更换功能
- 点击横幅弹出管理菜单

### 2. 日记页 (diary)
- 日记列表展示
- 按日期排序
- 心情标签展示
- 图片预览

### 3. 收藏页 (collection)
- 收藏网格展示
- 分类筛选（全部、神图、小卡、物料、语录）
- 分类标签显示

### 4. 个人中心 (profile)
- 用户信息展示
- 功能菜单（追星月报、时光轴、日程提醒）
- 数据导出功能
- 微信登录功能

### 5. 微信登录
- 微信登录流程已集成
- 用户信息获取
- 本地数据存储

## 使用说明

### 1. 在微信开发者工具中打开

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 选择"导入项目"
4. 项目目录选择 `miniprogram` 文件夹
5. 填写 AppID 可以选择"测试号"进行开发

### 2. 配置 TabBar 图标

在 `images/` 目录下需要放置以下图标文件：
- home.png / home-active.png
- diary.png / diary-active.png
- collection.png / collection-active.png
- profile.png / profile-active.png

（目前使用 Emoji 代替，图标可以后续替换。

### 3. 配置后端服务

在 `app.js` 中修改后端 API 地址：
```javascript
sendCodeToServer(code) {
  wx.request({
    url: 'https://your-api.com/api/login', // 修改为你的后端地址
    // ...
  });
}
```

## 待完善功能

以下功能目前为占位符，需要进一步开发：

- 写日记功能
- 查看日记详情
- 添加收藏功能
- 查看收藏详情
- 切换/添加爱豆
- 日程管理
- 追星月报
- 时光轴
- 后端 API 对接

## 微信登录后端接口

### 后端需要实现的接口

1. **登录接口**
- 路径：`POST /api/login`
- 参数：`{ code: string }`
- 返回：`{ token: string, openid: string }`

2. **获取用户信息**（可选）
- 路径：`GET /api/user/info`
- Header：`Authorization: Bearer {token}`

## 数据存储

小程序使用微信小程序本地存储（Storage）存储数据，包括：
- idol_diaries_idols - 爱豆列表
- idol_diaries_entries - 日记列表
- idol_diaries_collections - 收藏列表
- idol_diaries_current_id - 当前爱豆ID
- token - 登录token
- userInfo - 用户信息

## 注意事项

1. **开发阶段可以使用测试号，上线需要申请正式的小程序 AppID
2. 上线前需要在微信公众平台配置服务器域名白名单
3. 图片资源建议使用 CDN 或云存储
4. 用户隐私数据需要加密存储

## 技术栈

- 微信小程序原生开发
- WXML / WXSS / JavaScript
- 微信小程序 Storage API
- 微信登录 API
