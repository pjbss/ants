var http = require('http');
var url = require('url');
var NodeStatic = require('node-static');

var fileServer = new NodeStatic.Server('./static');

http.createServer(function (req, res) {
    fileServer.serve(req,res);
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');