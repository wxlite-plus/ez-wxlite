const { apiUrl } = require('../config/index.js');

let sessionId = wx.getStorageSync('sessionId');
let loginQueue = [];
let isLoginning = false;

const R = {
  // 插件接口
  use,
  // 上传文件
  uploadFile,
};

/**
 * 插件接口
 * @param {object} plugin { install }
 */
function use(plugin) {
  return plugin.install(R, req);
}

/**
 * 判断请求状态是否成功
 * 参数：http状态码
 * 返回值：[Boolen]
 */
function isHttpSuccess(status) {
  return (status >= 200 && status < 300) || status === 304;
}

/**
 * promise请求
 * @param {object} options {}
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
    complete,
  } = options;

  // 统一注入约定的header
  const header = Object.assign({
    sessionId,
    Accept: 'application/json;charset=UTF-8',
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

        if (isSuccess) { // 成功的请求状态
          if (success) {
            success(r.data);
          }
          res(r.data);
        } else {
          if (fail) {
            fail({
              msg: `服务器好像出了点小问题，请与客服联系~（错误代码：${r.statusCode}）`,
              detail: r,
            });
          }
          rej({
            msg: `服务器好像出了点小问题，请与客服联系~（错误代码：${r.statusCode}）`,
            detail: r,
          });
        }
      },
      fail(err) {
        if (fail) {
          fail(err);
        }
        rej(err);
      },
      complete,
    });
  });
}

/**
 * 登录
 */
function login() {
  return new Promise((res, rej) => {
    // 微信登录
    wx.login({
      success(r1) {
        if (r1.code) {
          // 获取sessionId
          requestP({
            url: `${apiUrl}/job-customer/api/sys/login`,
            method: 'POST',
            data: {
              jsCode: r1.code,
            },
          })
            .then((r2) => {
              if (r2.code === 0) {
                const newSessionId = r2.data.sessionId;
                sessionId = newSessionId; // 更新sessionId
                try {
                  // 保存sessionId
                  wx.setStorage({
                    key: 'sessionId',
                    data: newSessionId,
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
      },
    });
  });
}

/**
 * 获取sessionId
 */
function getSessionId() {
  return new Promise((res, rej) => {
    // 本地sessionId丢失，重新登录
    if (!sessionId) {
      loginQueue.push({ res, rej });

      if (!isLoginning) {
        isLoginning = true;

        login()
          .then((r1) => {
            isLoginning = false;
            loginQueue.map(q => q.res(r1.data.sessionId));
            loginQueue = [];
          })
          .catch((err) => {
            isLoginning = false;
            loginQueue.map(q => q.rej(err));
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
 * @param {object} options {}
 * @param {boolean} keepLogin true
 */
function req(options = {}, keepLogin = true) {
  if (keepLogin) {
    return new Promise((res, rej) => {
      getSessionId()
        .then(() => {
          // 获取sessionId成功之后，发起请求
          requestP(options)
            .then((r2) => {
              if (r2.code === 3000) {
                // 登录状态无效，则重新走一遍登录流程
                // 销毁本地已失效的sessionId
                sessionId = '';
                getSessionId()
                  .then(() => {
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
  }
  // 不需要sessionId，直接发起请求
  return requestP(options);
}

/**
 * 图片上传
 */
function uploadFile(data) {
  const url = `${apiUrl}/job-customer/api/file/upload`;
  return new Promise((res, rej) => {
    getSessionId()
      .then(() => {
        wx.uploadFile({
          url,
          filePath: data.filePath,
          formData: {
            type: data.type, // 1项目照片
          },
          name: 'file',
          header: {
            sessionId,
          },
          success(r) {
            const isSuccess = isHttpSuccess(r.statusCode);
            if (isSuccess) { // 成功的请求状态
              res(JSON.parse(r.data));
            } else {
              rej({
                msg: `服务器好像出了点小问题，请与客服联系~（错误代码：${r.statusCode}）`,
                detail: r,
              });
            }
          },
          fail(err) {
            rej(err);
          },
        });
      })
      .catch((err) => {
        rej(err);
      });
  });
}

module.exports = R;
