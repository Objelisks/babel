/**
PLAY MODE MODULE
*/
define(function(require, exports) {
  var statics = require('statics.js');
  var gameObject = require('gameObject.js');
  var input = require('input.js');
  var terrain = require('terrain.js');

  // Common mode state
  var world = require('world.js');

  // Play mode init
  exports.init = function() {
    var gridHelper = new THREE.GridHelper(10, 1);
    gridHelper.position.y -= 0.001;
    world.scene.add(gridHelper);
    var axisHelper = new THREE.AxisHelper();
    world.scene.add(axisHelper);

    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.x = -1;
    light.position.y = 1;
    light.position.z = 1;
    world.scene.add(light);
    light = new THREE.HemisphereLight(0xffffff, 0x404040, 0.5);
    world.scene.add(light);

    var cube = statics.buildCube();
    cube.position.x = 5;
    cube.position.z = -2;
    world.scene.add(cube);
    cube.update = function(delta) {
      cube.rotation.x += 1 * delta;
      cube.rotation.y += 1 * delta;
    };
    world.gameObjects.push(cube);

    for(var i=0; i<6; i++) {
      var tree = statics.buildTree();
      tree.position.x = Math.random() * 20 - 10;
      tree.position.z = Math.random() * 20 - 10;
      world.scene.add(tree);
    }

    statics.loadModel('grass', function(model) {
      for(var i=0; i<20; i++) {
        var grassInstance = model.clone();
        grassInstance.position.x = Math.random() * 20 - 10;
        grassInstance.position.z = Math.random() * 20 - 10;
        grassInstance.rotation.x = Math.random() * 0.2;
        grassInstance.rotation.y = Math.random() * 0.4;
        grassInstance.rotation.z = Math.random() * 0.2;
        world.scene.add(grassInstance);
      }
    });

    terrain.loadChunkAndNeighbors('0,0');

    var water = statics.buildWater();
    world.scene.add(water);
  }

  exports.activate = function() {

  }

  exports.deactivate = function() {
    
  }

  exports.update = function(delta) {
    // mode switch override

    world.gameObjects.each(function(obj) {
      obj.update(delta);
    });
  }

  exports.deactivate();
})