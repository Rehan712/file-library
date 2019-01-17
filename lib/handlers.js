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
  if (data.query.phone) {
    myFileLib.readFile("users", data.query.phone, function(err, fileData) {
      if (!err && fileData) {
        fileData = typeof fileData == 'object' ? fileData : JSON.parse(fileData)
        callback(200, fileData);
      } else {
        callback(401, { message: err });
      }
    });
  } else {
    callback(400, { message: "query not found with phone" });
  }
};

handlers._users.put = (data, callback) => {
	if(!data.query.phone){
		callback('no phone is found in query')
	}else{
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
	}
  
};


handlers._users.delete = (data,callback)=>{
  if(data.query.phone){
    myFileLib.deleteFile('users',data.query.phone,(err)=>{
      if(err){
        callback(err)
      }else{
        callback(false,{message:'file deleted successfully'})
      }

    })
  }else{
    callback('no query found for deletingg the file')
  }
}

module.exports = handlers;
