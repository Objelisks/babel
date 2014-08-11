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
  var saveServer = 'http://localhost:3000';

  var lowerTerrain = function() {
    var pos = world.player.position;
    terrain.editTerrain(pos.x, pos.z, -1);
  };
  var raiseTerrain = function() {
    var pos = world.player.position;
    terrain.editTerrain(pos.x, pos.z, 1);
  };

  var saveChunks = function() {
    sendJsonToServer(saveServer, { 'chunks':
      world.chunks.map(function(chunk) {
        return {
          'name': chunk.name,
          'heightmap': chunk.heightmap,
          'typemap': chunk.typemap,
          'staticObjs': [],
          'dynamicObjs': []
        };
      })
    });
  }

  exports.init = function() {
    var selectedVertex = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xEFBB24 }));
    selectedVertex.update = function(delta) {
      this.position.set(Math.round(world.player.position.x / tileScale) * tileScale,
        world.player.position.y + 0.25,
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
    input.primary.addEventListener('rightshoulderpressed', saveChunks);
  }

  exports.deactivate = function() {
    // hide debug helpers
    debugObjects.each(function(obj) {
      obj.visible = false;
    });

    input.primary.removeEventListener('xpressed', lowerTerrain);
    input.primary.removeEventListener('ypressed', raiseTerrain);
    input.primary.removeEventListener('rightshoulderpressed', saveChunks);
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