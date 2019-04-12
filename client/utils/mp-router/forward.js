const { encodeKey } = require('./store.js');
const { encode, querify } = require('./data.js');
const routeParser = require('./routeParser.js');

/**
 * 跳转页面
 * @param {object} routeObj { name, data, success, fail, complete }
 */
function forward(routeObj = {}, isReplace = false) {
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
  const opt = {
    url,
    success,
    fail,
    complete,
  };
  if (!url) {
    throw new Error('路由url不能为空');
  }
  if (isReplace) {
    wx.redirectTo(opt);
    return;
  }
  switch (route.type) {
    case 'tab':
      wx.switchTab(opt);
      break;
    default:
      wx.navigateTo(opt);
      break;
  }
}

/**
 * 前进
 * @param {object} option
 */
function push(option) {
  return forward.call(this, option);
}

/**
 * 替换
 * @param {object} option
 */
function replace(option) {
  return forward.call(this, option, true);
}

module.exports = {
  push,
  replace,
};
