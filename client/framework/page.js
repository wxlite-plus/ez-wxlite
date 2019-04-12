const { extract } = require('../router/index.js');

const page = Page;

module.exports = (options = {}) => {
  const { onLoad } = options;
  const patchOptions = {
    onLoad(...res) {
      const opts = res[0];
      const $opts = extract(opts) || {};
      this.$opts = $opts;
      console.log('Page $opts:', $opts);
      if (onLoad) {
        onLoad.apply(this, res);
      }
    },
  };
  const newOptions = Object.assign({}, options, patchOptions);
  return page(newOptions);
};
