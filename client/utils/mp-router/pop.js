/**
 * 返回
 * @param {object} option { delta }
 */
function pop(option) {
  wx.navigateBack(option);
}

module.exports = pop;
