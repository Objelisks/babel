// terrain needs to load in chunks
// each region will consist of many chunks
// connections between chunks are euclidian most of the time (plus doorways)
// one chunk needs to be at least visibleArea/2 size so that we only have to load the neighbors of the chunk
// each chunk consists of a heightmap, static objects, and dynamic objects
// heightmap determines the terrain type and the hills
// static objects are colliders that always spawn in the same place and are non-destructable
// dynamic objects have state that is saved (either short or long term) and are able to move around
// unloaded chunks are not simulated
// ingame editor will raise/lower terrain and paint terrain types
// need to be able to select static objects and place them
// dynamic objects can be placed with placeholders, and then parameters added later if needed

/**
TERRAIN MODULE
*/
define(function(require, exports) {

// load location
// create initial chunk
// create neighbor chunks
// if a chunk does not exist, generate a new placeholder chunk at mean height/type of neighbor chunk

// file format for chunks
// filename: `x`_`y`.json
// underscores separate coordinates
/*
0_0.json
{
	"name": "0_0",

	// number indicates height
	// this is per vertex (corners are shared vertices)
	"heightmap": [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
		[1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
		[1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	],

	// number indicates material
	// this is per vertex (corners are shared vertices)
	// material determines collision
	// transition materials will be generated automatically
	"typemap": [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 2, 2, 2, 1, 1, 1, 4],
		[1, 1, 1, 2, 2, 2, 1, 1, 4, 4],
		[1, 1, 1, 2, 2, 2, 1, 4, 4, 1],
		[1, 1, 1, 1, 1, 1, 4, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	],

	// map used to override default neighbor selection
	// default is euclidian coordinate neighbors
	"neighbors": {
		"0_1": "specialchunk", //instead of loading the (0, 1) chunk, load the 'specialchunk' chunk
		"0_-1": "empty" // instead of loading (0, -1) chunk, do not load a chunk (empty space)
	},

	// load and place, no save data
	"staticObjs": [
	],

	// spawn location prototypes
	// after each is placed, load data for individual id and apply changes
	"dynamicObjs": [

	],
}
*/
	var builder = require('builder.js');
	var world = require('world.js');
	var loader = require('loader.js');

	// TODO position chunks
	var tileScale = exports.tileScale = 2;
	var CHUNK_SIZE_MAP = 10;
	var CHUNK_SIZE_WORLD = CHUNK_SIZE_MAP * tileScale;
	var DEFAULT_CHUNK_HEIGHTMAP = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	];
	var DEFAULT_CHUNK_TYPEMAP = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	];

	// From THREE.Geometry.center
	var centerGeometryXZ = function() {
		this.computeBoundingBox();

		var offset = new THREE.Vector3();

		offset.addVectors( this.boundingBox.min, this.boundingBox.max );
		offset.multiplyScalar( - 0.5 );

		this.applyMatrix( new THREE.Matrix4().makeTranslation( offset.x, 0, offset.z ) );
		this.computeBoundingBox();

		return offset;
	}

  var buildTerrain = function(heightmap, typemap) {
    var geometry = new THREE.Geometry();
    var x = 0, y = 0, faceIndex = 0;
    var width = heightmap.length-1;
    if(width != CHUNK_SIZE_MAP) console.log('ERROR: tilemap has incorrect width:', width);
    var height = heightmap[0].length-1;
    if(height != CHUNK_SIZE_MAP) console.log('ERROR: tilemap has incorrect height:', height);
    var v1, v2, v3, v4;

    for(y = 0; y < height; y++) {
      for(x = 0; x < width; x++) {
        /*
        assumption: all points are on at most two height levels
        2 3
        0 1

        if 0 3 are equal height
          faces 0,3,1 and 0,2,3
        else
          faces 0,2,1 and 1,2,3
        */

        v1 = new THREE.Vector3(x*tileScale, heightmap[x][y]/tileScale, y*tileScale);
        v2 = new THREE.Vector3((x+1)*tileScale, heightmap[x+1][y]/tileScale, y*tileScale);
        v3 = new THREE.Vector3(x*tileScale, heightmap[x][y+1]/tileScale, (y+1)*tileScale);
        v4 = new THREE.Vector3((x+1)*tileScale, heightmap[x+1][y+1]/tileScale, (y+1)*tileScale);
        geometry.vertices.push(v1, v2, v3, v4);

        faceIndex = (y * width + x) * 4;
        if(v1.y === v4.y) {
          geometry.faces.push(new THREE.Face3(faceIndex, faceIndex+3, faceIndex+1));
          geometry.faces.push(new THREE.Face3(faceIndex, faceIndex+2, faceIndex+3));
        } else {
          geometry.faces.push(new THREE.Face3(faceIndex, faceIndex+2, faceIndex+1));
          geometry.faces.push(new THREE.Face3(faceIndex+1, faceIndex+2, faceIndex+3));
        }
      }
    }

    geometry.mergeVertices();
    geometry.computeFaceNormals();
    geometry.computeBoundingSphere();
    centerGeometryXZ.call(geometry);

    var material = new THREE.ShaderMaterial({
      uniforms: {
        color: { type:"v3", value: new THREE.Vector3(0.0, 1.0, 0.0) },
        time: { type:"f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() }
      },
      vertexShader: loader.vertex('terrain'),
      fragmentShader: loader.fragment('terrain')
    });

    //var material = new THREE.MeshLambertMaterial({ color: 0x00aa00 });

    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

	var chunkspace = function(x) {
		// TODO constant
		return Math.round(x / tileScale + CHUNK_SIZE_MAP / 2);
	}

	// TODO get inbetweens currently assumes flat
	var chunkHeight = function(chunk, x, y) {
    return chunk.heightmap[chunkspace(x)][chunkspace(y)] / tileScale;
	}

	var coordStr = function(x, y) {
		return '' + x + ',' + y;
	}

	var strCoord = function(str) {
		return str.split(',').map(function(coord) { return parseInt(coord); });
	}

	var chunkIndex = exports.chunkIndex = function(x, y) {
		return ((y + 1) * 3) + (x + 1);
	}

	var loadChunk = function(chunkName, callback) {

		// TODO check to see if chunk is already loaded
		var existingChunks = world.chunks.filter(function(chunk) { return chunk.name === chunkName; });
		if(existingChunks.length > 0) {
			callback(existingChunks[0]);
			return;
		}

		var afterChunk = function(loadedChunk) {
				loadedChunk.name = chunkName;
				
				var coords = strCoord(chunkName);

				// Main chunk position plus relative offset
				loadedChunk.position.x += coords[0] * CHUNK_SIZE_WORLD;
				loadedChunk.position.z += coords[1] * CHUNK_SIZE_WORLD;
				loadedChunk.tilePosition = new THREE.Vector2(coords[0], coords[1]);

				callback(loadedChunk);
		}

		// get file json
		loadJSONAsync('./chunks/' + chunkName + '.json', function(file) {
			var chunk = new THREE.Object3D();

			chunk.terrain = buildTerrain(file.heightmap, file.typemap);
			chunk.add(chunk.terrain);

			chunk.heightmap = file.heightmap;
			chunk.typemap = file.typemap;

			chunk.staticObjs = [];
			file.staticObjs.each(function(staticObj) {
				var obj = builder.buildStaticObj(staticObj); // TODO
				obj.position.y = chunkHeight(chunk, obj.position.x, obj.position.z);
				chunk.staticObjs.push(obj);
				chunk.add(obj);
			});

			chunk.dynamicObjs = [];
			file.dynamicObjs.each(function(dynamicObj) {
				var obj = builder.buildDynamicObj(dynamicObj); // TODO
				obj.position.y = chunkHeight(chunk, obj.position.x, obj.position.z);
				obj.parentChunk = chunk;
				chunk.dynamicObjs.push(obj);
				// don't add to chunk, needs to be added to scene when loaded
				// obj knows it's parent chunk, so remove only if it is out of sight and it's parent chunk is unloaded
				// alternate: fade out at range
			});

			afterChunk(chunk);
		}, function() {
			// File not found, load default chunk.
			var chunk = new THREE.Object3D();
			chunk.heightmap = DEFAULT_CHUNK_HEIGHTMAP;
			chunk.typemap = DEFAULT_CHUNK_TYPEMAP;
			chunk.terrain = buildTerrain(DEFAULT_CHUNK_HEIGHTMAP, DEFAULT_CHUNK_TYPEMAP);
			chunk.add(chunk.terrain);

			chunk.staticObjs = [];
			chunk.dynamicObjs = [];

			afterChunk(chunk);
		});

	}

	var loadNeighbors = function(chunk, callback) {
		// Chunktilespace
		var coords = { x: chunk.tilePosition.x, y: chunk.tilePosition.y };

		// Maps relative to chunk names (absolute coord or overridden)
		var neighbors = {
			'1,1': coordStr(coords.x+1, coords.y+1),
			'1,0': coordStr(coords.x+1, coords.y),
			'1,-1': coordStr(coords.x+1, coords.y-1),
			'0,1': coordStr(coords.x, coords.y+1),
			'0,-1': coordStr(coords.x, coords.y-1),
			'-1,1': coordStr(coords.x-1, coords.y+1),
			'-1,0': coordStr(coords.x-1, coords.y),
			'-1,-1': coordStr(coords.x-1, coords.y-1)
		};

		// Go find the chunks and position them
		neighbors.keys().each(function(relativeCoord) {
			var chunkName = neighbors[relativeCoord];

			loadChunk(chunkName, callback);
		});
	}

	var loadChunkAndNeighbors = exports.loadChunkAndNeighbors = function(chunkName) {

		console.log('loading chunk and neighbors:', chunkName);

    var addChunk = world.scene.add.bind(world.scene);

    loadChunk(chunkName, function(initChunk) {
      addChunk(initChunk);

      world.chunks[chunkIndex(0, 0)] = initChunk;
      loadNeighbors(initChunk, function(chunk) {

				var offset = strCoord(chunk.name);
				offset[0] -= initChunk.tilePosition.x;
				offset[1] -= initChunk.tilePosition.y;

				// TODO don't overwrite existing chunks
				// TODO dispose removed chunks
      	world.chunks[chunkIndex(offset[0], offset[1])] = chunk;

      });
    });

	}

  exports.editTerrain = function(x, y, mod) {
		var centerChunkPos = world.chunks[chunkIndex(0, 0)].tilePosition;
		var cx = chunkspace(x) - centerChunkPos.x;
		var cy = chunkspace(y) - centerChunkPos.y;
  	console.log('editing:', x, y, '(world)', cx, cy, '(chunk)');

    /*
   0x    10
	y 0 1 2
		3 4 5
		6 7 8
	10
    */

    // edit center chunk
    // change to chunkIndex
    editChunkGeometry(world.chunks[4], cx, cy, mod);
    if(cx === 0) {
    	editChunkGeometry(world.chunks[3], CHUNK_SIZE_MAP, cy, mod);
    	if(cy === 0) {
    		editChunkGeometry(world.chunks[0], CHUNK_SIZE_MAP, CHUNK_SIZE_MAP, mod);
    	}
    	if(cy === 10) {
    		editChunkGeometry(world.chunks[6], CHUNK_SIZE_MAP, 0, mod);
    	}
    } else if(cx === CHUNK_SIZE_MAP) {
    	editChunkGeometry(world.chunks[5], 0, cy, mod);
    	if(cy === 0) {
    		editChunkGeometry(world.chunks[2], 0, CHUNK_SIZE_MAP, mod);
    	}
    	if(cy === CHUNK_SIZE_MAP) {
    		editChunkGeometry(world.chunks[8], 0, 0, mod);
    	}
    }
    if(cy === 0) {
    	editChunkGeometry(world.chunks[1], cx, CHUNK_SIZE_MAP, mod);
    } else if(cy === CHUNK_SIZE_MAP) {
    	editChunkGeometry(world.chunks[7], cx, 0, mod);
    }


    // TODO update player position also
    if(mod > 0) {
      world.player.position.y += mod / tileScale;
    }
  }

  var editChunkGeometry = function(chunk, x, y, mod) {
    chunk.heightmap[x][y] += mod;
    var newGeometry = buildTerrain(chunk.heightmap, chunk.typemap).geometry;
    var oldGeometry = chunk.terrain.geometry;

    oldGeometry.vertices = newGeometry.vertices;
    oldGeometry.faces = newGeometry.faces;
    oldGeometry.verticesNeedUpdate = true;
    oldGeometry.elementsNeedUpdate = true;
    newGeometry.dispose();
  }

  // TODO
  exports.getChunkContainingObj = function(obj) {
  	var chunks = world.chunks;
  }

  // builds component that dispatches events when the obj enters/leaves the chunk
  exports.chunkTracker = function() {
  	// refers to object owning component
  	var self = this;

  	// return the actual component object
  	return {
  		'update' : function(delta) {
  			var centerChunkPos = world.chunks[chunkIndex(0, 0)].tilePosition;
  			var cx = chunkspace(self.position.x) - centerChunkPos.x * CHUNK_SIZE_MAP;
  			var cy = chunkspace(self.position.z) - centerChunkPos.y * CHUNK_SIZE_MAP;

  			if(cx <= -1) {
					loadChunkAndNeighbors(world.chunks[chunkIndex(-1, 0)].name);
  			}
  			if(cx >= CHUNK_SIZE_MAP + 1) {
					loadChunkAndNeighbors(world.chunks[chunkIndex(1, 0)].name);
  			}
  			if(cy <= -1) {
					loadChunkAndNeighbors(world.chunks[chunkIndex(0, -1)].name);
  			}
  			if(cy >= CHUNK_SIZE_MAP + 1) {
					loadChunkAndNeighbors(world.chunks[chunkIndex(0, 1)].name);
  			}
  		}
  	}
  }

});