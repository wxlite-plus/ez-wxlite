const setting = require('../setting.js');

/**
 * 检查口令
 */
function testKL(key) {
  const prefix = 'myAppName:';
  return new Promise((res, rej) => {
    const kl = setting.kl[prefix + key];

    if (!kl) {
      rej({
        msg: '口令不存在',
        detail: {
          key
        }
      });
    }

    wx.getClipboardData({
      success(r) {
        const reg = new RegExp(kl);

        if (reg.test(r.data)) {
          res(kl);
        } else {
          rej({
            msg: '口令匹配失败',
            detail: {
              key, kl,
              data: r
            }
          });
        }
      },
      fail(err) {
        rej(err);
      }
    });
  });
}

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
 * 比对时间戳是否是今天
 */
function isToday(time) {
  const day = new Date(time);
  const today = new Date();

  if ((day.getFullYear() === today.getFullYear()) && (day.getMonth() === today.getMonth()) && (day.getDate() === today.getDate())) {
    return true;
  }

  return false;
}

module.exports = {
  testKL,
  compareVersion,
  isToday
};
