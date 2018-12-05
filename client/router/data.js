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

function querify(obj) {
  return Object.keys(obj).map((k) => {
    const v = obj[k];
    return `${k}=${v}`;
  }).join('&');
}

module.exports = {
  encode,
  decode,
  querify,
};
