module.exports = {
	
	is_name_in_use: function (username) {
		for(let i in global.users){
			if (global.users[i].login.toLowerCase() == username.toLowerCase()){
				return true;
			}
		}
		return false;
	},
	
	quit_users: function(username){
		for(let i in global.users){ 
			if (global.users[i].login.toLowerCase() == username.toLowerCase()) {
				global.users.splice(i, 1);
				return true;
			}
		}
		return false;
	},
	
	timeout: function(username, unix){
		for(let i in global.users){ 
			if (global.users[i].login.toLowerCase() == username.toLowerCase()) {
				global.users[i].timeout = unix;
				return true;
			}
		}
		return false;
	},
	
	nst_unix: function(){
		return Math.round(+new Date()/1000);
	}

};
