// ────────────────────────────────────────────────
// 云托管配置（体验版 / 正式版走 wx.cloud.callContainer）
// ────────────────────────────────────────────────
const CLOUD_ENV_ID = 'prod-d7gv8c42oa25aafb0';       // 云托管环境 ID
const CLOUD_SERVICE_NAME = 'springboot-h9k1';          // 云托管服务名

// 开发环境直接访问本地后端（HTTP，无需配置合法域名）
const API_BASE_URLS = {
  develop: 'http://192.168.111.1:8080/api',
  // 体验版 / 正式版通过云托管调用，不再需要填公网域名
  trial: '',
  release: ''
};

// 云托管文件上传地址（uploadFile 不支持 callContainer，仍走 HTTPS）
const UPLOAD_URLS = {
  develop: 'http://192.168.111.1:8080/api/files/upload',
  trial: 'https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/files/upload',
  release: 'https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/files/upload'
};

// 🔧 临时配置：真机预览是否使用本地上传
// 前提：手机和电脑在同一 WiFi
const USE_LOCAL_UPLOAD_IN_DEVICE = false; // 使用云托管上传

const normalizeBaseUrl = (url) => {
  if (!url) {
    return '';
  }
  return url.replace(/\/+$/, '');
};

const getRuntimeEnvVersion = () => {
  try {
    const accountInfo = wx.getAccountInfoSync();
    return accountInfo?.miniProgram?.envVersion || 'develop';
  } catch (error) {
    return 'develop';
  }
};

/**
 * 是否使用云托管调用方式。
 * - trial / release：始终走云托管
 * - develop：开发者工具内运行走本地，真机预览也走云托管（手机连不到本机 localhost）
 */
const useCloudContainer = (envVersion) => {
  const currentEnv = envVersion || getRuntimeEnvVersion();
  if (currentEnv !== 'develop') {
    console.log('[env.useCloudContainer] 非开发环境，使用云托管');
    return true;
  }

  // develop 环境下，判断是否在真机上运行（真机预览无法访问本机服务）
  try {
    const systemInfo = wx.getSystemInfoSync();
    const isDevTools = systemInfo.platform === 'devtools';
    console.log('[env.useCloudContainer] platform:', systemInfo.platform, 'isDevTools:', isDevTools);
    
    // platform 为 'devtools' 表示在开发者工具中，其他（ios/android）表示真机
    
    // 🎯 开发优化：如果手机和电脑在同一局域网，可以改为 false
    // 这样真机预览也能直接访问本地后端，无需频繁部署云托管
    // return false;  // 取消注释这行，启用真机本地调试
    
    return !isDevTools;
  } catch (e) {
    console.error('[env.useCloudContainer] 获取系统信息失败:', e);
    return false;
  }
};

const getApiBaseUrl = (envVersion) => {
  const currentEnv = envVersion || getRuntimeEnvVersion();
  const matchedBaseUrl = API_BASE_URLS[currentEnv] || API_BASE_URLS.develop;
  return normalizeBaseUrl(matchedBaseUrl);
};

const getUploadUrl = (envVersion) => {
  const currentEnv = envVersion || getRuntimeEnvVersion();
  const isCloudMode = useCloudContainer(envVersion);
  
  console.log('[env.getUploadUrl] currentEnv:', currentEnv, 'isCloudMode:', isCloudMode, 'USE_LOCAL:', USE_LOCAL_UPLOAD_IN_DEVICE);
  
  // 🎯 真机预览时的上传地址选择
  if (currentEnv === 'develop' && isCloudMode) {
    // 如果开启本地上传（手机和电脑同一WiFi）
    if (USE_LOCAL_UPLOAD_IN_DEVICE) {
      console.log('[env.getUploadUrl] 使用本地上传地址');
      return UPLOAD_URLS.develop; // 使用本地地址
    }
    // 否则使用云托管地址
    console.log('[env.getUploadUrl] 使用云托管上传地址');
    return UPLOAD_URLS.trial;
  }
  
  const finalUrl = UPLOAD_URLS[currentEnv] || UPLOAD_URLS.develop;
  console.log('[env.getUploadUrl] 最终上传地址:', finalUrl);
  return finalUrl;
};

const getApiConfigError = (baseUrl, envVersion) => {
  const currentEnv = envVersion || getRuntimeEnvVersion();

  // 体验版 / 正式版走云托管，不需要配置 baseUrl，无错误
  if (useCloudContainer(envVersion)) {
    return '';
  }

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (!normalizedBaseUrl) {
    return '开发环境接口地址未配置，请先在 `miniprogram/utils/env.js` 中填写 develop 的后端地址。';
  }

  return '';
};

module.exports = {
  CLOUD_ENV_ID,
  CLOUD_SERVICE_NAME,
  getRuntimeEnvVersion,
  getApiBaseUrl,
  getUploadUrl,
  getApiConfigError,
  useCloudContainer,
  USE_LOCAL_UPLOAD_IN_DEVICE
};
