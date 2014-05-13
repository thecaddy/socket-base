
var fs = require('fs'),
    sys = require('sys'),
    http = require('http'),
    mime = require('mime'),
    redis = require('redis');


function start(port){
  var ActiveQueries = {};
  var db = redis.createClient(6379, '127.0.0.1');
  var subscriber = redis.createClient(6379, '127.0.0.1');

  db.set('ActiveQueries', ActiveQueries);

  //console.log('setting foo');
  db.set("foo", "this is crazy");

  // This will return a JavaScript String
  db.get("foo", function (err, reply) {
      console.log('made it here');
      console.log(reply.toString()); // Will print `OK`
  });

  // This will return a Buffer since original key is specified as a Buffer
  db.get(new Buffer("foo"), function (err, reply) {
      console.log(reply.toString()); // Will print `<Buffer 4f 4b>`
  });
  //db.end();


  var io = require('socket.io').listen(8000);

  //io.set('heartbeats', false);

  var data = { set: 'one'};
  // setInterval(function() {
  //     console.log('trying to publish');
  //     db.publish('foo', 'Date.now');
  // } , 5000);

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
          

          
          //ActiveQueries.pop(socket.ActiveQuery);
      });
  });
  subscriber.on('message', function(channel, message){
      //console.log('foo changed: ', channel);
      //console.log(ActiveQueries[channel]);
      io.sockets.emit(channel, message);
  });


  var options = {
    hostname: 'www.google.com',
    port: 8282,
    path: '',//propertyc/64',
    method: 'GET'
  };

  http.get("http://www.google.com/index.html", function(res) {
    console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      //console.log('BODY: ' + chunk);
    });
  });

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

exports.start = start;

















