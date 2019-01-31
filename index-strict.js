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


// in this file we use the flag in the cmd --use_strict

foo = 'test'
// Init function
app.init = function(){

  // Start the server
  server.init();

  // Start the workers
  workers.init();

  setTimeout(()=>{
  	cli.init()
  },50)

};

// Self executing
app.init();


// Export the app
module.exports = app;
