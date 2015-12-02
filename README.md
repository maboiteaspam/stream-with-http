# stream with http

receive and send message with an underlying http transport.

# Install

    npm i maboiteaspam/stream-with-http --save

# Usage

```js

var through2    = require('through2');
var getPort     = require('get-port');
var debug       = require('debug')('stream-with-http');
var http        = require('stream-with-http');


getPort().then(function (p) {

  debug('got a port %s', p)


  var s1 = http.read(p);                          // read messages incoming
                                                  // from an http server.

  s1.on('init', function(server) {                // use init event,
    server.setTimeout(500);                       // to configure the server.
  });
  s1.pipe(through2.obj(function (req, enc, cb) {  // it produces request object,
    console.log(req.url)                          // you can
    req.on('data', function (data) {              // read and
      console.log(JSON.parse(data))               // parse the data,
    })
    cb(null, req.url);                            // or whatever else.
  }).resume());



  var s2 = http.write();                          // write messages
                                                  // to an http server.
  var g= 0, i=0;
  var k = setInterval(function(){
    for( var e=i+500; i<e;i++) {
      s2.write({                                  // It can process urls
                                                  // or objects {
        url: "http://0.0.0.0:"+p+"/index/"+i,     //    address: of the endpoint
        body: {some:'data '+i}                    //    body: to write
                                                  // }
      })
    }
    g++;
    g>=400 && (clearInterval(k));
  }, 250)

  process.on('SIGINT', function() {
    s1.end();
    s2.end();
  })

});
```

# read more

- https://nodejs.org/api/http.html
