const { encodeKey } = require('./store.js');
const { encode, querify } = require('./data.js');
const routeParser = require('./routeParser.js');

/**
 * 关闭所有页面，打开到应用内的某个页面
 * @param {object} routeObj { name, data, success, fail, complete }
 */
function relaunch(routeObj = {}) {
  const {
    name, data, query, success, fail, complete,
  } = routeObj;
  let url = '';
  const queryData = query || {};
  if (!name) {
    throw new Error('路由名称不能为空');
  }
  const route = routeParser(name);
  if (!route) {
    throw new Error('没有匹配的路由规则');
  }
  url = route.path;
  if (data) {
    queryData[encodeKey] = encode(data);
  }
  if (route.type !== 'tab') {
    url += `?${querify(queryData)}`;
  }
  if (!url) {
    throw new Error('路由url不能为空');
  }
  wx.reLaunch({
    url,
    success,
    fail,
    complete,
  });
}

module.exports = relaunch;
