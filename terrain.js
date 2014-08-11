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
	var CHUNK_WIDTH = 20;
	var CHUNK_HEIGHT = 20;
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
	var tileScale = exports.tileScale = 2;

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
    var height = heightmap[0].length-1;
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

        faceIndex = (y*width+x)*4;
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
		return Math.round(x + 5);
	}

	// TODO
	var chunkHeight = function(chunk) {
    return chunk.heightmap[chunkspace(x)][chunkspace(y)];
	}

	exports.loadChunk = function(chunkName, callback) {
		// get file json
		loadJSONAsync('./chunks/' + chunkName + '.json', function(file) {
			var chunk = new THREE.Object3D();

			chunk.terrain = buildTerrain(file.heightmap, file.typemap);
			chunk.add(chunk.terrain);

			chunk.name = chunkName;
			chunk.neighbors = file.neighbors;
			chunk.heightmap = file.heightmap;
			chunk.typemap = file.typemap;

			chunk.staticObjs = [];
			file.staticObjs.each(function(staticObj) {
				var obj = builder.buildStaticObj(staticObj); // TODO
				obj.position.y = chunkHeight(chunk);
				chunk.staticObjs.push(obj);
				chunk.add(obj);
			});

			chunk.dynamicObjs = [];
			file.dynamicObjs.each(function(dynamicObj) {
				var obj = builder.buildDynamicObj(dynamicObj); // TODO
				obj.position.y = chunkHeight(chunk);
				obj.parentChunk = chunk;
				chunk.dynamicObjs.push(obj);
				// don't add to chunk, needs to be added to scene when loaded
				// obj knows it's parent chunk, so remove only if it is out of sight and it's parent chunk is unloaded
				// alternate: fade out at range
			});

			callback(chunk);
		}, function() {
			// File not found, load default chunk.
			var chunk = new THREE.Object3D();
			chunk.neighbors = {};
			chunk.name = chunkName;
			chunk.heightmap = DEFAULT_CHUNK_HEIGHTMAP;
			chunk.typemap = DEFAULT_CHUNK_TYPEMAP;
			chunk.terrain = buildTerrain(DEFAULT_CHUNK_HEIGHTMAP, DEFAULT_CHUNK_TYPEMAP);
			chunk.add(chunk.terrain);

			chunk.staticObjs = [];
			chunk.dynamicObjs = [];

			callback(chunk);
		});

	}

	var coordStr = function(x, y) {
		return '' + x + ',' + y;
	}

	// TODO
	exports.loadNeighbors = function(chunk, callback) {
		// Chunkspace
		var coords = { x: chunk.position.x, y: chunk.position.z };

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
		chunk.neighbors.keys().each(function(neighborOverride) {
			var key = neighborOverride.split(',');
			neighbors[key] = chunk.neighbors[neighborOverride];
		});

		// Go find the chunks and position them
		neighbors.keys().each(function(relativeCoord) {
			var chunkName = neighbors[relativeCoord];
			var offset = relativeCoord.split(',').map(function(coord) { return parseInt(coord); });
			if(chunkName === 'empty') return;
			exports.loadChunk(chunkName, function(newChunk) {
				// TODO generalize width/height of chunk?
				// TODO or consistently use constant

				// Main chunk position plus relative offset
				newChunk.position.x += coords.x + offset[0] * CHUNK_WIDTH;
				newChunk.position.z += coords.y + offset[1] * CHUNK_HEIGHT;

				// Return each new chunk
				callback(newChunk);
			});
		});
	}

  exports.editTerrain = function(x, y, mod) {
  	console.log(x, y, '(world)', chunkspace(x), chunkspace(y), '(chunk)');

    // TODO edit other chunks also
    var chunkCandidates = world.chunks.filter(function(chunk) {
      if(chunk.position.x + CHUNK_WIDTH) { return false;}
    });

    world.chunks[0].heightmap[chunkspace(x)][chunkspace(y)] += mod;
    var newGeometry = buildTerrain(world.chunks[0].heightmap, world.chunks[0].typemap).geometry;
    var oldGeometry = world.chunks[0].terrain.geometry;
    oldGeometry.vertices = newGeometry.vertices;
    oldGeometry.faces = newGeometry.faces;
    oldGeometry.verticesNeedUpdate = true;
    oldGeometry.elementsNeedUpdate = true;
    newGeometry.dispose();

    // TODO update player position also
    if(mod > 0) {
      world.player.position.y += mod / tileScale;
    }
  }

  exports.getChunkContainingObj = function(obj) {
  	var chunks = world.chunks;
  }

  exports.chunkTracker = function(obj, chunk) {

  }

});