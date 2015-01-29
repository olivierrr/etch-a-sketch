
module.exports = cmd;

function cmd(str, obj) {
    obj = obj || {};

    var bits = (str[0] === '#' && str[1] === '!' && str.slice(3).split(/\s+/));

    if(!bits || bits.length < 1) return false;

    return typeof obj[bits[0]] === 'function' && obj[bits[0]].apply(null, bits.slice(1));
}
