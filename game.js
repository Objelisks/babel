/**
GAME MODULE
*/
define(function(require, exports) {

  var world = require('world.js');
  var input = require('input.js');
  var builder = require('builder.js');
  var player = require('player.js');
  var playMode = require('playMode.js');
  var editMode = require('editMode.js');
  var terrain = require('terrain.js');

  // run tests
  //require('test.js');

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.90, window.innerHeight * 0.90);
  document.body.appendChild(renderer.domElement);

  var clock = new THREE.Clock(true);

  world.scene = new THREE.Scene();
  world.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  var playerObj = new player.Player();

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

    return function() {
      world.mode.deactivate();

      currentMode = (currentMode + 1) % modes.length;
      world.mode = modes[currentMode];

      world.mode.activate();

      console.log('mode:', currentMode);
    }
  })();

  input.primary.addEventListener('leftshoulderpressed', cycleMode);

  var render = function() {
    requestAnimationFrame(render);
    renderer.render(world.scene, world.camera);
    var delta = clock.getDelta();
    input.update(delta);
    world.mode.update(delta);
  }
  render();

});