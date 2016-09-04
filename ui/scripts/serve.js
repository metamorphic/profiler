var static = require('node-static');

var fileServer = new static.Server('../public');

require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    fileServer.serve(request, response, function (e, res) {
      var url = request.url;
      console.log(url);
      if (/^\/hal/.test(url)) {
        fileServer.serveFile(url, 200, {}, request, response);
      } else {
        if (!/(png|css|js)$/.test(url)) {
          fileServer.serveFile('./index.html', 200, {}, request, response);
        }
      }
    });
  }).resume();
}).listen(8001);