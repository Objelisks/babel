console.log('tests');
define(function(require, exports) {
  var gameObject = require('gameObject.js');
  var results = { failed: 0, passed: 0, expected: 0 };
  var assert = function(test) {
    results.expected += 1;
    if(test) {
      results.passed += 1;
    } else {
      results.failed += 1;
    }
  }

  try {


  } finally {
    console.log('test results:', results);
  }
});