var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * 0.90, window.innerHeight * 0.90);
document.body.appendChild(renderer.domElement);


function buildCube() {
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.ShaderMaterial({
    uniforms: {
      color: { type:"v3", value: new THREE.Vector3(0.0, 1.0, 0.0) },
      time: { type:"f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() }
    },
    vertexShader: vertexShader('basic'),
    fragmentShader: fragmentShader('basic')
  });
  var cube = new THREE.Mesh(geometry, material);
  return cube;
}

var cube = buildCube();
cube.position.x = 5;
cube.position.z = -2;
scene.add(cube);

var light = new THREE.PointLight(0xffffff, 1, 100);
light.position.x = 5;
light.position.y = 2;
light.position.z = 5;
scene.add(light);

var terrain = buildTerrainMesh();
scene.add(terrain);

scene.add(new THREE.GridHelper(20, 1));
var axisHelper = new THREE.AxisHelper();
axisHelper.position.y += 0.001;
scene.add(axisHelper);

camera.position.z = -2.5;
camera.position.x = -2.5;
camera.position.y = 2.5;
camera.lookAt(new THREE.Vector3());

function buildTerrainMesh() {
  var geometry = new THREE.Geometry();
  var noise = new SimplexNoise();
  var x = 0, y = 0, faceIndex = 0;
  var scale = 2;
  // build a grid
  var height = function(x, y) {
      var h = (noise.noise2D(x/10, y/10) + 1) / 2;
      if(h > 0.2) {
        if(h > 0.8) {
          h = 0.5;
        } else {
          h = 0;
        }
      } else {
        h = -0.5;
      }
      return h;
  }
  for(y = 0; y < 10; y++) {
    for(x = 0; x < 10; x++) {
      geometry.vertices.push(
        new THREE.Vector3(x*scale, height(x, y), y*scale),
        new THREE.Vector3((x+1)*scale, height(x+1, y), y*scale),
        new THREE.Vector3(x*scale, height(x, y+1), (y+1)*scale),
        new THREE.Vector3((x+1)*scale, height(x+1, y+1), (y+1)*scale)
      );
      faceIndex = (y*10+x)*4;
      geometry.faces.push(new THREE.Face3(faceIndex, faceIndex+3, faceIndex+1));
      geometry.faces.push(new THREE.Face3(faceIndex, faceIndex+2, faceIndex+3));
    }
  }

  //geometry.mergeVertices();
  geometry.computeFaceNormals();
  geometry.computeBoundingSphere();

  var material = new THREE.ShaderMaterial({
    uniforms: {
      color: { type:"v3", value: new THREE.Vector3(0.0, 1.0, 0.0) },
      time: { type:"f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() }
    },
    vertexShader: vertexShader('basic'),
    fragmentShader: fragmentShader('basic')
  });

  //var material = new THREE.MeshLambertMaterial({ color: 0x00aa00 });

  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function update(delta) {
  cube.rotation.x += 1 * delta;
  cube.rotation.y += 1 * delta;
}




var clock = new THREE.Clock(true);

function render() {
  var delta = clock.getDelta();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  update(delta);
}
render();

function vertexShader(name) {
  return document.getElementById(name + '-vertexShader').textContent;
}
function fragmentShader(name) {
  return document.getElementById(name + '-fragmentShader').textContent;
}