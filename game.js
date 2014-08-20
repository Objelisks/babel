/**
GAME MODULE
*/

var updates = {};

define(function(require, exports) {

  var world =       require('system/world');
  var input =       require('system/input');
  var Player =      require('player/player');
  var playMode =    require('modes/playMode');
  var editMode =    require('modes/editMode');
  var terrain =     require('system/terrain');

  // run tests
  //require('test.js');

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.90, window.innerHeight * 0.90);
  document.body.appendChild(renderer.domElement);

  var clock = new THREE.Clock(true);

  world.scene = new THREE.Scene();
  world.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  var playerObj = new Player();

  world.player = playerObj;
  world.scene.add(playerObj);
  world.gameObjects.push(playerObj);

  world.camera.position.set(-1.5, 2.5, -1.5);
  world.camera.lookAt(new THREE.Vector3(0, 0, 0));

  var cycleMode = (function() {
    var modes = [
      playMode,
      editMode
    ];
    var currentMode = 0;
    world.mode = modes[currentMode];
    modes.each(function(mode) { mode.init(); });
    modes.each(function(mode) { mode.deactivate(); });
    world.mode.activate();

    return function(event) {
      if(event.message !== 1) return;
      world.mode.deactivate();

      currentMode = (currentMode + 1) % modes.length;
      world.mode = modes[currentMode];

      world.mode.activate();

      console.log('mode:', currentMode);
    }
  })();

  input.primary.addEventListener('leftshoulder', cycleMode);

  var render = function() {
    requestAnimationFrame(render);
    renderer.render(world.scene, world.camera);
    var delta = clock.getDelta();
    input.update(delta);
    world.mode.update(delta);
    updates.keys().each(function(updateId) {
      if(updates[updateId](delta) === true) {
        delete updates[updateId];
      }
    });
  }
  render();

});


var setUpdate = (function() {
  var id = 1;
  return function(updateFunc) {
    id += 1;
    updates[id] = updateFunc;
    return id;
  }
})();

var clearUpdate = function(updateId) {
  delete updates[updateId];
}