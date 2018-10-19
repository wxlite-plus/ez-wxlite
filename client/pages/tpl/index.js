const { config } = require('../../framework/index.js');

Page({
  onShareAppMessage() {
    return config.shareData;
  },
});
