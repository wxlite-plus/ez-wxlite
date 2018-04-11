const mockServer = require('./mock/index.js');

module.exports = {
  server: {
    baseDir: ['templates'],
    routes: {
      '/static': 'static',
      '/index': 'templates/index.html'
    }
  },
  files: ['.'],
  proxy: false,
  port: 8080,
  middleware: [
    mockServer
  ],
  serveStatic: [],
  ghostMode: false,
  logPrefix: 'Browsersync',
  rewriteRules: [],
  open: false,
  browser: 'default',
  notify: false
};
