var websocket = require('websocket-stream');
var ecstatic = require('ecstatic');
var cmd = require('./lib/cmd');
var random = require('make-random-string');
var serverUrl = require('server-url');

var clients = {};

var server = require('http').createServer(ecstatic(__dirname + '/static'));
var wss = websocket.createServer({server: server}, handle);

function handle(stream) {
    console.log('new socket');

    stream.on('data', function(data) {
        cmd(data.toString(), {

            'pc': function() {
                var id = random(5, 'abcdefghijklmnopqrstuvwxyz');
                clients[id] = stream;
                stream.write('#! id ' + id);
            },

            'mobile': function(id) {
                if(clients[id]) {
                    clients[id].write('#! start');
                    stream.pipe(clients[id])
                } else {
                    stream.write('#! error');
                }
            }
        });
    });
};

server.listen(9002, function() {
    console.log('server listening on:', serverUrl(server));
});
