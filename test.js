var tester = function() {
  var tested = (function() {
    var ticks = 0;
    var timeout = 10;
    return function(delta) {
      ticks += delta;
      console.log('tick', ticks);
      if(ticks >= timeout) {
        return true;
      }
    };
  })();

  for (var i = 0; i < 20; i++) {
    console.log(tested(1.0));
  };
}

tester();