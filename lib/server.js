
var http = require('http');
var url = require('url');
var myFileLib = require('./data');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require('./handlers')
var helpers = require('./helpers');
var fs = require('fs');
var https = require('https');
var path = require('path');




var server = {};


// helpers.sendTwilioSms('3026300487','Hello Rehan',err=>{
//   console.log('thi is the err',err)
// });



server.httpServer = http.createServer(function(req,res){
  server.unifiedServer(req,res);
});

// // Start the HTTPS server
// server.httpsServer.listen(3000,function(){
//   console.log('The HTTP server is running on port '+3000);
// });

// Instantiate the HTTPS server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions,function(req,res){
  server.unifiedServer(req,res);
});

// Start the HTTPS server




server.unifiedServer=(req,res)=>{
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
    var chosenHandler = server.router[trimmedPath] ? server.router[trimmedPath] : router.notFound;
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
}

server.router = {
	readFile:handlers.readFile,
	createFile:handlers.createFile,
	updateFile:handlers.updateFile,
	deleteFile:handlers.deleteFile,
	users:handlers.users,
  tokens:handlers.tokens,
	notFound:handlers.notFound,
	checks:handlers.checks
}


server.init = ()=>{
  server.httpServer.listen(5000,function(){
  console.log('\x1b[35m%s\x1b[0m','The HTTPS server is running on port '+5000);
  });
}


module.exports = server
