const { encode, decode } = require('./data.js');
const { push, replace } = require('./forward.js');
const pop = require('./pop.js');
const relaunch = require('./relaunch.js');

module.exports = {
  encode,
  decode,
  push,
  replace,
  pop,
  relaunch,
};
