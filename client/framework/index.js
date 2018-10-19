const app = require('./app.js');
const page = require('./page.js');
const component = require('./component.js');

const config = require('../config/index.js');
const req = require('../req/index.js');
const router = require('../router/index.js');
const utils = require('../utils/index.js');

module.exports = {
  App: app,
  Page: page,
  Component: component,
  patch() {
    App = app;
    Page = page;
    Component = component;
  },
  config,
  req,
  router,
  utils,
};
