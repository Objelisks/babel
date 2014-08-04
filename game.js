define(function(require, exports) {
  var Builder = require('builder.js');
  var Input = require('input.js');
  var gameObjects = [];

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.90, window.innerHeight * 0.90);
  document.body.appendChild(renderer.domElement);



  scene.add(new THREE.GridHelper(20, 1));
  var axisHelper = new THREE.AxisHelper();
  axisHelper.position.y += 0.001;
  scene.add(axisHelper);

  var light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.x = -1;
  light.position.y = 1;
  light.position.z = 1;
  scene.add(light);
  light = new THREE.HemisphereLight(0xffffff, 0x404040, 0.5);
  scene.add(light);

  var cube = Builder.buildCube();
  cube.position.x = 5;
  cube.position.z = -2;
  scene.add(cube);

  for(var i=0; i<6; i++) {
    var tree = Builder.buildTree();
    tree.position.x = Math.random() * 10;
    tree.position.z = Math.random() * 10;
    scene.add(tree);
  }

  var terrain = Builder.buildTerrainMesh();
  scene.add(terrain);

  var player = Builder.buildPlayer();
  addComponent(player, new Input.GamepadController());
  scene.add(player);
  gameObjects.push(player);

  camera.position.z = -1.5;
  camera.position.x = -1.5;
  camera.position.y = 2.5;
  camera.lookAt(new THREE.Vector3());



  function update(delta) {
    cube.rotation.x += 1 * delta;
    cube.rotation.y += 1 * delta;

    //handleInput(delta);

    gameObjects.each(function(obj) {
      obj.update(delta);
    })
  }


  var handleInput = (function() {
    var playerMoveSpeed = 2.0;

    return function(delta) {
      if(Input.pressed('w')) {
        player.position.x += playerMoveSpeed * delta;
      }
      if(Input.pressed('s')) {
        player.position.x -= playerMoveSpeed * delta;
      }
      if(Input.pressed('d')) {
        player.position.z += playerMoveSpeed * delta;
      }
      if(Input.pressed('a')) {
        player.position.z -= playerMoveSpeed * delta;
      }
      camera.position.x = player.position.x - 1.5;
      camera.position.z = player.position.z - 1.5;
    }
  })();

  var clock = new THREE.Clock(true);

  function render() {
    var delta = clock.getDelta();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    update(delta);
  }
  render();

});