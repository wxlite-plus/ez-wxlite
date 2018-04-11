const apiUrlTable = {
  local: 'http://192.168.1.100:8080',
  online: 'https://wxlite.jack-lo.io',
  dev: 'https://wxlite-dev.jack-lo.io',
  pre: 'https://wxlite-pre.jack-lo.io'
};

/**
 * 以下口令为key值md5加密之后得到的字符串（16位小写），
 * https://md5jiami.51240.com
 */
const kl = {
  'myAppName:开启debug': '822d769d40a1cd77',
  'myAppName:打开测试页面': '8588972db83322ab',
  'myAppName:切换开发环境': '0f64ebb614e92339',
  'myAppName:切换预发环境': '9b5fe3f72791fa5f'
};

module.exports = {
  apiUrlTable,
  kl
};
