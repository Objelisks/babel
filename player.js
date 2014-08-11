define(function(require, exports) {

  var world = require('world.js');
  var input = require('input.js');
  var gameObject = require('gameObject.js');

  var rightStickHandler = function(event) {
    var axes = event.message;
  }

  var axisThreshold = 0.15;
  var floorHeight = 0;
  var cameraOffset = new THREE.Vector3(-1.5, 2.5, -1.5);

  var leftStickHandler = function(event) {
    var axes = event.message;
    var delta = event.delta;

    var cameraFacingAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(world.camera.quaternion);
    cameraFacingAxis.setY(0).normalize();
    var cameraFacing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), cameraFacingAxis);

    var left = axes.x;
    var forward = axes.y;
    var movement = new THREE.Vector3(left, 0, forward).applyQuaternion(cameraFacing);
    var magnitude = movement.length();

    var dir = movement.clone().normalize();
    var dist = magnitude * this.moveSpeed * delta;
    if(magnitude > axisThreshold) {
      this.translateOnAxis(dir, dist);
    }

    var fallSpeed = 4.5;
    if(world.chunks) {
      var pos = this.position.clone();

      var origin = pos.setY(pos.y).add(dir.setLength(dist));
      var raycasterMove = new THREE.Raycaster(origin, new THREE.Vector3(0, -1, 0), 0.1, 100);

      var halfHeight = this.height / 2.0;

      results = raycasterMove.intersectObjects(world.chunks, true);
      if(results.length > 0) {
        floorHeight = results[0].point.y;
      } else {
        floorHeight = pos.y - halfHeight;
      }

      if(this.position.y - halfHeight > floorHeight) {
        this.position.y = Math.max(floorHeight + halfHeight,
                                          this.position.y - fallSpeed * delta);
      } else {
        this.position.y = floorHeight + halfHeight;
      }
    }

    world.camera.position.copy(this.position).add(cameraOffset);
  }

  var playerController = function() {
    this.moveSpeed = 0.7;
    this.height = 1.0;
    input.primary.addEventListener('leftstickmoved', leftStickHandler.bind(this));
    input.primary.addEventListener('rightstickmoved', rightStickHandler.bind(this));
    return {};
  }

  // TODO make constructors consistent
  exports.Player = function() {
    var geometry = new THREE.SphereGeometry(0.25, 32, 32);
    var material = new THREE.MeshLambertMaterial({ color: 0xFB966E });
    var mesh = new THREE.Mesh(geometry, material);
    mesh = gameObject.construct(mesh)
      .addComponent(playerController);
    mesh.position.y = 0.25;
    mesh.moveSpeed = 5.0;
    mesh.height = 0.5;
    return mesh;
  }

});