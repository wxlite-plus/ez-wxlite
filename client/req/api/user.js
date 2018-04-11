module.exports = (req, apiUrl) => {
  return {
    // 获取用户信息
    getUserInfo(data) {
      const url = `${apiUrl}/user/${data.id}/info`;
      return req({ url });
    },
    // 获取自己信息
    getMyInfo() {
      const url = `${apiUrl}/user/mine`;
      return req({ url });
    }
  }
};