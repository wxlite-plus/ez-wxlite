const store = require('../store/index.js');
const req = require('../req/index.js');

module.exports = (options = {}) => {
  // const { onLoad, onUnload } = options;
  const injectOptions = {
    $store: store,
    $req: req
  };
  const patchOptions = {
    // onLoad(...res) {
    //   console.log('load');
    //   onLoad && onLoad.apply(this, res);
    // },
    // onUnload(...res) {
    //   console.log('unload');
    //   onUnload && onUnload.apply(this, res);
    // }
  };
  const newOptions = Object.assign(injectOptions, options, patchOptions);

  return Page(newOptions);
};