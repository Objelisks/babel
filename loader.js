define(function(require, exports) {

exports.vertex = function(name) {
  return document.getElementById(name + '-vertexShader').textContent;
}

exports.fragment = function(name) {
  return document.getElementById(name + '-fragmentShader').textContent;
}

});