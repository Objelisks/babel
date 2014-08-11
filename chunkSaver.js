var http = require('http');
var fs = require('fs');
var request = require('request');

var saveDirectory = __dirname + '/chunks/';

var inc = 0;

var server = http.createServer(function(req, res) {
  var body = '';
  req.on('data', function(chunk) {
    body += chunk;
  });
  req.on('end', function() {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end();
    var bodyJson = JSON.parse(body);
    var chunks = bodyJson.chunks;
    chunks.forEach(function(chunk) {
      fs.writeFile(saveDirectory + chunk.name + '.json', JSON.stringify(chunk));
    });
    console.log('saved chunks', inc++);
  });
});

server.listen('3000');