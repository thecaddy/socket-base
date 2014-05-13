var util = require('util');

function formatArgs(args){
    return [util.format.apply(util.format, Array.prototype.slice.call(args))];
}

process.on('uncaughtException', function(err){
  var localargs = {};
  if(err.localargs){
    localargs = err.localargs;
  }

  console.error('message:['+ err.message + ']\r\n'
    + 'localargs:[' + util.inspect(localargs) + ']\r\n'
    + 'stack:[' + err.stack + ']\r\n');
  process.exit(1);
})