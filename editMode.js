/**
EDIT MODE MODULE
*/
define(function(require, exports) {
	var terrain = require('terrain.js');
  var input = require('input.js');
	var gameObject = require('gameObject.js');

	// Common mode state
	var world = require('world.js');

  // Edit mode init
  var debugObjects = [];
  var tileScale = terrain.tileScale;

  var lowerTerrain = function() {
    var pos = world.player.position.clone();
    var geometry = world.chunks[0].terrain.geometry;
    pos.set(Math.round(pos.x / tileScale) * tileScale, 0, Math.round(pos.z / tileScale) * tileScale);
    geometry.vertices.each(function(vertex) {
      if(vertex.x === pos.x && vertex.z === pos.z) {
        console.log('found vertex');
        vertex.y -= 1 / tileScale;
      }
    });
    geometry.verticesNeedUpdate = true;
  }

  var raiseTerrain = function() {
    var pos = world.player.position.clone();
    var geometry = world.chunks[0].terrain.geometry;
    pos.set(Math.round(pos.x / tileScale) * tileScale, 0, Math.round(pos.z / tileScale) * tileScale);
    geometry.vertices.each(function(vertex) {
      if(vertex.x === pos.x && vertex.z === pos.z) {
        console.log('found vertex');
        vertex.y += 1 / tileScale;
      }
    });
    geometry.verticesNeedUpdate = true;
  }

  exports.init = function() {
    var selectedVertex = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xEFBB24 }));
    selectedVertex.update = function(delta) {
      this.position.set(Math.round(world.player.position.x / tileScale) * tileScale,
        world.player.position.y,
        Math.round(world.player.position.z / tileScale) * tileScale);
    }
    world.scene.add(selectedVertex);
    debugObjects.push(selectedVertex);
  }

  exports.activate = function() {
    // show debug helpers
    debugObjects.each(function(obj) {
      obj.visible = true;
    });

    input.primary.addEventListener('xpressed', lowerTerrain);
    input.primary.addEventListener('ypressed', raiseTerrain);
  }

  exports.deactivate = function() {
    // hide debug helpers
    debugObjects.each(function(obj) {
      obj.visible = false;
    });

    input.primary.removeEventListener('xpressed', lowerTerrain);
    input.primary.removeEventListener('ypressed', raiseTerrain);
  }

	exports.update = function(delta) {
    world.player.update(delta);
    /*world.gameObjects.each(function(obj) {
      obj.update(delta);
    });*/

    debugObjects.each(function(obj) {
      if(obj.update) {
        obj.update(delta);
      }
    });

    // handle input
	}

  exports.deactivate();
})