import nst_post from './utils';

export default async function login(username, passwd) {
	let data = await nst_post("/login", {username: username, passwd: passwd});
	if (!data){
		return 'server_error';
	}
	
	return data;
}

