var http = require('http');
var url = require('url');
var Ants = require('ants');

var farm = new Ants();

farm.addNode('a', function(p){
    var url_parts = url.parse(p, true);
    return url_parts.path;
});

farm.addNode('b', function(p){
    return 'No ' + p + ' For YOU!!!';
});
farm.connect('a', 'b');

http.createServer(function (req, res) {
    farm.message(req.url, function(endPacket){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(endPacket + '\n');
    }, {});
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');