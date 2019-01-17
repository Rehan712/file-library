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

helpers.createRandomString = no=>{
	if(typeof no === 'number' && no > 0){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= no; i++) {
        // Get a random charactert from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
}
module.exports = helpers