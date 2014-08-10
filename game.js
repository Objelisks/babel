/**
GAME MODULE
*/
define(function(require, exports) {

  var world = require('world.js');
  var input = require('input.js');

  // run tests
  //require('test.js');

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.90, window.innerHeight * 0.90);
  document.body.appendChild(renderer.domElement);

  var clock = new THREE.Clock(true);


  var cycleMode = (function() {
    var modes = [
      require('playMode.js'),
      require('editMode.js')
    ];
    var currentMode = 0;
    world.mode = modes[currentMode];
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