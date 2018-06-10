const apiUrlTable = {
  local: 'http://192.168.1.119:8080',
  online: 'https://wxlite.jack-lo.io',
  dev: 'https://wxlite-dev.jack-lo.io',
  pre: 'https://wxlite-pre.jack-lo.io'
};

// const cdnPath = 'https://cdn.jack-lo.io/wxlite/static';
const cdnPath = 'http://192.168.1.119:8080/static';

const shareData = {
  title: ''
};

const defaultAvt = `${cdnPath}/img/default-face.png`;

module.exports = {
  apiUrlTable,
  cdnPath,
  shareData,
  defaultAvt
};
