var fade = require('fade');
var websocket = require('websocket-stream');
var through = require('through');
var cmd = require('./cmd');
var clamp = require('clamp');
var config = require('./config');

var breadCrumbs = document.querySelector('.breadcrumb');
var getId = document.getElementById('getId');
var copyToPhone = document.getElementById('copyToPhone');
var urlHolder = document.getElementById('clientUrl');
var canvas = document.createElement('canvas');

var render = require('./render')(canvas);

getId.addEventListener('click', requestId);

function requestId(){
    getId.classList.add('active');
    initWebSocket()
}

function initDrawing(){
    if(!copyToPhone.classList.contains('active')) return;

    fade.out(breadCrumbs, 500, function(){
        document.body.removeChild(breadCrumbs)
    });

    fade.out(urlHolder, 500, function(){
        fade.in(urlHolder);
        urlHolder.classList.add('unselectable');
    })

    document.body.appendChild(canvas);
}

function urlGotten(key){
    urlHolder.innerHTML = 'STEP 1: Go to `' + config.root_url + 'mobile' + '`' + '<br> STEP 2: Enter your KEY: '+ key + '<br><br> Waiting for mobile connection... <br><br>';
    var img = document.createElement('img')
    img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + config.root_url + 'mobile%23' + key;
    urlHolder.appendChild(img);
    copyToPhone.classList.add('active');
}

function initWebSocket(){
    var ws = websocket(config.socket_url);

    ws.write('#! pc');
    ws.on('data', function(data){
        cmd(data.toString(), {
            'id': function(id){
                urlGotten(id);
            },
            'start': function() {
                urlHolder.innerHTML = '';
                initDrawing();
                ws.pipe(through(updatePosition())).pipe(render);
            },
            'reset': function() {
                render.reset();
            }
        });
    });
}

function updatePosition(startingPosition) {
    var position = startingPosition || {x:0,y:0};

    return function(data) {
        var direction = data.toString();

        if(direction == 0) --position.y;
        if(direction == 1) ++position.y;
        if(direction == 2) --position.x;
        if(direction == 3) ++position.x;

        position.x = clamp(position.x, 0, canvas.width/10);
        position.y = clamp(position.y, 0, canvas.height/10);

        this.queue(position);
    }
}
