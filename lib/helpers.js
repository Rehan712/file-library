var crypto = require('crypto');

var helpers = {};

helpers.hash = str=>{
	if(typeof str === 'string' && str.length > 0){
		const hash = crypto.createHmac('sha256','my-secret')
		.update(str)
		.digest('hex')
		return hash
	}else{
		return false
	}
}

helpers.isJson = function(str) {
	try{
		JSON.parse(str)
		return true
	}catch(e){
		return false
	}
	return true
}

module.exports = helpers