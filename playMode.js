/**
PLAY MODE MODULE
*/
define(function(require, exports) {
  var builder = require('builder.js');
  var gameObject = require('gameObject.js');
  var input = require('input.js');
  var terrain = require('terrain.js');

  // Common mode state
  var world = require('world.js');



  // Play mode init
  world.scene = new THREE.Scene();
  world.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  var gridHelper = new THREE.GridHelper(20, 1);
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

  var cube = builder.buildCube();
  cube.position.x = 5;
  cube.position.z = -2;
  world.scene.add(cube);
  cube.update = function(delta) {
    cube.rotation.x += 1 * delta;
    cube.rotation.y += 1 * delta;
  };
  world.gameObjects.push(cube);

  for(var i=0; i<6; i++) {
    var tree = builder.buildTree();
    tree.position.x = Math.random() * 20;
    tree.position.z = Math.random() * 20;
    world.scene.add(tree);
  }

  builder.loadModel('grass', function(model) {
    for(var i=0; i<20; i++) {
      var grassInstance = model.clone();
      grassInstance.position.x = Math.random() * 20;
      grassInstance.position.z = Math.random() * 20;
      grassInstance.rotation.x = Math.random() * 0.2;
      grassInstance.rotation.y = Math.random() * 0.4;
      grassInstance.rotation.z = Math.random() * 0.2;
      world.scene.add(grassInstance);
    }
  });


  var addChunk = function(chunk) {
    world.scene.add(chunk);
    world.chunks.push(chunk);
  }

  terrain.loadChunk('0,0', function(initChunk) {
    addChunk(initChunk);
    terrain.loadNeighbors(initChunk, addChunk);
  });

  var water = builder.buildWater();
  world.scene.add(water);


  var player = gameObject.construct(builder.buildPlayer())
    .addComponent(input.gamepad(world.camera, world.chunks));
  player.moveSpeed = 5.0;
  player.height = 0.5;

  world.player = player;
  world.scene.add(player);
  world.gameObjects.push(player);

  world.camera.position.set(-1.5, 2.5, -1.5);
  world.camera.lookAt(new THREE.Vector3(0, 0, 0));




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