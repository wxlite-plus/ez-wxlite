const routes = require('./routes.js');

function parser(name) {
  if (!name) {
    throw new Error('路由名字不能为空');
  }
  const stack = name.split('.');
  stack.unshift({ inferior: routes });
  try {
    const res = stack.reduce((pV, cV) => pV && pV.inferior && pV.inferior[cV]);
    return res;
  } catch (err) {
    throw err;
  }
}

module.exports = parser;
