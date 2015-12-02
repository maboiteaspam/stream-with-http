
var debug = require('debug')('stream-with-http')
var through2 = require('through2')
var http = require('http')
var util = require('util')

module.exports = function streamHttpWrite(handle, commit) {

  if (typeof handle !== 'function') {
    commit = handle;
    handle = function (chunk) {
      if (chunk.hostname) return chunk;
      var addressObj = require('url').parse(chunk.url || chunk);
      return {
        hostname: addressObj.hostname,
        port: addressObj.port,
        path: addressObj.path,
        method: chunk.body?'POST':'GET'
      };
    }
  }
  commit = !!commit;

  var fnTransform = function (chunk, enc, cb) {

    var options = handle(chunk);
    debug('sending a message %j', options)

    var req = http.request(options, function (res){
      //debug('sent a message %j', chunk)
      stream.emit('response', res)
      if (commit) cb(null, req, res)

    }).on('error', function(e) {
        stream.emit('error', e)
      if(commit) cb(null)
      });
    if (chunk.body) req.end(JSON.stringify(chunk.body));
    else req.end();
    if (!commit) cb(null)
  };

  var fnFlush = function (cb) {
    debug(' flush done stream-http-write')
    cb()
  };


  var stream = through2.obj(fnTransform, fnFlush);
  stream.resume();

  return stream;
};
