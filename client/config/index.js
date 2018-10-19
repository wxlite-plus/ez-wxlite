const apiUrlTable = require('./apiUrlTable.js');
const cdnPathTable = require('./cdnPathTable.js');

const apiUrl = apiUrlTable.dev;
const cdnPath = cdnPathTable.dev;

const defaultAvt = `${cdnPath}/img/default-face.png`;
const shareData = {
  title: '我是默认分享标题',
  path: '/pages/index/index',
};

module.exports = {
  // 环境
  apiUrl,
  // cdn路径
  cdnPath,
  // 默认头像
  defaultAvt,
  // 分享内容
  shareData,
};
