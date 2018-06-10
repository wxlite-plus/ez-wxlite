const state = require('./state.js');
const subObj = {};
let id = 0;

function setState(obj) {
  if (!obj) {
    return
  }

  const keys = Object.keys(obj);

  keys.map((key) => {
    const oV = state[key];
    const val = obj[key];

    state[key] = val;
    pub(key, val, oV);
  });
}

function pub(key, nV, oV) {
  const events = subObj[key];

  if (events && events.length > 0) {
    events.map((e) => {
      e.handler(nV, oV);
    });
  }
}

function sub(key, handler) {
  const events = subObj[key];
  const _id = ++id;

  if (!events) {
    subObj[key] = [];
  }

  subObj[key].push({
    id: _id,
    handler
  });

  return () => unsub(key, _id);
}

function unsub(key, id) {
  const events = subObj[key];

  if (!events || events.length <= 0) {
    return;
  }

  const res = events.findIndex((e) => e.id === id);

  if (res < 0) {
    return res;
  }

  return events.splice(res, 1);
}

function once(key, handler) {
  const id = sub(key, (...arg) => {
    handler.apply(null, arg);
    unsub(key, id);
  });

  return id;
}

module.exports = {
  state,
  setState,
  sub,
  unsub,
  once
};
