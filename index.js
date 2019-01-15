// var http = require('http');
// var url = require('url');



// var server = http.createServer(function(req,res){
// 	console.log('this is the headers',req.headers)
// 	var parcedUrl = url.parse(req.url);
// 	var path = parcedUrl.pathname
	
// 	res.send('Hello World')
// 	console.log('this is the parsed url ',parcedUrl)
// })

// server.listen(3000,()=>console.log('node server is listening on port 3000'))


var http = require('http');
var url = require('url');
var myFileLib = require('./lib/data');
var StringDecoder = require('string_decoder').StringDecoder
 // Configure the server to respond to all requests with a string
var server = http.createServer(function(req,res){

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data',(data)=>{
  	buffer += decoder.write(data)
  })
  req.on('end',()=>{
  	buffer += decoder.end();
  	buffer = isJson(buffer) ? JSON.parse(buffer) : {} 
  	console.log('this si the buffer',buffer)
  	var chosenHandler = router[trimmedPath] ? router[trimmedPath] : router.notFound;
  	var data = {
  		headers:req.headers,
  		path,
  		body:buffer,
  		query:parsedUrl.query
  	}
  	chosenHandler(data,(status,response)=>{
  		status = status ? status : 200;
  		response = response ? response : {}
  		res.setHeader('Content-Type','application/json');
  		res.writeHeader(status)
  		res.end(JSON.stringify(response));
  	})
  })
  // Send the response
});

function isJson(str) {
	try{
		JSON.parse(str)
		return true
	}catch(e){
		return false
	}
	return true
}

var handlers = {};

handlers.createFile = (data,callback)=>{
	myFileLib.createFile('test','pakage.json',{author:'rehan'},(err)=>{
		if(err){
			callback(400,{message:{err}})
		}else{
			callback(200,{message:'file created successfully'})
		}
	})
}

handlers.notFound = (data,callback)=>{
	callback(404,{message:'not found'})
}

handlers.readFile = (data,callback)=>{
	myFileLib.readFile('test','pakage.json',(err,fileData)=>{
		if(err){
			callback(400,{message:err})
		}else{
			callback(200, {data:fileData})
		}
	})
}

handlers.updateFile = (data,callback)=>{
	myFileLib.updateFile('test','pakage.json',{license:'MIT'},(err)=>{
		if(err){
			callback(400,{message:err})
		}else{
			callback(200,{message:'file updated successfully'});
		}
	})
}

handlers.deleteFile = (data,callback)=>{
	myFileLib.deleteFile('test','pakage.json',(err)=>{
		if(err){
			callback(400,{message:err})
		}else{
			callback(200,{message:'file deleted successfully'})
		}
	})
}


var router = {
	readFile:handlers.readFile,
	createFile:handlers.createFile,
	updateFile:handlers.updateFile,
	deleteFile:handlers.deleteFile,
	notFound:handlers.notFound
}

// Start the server
server.listen(5000,function(){
  console.log('The server is up and running now');
});