let socketioJwt = require("socketio-jwt");
let express = require("express");
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let jwt = require('jsonwebtoken');
let fs = require('fs');
let bodyParser = require("body-parser");
let utils = require('./modules/utils');
let winston = require('winston');
let {format} = winston;
let config = require('config');



// Core
global.users = [];
let avatar=1;
let config_port = config.get("listen_port");
let config_token = config.get("server_token");
let config_client_timeout = config.get("client_timeout");
let config_server_logs = config.get("logs");

let logger = winston.createLogger({
	level: 'info',
	transports: [
		new winston.transports.Console({
		  level: 'info',
		  format: winston.format.combine(
			winston.format.colorize(),
			winston.format.simple()
		  )
		}),
		new winston.transports.File({
			filename: config_server_logs,
			level: 'info',
			format: winston.format.combine(
					winston.format.timestamp({format:'MM-YY-DD HH:mm:ss'}),
					winston.format.json()
			)
		})
	]
});



http.listen(config_port, () => logger.info('Listening on port: '+config_port))

io.on('connection', socketioJwt.authorize({
    secret: config_token,
    timeout: 15000
}));

io.on('authenticated', (socket) => {
	let ip = socket.conn.remoteAddress.split(":")[3];
	logger.info("Client authorized: "+socket.decoded_token.name+', ip: '+ip);
});
  
io.on('connection', (socket) => {
	let ip = socket.conn.remoteAddress.split(":")[3];
	logger.info('Connected: '+ip);

	socket.on('disconnect', () => {
		if (socket.decoded_token && socket.decoded_token.name){
			logger.info('Disconnected '+ip+", Name: "+socket.decoded_token.name);
			
			let left_details = '';
			for(let i in global.users){
				if (global.users[i].login.toLowerCase() == socket.decoded_token.name.toLowerCase() && global.users[i].timeout < utils.nst_unix()){
					left_details = ' due to inactivity';
					break;
				}
			}
			
			io.emit('server', { type: "logout", login: socket.decoded_token.name, msg: socket.decoded_token.name+" has left chat"+left_details });
			utils.quit_users(socket.decoded_token.name);
		}
	});
	
	socket.on('nst_ping', ()=>{
		//logger.info("ping");  
	});

	socket.on('login', (data) => {
		if (!data.hasOwnProperty("name")){
			return false;
		}

		
		if (!utils.is_name_in_use(socket.decoded_token.name)){
			logger.info('User '+ip+", "+socket.decoded_token.name+" joined chat");
			global.users.push({login: socket.decoded_token.name, avatar: socket.decoded_token.avatar, timeout: utils.nst_unix() + config_client_timeout});
			
			socket.broadcast.emit('server', { type: 'login', login: socket.decoded_token.name, avatar: socket.decoded_token.avatar, msg: socket.decoded_token.name+" joined to chat" });
			socket.emit('loggined', { login: socket.decoded_token.name, avatar: socket.decoded_token.avatar, all_users: global.users });
		}else{
			logger.log("error", "User already loggined: "+socket.decoded_toke.name);
		}
	});
	

	socket.on('msg', (msg)=>{
		if (msg.length > 1024){
			msg = msg.substring(0, 1024);
		}
		logger.info("Message <"+socket.decoded_token.name+"> "+msg);
		io.emit('server', { type: 'msg', login: socket.decoded_token.name, avatar: socket.decoded_token.avatar, msg: msg });
		utils.timeout(socket.decoded_token.name, utils.nst_unix() + config_client_timeout);
	});

});

// Ping Pong game
setInterval(()=>{
	io.emit('nst_pong');
}, 10000);

// Auto kick idle clients
setInterval(()=>{
	for(let i in global.users){
		if (global.users[i].timeout < utils.nst_unix()){
			io.emit('server', { type: 'kick', login: global.users[i].login });
			logger.info("User <"+global.users[i].login+"> kicked due inactivity");
		}
	}
}, 1000);


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('web'));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/web/chat_client.htm");
});


app.post("/login", (req, res) => {
	
	let name = req.body.username || '';

	if (!name.match(/^[a-zA-Z0-9\._\s-]{1,30}$/)){
		res.send({error: 'Min. name length 1 Max 30 symbols, and allowed characters are: a-z A-Z 0-9 . _ - space'});
		return;		
	}

	if (utils.is_name_in_use(req.body.username)){
		res.send({error: "Name already in use, choose another name"});
	}else{
		let token = jwt.sign({ name: req.body.username, avatar: avatar }, config_token);
		avatar++;
		if (avatar > 10){
			avatar = 1;
		}
		res.send({token: token});
	}
});
