var io = require('socket.io-client');
var chalk = require('chalk');
var spam;var ownlogout = false;
var socket = null;
var ilr = {
	server: 'http://chat.iloveradio.de:13000',
	room: '101',
	name: 'Blu'
};
process.on('uncaughtException', function (err) {
  console.log(chalk.white.bgRed(err));
});
function query(text, callback) {
    'use strict';
    process.stdin.resume();
    process.stdout.write(text);
    process.stdin.once("data", function (data) {
        callback(data.toString().trim());
    });
}
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var randomString = function(len){
	var text = "";var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i=0;i<len;i++){text += possible.charAt(Math.floor(Math.random() * possible.length));}
	return text;
};
var waitForMessage = function(text){
	query(text, function(response){
		if(response.startsWith('msg ')){
			message(response.replace('msg ', ''));
		// }else if(response.startsWith('name ')){
			// logout();
			// login(response.replace('name ', ''));
		// }else if(response.startsWith('eval ')){
			// eval(response.replace('eval ', ''));
		}
		process.stdin.pause();
		waitForMessage();
	});
};
var register = function(name, email, pw){
	socket.emit('vum_register', {'name': name, 'mail': email, 'password': pw});
};
var login = function(name){
	socket.emit('login', {
		'name': name
	});
};
var logout = function() {
	ownlogout = true;
    socket.emit('logout'); 
};
var room = function(room){
	socket.emit('joinroom', {
		'room': room
	});
};
var message = function(msg){
	console.log('Sending message: '+msg);
	socket.emit('chat message', {
		'text': msg
	});
};
var connect = function(server, chatroom, name){
	if(server){ilr.server = server;}
	socket = io(ilr.server, {
		transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket']
	});
	console.log(chalk.green('Welcome to the ILoveRadio Shoutbox!'));
	//console.log(chalk.green('Commands: msg <text>, eval <code>, name <newname>'));
	socket.connect();
	if(chatroom){ilr.room = chatroom;}
	room(ilr.room);
	if(name){ilr.name = name;}
	login(name);
};
var registerEvents = function(){
	socket.on('chat message', function(msg) {
		if(msg.verified){
			console.info(chalk.green(msg.name)+': '+msg.text);
		}else{
			console.log(chalk.cyan(msg.name)+': '+msg.text);
		}
	});
	socket.on('login', function(msg) {
		if (msg.success === 'true') {
			console.log(chalk.black.bgGreen('Logged in.'));
			message('hallu c:');
		} else if (msg.success === 'wrong') {
			console.log('Der Login hat nicht geklappt! Prüfe bitte Name und Passwort.');
		} else {
			console.log('Dein Name scheint schon belegt zu sein... benutze bitte einen anderen!');
			connect();
		}
	});
	socket.on('logout', function() {
		console.log(chalk.black.bgYellow('Logged out!'));
		if(!ownlogout){
			login(randomString(9));
		}else{
			ownlogout = false;
		}
	});
	socket.on('room in', function() {
		console.log('chat wants me to room in');
	});
	socket.on('vum_registration_fail', function() {
		console.log(chalk.red('vum_registration_fail'));
	});
	socket.on('vum_registration_done', function() {
		console.log('vum_registration_done');
	});
};
if (null === socket) {
	connect();registerEvents();
	// query('Enter Server ('+ilr.server+'): ', function(response){
		// if(response){ilr.server = response;}
		// process.stdin.pause();
		// query('Enter Room Number ('+ilr.room+'): ', function(response){
			// if(response){ilr.room = response;}
			// process.stdin.pause();
			// query('Enter Name ('+ilr.name+'): ', function(response){
				// if(response){ilr.name = response;}
				// process.stdin.pause();
				// connect();registerEvents();
			// });
		// });
	// });
} else {
	if (socket.disconnected) {
		console.log(chalk.white.bgRed('Socket Disconnected: reconnecting...'));
		connect();
	}
}
waitForMessage('');