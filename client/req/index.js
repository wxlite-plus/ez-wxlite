const R = require('./prototype.js');
// fn
const errFn = require('./fn/err.js');
const cachifyFn = require('./fn/cachify.js');
// api
const commonApi = require('./api/common.js');

/**
 * 备注：为了使errPicker正确工作，
 * 请尽量保持返回原始的err对象，避免自定义err对象
 * 若需要自定义err对象，请统一使用以下结构体：
 * { msg: '错误信息', detail: '详情' }
 */

R.use(errFn);
R.use(cachifyFn);

R.use(commonApi);

module.exports = R;
