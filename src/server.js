
var fs = require('fs'),
    sys = require('sys'),
    http = require('http'),
    mime = require('mime'),
    socketio = require('socket.io'),
    redis = require('redis'),
    io;


function start(port, api, redisIP){
  var ActiveQueries = {};
  var db = redis.createClient(6379, '172.30.51.102');
  var subscriber = redis.createClient(6379, '172.30.51.102');

  db.set('ActiveQueries', ActiveQueries);
  io = socketio.listen(port);

  //io.set('heartbeats', false)

  io.sockets.on('connection', function (socket) {
      socket.emit('news', { hello: 'world' });
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


  var options = {
    hostname: 'www.google.com',
    port: 8282,
    path: '',//propertyc/64',
    method: 'GET'
  };

  //set up polling
  setInterval(function(){
      for(var key in ActiveQueries){
          http.get("http://www.google.com/index.html", function(res) {
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
              //db.publish(key, 'chunk');
            });
          });
          //console.log('val:',db.get(key));
          db.get(key, function (err, reply) {
              console.log('reply:', reply);
              if(reply != (new Date()).getMinutes()){
                  db.publish(key, (new Date()).getMinutes());
                  db.set(key, (new Date()).getMinutes());
              }
          });
          
          //db.publish(key, ('pinging server: ', new Date()));
      }
  }, 5000);
}

function stop(){
  console.log('io', io);
}

exports.start = start;
exports.stop = stop;

















