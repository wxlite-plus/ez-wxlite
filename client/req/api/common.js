const { apiUrl } = require('../../config/index.js');

module.exports = {
  install(R, req) {
    R.common = {
      // 上传formid
      reportFormId(data) {
        const url = `${apiUrl}/api/pushFormId`;
        return req({ url, method: 'POST', data });
      },
    };
  },
};
