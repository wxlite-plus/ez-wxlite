const store = require('./store/index.js');
const utils = require('./utils/index.js');
const setting = require('./setting.js');
const FW = require('./framework/index.js');

// 初始化环境
initEnv();

FW.App({
  onLaunch(options) {
    // Do something initial when launch.
  },

  onShow(options) {
    // 开启debug
    utils
      .testKL('开启debug')
      .then(() => {
        wx.setEnableDebug({
          enableDebug: true
        });
      })
      .catch((err) => {
        console.log(err);
      });

    // 打开测试页面
    utils
      .testKL('打开测试页面')
      .then(() => {
        wx.navigateTo({
          url: '/pages/test/index'
        });
      })
      .catch((err) => {
        console.log(err);
      });

    // 检查SDK版本
    checkSDK();
    // 检查更新
    checkForUpdate();
  },

  onHide() {
    // Do something when hide.
  },

  onError(err) {
    console.log(err)
  }
});

/**
 * 检查sdk版本
 */
function checkSDK() {
  wx.getSystemInfo({
    success(r1) {
      const compareRes = utils.compareVersion(r1.SDKVersion, '1.7.0');

      if (compareRes < 0) {
        wx.showModal({
          title: '版本过低',
          content: '当前的微信版本较低，部分功能（如收听直播）将无法正常使用，请升级最新版！',
          showCancel: false,
          confirmText: '好的',
          success(r2) {
            console.log(r2);
          },
          fail(err) {
            console.log(err);
          }
        });
      }
    },
    fail(err) {
      console.log(err);
    }
  });
}

/**
 * 检查新版本
 */
function checkForUpdate() {
  if (wx.getUpdateManager) {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      // 请求完新版本信息的回调
      console.log('请求完新版本信息的回调：', res.hasUpdate);
    });

    updateManager.onUpdateReady(() => {
      // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      const updateRemindTime = wx.getStorageInfoSync('updateRemindTime');

      console.log('新的版本已经下载好');
      // 如果时间今天已经提示过，则不再提示
      if (!updateRemindTime || !utils.isToday(updateRemindTime)) {
        wx.setStorageSync('updateRemindTime', new Date().getTime());
        wx.showModal({
          title: '发现新版本',
          content: '有新版本啦！我们做了许多好玩的功能，还不快来体验一下？',
          cancelText: '暂不更新',
          confirmText: '重启更新',
          success(res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          },
          fail(err) {
            console.log(err);
          }
        });
      }
    });

    updateManager.onUpdateFailed(() => {
      // 新的版本下载失败
      console.log('新的版本下载失败');
    });
  } else {
    console.log('不支持更新检测');
  }
}

/**
 * 初始化环境
 */
function initEnv() {
  // 切换开发环境
  utils.testKL('切换开发环境')
    .then(() => {
      store.setState('apiUrl', setting.apiUrlTable.dev);
      store.setState('env', 'dev');
    })
    .catch((err) => {
      console.log(err);
    });

  // 切换预发环境
  utils
    .testKL('切换预发环境')
    .then(() => {
      store.setState('apiUrl', setting.apiUrlTable.pre);
      store.setState('env', 'pre');
    })
    .catch((err) => {
      console.log(err);
    });

  // 默认初始化为线上环境
  store.setState('apiUrl', setting.apiUrlTable.online);
  store.setState('env', 'online');
}
