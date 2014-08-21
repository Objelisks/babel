/*
PLAYER MODULE
*/
define(function(require, exports) {

  // Imports
  var world =           require('system/world');
  var input =           require('system/input');
  var terrain =         require('system/terrain');
  var gameObject =      require('system/gameObject');

  var Bow =             require('items/bow');
  var Stick =           require('items/stick');

  // Private
  var axisThreshold = 0.15;
  var floorHeight = 0;
  var cameraOffset = new THREE.Vector3(-3, 3, -3);

  // Handlers
  var rightTriggerHandler = function(event) {
    var value = event.message;
    var delta = event.delta;

    this.item.trigger(value, delta);
  }

  var rightStickHandler = function(event) {
    var axes = event.message;
    var delta = event.delta;

    this.item.stick(axes, delta);
  }

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
    input.primary.addEventListener('righttrigger', rightTriggerHandler.bind(this));
    return {};
  }

  // TODO make constructors consistent
  var Player = function() {
    THREE.Object3D.call(this);
    gameObject.construct(this)
      .addComponent(playerController)
      .addComponent(terrain.chunkTracker);
    this.moveSpeed = 5.0;
    this.height = 0.5;

    var geometry = new THREE.SphereGeometry(0.25, 32, 32);
    var material = new THREE.MeshLambertMaterial({ color: 0xFB966E });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.25;
    this.add(mesh);

    this.bow = new Bow();
    this.stick = new Stick();
    this.bow.visible = false;

    this.item = this.stick;

    this.add(this.bow);
    this.add(this.stick);
  }

  Player.prototype = Object.create(THREE.Object3D.prototype);

  return Player;

});