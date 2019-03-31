const apiUrlTable = require('./apiUrlTable.js');

const apiUrl = apiUrlTable.release;

const shareData = {
  title: '我是默认分享标题',
  path: '/pages/index/index',
};

module.exports = {
  // 环境
  apiUrl,
  // 分享内容
  shareData,
};
