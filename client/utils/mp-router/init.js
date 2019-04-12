const { routeMap } = require('./store.js');

/**
 * 初始化方法
 * @param {object} opt
 */
function init(opt = {}) {
  const { routes } = opt;
  if (routes) {
    Object.keys(routes).map((key) => {
      const route = routes[key];
      routeMap[key] = route;
      if (route.path) {
        routeMap[route.path] = route;
      }
      return key;
    });
  }
}

module.exports = init;
