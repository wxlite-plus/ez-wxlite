const initUserApi = require('./api/user.js');
const store = require('../store/index.js');
const { state } = store;
let loginQueue = [];
let isLoginning = false;

/**
 * 备注：为了使errPicker正确工作，
 * 请尽量保持返回原始的err对象，避免自定义err对象
 * 若需要自定义err对象，请统一使用以下结构体：
 * { msg: '错误信息', detail: '详情' }
 */

const R = {
  // 提炼错误信息
  errPicker,
  // 错误弹窗
  showErr,
  // user
  user: initUserApi(req, state.apiUrl)
};

/**
 * 判断请求状态是否成功
 * 参数：http状态码
 * 返回值：[Boolen]
 */
function isHttpSuccess(status) {
  return status >= 200 && status < 300 || status === 304;
}

/**
 * promise请求
 * 参数：参考wx.request
 * 返回值：[promise]res.data
 */
function requestP(options = {}) {
  const {
    url,
    data,
    method,
    dataType,
    responseType,
    success,
    fail,
    complete
  } = options;

  // 统一注入约定的header
  let header = Object.assign({
    sessionId: state.sessionId,
    Accept: 'application/json;charset=UTF-8'
  }, options.header);

  return new Promise((res, rej) => {
    wx.request({
      url,
      data,
      header,
      method,
      dataType,
      responseType,
      success(r) {
        const isSuccess = isHttpSuccess(r.statusCode);

        if (isSuccess) {  // 成功的请求状态
          res(r.data);
        } else {
          console.log({
            msg: `网络错误:${r.statusCode}`,
            detail: r
          });
          rej({
            msg: `网络错误:${r.statusCode}`,
            detail: r
          });
        }
      },
      fail(err) {
        rej(err);
      },
      complete
    });
  });
}

/**
 * 提炼错误信息
 * 参数：err
 * 返回值：[string]errMsg
 */
function errPicker(err) {
  if (typeof err === 'string') {
    return err;
  }

  return err.msg || err.errMsg || (err.detail && err.detail.errMsg) || '未知错误';
}

/**
 * 错误弹窗
 */
function showErr(err) {
  const msg = errPicker(err);

  wx.showModal({
    showCancel: false,
    content: msg
  });
}

/**
 * 登录
 * 参数：undefined
 * 返回值：[promise]res
 */
function login() {
  return new Promise((res, rej) => {
    // 微信登录
    wx.login({
      success(r1) {
        if (r1.code) {
          // 获取sessionId
          requestP({
            url: `${state.apiUrl}/api/login/${r1.code}`,
            method: 'POST'
          })
            .then((r2) => {
              if (r2.code === 0 && r2.data) {
                const { sessionId } = r2.data;

                try {
                  // 保存sessionId
                  store.setState({
                    sessionId
                  });

                  res(r2);
                } catch (err) {
                  rej(err);
                }
              } else {
                rej(r2);
              }
            })
            .catch((err) => {
              rej(err);
            });
        } else {
          rej(r1);
        }
      },
      fail(err) {
        rej(err);
      }
    });
  });
}

/**
 * 获取sessionId
 * 参数：undefined
 * 返回值：[promise]sessionId
 */
function getSessionId() {
  return new Promise((res, rej) => {
    let { sessionId } = state;

    // 本地sessionId丢失，重新登录
    if (!sessionId) {
      loginQueue.push({ res, rej });

      if (!isLoginning) {
        isLoginning = true;

        login()
          .then((r1) => {
            isLoginning = false;
            loginQueue.map((q) => q.res(r1.data.sessionId));
            loginQueue = [];
          })
          .catch((err) => {
            isLoginning = false;
            loginQueue.map((q) => q.rej(err));
            loginQueue = [];
          });
      }
    } else {
      res(sessionId);
    }
  });
}

/**
 * ajax高级封装
 * 参数：[Object]option = {}，参考wx.request；
 * [Boolen]keepLogin = false
 * 返回值：[promise]res
 */
function req(options = {}, keepLogin = true) {
  if (keepLogin) {
    return new Promise((res, rej) => {
      getSessionId()
        .then((r1) => {
          // 获取sessionId成功之后，发起请求
          requestP(options)
            .then((r2) => {
              if (r2.code === 401) {
                // 登录状态无效，则重新走一遍登录流程
                // 销毁本地已失效的sessionId
                store.setState({
                  sessionId: ''
                });

                getSessionId()
                  .then((r3) => {
                    requestP(options)
                      .then((r4) => {
                        res(r4);
                      })
                      .catch((err) => {
                        rej(err);
                      });
                  });
              } else {
                res(r2);
              }
            })
            .catch((err) => {
              // 请求出错
              rej(err);
            });
        })
        .catch((err) => {
          // 获取sessionId失败
          rej(err);
        });
    });
  } else {
    // 不需要sessionId，直接发起请求
    return requestP(options);
  }
}

module.exports = R;
