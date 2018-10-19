const app = App;

module.exports = (options = {}) => {
  const { onLaunch } = options;
  const patchOptions = {
    onLaunch(...res) {
      const opts = res[0];
      this.$opts = opts;
      console.log('App option:', opts);
      if (onLaunch) {
        onLaunch.apply(this, res);
      }
    },
  };
  const newOptions = Object.assign({}, options, patchOptions);
  return app(newOptions);
};
