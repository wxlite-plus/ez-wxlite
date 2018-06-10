const store = require('./store/index.js');
const setting = require('./setting.js');
const FW = require('./framework/index.js');

// 初始化环境
initEnv();

FW.App({
  onLaunch(options) {
    // Do something initial when launch.
  },

  onShow(options) {
    // Do something when show.
  },

  onHide() {
    // Do something when hide.
  },

  onError(err) {
    console.log(err)
  }
});

/**
 * 初始化环境
 */
function initEnv() {
  // 默认初始化为线上环境
  store.setState({
    apiUrl: setting.apiUrlTable.local,
    env: 'local'
  });
}
