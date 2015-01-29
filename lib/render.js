
var fit = require('canvas-fit');
var through = require('through');

module.exports = function(canvas) {
    window.addEventListener('resize', fit(canvas));
    var ctx = canvas.getContext('2d');

    var stream = through(write);
    stream.reset = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    return stream;

    function write(data) {
        ctx.fillRect(data.x*10, data.y*10, 10, 10);
    }
}