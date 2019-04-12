const { encodeKey } = require('./store.js');

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

/**
 * query化
 * @param {object} obj
 */
function querify(obj) {
  return Object.keys(obj).map((k) => {
    const v = obj[k];
    return `${k}=${v}`;
  }).join('&');
}

/**
 * 提炼数据
 * @param {object} option
 */
function extract(option = {}) {
  const data = option[encodeKey];
  if (data) {
    return decode(data);
  }
  return null;
}

module.exports = {
  encode,
  decode,
  querify,
  extract,
};
