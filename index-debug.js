/*
 * Primary file for API
 *
 */

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli')

// Declare the app
var app = {};

// Init function


// to start the debugger we write node inspect index-debug.js


debugger;
app.init = function(){

  // Start the server
  server.init();

  // Start the workers
  workers.init();

  setTimeout(()=>{
  	cli.init()
  },50)

};
debugger;

// Self executing
debugger;
app.init();
debugger;


// Export the app
module.exports = app;
