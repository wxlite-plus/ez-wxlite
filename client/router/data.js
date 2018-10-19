/**
 * 编码
 * @param {object} data
 */
function encode(data) {
  return encodeURIComponent(JSON.stringify(data));
}

/**
 * 解码
 * @param {object} code
 */
function decode(code) {
  return JSON.parse(decodeURIComponent(code));
}

module.exports = {
  encode,
  decode,
};
