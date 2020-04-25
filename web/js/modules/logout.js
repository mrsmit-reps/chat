export default function logout(socket) {
	if(socket){
		socket.destroy();
	}
	$("#frame").hide();
	$("#landing").show();
	
	$(".contact").each(function(){
		if (!$(this).hasClass("hide")){
			$(this).remove();
		}
	});
	
	$(".messages li").each(function(){
		$(this).remove();
	});
}