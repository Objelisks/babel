define(function(require, exports) {

  // run tests
  require('test.js');

  var builder = require('builder.js');
  var gameObject = require('gameObject.js');
  var input = require('input.js');
  var gameObjects = [];

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.90, window.innerHeight * 0.90);
  document.body.appendChild(renderer.domElement);



  var gridHelper = new THREE.GridHelper(20, 1);
  gridHelper.position.y -= 0.001;
  scene.add(gridHelper);
  var axisHelper = new THREE.AxisHelper();
  scene.add(axisHelper);

  var light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.x = -1;
  light.position.y = 1;
  light.position.z = 1;
  scene.add(light);
  light = new THREE.HemisphereLight(0xffffff, 0x404040, 0.5);
  scene.add(light);

  var cube = builder.buildCube();
  cube.position.x = 5;
  cube.position.z = -2;
  scene.add(cube);

  for(var i=0; i<6; i++) {
    var tree = builder.buildTree();
    tree.position.x = Math.random() * 10;
    tree.position.z = Math.random() * 10;
    scene.add(tree);
  }

  var terrain = builder.buildTerrainMesh();
  scene.add(terrain);

  var player = gameObject.construct(builder.buildPlayer())
    .addComponent('gamepad');
  player.moveSpeed = 5.0;
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
    });
    camera.position.x = player.position.x - 1.5;
    camera.position.z = player.position.z - 1.5;
  }

  var clock = new THREE.Clock(true);

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    update(clock.getDelta());
  }
  render();

});