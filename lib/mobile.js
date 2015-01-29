var Hammer = require('hammerjs');
var through = require('through');
var websocket = require('websocket-stream');
var cmd = require('./cmd');
var config = require('./config');

// prevent scrolling
document.body.addEventListener('touchmove', function(e){
    e.preventDefault();
}, false);

var h = new Hammer(document.querySelector('#horizontal'));
var v = new Hammer(document.querySelector('#vertical'));
h.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL});
v.get('pan').set({direction: Hammer.DIRECTION_VERTICAL});
h.on('panleft panright', trigger);
v.on('panup pandown', trigger);

var directionStream = through();

function trigger(e){
    var directions = {
        panup: '0',
        pandown: '1',
        panleft: '2',
        panright: '3'
    };

    directionStream.push(directions[e.type]);
}

function initWebSocket(key) {
    var ws = websocket(config.socket_url);

    ws.write('#! mobile ' + key);
    directionStream.pipe(ws);

    ws.on('data', function(data){
        cmd(data.toString(), {

            'error': function() {
                setTimeout(function() {
                    ws.write('#! mobile ' + prompt('key'));
                }, 4000);
            }
        });
    });
}

var hash = document.location.hash;
if(hash) {
    if(hash[hash.length - 1] === '/') {
        hash = hash.slice(0, hash.length - 1);
    }
    if(hash[0] === '#') {
        hash = hash.slice(1);
    }

    console.log('hash is', hash);
    initWebSocket(hash);
} else {
    initWebSocket(prompt('key'));
}