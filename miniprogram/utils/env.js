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
 * 是否使用云托管调用方式（非开发环境时启用）
 */
const useCloudContainer = (envVersion) => {
  const currentEnv = envVersion || getRuntimeEnvVersion();
  return currentEnv !== 'develop';
};

const getApiBaseUrl = (envVersion) => {
  const currentEnv = envVersion || getRuntimeEnvVersion();
  const matchedBaseUrl = API_BASE_URLS[currentEnv] || API_BASE_URLS.develop;
  return normalizeBaseUrl(matchedBaseUrl);
};

const getUploadUrl = (envVersion) => {
  const currentEnv = envVersion || getRuntimeEnvVersion();
  return UPLOAD_URLS[currentEnv] || UPLOAD_URLS.develop;
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
  useCloudContainer
};
