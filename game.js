var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * 0.90, window.innerHeight * 0.90);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.ShaderMaterial({
  uniforms: {
    color: { type:"v3", value: new THREE.Vector3(0.0, 1.0, 0.0) },
    time: { type:"f", value: 1.0 },
    resolution: { type: "v2", value: new THREE.Vector2() }
  },
  vertexShader: document.getElementById('basic-vertexShader').textContent,
  fragmentShader: document.getElementById('basic-fragmentShader').textContent
});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;
var clock = new THREE.Clock(true);

function render() {
  var delta = clock.getDelta();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  update(delta);
}
render();

function update(delta) {
  cube.rotation.x += 1 * delta;
  cube.rotation.y += 1 * delta;
}

function loadShader(name) {
  var link = document.querySelector('link[rel="import"]');
}