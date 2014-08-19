define(function(require, exports) {

  exports.ticker = function(max) {
    max = max || 1.0;
    var current = 0.0;
    return function(delta) {
      current = Math.min(current + delta, max);
      return current / max;
    }
  }

});