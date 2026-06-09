/**
 * 统一日志管理工具
 * 在开发环境显示详细日志，生产环境只显示错误日志
 */

const env = require('./env.js');

const isDev = env.getRuntimeEnvVersion() === 'develop';

/**
 * 普通日志 - 仅开发环境输出
 */
function log(...args) {
  if (isDev) {
    console.log(...args);
  }
}

/**
 * 信息日志 - 仅开发环境输出
 */
function info(...args) {
  if (isDev) {
    console.info(...args);
  }
}

/**
 * 警告日志 - 所有环境输出
 */
function warn(...args) {
  console.warn(...args);
}

/**
 * 错误日志 - 所有环境输出
 */
function error(...args) {
  console.error(...args);
}

/**
 * 调试日志 - 仅开发环境输出
 */
function debug(...args) {
  if (isDev) {
    console.debug(...args);
  }
}

module.exports = {
  log,
  info,
  warn,
  error,
  debug,
  isDev
};
