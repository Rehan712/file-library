var assert = require('assert');
var helpers = require('../lib/helpers');



_app = {};

_app.tests = {
	unit:{}
}

_app.tests.unit['helpers getNumber return a number'] = function (done) {
	var val = helpers.getNumber();
	assert.equal(typeof val,'number')
	done()
};

_app.tests.unit['helpers getNumber return 1'] = function (done) {
	var val = helpers.getNumber();
	assert.equal( val,1);
	done()
};

_app.tests.unit['helpers getNumber return 2'] = function (done) {
	var val = helpers.getNumber();
	assert.equal(val,2)
	done()
};

_app.countTests = function () {
	var counter = 0;
	for (var key in _app.tests){
		var subTests = _app.tests[key];
		for (var testName in subTests){
			counter++
		}
	}
	return counter
}


_app.runTests = function () {
	var errors = [];
	var success = 0;
	var counter = 0;
	var limit = _app.countTests();

	for (var key in _app.tests){
		var subTests = _app.tests[key];
		for (var testName in subTests){
			(
				function () {
					var tempTestName = testName;
					var testValue = subTests[tempTestName];
					try{
						testValue(function () {
							console.log('\x1b[32m%s\x1b[0m',tempTestName)
							counter++;
							success++;
							if(counter == limit){
								_app.produceTestReport(limit,success,errors)
							}
						})
					}catch(e){
						errors.push({
							name:testName,
							error:e
						})
						console.log('\x1b[31m%s\x1b[0m',tempTestName);
						counter++
						if(counter == limit){
							_app.produceTestReport(limit,success,errors)
						}
					}
				}
			)() 
		}
	}
}

_app.produceTestReport = function(limit,successes,errors){
  console.log("");
  console.log("--------BEGIN TEST REPORT--------");
  console.log("");
  console.log("Total Tests: ",limit);
  console.log("Pass: ",successes);
  console.log("Fail: ",errors.length);
  console.log("");

  // If there are errors, print them in detail
  if(errors.length > 0){
    console.log("--------BEGIN ERROR DETAILS--------");
    console.log("");
    errors.forEach(function(testError){
      console.log('\x1b[31m%s\x1b[0m',testError.name);
      console.log(testError.error);
      console.log("");
    });
    console.log("");
    console.log("--------END ERROR DETAILS--------");
  }


  console.log("");
  console.log("--------END TEST REPORT--------");

};

// Run the tests
_app.runTests();