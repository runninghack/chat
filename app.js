
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , sio = require('socket.io')
  , client = require('redis');

var app = express(),
    server = http.createServer(app),
    users = {};//记录在线用户


app.configure(function(){
  console.log('config');
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

/*app.configure('production', function(){
  app.use(express.errorHandler());
});*/

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/reg',routes.reg);
app.post('/reg',routes.doReg);
app.get('/login',routes.login);
app.post('/login',routes.dologin);
app.get('/chat',routes.chat);

/*var server = http.createServer(app).listen(app.get('port'),function(){
})*/

var io = sio.listen(server);

io.sockets.on('connection',function(socket){

    //console.log('sockets');
	var socketobj = socket;
	socket.on('addme',function(username){
	    console.log('socket-username:',username);
		socket.username = username;
		users[username] = socket;
		refresh_online();
		socket.emit('chat','SERVER','You have connected');
	});
	
	//console.log("socket.handshake:",socket.handshake);
	
	var refresh_online = function(){
	    console.log('online');
		var usersonline = [];
		for(var i in users){
		    usersonline.push(i);//写入栈
		}
		io.sockets.emit('online list', usersonline);//所有人广播
	}
		
	socket.on('sendchat',function(data){
	    console.log('send-data:',data);
	    io.sockets.emit('chat',socket.username,data);
	});
	
	//私人信息
	socket.on('private message',function(to, msg){
	    console.log('private message');
		console.log('to: ',to);
		console.log('msg: ',msg);
		var target = users[to];
		console.log('target: ',target);
		target.emit('private message', socket.username, msg);
		/*if (target) {
			target.emit('private message', name+'[私信]', msg);
		}
		else {
			socket.emit('message error', to, msg);
		}*/
	});
	
	socket.on('disconnect',function(){
	    console.log('disconnect-socketname:',socketobj.username);
		delete users[socketobj.username];		
		refresh_online();
	});
});

server.listen(3000,"192.168.0.3");
//server.listen(3000,"192.168.0.1");
//server.listen(3000);
/*server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});*/
