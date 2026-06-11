/**
 * 安全解析日期时间字符串，确保按中国时区(UTC+8)处理
 * 后端返回的 LocalDateTime 格式: "2026-06-11 15:30:00"
 * 兼容旧格式: "2026-06-11T15:30:00"
 */
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  let str = String(dateStr).trim();
  // 将 ISO 格式 T 替换为空格，提高兼容性
  str = str.replace('T', ' ');
  
  // 手动解析 "yyyy-MM-dd HH:mm:ss" 或 "yyyy-MM-dd" 格式
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    const hour = parseInt(match[4] || 0);
    const minute = parseInt(match[5] || 0);
    const second = parseInt(match[6] || 0);
    return new Date(year, month, day, hour, minute, second);
  }
  
  // 回退到原生解析
  return new Date(str);
};

const formatDate = (dateStr) => {
  const date = parseDate(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateStr) => {
  const date = parseDate(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}.${day}`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = parseDate(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

const getDaysBetween = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const showToast = (title, icon = 'none') => {
  wx.showToast({
    title,
    icon,
    duration: 2000
  });
};

const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

const hideLoading = () => {
  wx.hideLoading();
};

const showModal = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
};

const chooseImage = (count = 1) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

module.exports = {
  parseDate,
  formatDate,
  formatDateDisplay,
  formatDateTime,
  getDaysBetween,
  generateId,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  chooseImage
};