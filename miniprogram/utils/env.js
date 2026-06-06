const API_BASE_URLS = {
  develop: 'http://192.168.111.1:8080/api',
  trial: 'https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api',
  release: 'https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api'
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

const getApiBaseUrl = (envVersion) => {
  const currentEnv = envVersion || getRuntimeEnvVersion();
  const matchedBaseUrl = API_BASE_URLS[currentEnv] || API_BASE_URLS.develop;
  return normalizeBaseUrl(matchedBaseUrl);
};

const getApiConfigError = (baseUrl, envVersion) => {
  const currentEnv = envVersion || getRuntimeEnvVersion();
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (!normalizedBaseUrl) {
    if (currentEnv === 'develop') {
      return '开发环境接口地址未配置，请先在 `miniprogram/utils/env.js` 中填写 develop 的后端地址。';
    }

    return '当前小程序环境未配置后端接口地址，请先将后端部署到 HTTPS 公网域名，并在微信公众平台配置合法域名后，再把该域名写入 `miniprogram/utils/env.js`。';
  }

  if (currentEnv !== 'develop' && !/^https:\/\//i.test(normalizedBaseUrl)) {
    return '体验版和正式版小程序接口必须使用 HTTPS 合法域名，当前配置不符合要求，请在 `miniprogram/utils/env.js` 中改为已备案并已配置到微信后台的 HTTPS 域名。';
  }

  return '';
};

module.exports = {
  getRuntimeEnvVersion,
  getApiBaseUrl,
  getApiConfigError
};
