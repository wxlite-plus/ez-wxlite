const store = require('../store/index.js');
const req = require('../req/index.js');

module.exports = (options = {}) => {
  const { onLoad } = options;
  const injectOptions = {};
  const patchOptions = {
    onLoad(...res) {
      const opts = res[0];

      this.$store = store;
      this.$req = req;
      this.$opts = opts;
      console.log('Page option:', opts);
      onLoad && onLoad.apply(this, res);
    }
  };
  const newOptions = Object.assign(injectOptions, options, patchOptions);

  return Page(newOptions);
};