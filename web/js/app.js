// chat client engine



let CryptoJS = require("crypto-js");
import {sha256} from 'crypto-js/sha256';
import logout from './modules/logout';
import login from './modules/login';
import {nst_server_msg, nst_add_user_profile, nst_remove_user_profile, 
        nst_add_all_user_profiles, send_message, escapeHtml, fix_viewport_mobile} from './modules/utils';
let $ = require("jquery");
window.jQuery = $;
window.$ = $;


$(() => {
	let socket;
	let name = '';
	let disc_msg = "Connection lost";


	$("#nst_login").click(async ()=>{
		name = $("#nst_name").val().trim();
		let ret = await login(name, '');
		
		if (ret == "server_error"){
			$("#nst_status").html("Server down, try again laiter.");
		}
		
		if (ret.hasOwnProperty("token")){
			$("#nst_status").html('');
			engine(ret.token);
		}
		
		if (ret.hasOwnProperty("error")){
			$("#nst_status").html(ret.error);
		}
	});

	$("#nst_name").keypress((e)=>{
		if (e.which == 13){
			$("#nst_login").click();
		}
	});
	
	$("#nst_send").click(()=>{
		send_message(socket);
	});
	
	$("#nst_text").keypress((e)=>{
		if (e.which == 13){
			$("#nst_send").click();
		}
	});
	
	$(".nst_close").click(()=>{
		disc_msg = "";
		socket.disconnect();
	});

	function engine(token){
		if (!socket){
			socket = io();
		}else{
			socket.destroy();
			socket = io();
		}
		
		// on connect
		socket.on('connect', ()=> {
		  	if (!socket.connected){
				$("#nst_status").html("Can't connecto to server");
				return false;
			}
			
	
			socket.emit('authenticate', { token: token}).on('authenticated', () => {
				  socket.emit('login', { name: name });
			})
			.on('unauthorized', (msg) => {
				console.log(`Unauthorized: ${JSON.stringify(msg.data)}`);
			})
		});
		
		
		// loggined
		socket.on('loggined', (data)=>{
			nst_add_all_user_profiles(data.all_users);
			
			$("#landing").hide();
			$("#frame").show();
			fix_viewport_mobile();
			$("#nst_text").focus();
		});

		
		// on disconnect
		socket.on('disconnect', ()=> {
			$("#nst_status").html(disc_msg);
			disc_msg = "Connection lost";
			logout(socket);
		});
		
		
		// ping pong game
		socket.on('nst_pong', ()=> {
			//console.log("Server: Pong");
			socket.emit('nst_ping');
		});
		
		
		// server
		socket.on('server', (data)=>{
			
			
			if (data.type == "login"){
				nst_add_user_profile(data.login, data.avatar);
				nst_server_msg(data);
			}
			
			if (data.type == "logout"){
				nst_remove_user_profile(data.login);
				nst_server_msg(data);
			}
			
			if (data.type == "kick" && data.login.toLowerCase() == name.toLowerCase()){
				disc_msg = 'Kicked due inactivity';
				socket.disconnect();
			}
			
			if (data.type == "msg"){ 
				let msg = data.msg;
				msg = escapeHtml(msg);
				
				let cl = 'replies';
				if (data.login.toLowerCase() == name.toLowerCase()){
					cl = 'sent';
				}
				
				$('<li class="'+cl+'" title="'+data.login+'"><img src="images/'+data.avatar+'.png" alt="" /><p><span style="font-weight:bold;">'+data.login+':</span><br>' + msg + '</p></li>').appendTo($('.messages ul'));
				$('.contact[data-name="'+data.login+'"]').find(".preview").html(msg.substring(0, 100));
				$(".messages").animate({ scrollTop: $('.messages').prop("scrollHeight") }, "fast");
			}
		});
		

	}
});

