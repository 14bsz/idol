const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateStr) => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}.${day}`;
};

const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
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
  formatDate,
  formatDateDisplay,
  getDaysBetween,
  generateId,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  chooseImage
};