var myFileLib = require("./data");
var helpers = require("./helpers");

var handlers = {};

handlers.createFile = (data, callback) => {
  myFileLib.createFile("test", "pakage.json", { author: "rehan" }, err => {
    if (err) {
      callback(400, { message: { err } });
    } else {
      callback(200, { message: "file created successfully" });
    }
  });
};

handlers.notFound = (data, callback) => {
  callback(404, { message: "not found" });
};

handlers.readFile = (data, callback) => {
  myFileLib.readFile("test", "pakage.json", (err, fileData) => {
    if (err) {
      callback(400, { message: err });
    } else {
      callback(200, { data: fileData });
    }
  });
};

handlers.updateFile = (data, callback) => {
  myFileLib.updateFile("test", "pakage.json", { license: "MIT" }, err => {
    if (err) {
      callback(400, { message: err });
    } else {
      callback(200, { message: "file updated successfully" });
    }
  });
};

handlers.deleteFile = (data, callback) => {
  myFileLib.deleteFile("test", "pakage.json", err => {
    if (err) {
      callback(400, { message: err });
    } else {
      callback(200, { message: "file deleted successfully" });
    }
  });
};

handlers.users = (data, callback) => {
  const methods = ["get", "post", "put", "delete"];
  if (methods.indexOf(data.method) !== -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers.tokens = (data,callback)=>{
  const methods = ["get", "post", "put", "delete"];
  if(methods.indexOf(data.method) !== -1){
    handlers._tokens[data.method](data,callback)
  }else{
    callback(405)
  }
}

handlers._users = {};

handlers._users.post = (data, callback) => {
  var firstName = data.body.firstName ? data.body.firstName : false;
  var lastName = data.body.lastName ? data.body.lastName : false;
  var phone = data.body.phone ? data.body.phone : false;
  var password = data.body.password ? data.body.password : false;
  var tosAgreement = data.body.tosAgreement ? data.body.tosAgreement : false;
  if (firstName && lastName && phone && password && tosAgreement) {
    myFileLib.readFile("users", phone, (err, data) => {
      if (err) {
        var hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          var userObject = {
            firstName,
            lastName,
            phone,
            password: hashedPassword,
            tosAgreement: true
          };
          myFileLib.createFile("users", phone, userObject, err => {
            if (err) {
              callback(400, { message: "cannot create the new user" });
            } else {
              callback(200, { message: "file created successfully" });
            }
          });
        } else {
          callback(400, { message: "cannot hashed the password" });
        }
      } else {
        callback(400, { message: "file with this user already exists" });
      }
    });
  } else {
    callback(400, { message: "required field is missing" });
  }
};

handlers._users.get = (data, callback) => {
  const phone = data.query.phone
  if (phone) {
    const token = data.headers.token
    if(!token){
      callback(403,'token is missing in headers')
    }else{
      handlers._tokens.verify(token,phone,(isValid)=>{
        if(isValid){
          myFileLib.readFile("users", data.query.phone, function(err, fileData) {
            if (!err && fileData) {
              fileData = typeof fileData == 'object' ? fileData : JSON.parse(fileData)
              callback(200, fileData);
            } else {
              callback(401, { message: err });
            }
        });
        }else{
          callback(401,{message:'Invalid Token '})
        }
      })
    }
   
  } else {
    callback(400, { message: "query not found with phone" });
  }
};

handlers._users.put = (data, callback) => {
  const token = data.headers.token
	if(!data.query.phone){
		callback('no phone is found in query')
	}else{
    if(!token){
      callback(403,{message:'no token found in teh headers'})
    }else{
      handlers._tokens.verify(token,data.query.phone,(isValid)=>{
        if(isValid){
          var firstName = data.body.firstName ? data.body.firstName : false;
          var lastName = data.body.lastName ? data.body.lastName : false;
          var phone = data.query.phone;
          var password = data.body.password ? data.body.password : false;
          var tosAgreement = data.body.tosAgreement ? data.body.tosAgreement : false;
          myFileLib.readFile("users", phone, (err, fileData) => {
            if (err) {
              callback("file not exists");
            } else {
                const newFileData = {...JSON.parse(fileData)}
                if(firstName){
                  newFileData.firstName = firstName
                }
                if(lastName){
                  newFileData.lastName = lastName
                }
                if(password){
                  newFileData.password = helpers.hash(password)
                }       
                myFileLib.updateFile('users',data.query.phone,newFileData,(err)=>{
                  if(err){
                    callback(err)
                  }else{
                    callback(false,{message:'file update successfully'})
                  }
                })
              }
            });
        }else{
          callback(401,{message:'Unauthorized'})
        }
      })
    }
		
	}
  
};


handlers._users.delete = (data,callback)=>{
  const token = data.headers.token,
  phone = data.query.phone
  if(token && phone){
    handlers._tokens.verify(token,phone,(isValid)=>{
      if(isValid){
         if(phone){
          myFileLib.deleteFile('users',phone,(err)=>{
            if(err){
              callback(err)
            }else{
              callback(false,{message:'file deleted successfully'})
            }

          })
        }else{
          callback('no query found for deletingg the file')
        }
      }else{
        callback(401,{message:'Unauthorized'})
      }
    })
  }else{
    callback(405,{message:'no token foudn in the headers'})
  }
}


handlers._tokens = {};

handlers._tokens.post = (data, callback) => {
  var phone = data.body.phone ? data.body.phone : false;
  var password = data.body.password ? data.body.password : false;
  var hashedPassword = helpers.hash(password);
  if (phone && hashedPassword) {
    myFileLib.readFile('users',phone,(err,fileData)=>{
      if(err){
        callback(400,{message:err})
      }else{
        var usersPassword = JSON.parse(fileData).password
        if(usersPassword == helpers.hash(password)){
          const tokenId = helpers.createRandomString(20)
          var tokenObject = {
          phone,
          password: hashedPassword,
          id:tokenId,
          expires:Date.now() + 1000 * 60 * 60
        };
    myFileLib.createFile("tokens", tokenId, tokenObject, err => {
      if (err) {
        callback(400, { message: "cannot create the new user" });
      } else {
        callback(200, { message: tokenObject });
      }
    });
        }else{
          callback(401,{message:'password does not match'})
        }
      }
    })
  } else {
    callback(400, { message: "phone or hashed password missing" });
  }
};

handlers._tokens.get = (data,callback)=>{
  const id = typeof data.query.tokenId == "string" && data.query.tokenId
  if(id){
    myFileLib.readFile('tokens',id,(err,fileData)=>{
      if(err){
        callback(400,{message:err})
      }else{
        callback(200,JSON.parse(fileData))
      }
    })
  }else{
    callback(400,{message:'cannot found the valid token id in the params'})
  }
}

handlers._tokens.put = (data,callback)=>{
  var phone = data.body.phone ? data.body.phone : false;
  var password = data.body.password ? data.body.password : false;
  var hashedPassword = helpers.hash(password);
  var tokenId = data.query.tokenId && data.query.tokenId
  if(tokenId){
  myFileLib.readFile('tokens',tokenId,(err,fileData)=>{
    if(err){
      callback(400,{message:err})
    }else{
      fileData = JSON.parse(fileData)
     if(phone){
      fileData.phone = phone
     }
     if(password){
      fileData.password = helpers.hash(password)
     }
     fileData.expires = Date.now() * 1000 * 60 * 60
     myFileLib.updateFile('tokens',tokenId,fileData,(err)=>{
      if(err){
        callback(400,err)
      }else{
        callback(200,{message:fileData})
      }
     })
    }
  })
  }else{
    callback(400,{message:'no token id found in the query'})
  }
}

handlers._tokens.delete = (data,callback)=>{
  if(!data.query.tokenId){
    callback(400,{message:'cannot found the token id in the query'})
  }else{
    myFileLib.deleteFile('tokens',data.query.tokenId,(err)=>{
      if(err){
        callback(400,{message:err})
      }else{
        callback(200,{message:'file deleted successfully'})
      }
    })
  }
}

handlers._tokens.verify = (tokenId,phone,callback)=>{
  if(!tokenId || !phone){
    callback(false)
  }else{
    myFileLib.readFile('tokens',tokenId,(err,data)=>{
      if(err){
        callback(false)
      }else{
        data = JSON.parse(data)
        if(data.phone === phone && data.expires > Date.now()){
          callback(true)
        }else{
          callback(false)
        }
      }
    })
  }
}

handlers.checks = (data,callback)=>{
	const methods = ['get','post','put','delete'];
	if(methods.indexOf(data.method) !== -1){
		handlers._checks[data.method](data,callback)
	}else{
		callback(405)
	}
}
handlers._checks = {}
handlers._checks.post = (data,callback)=>{
	var protocol = data.body.protocol ? data.body.protocol : false
	var url = data.body.url ? data.body.url : false
	var method = data.body.method ? data.body.method : false
	var successCode = data.body.successCode ? data.body.successCode : false
	var timeoutSeconds = data.body.timeoutSeconds ? data.body.timeoutSeconds : false
	if(protocol && url && method && successCode && timeoutSeconds){
		const token = data.headers.token;
		myFileLib.readFile('tokens',token,(err,tokenData)=>{
			if(err){
				callback(403,{message:'token file not found or invalid token'})
			}else{
				var userPhone = JSON.parse(tokenData).phone;
				myFileLib.readFile('users',userPhone,(err,userData)=>{
					if(err){
						callback(403,{message:err})
					}else{
						var userChecks = typeof userData.checks === 'object' && userData.checks instanceof Array ? userData.checks : [];
						if(userChecks.length < 5){
							var checkId = helpers.createRandomString(20);
							var checkObject = {
								id:checkId,
								protocol,
								url,
								method,
								successCode,
								timeoutSeconds,
								userPhone
							}
							myFileLib.createFile('checks',checkId,checkObject,(err)=>{
								if(err){
									callback(403,{message:'error comes in creating check file'})
								}else{
									var newUserData = Object.assign({checks:userChecks},userData);
									// newUserData.checks = userChecks
									newUserData.checks.push(checkObject);
									console.log('his is the new user data',newUserData)
									myFileLib.updateFile('users',userPhone,newUserData,(err,updatedUserData)=>{
										if(err){
											callback(403,{messaage:'error comes in updating the users with checks'})
										}else{
											callback(200,checkObject)
										}
									})
								}
							})
						}else{
							callback(403,{message:'you have reached your checks max limit 5'})
						}
						
					}
				})
			}
		})
	}else{
		callback(400,{message:'something missing in the body'})
	}

}



module.exports = handlers;
