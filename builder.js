/**
BUILDER MODULE
*/
define(function(require, exports) {
  var loader = require('loader.js');
  var terrain = require('terrain.js');

  // TODO remove this file

  exports.buildCube = function() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.ShaderMaterial({
      uniforms: {
        color: { type:"v3", value: new THREE.Vector3(0.0, 1.0, 0.0) },
        time: { type:"f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() }
      },
      vertexShader: loader.vertex('terrain'),
      fragmentShader: loader.fragment('terrain')
    });
    var cube = new THREE.Mesh(geometry, material);
    return cube;
  }

  exports.buildTree = function() {
    var geometry = new THREE.BoxGeometry(0.3, 3, 0.3);
    var material = new THREE.MeshLambertMaterial({ color: 0xECB88A });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 1.5;
    return mesh;
  }

  exports.buildWater = function() {
    var geometry = new THREE.PlaneGeometry(40, 40);
    var material = new THREE.MeshLambertMaterial({ color: 0x86A697 });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -0.3;
    mesh.rotation.x = -Math.PI/2;
    return mesh;
  }

  var colladaLoader = new THREE.ColladaLoader();
  colladaLoader.options.convertUpAxis = true;
  colladaLoader.options.upAxis = 'Y';

  exports.loadModel = function(name, callback) {
    //var modelFile = require('./models/' + name + '.dae');
    colladaLoader.load('./models/' + name + '.dae', function(collada) {
      console.log('loaded mesh:', name);
      callback(collada.scene);
    });
  }
});