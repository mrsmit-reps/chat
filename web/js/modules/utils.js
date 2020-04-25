export default async function nst_post(url, post_params){
    return new Promise(resolve => {
        $.post(url, post_params, function(data){
            return resolve(data);
        }).fail(()=>{
			return resolve(false);
		});
    });
}


export function nst_server_msg(data) {
	$('<li class="sent"><img src="images/server.jpg" alt="" /><p>' + data.msg + '</p></li>').appendTo($('.messages ul'));
	$(".messages").animate({ scrollTop: $('.messages').prop("scrollHeight") }, "fast");
};


export function nst_add_user_profile(name, avatar){
	let x = $(".contact.hide").clone();
	x.removeClass("hide");
	x.attr("data-name", name);
	x.find("img").attr("src", "images/"+avatar+".png");
	x.find(".name").html(name);
	x.appendTo($('#contacts ul'));
}

export function nst_add_all_user_profiles(users){
	for(let i in users){
		nst_add_user_profile(users[i].login, users[i].avatar);
	}
}

export function nst_remove_user_profile(name){
	$(".contact").each(function(){
		if (!$(this).hasClass("hide")){
			if ($(this).attr("data-name") == name){
				$(this).remove();
				return true;
			}
		}
	});
}

export function send_message(socket){
	let msg = $("#nst_text").val();
	$("#nst_text").val('');
	msg = msg.trim();
	if (msg.length){
		socket.emit('msg', msg);
	}
	$("#nst_text").focus();
}

export function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

export function fix_viewport_mobile(){
	let rootElement = document.querySelector("#frame");
	let viewPortH = rootElement.getBoundingClientRect().height;
	let windowH = window.innerHeight;
	let browserUiBarsH = viewPortH - windowH;
	rootElement.style.height = `calc(100vh - ${browserUiBarsH}px)`;
}
