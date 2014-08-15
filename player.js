define(function(require, exports) {

  // Imports
  var world = require('world.js');
  var input = require('input.js');
  var terrain = require('terrain.js');
  var gameObject = require('gameObject.js');

  // Private
  var axisThreshold = 0.15;
  var floorHeight = 0;
  var cameraOffset = new THREE.Vector3(-3, 3, -3);

  var forward = new THREE.Vector3(0, 1, 0);

  var arrowLife = 5.0;
  var arrowSpeed = 5.0;

  var Arrow = function(position, direction) {
    var dir = direction.clone();
    this.mesh = new THREE.ArrowHelper(dir, position.clone(), 1.0, 0xffffff);
    this.lived = 0.0;
    var self = this;
    this.update = function(delta) {
      self.lived += delta;
      if(self.lived >= arrowLife) {
        self.mesh.visible = false;
        world.gameObjects.splice(world.gameObjects.indexOf(self), 1);
        world.scene.remove(self.mesh);
      }

      // TODO describe parabola
      self.mesh.translateOnAxis(forward, arrowSpeed * delta);

      // TODO collision
    }
  }

  var bowAimHelper = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.5, 0), 10, 0xff0000);
  var bowDrawHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0.5, 0), 10, 0x00ff00);

  var bowAim = new THREE.Vector3();
  var lastRightStick = new THREE.Vector3();
  var lastRightTrigger = 0.0;
  var bowReleaseThreshold = 0.7;

  // Handlers
  var rightTriggerHandler = function(event) {
    var value = event.message;
    var delta = event.delta;

    bowDrawHelper.setLength(value + 0.01);
    var velocity = lastRightTrigger - value;
    lastRightTrigger = value;

    // probably need to average over three frames
    if(velocity > bowReleaseThreshold) {
      var arrow = new Arrow(this.position, bowAim);
      world.gameObjects.push(arrow);
      world.scene.add(arrow.mesh);
    }
  }

  var rightStickHandler = function(event) {
    var axes = event.message;
    var delta = event.delta;

    var rightStick = new THREE.Vector3(axes.x, 0, axes.y);
    
    var cameraFacingAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(world.camera.quaternion);
    cameraFacingAxis.setY(0).normalize();
    var cameraFacing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), cameraFacingAxis);

    var left = axes.x;
    var forward = axes.y;
    var rawAim = new THREE.Vector3(left, 0, forward).applyQuaternion(cameraFacing);
    var magnitude = rawAim.length();

    // rawAim describes direction relative to player that the stick is pointing
    // subtract the magnitude from the y component to have the bow direction raise as it is aimed
    // add pseudorandom vector derived from velocity of stick to prevent snapping
    // pseudorandom should come from time? need to describe an arc away from aiming vector

    lastRightStick.copy(rawAim);
    bowAim.copy(rawAim.add(new THREE.Vector3(0, magnitude - 1.0, 0)));


    bowAimHelper.setDirection(bowAim);
    bowAimHelper.setLength(magnitude + 0.3);
    bowDrawHelper.setDirection(bowAim.clone().negate());

    // get position
    // use trigger to draw/release bow
    // spawn projectile when bow was drawn and released
    // arrow velocity, timer
    // when timers runs out, drop arrow if still flying
    // on collide with static/terrain, stick, new timer for fadeaway
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
  exports.Player = function() {
    var geometry = new THREE.SphereGeometry(0.25, 32, 32);
    var material = new THREE.MeshLambertMaterial({ color: 0xFB966E });
    var mesh = new THREE.Mesh(geometry, material);
    mesh = gameObject.construct(mesh)
      .addComponent(playerController)
      .addComponent(terrain.chunkTracker);
    mesh.position.y = 0.25;
    mesh.moveSpeed = 5.0;
    mesh.height = 0.5;

    mesh.add(bowAimHelper);
    mesh.add(bowDrawHelper);
    return mesh;
  }

});