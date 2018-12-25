const proxy = require('proxy-middleware');

function init(server) {
  server.get('/admin/info', (req, res) => {
    res.json(succ({
      id: '123456',
      name: 'Jack'
    }));
  });

  // server.post('/uploadImg', (req, res) => {
  //   res.json(succ(avt));
  // });

  // server.use('/api', proxy('https://wxlite.jack-lo.io/api'));
}

function succ(data) {
  return {
    code: 0,
    data: data,
    msg: 'ok'
  };
}

module.exports = init;
