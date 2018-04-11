const proxy = require('proxy-middleware');

function init(server) {
  const avt = 'http://cdn.lizhi.fm/radio_cover/2014/08/16/13744067958412162_200x200.jpg';

  // server.get('/admin/info', (req, res) => {
  //   res.json(succ({
  //     id: '123456',
  //     name: 'Jack'
  //   }));
  // });
  
  // server.get('/getLiveInfo', (req, res) => {
  //   res.json(succ({
  //     endTime: 1455946200000,
  //     imageUrl: avt,
  //     liveId: 0,
  //     liveName: 'liveName',
  //     liveTopic: 'liveTopic',
  //     startTime: 1513856038712
  //   }));
  // });

  // server.get('/startLive', (req, res) => {
  //   res.json(succ());
  // });

  // server.get('/stopLive', (req, res) => {
  //   res.json(succ());
  // });

  // server.get('/notifySubscribers', (req, res) => {
  //   res.json(succ());
  // });

  // server.get('/getLiveComments', (req, res) => {
  //   var now = new Date().getTime();

  //   res.json(succ([now + 1, now + 2, now + 3, now + 4, now + 5, now + 6, now + 7, now + 8, now + 9, now + 10].map((n) => {
  //     return {
  //       content: `hahaha${n}`,
  //       userIconUrl: avt,
  //       userName: `山里育${n}`
  //     }
  //   })));
  // });

  // server.post('/postLiveComments', (req, res) => {
  //   res.json(succ());
  // });

  // server.get('/getLiveListenerCount', (req, res) => {
  //   var num = parseInt(Math.random() * 10);

  //   res.json(succ({
  //     onlineNum: num,
  //     totalNum: num + 100
  //   }));
  // });

  // server.post('/postLive', (req, res) => {
  //   res.json(succ({
  //     liveId: 123
  //   }));
  // });

  // server.post('/uploadImg', (req, res) => {
  //   res.json(succ(avt));
  // });

  // server.get('/getLiveStatus', (req, res) => {
  //   res.json(succ({
  //     lineOn: true,
  //     status: 0 // 0预告中/1直播中/2直播结束/3直播已经删除
  //   }));
  // });

  // server.use('/api', proxy('https://pcnjzydev.lizhifm.com/api'));
  // server.use('/genQrcode', proxy('https://pcnjzydev.lizhifm.com/genQrcode'));
}

function succ(data) {
  return {
    rcode: 0,
    data: data,
    msg: 'ok'
  }
}

module.exports = init;
