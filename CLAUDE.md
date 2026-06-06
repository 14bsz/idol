# 爱豆时光日记 - 项目全局配置

## 项目概述
这是一个微信小程序项目，用于记录和管理偶像相关的日记、收藏、纪念日等内容。

## 技术栈
- 前端: React + TypeScript + Vite + Tailwind CSS
- 后端: Spring Boot + MyBatis-Plus + MySQL + Redis
- 小程序: 微信小程序原生开发

## Skill 配置
以下 Skill 在本项目中全局启用，用于前端代码生成时优先保证视觉高级感和交互动效：

### 1. frontend-design
- **路径**: ./skills/frontend-design/SKILL.md
- **用途**: 创建独特的、生产级前端界面，避免通用的 AI 美学
- **重点**: 大胆的审美方向、独特的字体选择、鲜明的色彩主题、精心设计的动效

### 2. ui-ux-pro-max
- **路径**: ./skills/ui-ux-pro-max/SKILL.md
- **用途**: 提供专业的 UI/UX 设计智能，包含 50+ 样式、161 配色、57 字体配对
- **重点**: 行业特定设计系统生成、无障碍设计、触摸交互优化、响应式布局

### 3. interaction-design
- **路径**: ./skills/interaction-design/SKILL.md
- **用途**: 设计和实现微交互、动效设计、过渡动画和用户反馈模式
- **重点**: 目的明确的动效、时间控制指南、缓动函数、状态过渡流畅性

### 4. wechat-miniprogram-design
- **路径**: ./skills/wechat-miniprogram-design/SKILL.md
- **用途**: 微信小程序官方设计规范顾问
- **重点**: 微信小程序 UI 设计、组件规范、尺寸标准、审核红线、合规自查

## 前端代码生成原则
1. **视觉高级感优先**: 优先使用 frontend-design 的设计思维，选择大胆且一致的审美方向
2. **交互动效完善**: 同时应用 interaction-design 的微交互和动效设计原则
3. **专业设计系统**: 遵循 ui-ux-pro-max 的设计数据库，确保专业级别的视觉效果
4. **小程序规范**: 微信小程序相关代码必须遵循 wechat-miniprogram-design 的官方规范
5. **技术栈适配**: 前端代码使用 React + TypeScript + Tailwind CSS，后端使用 Spring Boot

## 代码规范
- 所有新建代码文件使用 UTF-8 格式
- 文件命名要有区分度，不同页面目录里的文件不能重名
- 代码使用 setup 语法糖实现（Vue）或函数组件（React）
- 禁止修改无关代码和样式
- 生成的页面上默认图片从 https://picsum.photos/ 引用

## 注意事项
- 前端页面修改完成后不用每次都 npm run build
- 后端文件修改后，需要提示用户手动重启后端服务
- 数据库在 E:\mysql-8.0.33-winx64，账号: root，密码: 123456
- Redis 在 E:\Redis\Redis-x64-5.0.14.1，无密码
