const setting = require('../setting.js');

/**
 * 微信官方提供的sdk版本比较方法
 * 有bug直接怼微信
 * https://developers.weixin.qq.com/blogdetail?action=get_post_info&lang=zh_CN&token=&docid=000ea80cd78de80e9946942cb51401
 */
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  var len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (var i = 0; i < len; i++) {
    var num1 = parseInt(v1[i])
    var num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

/**
 * 授权
 */
function author(type) {
  return new Promise((res, rej) => {
    wx.getSetting({
      success(r1) {
        if (!r1.authSetting[type]) {
          wx.authorize({
            scope: type,
            success(r2) {
              res(r2);
            },
            fail(err) {
              rej(err);
            }
          })
        } else {
          res(r1);
        }
      },
      fail(err) {
        rej(err);
      }
    });
  });
}

module.exports = {
  compareVersion,
  author
};
