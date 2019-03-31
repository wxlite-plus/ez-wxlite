function install(req, request) {
  req.user = {
    getMyInfo() {
      const url = `${req.apiUrl}/api/user/myInfo`;
      return request({ url });
    },
  };
}

module.exports = {
  install,
};
