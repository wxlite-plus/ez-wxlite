const store = require('../store/index.js');
const req = require('../req/index.js');

module.exports = (options = {}) => {
  const { onLaunch } = options;

  const injectOptions = {};
  const patchOptions = {
    onLaunch(...res) {
      this.$store = store;
      this.$req = req;
      console.log('App option:', res[0] || {});
      onLaunch && onLaunch.apply(this, res);
    }
  };
  const newOptions = Object.assign(injectOptions, options, patchOptions);

  return App(newOptions);
};