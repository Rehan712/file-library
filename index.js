


var http = require('http');
var url = require('url');
var myFileLib = require('./lib/data');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require('./lib/handlers')
var helpers = require('./lib/helpers')
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
  	buffer = helpers.isJson(buffer) ? JSON.parse(buffer) : {} 
  	console.log('this si the buffer',buffer)
  	var chosenHandler = router[trimmedPath] ? router[trimmedPath] : router.notFound;
  	var data = {
  		headers:req.headers,
  		path,
  		body:buffer,
  		query:parsedUrl.query,
  		method
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





var router = {
	readFile:handlers.readFile,
	createFile:handlers.createFile,
	updateFile:handlers.updateFile,
	deleteFile:handlers.deleteFile,
	users:handlers.users,
  tokens:handlers.tokens,
	notFound:handlers.notFound,
	checks:handlers.checks
}

// Start the server
server.listen(5000,function(){
  console.log('The server is up and running now');
});