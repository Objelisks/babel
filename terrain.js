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
	// coordinates also specified in file
	coordinates: {
		'x': 0,
		'y': 0
	}

	// 10x10 for now
	// number indicates height
	heightmap: [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
		[1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
		[1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		...
	],
	// number indicates material
	// transition materials will be generated automatically
	typemap: [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 2, 2, 2, 1, 1, 1, 4],
		[1, 1, 1, 2, 2, 2, 1, 1, 4, 4],
		[1, 1, 1, 2, 2, 2, 1, 4, 4, 1],
		[1, 1, 1, 1, 1, 1, 4, 1, 1, 1],
		...
	],

	// map used to override default neighbor selection
	neighbors: {
		'0_1': 'specialchunk', //instead of loading the (0, 1) chunk, load the 'specialchunk' chunk
		'0_-1': null // instead of loading (0, -1) chunk, do not load a chunk (empty space)
	}

	// load and place, no save data
	static: [
	],

	// spawn location prototypes
	// after each is placed, load data for individual id and apply changes
	dynamic: [

	]
}


*/

var saveData = {
	currentChunk: {'x': 0, 'y': 0},
	currentLocation: new THREE.Vector3(0, 0, 0),
	inventory: [],
	health: 10,
};

exports.loadChunk = function(x, y) {

}



});