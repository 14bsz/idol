const AVATAR_EXPORT_SIZE = 600;
const BANNER_EXPORT_WIDTH = 1200;

Page({
  data: {
    cropType: 'avatar',
    imageSrc: '',
    title: '裁剪图片',
    subtitle: '',
    tipText: '',
    footerTitle: '',
    footerDesc: '',
    cropFrameWidth: 0,
    cropFrameHeight: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    displayWidth: 0,
    displayHeight: 0,
    imageLeft: 0,
    imageTop: 0,
    safeTop: 0,
    safeBottom: 0,
    navBarHeight: 44,
    headerPaddingLeft: 16,
    headerPaddingRight: 16,
    isReady: false,
    isSaving: false
  },

  imageMeta: null,
  cropperState: {
    scale: 1,
    minScale: 1,
    maxScale: 4,
    offsetX: 0,
    offsetY: 0
  },
  gestureState: null,

  onLoad(options) {
    const rawSrc = options && options.src ? decodeURIComponent(options.src) : '';
    const cropType = options && options.type === 'banner' ? 'banner' : 'avatar';

    if (!rawSrc) {
      wx.showToast({ title: '图片地址无效', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 300);
      return;
    }

    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const menuButtonRect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    const safeArea = windowInfo.safeArea || {
      top: 0,
      bottom: windowInfo.screenHeight || windowInfo.windowHeight
    };
    const safeBottom = Math.max(0, (windowInfo.screenHeight || windowInfo.windowHeight) - safeArea.bottom);
    const cropConfig = this.getCropConfig(cropType, windowInfo.windowWidth);
    const topGap = menuButtonRect ? Math.max(0, menuButtonRect.top - safeArea.top) : 6;
    const navBarHeight = menuButtonRect
      ? topGap * 2 + menuButtonRect.height
      : 44;
    const capsuleSafeWidth = menuButtonRect
      ? Math.max(0, windowInfo.windowWidth - menuButtonRect.left) + 12
      : 96;

    this.setData({
      cropType,
      imageSrc: rawSrc,
      title: cropConfig.title,
      subtitle: cropConfig.subtitle,
      tipText: cropConfig.tipText,
      footerTitle: cropConfig.footerTitle,
      footerDesc: cropConfig.footerDesc,
      cropFrameWidth: cropConfig.cropFrameWidth,
      cropFrameHeight: cropConfig.cropFrameHeight,
      canvasWidth: cropConfig.canvasWidth,
      canvasHeight: cropConfig.canvasHeight,
      safeTop: safeArea.top,
      safeBottom,
      navBarHeight,
      headerPaddingLeft: 16,
      headerPaddingRight: capsuleSafeWidth
    });

    this.loadImageMeta(rawSrc);
  },

  getCropConfig(cropType, windowWidth) {
    if (cropType === 'banner') {
      const cropFrameWidth = Math.max(280, windowWidth - 48);
      const cropFrameHeight = Math.round(windowWidth * 576 / 750);
      const canvasHeight = Math.round(BANNER_EXPORT_WIDTH * cropFrameHeight / cropFrameWidth);
      return {
        title: '裁剪壁纸',
        subtitle: '固定尺寸',
        tipText: '双指缩放，单指拖动图片调整位置',
        footerTitle: '壁纸固定比例裁剪',
        footerDesc: '裁剪后仅保留框内区域，自动适配小程序壁纸显示',
        cropFrameWidth,
        cropFrameHeight,
        canvasWidth: BANNER_EXPORT_WIDTH,
        canvasHeight
      };
    }

    const cropFrameWidth = Math.min(windowWidth - 72, 320);
    return {
      title: '裁剪头像',
      subtitle: '正方形',
      tipText: '双指缩放，单指拖动图片调整位置',
      footerTitle: '头像正方形裁剪',
      footerDesc: '裁剪后仅保留正方形区域，确保头像不变形',
      cropFrameWidth,
      cropFrameHeight: cropFrameWidth,
      canvasWidth: AVATAR_EXPORT_SIZE,
      canvasHeight: AVATAR_EXPORT_SIZE
    };
  },

  loadImageMeta(src) {
    wx.showLoading({ title: '加载图片中...' });
    wx.getImageInfo({
      src,
      success: (res) => {
        this.imageMeta = {
          width: res.width,
          height: res.height
        };
        this.setData({
          imageSrc: res.path || src
        });
        wx.hideLoading();
        this.initializeCropper();
      },
      fail: (error) => {
        console.error('读取图片信息失败', error);
        wx.hideLoading();
        wx.showToast({ title: '图片加载失败', icon: 'none' });
        setTimeout(() => {
          wx.navigateBack();
        }, 300);
      }
    });
  },

  initializeCropper() {
    if (!this.imageMeta) {
      return;
    }

    const { cropFrameWidth, cropFrameHeight } = this.data;
    const minScale = Math.max(
      cropFrameWidth / this.imageMeta.width,
      cropFrameHeight / this.imageMeta.height
    );

    this.cropperState = {
      scale: minScale,
      minScale,
      maxScale: Math.max(minScale * 4, minScale + 1),
      offsetX: 0,
      offsetY: 0
    };

    this.applyTransform(minScale, 0, 0, true);
  },

  applyTransform(scale, offsetX, offsetY, markReady) {
    if (!this.imageMeta) {
      return;
    }

    const { cropFrameWidth, cropFrameHeight } = this.data;
    const clampedScale = this.clamp(scale, this.cropperState.minScale, this.cropperState.maxScale);
    
    // 当前缩放比例下图片的实际显示尺寸
    const displayWidth = this.imageMeta.width * clampedScale;
    const displayHeight = this.imageMeta.height * clampedScale;
    
    // 允许的偏移量：使得图片边缘刚好贴合或包住裁剪框边缘
    // 因为是 translate3d，offsetX=0 时图片居中，
    // 最大正负偏移即图片宽/高减去裁剪框宽/高的一半
    const maxOffsetX = Math.max(0, (displayWidth - cropFrameWidth) / 2);
    const maxOffsetY = Math.max(0, (displayHeight - cropFrameHeight) / 2);
    
    const clampedOffsetX = this.clamp(offsetX, -maxOffsetX, maxOffsetX);
    const clampedOffsetY = this.clamp(offsetY, -maxOffsetY, maxOffsetY);

    this.cropperState.scale = clampedScale;
    this.cropperState.offsetX = clampedOffsetX;
    this.cropperState.offsetY = clampedOffsetY;

    this.setData({
      displayWidth,
      displayHeight,
      // 基础居中偏移 + 手势偏移
      imageLeft: (cropFrameWidth - displayWidth) / 2 + clampedOffsetX,
      imageTop: (cropFrameHeight - displayHeight) / 2 + clampedOffsetY,
      isReady: markReady ? true : this.data.isReady
    });
  },

  onTouchStart(e) {
    if (!this.data.isReady || !e.touches || !e.touches.length) {
      return;
    }

    if (e.touches.length === 1) {
      this.gestureState = {
        type: 'move',
        startX: e.touches[0].pageX,
        startY: e.touches[0].pageY,
        startOffsetX: this.cropperState.offsetX,
        startOffsetY: this.cropperState.offsetY
      };
      return;
    }

    if (e.touches.length >= 2) {
      this.gestureState = {
        type: 'scale',
        startDistance: this.getDistance(e.touches[0], e.touches[1]),
        startScale: this.cropperState.scale,
        startOffsetX: this.cropperState.offsetX,
        startOffsetY: this.cropperState.offsetY
      };
    }
  },

  onTouchMove(e) {
    if (!this.gestureState || !e.touches || !e.touches.length) {
      return;
    }

    if (this.gestureState.type === 'move' && e.touches.length === 1) {
      const deltaX = e.touches[0].pageX - this.gestureState.startX;
      const deltaY = e.touches[0].pageY - this.gestureState.startY;
      this.applyTransform(
        this.cropperState.scale,
        this.gestureState.startOffsetX + deltaX,
        this.gestureState.startOffsetY + deltaY,
        false
      );
      return;
    }

    if (e.touches.length >= 2) {
      const distance = this.getDistance(e.touches[0], e.touches[1]);
      const ratio = distance / (this.gestureState.startDistance || distance || 1);
      this.applyTransform(
        this.gestureState.startScale * ratio,
        this.gestureState.startOffsetX,
        this.gestureState.startOffsetY,
        false
      );
    }
  },

  onTouchEnd(e) {
    if (e.touches && e.touches.length === 1) {
      this.gestureState = {
        type: 'move',
        startX: e.touches[0].pageX,
        startY: e.touches[0].pageY,
        startOffsetX: this.cropperState.offsetX,
        startOffsetY: this.cropperState.offsetY
      };
      return;
    }

    this.gestureState = null;
  },

  onCancel() {
    wx.navigateBack();
  },

  onConfirmCrop() {
    if (!this.data.isReady || this.data.isSaving) {
      return;
    }

    const sourceRect = this.getSourceRect();
    const { canvasWidth, canvasHeight, imageSrc } = this.data;
    const ctx = wx.createCanvasContext('cropCanvas', this);

    this.setData({ isSaving: true });
    wx.showLoading({ title: '生成裁剪图...' });

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(
      imageSrc,
      sourceRect.sx,
      sourceRect.sy,
      sourceRect.sWidth,
      sourceRect.sHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'cropCanvas',
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        destWidth: canvasWidth,
        destHeight: canvasHeight,
        fileType: 'jpg',
        quality: 1,
        success: (res) => {
          wx.hideLoading();
          this.setData({ isSaving: false });
          const eventChannel = this.getOpenerEventChannel();
          eventChannel.emit('cropSuccess', {
            tempFilePath: res.tempFilePath,
            cropType: this.data.cropType
          });
          wx.navigateBack();
        },
        fail: (error) => {
          console.error('导出裁剪图片失败', error);
          wx.hideLoading();
          this.setData({ isSaving: false });
          wx.showToast({ title: '裁剪失败，请重试', icon: 'none' });
        }
      }, this);
    });
  },

  getSourceRect() {
    const { cropFrameWidth, cropFrameHeight } = this.data;
    const { scale, offsetX, offsetY } = this.cropperState;
    const displayWidth = this.imageMeta.width * scale;
    const displayHeight = this.imageMeta.height * scale;
    const imageLeft = (cropFrameWidth - displayWidth) / 2 + offsetX;
    const imageTop = (cropFrameHeight - displayHeight) / 2 + offsetY;

    const sx = this.clamp((-imageLeft) / scale, 0, this.imageMeta.width);
    const sy = this.clamp((-imageTop) / scale, 0, this.imageMeta.height);
    const sWidth = this.clamp(cropFrameWidth / scale, 1, this.imageMeta.width - sx);
    const sHeight = this.clamp(cropFrameHeight / scale, 1, this.imageMeta.height - sy);

    return {
      sx,
      sy,
      sWidth,
      sHeight
    };
  },

  getDistance(firstTouch, secondTouch) {
    const deltaX = firstTouch.pageX - secondTouch.pageX;
    const deltaY = firstTouch.pageY - secondTouch.pageY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  },

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
});
