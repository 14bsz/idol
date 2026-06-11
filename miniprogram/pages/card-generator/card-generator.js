const templates = [
  { id: 'minimal-korean', name: '韩系简约', bgColor: 'bg-white', textColor: 'text-slate-800' },
  { id: 'dreamy-gradient', name: '梦幻渐变', bgColor: 'bg-gradient', textColor: 'text-slate-700' },
  { id: 'vintage-paper', name: '复古报刊', bgColor: 'bg-vintage', textColor: 'text-vintage-text' },
  { id: 'dark-idol', name: '酷飒黑金', bgColor: 'bg-dark', textColor: 'text-white' },
];

const PHOTO_SCOPE = 'scope.writePhotosAlbum';
const PHOTO_AUTH_DENY_RE = /auth deny|auth denied|authorize no response|permission/i;

Page({
  data: {
    entry: null,
    idol: null,
    templates: templates,
    selectedTemplate: templates[0],
    isGenerating: false,
    showToast: false,
    displayContent: '',
    displayDate: '',
    displayImage: '',
    idolAvatar: '',
    shareTitle: '爱豆时光日记',
    shareImage: ''
  },

  getTemplateRenderConfig(templateId) {
    const drawRadial = (ctx, x, y, radius, color0, color1, stop1 = 0.72, blur = 0) => {
      ctx.save();
      if (blur) {
        ctx.shadowBlur = blur;
        ctx.shadowColor = color0;
      }
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, color0);
      grad.addColorStop(stop1, color1);
      grad.addColorStop(1, color1); // extend to edge
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const configs = {
      'minimal-korean': {
        textColor: '#1e293b',
        mutedColor: 'rgba(30, 41, 59, 0.56)',
        dividerColor: 'rgba(30, 41, 59, 0.12)',
        badgeBg: 'rgba(255, 255, 255, 0.88)',
        badgeText: '#475569',
        tagBg: 'rgba(255, 255, 255, 0.58)',
        tagText: '#64748b',
        avatarBorder: 'rgba(255, 255, 255, 0.72)',
        imageBorder: 'rgba(255, 255, 255, 0.72)',
        footerColor: 'rgba(30, 41, 59, 0.52)',
        brandColor: 'rgba(30, 41, 59, 0.34)',
        backgroundPainter: (ctx, width, height, rpx) => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          
          // .deco-bg
          ctx.save();
          ctx.shadowBlur = rpx(48);
          ctx.shadowColor = 'rgba(252, 228, 236, 0.3)';
          ctx.fillStyle = 'rgba(252, 228, 236, 0.3)';
          ctx.beginPath();
          ctx.arc(width - rpx(128) + rpx(80), rpx(128) - rpx(80), rpx(128), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // top accent
          drawRadial(ctx, width + rpx(12) - rpx(110), -rpx(32) + rpx(110), rpx(110), 'rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0)');
          // bottom accent
          drawRadial(ctx, -rpx(36) + rpx(100), height - rpx(120) - rpx(100), rpx(100), 'rgba(236, 253, 245, 0.65)', 'rgba(236, 253, 245, 0)', 0.7);
        }
      },
      'dreamy-gradient': {
        textColor: '#334155',
        mutedColor: 'rgba(51, 65, 85, 0.62)',
        dividerColor: 'rgba(51, 65, 85, 0.14)',
        badgeBg: 'rgba(255, 240, 246, 0.94)',
        badgeText: '#be185d',
        tagBg: '#ffe4ef', // will use gradient in renderCardToCanvas
        tagText: '#be185d',
        avatarBorder: 'rgba(255, 255, 255, 0.82)',
        imageBorder: 'rgba(255, 255, 255, 0.82)',
        footerColor: 'rgba(51, 65, 85, 0.56)',
        brandColor: 'rgba(51, 65, 85, 0.36)',
        backgroundPainter: (ctx, width, height, rpx) => {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#FFF5F7');
          grad.addColorStop(0.5, '#FFF0F6');
          grad.addColorStop(1, '#F0F7FF');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          drawRadial(ctx, width + rpx(12) - rpx(110), -rpx(32) + rpx(110), rpx(110), 'rgba(251, 207, 232, 0.92)', 'rgba(251, 207, 232, 0)', 0.72, rpx(10));
          drawRadial(ctx, -rpx(36) + rpx(100), height - rpx(120) - rpx(100), rpx(100), 'rgba(219, 234, 254, 0.8)', 'rgba(219, 234, 254, 0)', 0.72, rpx(12));
        }
      },
      'vintage-paper': {
        textColor: '#4a4a4a',
        mutedColor: 'rgba(74, 74, 74, 0.72)',
        dividerColor: 'rgba(91, 73, 49, 0.18)',
        badgeBg: 'rgba(111, 88, 61, 0.94)',
        badgeText: '#f8f1e5',
        tagBg: 'rgba(215, 199, 174, 0.82)',
        tagText: '#6b4f32',
        avatarBorder: 'rgba(120, 96, 64, 0.2)',
        imageBorder: 'rgba(120, 96, 64, 0.2)',
        footerColor: 'rgba(74, 74, 74, 0.58)',
        brandColor: 'rgba(74, 74, 74, 0.5)',
        backgroundPainter: (ctx, width, height, rpx) => {
          ctx.fillStyle = '#f4f1ea';
          ctx.fillRect(0, 0, width, height);

          drawRadial(ctx, width + rpx(12) - rpx(110), -rpx(32) + rpx(110), rpx(110), 'rgba(215, 199, 174, 0.48)', 'rgba(215, 199, 174, 0)');
          drawRadial(ctx, -rpx(36) + rpx(100), height - rpx(120) - rpx(100), rpx(100), 'rgba(190, 174, 151, 0.4)', 'rgba(190, 174, 151, 0)');
        }
      },
      'dark-idol': {
        textColor: '#ffffff',
        mutedColor: 'rgba(250, 204, 21, 0.76)',
        dividerColor: 'rgba(255, 255, 255, 0.2)',
        badgeBg: 'rgba(15, 23, 42, 0.88)',
        badgeText: '#facc15',
        tagBg: 'rgba(250, 204, 21, 0.12)',
        tagText: '#fde68a',
        avatarBorder: 'rgba(250, 204, 21, 0.36)',
        imageBorder: 'rgba(250, 204, 21, 0.28)',
        footerColor: 'rgba(255, 255, 255, 0.76)',
        brandColor: 'rgba(255, 255, 255, 0.76)',
        backgroundPainter: (ctx, width, height, rpx) => {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.42, '#111827');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          drawRadial(ctx, width + rpx(12) - rpx(110), -rpx(32) + rpx(110), rpx(110), 'rgba(250, 204, 21, 0.2)', 'rgba(250, 204, 21, 0)');
          drawRadial(ctx, -rpx(36) + rpx(100), height - rpx(120) - rpx(100), rpx(100), 'rgba(147, 51, 234, 0.18)', 'rgba(147, 51, 234, 0)');
        }
      }
    };

    return configs[templateId] || configs['minimal-korean'];
  },

  resolveImageUrl(image) {
    const app = getApp();
    if (!image) {
      return '';
    }
    if (typeof image === 'string') {
      return app.resolveMediaUrl(image);
    }
    if (typeof image === 'object' && image.type === 'video') {
      return '';
    }
    if (typeof image === 'object' && image.url) {
      return app.resolveMediaUrl(image.url);
    }
    return '';
  },

  getFirstDisplayImage(images) {
    if (!images || !images.length) {
      return '';
    }
    for (let i = 0; i < images.length; i++) {
      const current = images[i];
      const imageUrl = this.resolveImageUrl(current);
      if (imageUrl) {
        return imageUrl;
      }
    }
    return '';
  },

  buildShareTitle(entry, idol) {
    const idolName = idol?.name || '爱豆';
    const content = (entry?.content || '').replace(/\s+/g, ' ').trim();
    if (!content) {
      return idolName + '的心动卡片';
    }
    return idolName + '：' + content.slice(0, 18) + (content.length > 18 ? '...' : '');
  },

  buildSharePayload() {
    const imageUrl = this.data.shareImage || '';
    const idol = this.data.idol;
    const entry = this.data.entry;
    const payload = {
      title: this.data.shareTitle || '爱豆时光日记',
      path: idol && entry 
        ? `/pages/diary-detail/diary-detail?id=${encodeURIComponent(entry.id)}&idolId=${encodeURIComponent(idol.id)}` 
        : '/pages/diary/diary'
    };

    if (imageUrl) {
      payload.imageUrl = imageUrl;
    }

    return payload;
  },

  shouldKeepOriginalShareImage(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return false;
    }
    return /^https?:\/\//i.test(imageUrl);
  },

  prepareShareImage(imageUrl) {
    if (!imageUrl) {
      return;
    }

    // Remote URLs are more stable for WeChat share cards than the
    // temporary paths returned by wx.getImageInfo().
    if (this.shouldKeepOriginalShareImage(imageUrl)) {
      this.setData({ shareImage: imageUrl });
      return;
    }

    wx.getImageInfo({
      src: imageUrl,
      success: (res) => {
        const localShareImage = res.path || imageUrl;
        this.setData({ shareImage: localShareImage });
      },
      fail: () => {}
    });
  },

  prepareCardDisplayImage(imageUrl, fallbackUrl = '') {
    if (!imageUrl) {
      this.setData({ displayImage: fallbackUrl || '' });
      return;
    }

    wx.getImageInfo({
      src: imageUrl,
      success: (res) => {
        this.setData({ displayImage: res.path || imageUrl });
      },
      fail: () => {
        this.setData({ displayImage: imageUrl || fallbackUrl || '' });
      }
    });
  },

  onLoad(options) {
    const app = getApp();
    const entry = app.globalData.sharingEntry;
    const idol = app.globalData.currentIdol;

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    if (entry && idol) {
      app.ensureDiaryMediaPersisted(entry).then((persistedEntry) => {
        const currentEntry = persistedEntry || entry;
        const firstImage = this.getFirstDisplayImage(currentEntry.images);
        const idolAvatar = this.resolveImageUrl(idol.avatar);
        const idolBanner = this.resolveImageUrl(idol.bannerImage);
        const fallbackImage = idolBanner || idolAvatar || '';
        const shareImage = firstImage || fallbackImage;
        this.setData({
          entry: currentEntry,
          idol,
          displayContent: currentEntry.content,
          displayDate: currentEntry.createdAt.replace(/-/g, '.'),
          displayImage: '',
          idolAvatar,
          idolBanner,
          fallbackImage,
          shareTitle: this.buildShareTitle(currentEntry, idol),
          shareImage
        });
        this.prepareCardDisplayImage(firstImage, fallbackImage);
        this.prepareShareImage(shareImage);
      });
    }
  },

  onCardImageLoad(e) {
    this.prepareShareImage(this.data.shareImage || this.data.displayImage);
  },

  onCardImageError(e) {
    if (this.data.fallbackImage && this.data.displayImage !== this.data.fallbackImage) {
      this.setData({ displayImage: this.data.fallbackImage });
    }
  },

  onShareAppMessage() {
    return this.buildSharePayload();
  },

  onShareTimeline() {
    const payload = this.buildSharePayload();
    const timelinePayload = {
      title: payload.title
    };

    if (payload.imageUrl) {
      timelinePayload.imageUrl = payload.imageUrl;
    }

    return timelinePayload;
  },

  onClose() {
    wx.navigateBack();
  },

  selectTemplate(e) {
    const template = e.currentTarget.dataset.template;
    this.setData({
      selectedTemplate: template
    });
  },

  getCanvasNode() {
    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery().in(this);
      // 同时获取预览卡片的尺寸和画布节点
      query.select('#cardCanvas').boundingClientRect();
      query.select('#saveCardCanvas').fields({ node: true, size: true });
      
      query.exec((res) => {
        const previewRect = res && res[0];
        const canvasResult = res && res[1];

        if (!previewRect) {
          reject(new Error('未找到预览卡片'));
          return;
        }
        if (!canvasResult || !canvasResult.node) {
          reject(new Error('未找到保存画布'));
          return;
        }

        const canvas = canvasResult.node;
        const ctx = canvas.getContext('2d');
        
        // 保存 UI 尺寸用于渲染参考
        this.uiWidth = previewRect.width;
        this.uiHeight = previewRect.height;
        
        resolve({ canvas, ctx });
      });
    });
  },

  ensureLocalImage(url) {
    if (!url) {
      return Promise.resolve('');
    }

    if (/^(wxfile:|file:|data:)/i.test(url)) {
      return Promise.resolve(url);
    }

    return new Promise((resolve) => {
      wx.getImageInfo({
        src: url,
        success: (res) => resolve(res.path || url),
        fail: () => resolve(url)
      });
    });
  },

  loadCanvasImage(canvas, url) {
    return this.ensureLocalImage(url).then((localPath) => {
      if (!localPath) {
        return '';
      }

      return new Promise((resolve, reject) => {
        const image = canvas.createImage();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('图片加载失败'));
        image.src = localPath;
      }).catch(() => '');
    });
  },


  fillRoundRect(ctx, x, y, width, height, radius, fillStyle) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + safeRadius, safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.arcTo(x, y + height, x, y + height - safeRadius, safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.arcTo(x, y, x + safeRadius, y, safeRadius);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.restore();
  },

  strokeRoundRect(ctx, x, y, width, height, radius, strokeStyle, lineWidth = 2) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + safeRadius, safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.arcTo(x, y + height, x, y + height - safeRadius, safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.arcTo(x, y, x + safeRadius, y, safeRadius);
    ctx.closePath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.restore();
  },

  clipRoundRect(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + safeRadius, safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.arcTo(x, y + height, x, y + height - safeRadius, safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.arcTo(x, y, x + safeRadius, y, safeRadius);
    ctx.closePath();
    ctx.clip();
  },

  drawCoverImage(ctx, image, x, y, width, height, radius = 0) {
    if (!image) {
      return;
    }

    const imageRatio = image.width / image.height;
    const targetRatio = width / height;
    let sourceWidth = image.width;
    let sourceHeight = image.height;
    let sourceX = 0;
    let sourceY = 0;

    if (imageRatio > targetRatio) {
      sourceWidth = image.height * targetRatio;
      sourceX = (image.width - sourceWidth) / 2;
    } else {
      sourceHeight = image.width / targetRatio;
      sourceY = (image.height - sourceHeight) / 2;
    }

    ctx.save();
    if (radius > 0) {
      this.clipRoundRect(ctx, x, y, width, height, radius);
    }
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
    ctx.restore();
  },

  drawCircleImage(ctx, image, x, y, size) {
    if (!image) {
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    this.drawCoverImage(ctx, image, x, y, size, size);
    ctx.restore();
  },

  wrapText(ctx, text, maxWidth, maxLines = 5) {
    const content = (text || '').trim();
    if (!content) {
      return [''];
    }

    const chars = content.split('');
    const lines = [];
    let current = '';

    for (let i = 0; i < chars.length; i++) {
      const next = current + chars[i];
      if (ctx.measureText(next).width <= maxWidth || !current) {
        current = next;
      } else {
        lines.push(current);
        current = chars[i];
      }

      if (lines.length === maxLines) {
        break;
      }
    }

    if (lines.length < maxLines && current) {
      lines.push(current);
    }

    if (lines.length === maxLines && chars.join('').length > lines.join('').length) {
      const lastIndex = lines.length - 1;
      let lastLine = lines[lastIndex];
      while (lastLine && ctx.measureText(lastLine + '...').width > maxWidth) {
        lastLine = lastLine.slice(0, -1);
      }
      lines[lastIndex] = (lastLine || '').trimEnd() + '...';
    }

    return lines;
  },

  drawCenteredTextBlock(ctx, lines, centerX, startY, lineHeight, color) {
    ctx.save();
    ctx.fillStyle = color;
    lines.forEach((line, index) => {
      const metrics = ctx.measureText(line);
      const x = centerX - metrics.width / 2;
      ctx.fillText(line, x, startY + index * lineHeight);
    });
    ctx.restore();
  },

  drawCardBackground(ctx, config) {
    config.backgroundPainter(ctx);
  },

  async renderCardToCanvas() {
    const { canvas, ctx } = await this.getCanvasNode();
    const selectedTemplate = this.data.selectedTemplate || templates[0];
    const theme = this.getTemplateRenderConfig(selectedTemplate.id);
    
    // 生成逻辑与 UI 解耦：固定使用 750 作为逻辑宽度基准，导出 9:16 高清图
    const BASE_WIDTH = 750;
    const SCALE = 3; // 高清倍率
    const CARD_WIDTH = BASE_WIDTH * SCALE;
    const CARD_HEIGHT = (CARD_WIDTH * 16) / 9; // 强制 9:16 全屏比例
    
    const rpx = (val) => val * SCALE;
    const PADDING = rpx(40);
    const INNER_WIDTH = CARD_WIDTH - PADDING * 2;
    
    const avatarImage = await this.loadCanvasImage(canvas, this.data.idolAvatar || this.data.idol?.avatar || '');
    const coverImage = await this.loadCanvasImage(canvas, this.data.displayImage || this.data.shareImage || '');

    // 配置画布物理像素尺寸
    const dpr = wx.getSystemInfoSync().pixelRatio || 1;
    canvas.width = CARD_WIDTH * dpr;
    canvas.height = CARD_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    // 清空并初始化
    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    ctx.textBaseline = 'top';

    // 1. 绘制背景和圆角裁切
    ctx.save();
    this.clipRoundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, rpx(40));
    theme.backgroundPainter(ctx, CARD_WIDTH, CARD_HEIGHT, rpx);
    
    // 2. 绘制卡片边框
    const strokeColor = selectedTemplate.id === 'vintage-paper' ? 'rgba(120, 96, 64, 0.16)' : 
                       selectedTemplate.id === 'dark-idol' ? 'rgba(250, 204, 21, 0.18)' : 'rgba(255, 255, 255, 0.18)';
    this.strokeRoundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, rpx(40), strokeColor, rpx(1));

    // --- 顶部区域 (Header) ---
    let cursorY = PADDING;
    if (avatarImage) {
      this.fillRoundRect(ctx, PADDING - rpx(4), cursorY - rpx(4), rpx(96), rpx(96), rpx(48), theme.avatarBorder);
      this.drawCircleImage(ctx, avatarImage, PADDING, cursorY, rpx(88));
    }

    ctx.font = `bold ${rpx(18)}px sans-serif`;
    ctx.fillStyle = selectedTemplate.id === 'dark-idol' ? 'rgba(250, 204, 21, 0.76)' : theme.textColor;
    ctx.globalAlpha = selectedTemplate.id === 'dark-idol' ? 1 : (selectedTemplate.id === 'vintage-paper' ? 0.72 : 0.56);
    ctx.fillText('WITH', PADDING + rpx(108), cursorY + rpx(16));
    ctx.globalAlpha = 1;

    ctx.fillStyle = theme.textColor;
    ctx.font = `bold italic ${rpx(32)}px sans-serif`;
    if (selectedTemplate.id === 'vintage-paper') {
        ctx.font = `bold ${rpx(32)}px serif`;
    }
    ctx.fillText((this.data.idol?.name || '爱豆').slice(0, 14), PADDING + rpx(108), cursorY + rpx(42));

    // --- 底部区域 (Footer) ---
    const footerHeight = rpx(20) + rpx(30) + rpx(12) + rpx(12) + rpx(24);
    const footerY = CARD_HEIGHT - PADDING - footerHeight + rpx(12);

    // --- 中间内容区域 (Content) ---
    const headerBottomY = cursorY + rpx(88) + rpx(12);
    const contentAreaHeight = footerY - headerBottomY - rpx(32) - rpx(24);
    
    // 预计算内容元素总高度
    const isSerifFont = this.data.entry?.template === 'serif';
    const fontSize = isSerifFont ? rpx(42) : rpx(32);
    const textLineHeight = isSerifFont ? fontSize * 1.72 : fontSize * 1.8;
    ctx.font = `${isSerifFont ? 'normal' : '600'} italic ${fontSize}px ${isSerifFont ? "Georgia, 'Times New Roman', Times, serif" : "sans-serif"}`;
    const quoteLines = this.wrapText(ctx, `"${this.data.displayContent || ''}"`, INNER_WIDTH, coverImage ? 8 : 12);
    
    // 在 9:16 比例下，图片占据更多空间以保证美感
    let imageHeight = 0;
    if (coverImage) {
      imageHeight = Math.min(contentAreaHeight * 0.55, rpx(800)); 
    }
    
    const elementsHeight = (coverImage ? (imageHeight + rpx(32)) : 0) + rpx(48) + rpx(20) + rpx(24) + rpx(20) + (quoteLines.length * textLineHeight);
    
    // 计算居中偏移
    const contentStartY = headerBottomY + rpx(32) + Math.max(0, (contentAreaHeight - elementsHeight) / 2);
    cursorY = contentStartY;

    // 绘制图片
    if (coverImage) {
      const imageRadius = selectedTemplate.id === 'vintage-paper' ? rpx(16) : rpx(32);
      this.fillRoundRect(ctx, PADDING, cursorY, INNER_WIDTH, imageHeight, imageRadius, '#f8fafc');
      
      if (selectedTemplate.id === 'vintage-paper') {
        ctx.save();
        ctx.filter = 'saturate(0.82) contrast(0.94)';
        this.drawCoverImage(ctx, coverImage, PADDING, cursorY, INNER_WIDTH, imageHeight, imageRadius);
        ctx.restore();
      } else {
        this.drawCoverImage(ctx, coverImage, PADDING, cursorY, INNER_WIDTH, imageHeight, imageRadius);
      }
      
      this.strokeRoundRect(ctx, PADDING, cursorY, INNER_WIDTH, imageHeight, imageRadius, theme.imageBorder, rpx(2));

      // 渐变叠加
      const overlayGradient = ctx.createLinearGradient(0, cursorY + imageHeight - rpx(160), 0, cursorY + imageHeight);
      overlayGradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
      const overlayColor = selectedTemplate.id === 'dark-idol' ? 'rgba(15, 23, 42, 0.44)' : 
                          selectedTemplate.id === 'dreamy-gradient' ? 'rgba(244, 114, 182, 0.2)' :
                          selectedTemplate.id === 'vintage-paper' ? 'rgba(91, 73, 49, 0.14)' : 'rgba(15, 23, 42, 0.18)';
      overlayGradient.addColorStop(1, overlayColor);
      this.fillRoundRect(ctx, PADDING, cursorY + imageHeight - rpx(160), INNER_WIDTH, rpx(160), imageRadius, overlayGradient);

      // Badge
      ctx.font = `bold ${rpx(20)}px sans-serif`;
      const badgeText = "TODAY'S PICK";
      const badgeWidth = ctx.measureText(badgeText).width + rpx(40);
      this.fillRoundRect(ctx, PADDING + rpx(24), cursorY + rpx(24), badgeWidth, rpx(52), rpx(26), theme.badgeBg);
      ctx.fillStyle = theme.badgeText;
      ctx.fillText(badgeText, PADDING + rpx(24) + rpx(20), cursorY + rpx(24) + rpx(16));

      cursorY += imageHeight + rpx(32);
    }

    // Tag
    ctx.font = `bold ${rpx(20)}px sans-serif`;
    const tagText = 'IDOL MEMORY CARD';
    const tagWidth = ctx.measureText(tagText).width + rpx(44);
    const tagX = (CARD_WIDTH - tagWidth) / 2;
    
    this.fillRoundRect(ctx, tagX, cursorY, tagWidth, rpx(48), rpx(24), theme.tagBg);
    ctx.fillStyle = theme.tagText;
    ctx.fillText(tagText, tagX + rpx(22), cursorY + rpx(14));

    cursorY += rpx(48) + rpx(20);

    // Divider
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.1;
    const lineW = (INNER_WIDTH - rpx(28) - rpx(32)) / 2;
    ctx.fillRect(PADDING, cursorY + rpx(12), lineW, rpx(2));
    ctx.fillRect(CARD_WIDTH - PADDING - lineW, cursorY + rpx(12), lineW, rpx(2));
    ctx.globalAlpha = 1;
    
    // Heart
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.4;
    ctx.font = `${rpx(24)}px sans-serif`;
    ctx.fillText('♥', CARD_WIDTH / 2 - rpx(12), cursorY + rpx(1));
    ctx.globalAlpha = 1;

    cursorY += rpx(24) + rpx(20);

    // Quote Text
    ctx.font = `${isSerifFont ? 'normal' : '600'} italic ${fontSize}px ${isSerifFont ? "Georgia, 'Times New Roman', Times, serif" : "sans-serif"}`;
    if (selectedTemplate.id === 'vintage-paper') {
        ctx.font = `500 ${fontSize}px serif`;
    }
    
    this.drawCenteredTextBlock(ctx, quoteLines, CARD_WIDTH / 2, cursorY, textLineHeight, theme.textColor);

    // --- 底部绘制 ---
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.52;
    ctx.font = `${rpx(24)}px 'Courier New', monospace`;
    const dateText = this.data.displayDate || '';
    const dateWidth = ctx.measureText(dateText).width;
    ctx.fillText(dateText, (CARD_WIDTH - dateWidth) / 2, footerY);
    
    ctx.globalAlpha = 0.34;
    ctx.font = `900 ${rpx(20)}px sans-serif`;
    const brandText = 'IDOL TIME DIARY • MEMORY CARD';
    const brandWidth = ctx.measureText(brandText).width;
    ctx.fillText(brandText, (CARD_WIDTH - brandWidth) / 2, footerY + rpx(34) + rpx(12));
    
    ctx.globalAlpha = 1;
    ctx.restore();

    this.exportWidth = CARD_WIDTH * dpr;
    this.exportHeight = CARD_HEIGHT * dpr;
  },

  exportCanvasFile() {
    return this.getCanvasNode().then(({ canvas }) => new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvas,
        x: 0,
        y: 0,
        width: this.exportWidth,
        height: this.exportHeight,
        destWidth: this.exportWidth,
        destHeight: this.exportHeight,
        fileType: 'png',
        quality: 1,
        success: (res) => resolve(res.tempFilePath),
        fail: () => reject(new Error('导出卡片图片失败'))
      }, this);
    }));
  },

  getSetting() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: resolve,
        fail: reject
      });
    });
  },

  authorize(scope) {
    return new Promise((resolve, reject) => {
      wx.authorize({
        scope,
        success: resolve,
        fail: reject
      });
    });
  },

  openSetting() {
    return new Promise((resolve, reject) => {
      wx.openSetting({
        success: resolve,
        fail: reject
      });
    });
  },

  showModal(options) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        ...options,
        success: resolve,
        fail: reject
      });
    });
  },

  saveImageToPhotosAlbum(filePath) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: resolve,
        fail: reject
      });
    });
  },

  async ensurePhotoAlbumPermission() {
    const settingRes = await this.getSetting();
    const currentState = settingRes.authSetting ? settingRes.authSetting[PHOTO_SCOPE] : undefined;

    if (currentState === true) {
      return;
    }

    if (currentState === undefined) {
      await this.authorize(PHOTO_SCOPE);
      return;
    }

    const modalRes = await this.showModal({
      title: '需要相册权限',
      content: '保存卡片到手机需要访问你的相册，请在设置中开启权限。',
      confirmText: '去开启',
      cancelText: '取消'
    });

    if (!modalRes.confirm) {
      throw new Error('你已取消授权');
    }

    const openSettingRes = await this.openSetting();
    if (!openSettingRes.authSetting || !openSettingRes.authSetting[PHOTO_SCOPE]) {
      throw new Error('未开启相册权限');
    }
  },

  async handleSave() {
    if (this.data.isGenerating) {
      return;
    }

    if (!this.data.entry || !this.data.idol) {
      wx.showToast({ title: '卡片数据未准备好', icon: 'none' });
      return;
    }

    this.setData({ isGenerating: true });

    try {
      await this.renderCardToCanvas();
      const tempFilePath = await this.exportCanvasFile();
      await this.ensurePhotoAlbumPermission();
      await this.saveImageToPhotosAlbum(tempFilePath);
      this.showToastFunc();
    } catch (error) {
      console.error('保存卡片失败:', error);
      const message = PHOTO_AUTH_DENY_RE.test(error?.errMsg || error?.message || '')
        ? '未开启相册权限'
        : (error?.message || '保存失败，请重试');
      wx.showToast({ title: message, icon: 'none' });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  showToastFunc() {
    this.setData({ showToast: true });
    setTimeout(() => {
      this.setData({ showToast: false });
    }, 3000);
  }
});
