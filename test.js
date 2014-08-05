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
    gameObject.register('thing', function() {
      return { x: 4 };
    });

    var obj = gameObject.construct({name: 'testobj'})
      .addComponent('thing');

    assert(obj['thing']);
    assert(obj.thing.x === 4);

    gameObject.register('otherThing', function() {
      return { x: 5 };
    });
    obj.addComponent('otherThing');

    assert(obj.thing.x === 4);
    assert(obj.otherThing.x === 5);

  } finally {
    console.log('test results:', results);
  }
});