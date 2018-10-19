/**
 * 微信弹窗
 * @param {object} option
 */
function showModal(option) {
  const opt = {
    cancelColor: '#212732',
    confirmColor: '#377fee',
  };
  return wx.showModal.call(wx, Object.assign({}, option, opt));
}

module.exports = {
  showModal,
};
