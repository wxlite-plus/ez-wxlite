const store = require('../store/index.js');
const req = require('../req/index.js');

module.exports = (options = {}) => {
  const { created } = options;
  const patchOptions = {
    created(...res) {
      this.$store = store;
      this.$req = req;
      created && created.apply(this, res);
    }
  };
  const newOptions = Object.assign({}, options, patchOptions);

  return Component(newOptions);
};