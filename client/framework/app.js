const store = require('../store/index.js');
const req = require('../req/index.js');

module.exports = (options = {}) => {
  const injectOptions = {
    $store: store,
    $req: req
  };
  const patchOptions = {};
  const newOptions = Object.assign(injectOptions, options, patchOptions);

  return App(newOptions);
};