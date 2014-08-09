/**
EDIT MODE MODULE
*/
define(function(require, exports) {
	var terrain = require('terrain.js');
	var gameObject = require('gameObject.js');

	// Common mode state
	var world = require('world.js');

  // Edit mode init
  var debugObjects = [];

  var selectedVertex = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xEFBB24 }));
  selectedVertex.update = function(delta) {
    this.position.set(Math.round(world.player.position.x / 2) * 2,
      world.player.position.y,
      Math.round(world.player.position.z / 2) * 2);
  }
  world.scene.add(selectedVertex);
  debugObjects.push(selectedVertex);

  exports.activate = function() {
    // show debug helpers
    debugObjects.each(function(obj) {
      obj.visible = true;
    });
  }

  exports.deactivate = function() {
    // hide debug helpers
    debugObjects.each(function(obj) {
      obj.visible = false;
    });
  }

	exports.update = function(delta) {
    world.gameObjects.each(function(obj) {
      obj.update(delta);
    });

    debugObjects.each(function(obj) {
      if(obj.update) {
        obj.update(delta);
      }
    });

    // handle input
	}

  exports.deactivate();
})