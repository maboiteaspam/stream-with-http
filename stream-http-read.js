
var debug = require('debug')('stream-with-http')
var http = require('http')
var through2 = require('through2')

module.exports = function streamHttpRead(port, host) {

  var fnTransform = function (chunk, enc, cb) {
    cb(null, chunk)
  };

  var addr = {
    host: host || '0.0.0.0',
    port: port,
    pathName: '/'
  };

  var address = 'http://'+addr.host+':'+(addr.port)+''+addr.pathName;

  debug('server address %s', address)
  var server = http.createServer();

  var fnFlush = function (cb) {
    debug('flush done stream-http-read')
    server.close()
    cb()
  };
  server.on('close', function () {
    debug('server close stream-http-read')
  })

  var stream = through2.obj(fnTransform, fnFlush);
  stream.resume();

  server.on('request', function (req, res){
    debug('got request %s', req.url)
    stream.write(req);
    res.end();
  });

  stream.emit('init', address, addr, server);
  server.listen(addr.port, addr.host);


  return stream;
};
