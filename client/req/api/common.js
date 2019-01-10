const { apiUrl } = require('../../config/index.js');

module.exports = {
  install(req, request) {
    req.common = {
      // 上传formid
      reportFormId(data) {
        const url = `${apiUrl}/api/pushFormId`;
        return request({ url, method: 'POST', data });
      },
    };
  },
};
