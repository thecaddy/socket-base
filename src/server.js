
var fs = require('fs'),
    sys = require('sys'),
    mime = require('mime'),
    socketio = require('socket.io'),
    redis = require('redis'),
    request = require('request'),
    colors = require('colors'),
    io;


function start(port, api, redisIP){
  var ActiveQueries = {};
  var db = redis.createClient(6379, '172.30.51.102');
  var subscriber = redis.createClient(6379, '172.30.51.102');

  db.set('ActiveQueries', ActiveQueries);
  io = socketio.listen(port);

  //io.set('heartbeats', false)

  io.sockets.on('connection', function (socket) {
      socket.on('register', function (data) {
          console.log('register: ', data);

          //ActiveQueries.push(data);
          socket.ActiveQuery = data;
          db.set('ActiveQueries', ActiveQueries);
          if(!ActiveQueries[data]){
              subscriber.subscribe(data);
              ActiveQueries[data] = {
                  count: 1,
                  query: data
              }
          }else{
              ActiveQueries[data].count++;
          }
          console.log(ActiveQueries);
          //console.log(socket);
      });

      socket.on('disconnect', function(data){
          console.log('USER DISCONNECTED');
          console.log('Data: ', socket.ActiveQuery);
          if(ActiveQueries[socket.ActiveQuery]){
              ActiveQueries[socket.ActiveQuery].count--;
              if(!ActiveQueries[socket.ActiveQuery].count){
                  subscriber.unsubscribe(socket.ActiveQuery);
                  delete ActiveQueries[socket.ActiveQuery];
              }
          }
      });
  });
  subscriber.on('message', function(channel, message){
      io.sockets.emit(channel, message);
  });

  //set up polling
  setInterval(function(){
    for(var key in ActiveQueries){
      var options = {
        url: api + ActiveQueries[key].query.url,
        method: 'POST',
        qs: ActiveQueries[key].query.query,
        encoding: 'utf8',
        headers:{
          'User-Agent': 'request'
        }
      }
      var code;
      var t = Date.now();
      console.log('-->'.grey + ' POST '.bold.blue + ActiveQueries[key].query.url.grey);
      request(options, function(err, res, body) {         
        if(res.statusCode ==200)
          code = res.statusCode.toString().green;
        else
          code = res.statusCode.toString().red;

        var el = Date.now() - t;

        console.log('<--'.grey + ' POST '.bold.blue + ActiveQueries[key].query.url.grey 
          + ' ' + code + ' ' + el.toString().grey + 'ms -'.grey); 
        db.get(key, function (err, reply) {
          if(reply != body){
              db.publish(key, body);
              db.set(key, body);
          }
        });
      });

      //console.log('val:',db.get(key));
      // db.get(key, function (err, reply) {
      //     if(reply != (new Date()).getMinutes()){
      //         db.publish(key, (new Date()).getMinutes());
      //         db.set(key, (new Date()).getMinutes());
      //     }
      // });
    }
  }, 5000);
}

exports.start = start;

















