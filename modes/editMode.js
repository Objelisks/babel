/**
EDIT MODE MODULE
*/
define(function(require, exports) {
	var terrain =       require('system/terrain');
  var input =         require('system/input');
	var gameObject =    require('system/gameObject');
  var world =         require('system/world');

  // Edit mode init
  var debugObjects = [];
  var tileScale = terrain.tileScale;
  var saveServer = 'http://localhost:3000';

  var lowerTerrain = function(event) {
    if(event.message !== 1) return;
    var pos = world.player.position;
    terrain.editTerrain(pos.x, pos.z, -1);
  };
  var raiseTerrain = function(event) {
    if(event.message !== 1) return;
    var pos = world.player.position;
    terrain.editTerrain(pos.x, pos.z, 1);
  };

  var saveChunks = function(event) {
    if(event.message !== 1) return;
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

    input.primary.addEventListener('x', lowerTerrain);
    input.primary.addEventListener('y', raiseTerrain);
    input.primary.addEventListener('rightshoulder', saveChunks);
  }

  exports.deactivate = function() {
    // hide debug helpers
    debugObjects.each(function(obj) {
      obj.visible = false;
    });

    input.primary.removeEventListener('x', lowerTerrain);
    input.primary.removeEventListener('y', raiseTerrain);
    input.primary.removeEventListener('rightshoulder', saveChunks);
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