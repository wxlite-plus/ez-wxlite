const { config, req } = require('../../framework/index.js');

Page({
  onLoad() {
    this.getMyInfo();
  },
  onShareAppMessage() {
    return config.shareData;
  },
  getMyInfo() {
    req.user.getMyInfo()
      .then((res) => {
        if (res.code === 0) {
          console.log(res);
        } else {
          req.err.show(res.msg);
        }
      })
      .catch(req.err.show);
  },
});
