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

// TODO use save data
var saveData = {
	currentChunk: {'x': 0, 'y': 0},
	currentLocation: new THREE.Vector3(0, 0, 0),
	inventory: [],
	health: 10,
};

var builder = require('builder.js');

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
exports.tileScale = 2;

// TODO
var positionHeight = function(terrain) {
	// return terrain.getHeight(obj.position.x, obj.position.z);
	return 1;
}

var loadFileIntoChunk = function(file) {
	return chunk;
}

exports.loadChunk = function(chunkName, callback) {
	// get file json
	loadJSONAsync('./chunks/' + chunkName + '.json', function(file) {
		var chunk = new THREE.Object3D();
		chunk.coordinates = { 'x': 0, 'y': 0 };
		chunk.neighbors = file.neighbors;
		chunk.terrain = builder.buildTerrain(file.heightmap, file.typemap);
		chunk.add(chunk.terrain);

		chunk.staticObjs = [];
		file.staticObjs.each(function(staticObj) {
			var obj = builder.buildStaticObj(staticObj); // TODO
			obj.position.y = positionHeight(terrain);
			chunk.staticObjs.push(obj);
			chunk.add(obj);
		});

		chunk.dynamicObjs = [];
		file.dynamicObjs.each(function(dynamicObj) {
			var obj = builder.buildDynamicObj(dynamicObj); // TODO
			obj.position.y = positionHeight(terrain);
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
		chunk.coordinates = { 'x': 0, 'y': 0 };
		chunk.neighbors = [];
		chunk.terrain = builder.buildTerrain(DEFAULT_CHUNK_HEIGHTMAP, DEFAULT_CHUNK_TYPEMAP);
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
	var coords = chunk.coordinates;
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
	console.log(neighbors);
	neighbors.keys().each(function(relativeCoord) {
		var chunkName = neighbors[relativeCoord];
		var offset = relativeCoord.split(',').map(function(coord) { return parseInt(coord); });
		if(chunkName === 'empty') return;
		exports.loadChunk(chunkName, function(newChunk) {
			newChunk.position.x += offset[0] * CHUNK_WIDTH;
			newChunk.position.z += offset[1] * CHUNK_HEIGHT;
			callback(newChunk);
		});
	});
}

exports.saveChunk = function(name, data) {

}

});