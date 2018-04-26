const store = require('../store/index.js');
const req = require('../req/index.js');

module.exports = (options = {}) => {
  const { onLoad } = options;
  const injectOptions = {};
  const patchOptions = {
    onLoad(...res) {
      this.$store = store;
      this.$req = req;
      console.log('Page option:', res[0]);
      onLoad && onLoad.apply(this, res);
    }
  };
  const newOptions = Object.assign(injectOptions, options, patchOptions);

  return Page(newOptions);
};