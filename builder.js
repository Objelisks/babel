define(function(require, exports) {
  var Loader = require('loader.js');

  exports.Components = function(obj) {
    return { original: obj };
  }

  exports.Components.prototype = {
    this.gameObject = function() {
      this.original.update = function(delta) {};
    }
    this.collider = function() {
      this.original.collider = function() {
        ;
      }
    }

  }

  exports.buildPlayer = function() {
    var geometry = new THREE.SphereGeometry(0.25, 32, 32);
    var material = new THREE.MeshLambertMaterial({ color: 0xFB966E });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.25;
    return mesh;
  }

  exports.buildCube = function() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.ShaderMaterial({
      uniforms: {
        color: { type:"v3", value: new THREE.Vector3(0.0, 1.0, 0.0) },
        time: { type:"f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() }
      },
      vertexShader: Loader.vertex('terrain'),
      fragmentShader: Loader.fragment('terrain')
    });
    var cube = new THREE.Mesh(geometry, material);
    return cube;
  }

  exports.buildTerrainMesh = function() {
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
      vertexShader: Loader.vertex('terrain'),
      fragmentShader: Loader.fragment('terrain')
    });

    //var material = new THREE.MeshLambertMaterial({ color: 0x00aa00 });

    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  exports.buildTree = function() {
    var geometry = new THREE.BoxGeometry(0.3, 3, 0.3);
    var material = new THREE.MeshLambertMaterial({ color: 0xECB88A });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 1.5;
    return mesh;
  }
});