/*
BOW MODULE
*/
define(function(require, exports) {
  var world = require('system/world');

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

  var Bow = function() {
    THREE.Object3D.call(this);

    var geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    var material = new THREE.MeshLambertMaterial({ color: 0xff0000 });

    this.add(new THREE.Mesh(geometry, material));

    this.add(bowAimHelper);
    this.add(bowDrawHelper);
  }

  Bow.prototype = Object.create(THREE.Object3D.prototype);

  Bow.prototype.trigger = function(value, delta) {

    bowDrawHelper.setLength(value + 0.01);
    var velocity = lastRightTrigger - value;
    lastRightTrigger = value;

    // probably need to average over three frames
    if(velocity > bowReleaseThreshold) {
      var spawnPos = this.localToWorld(this.position.clone());
      var arrow = new Arrow(spawnPos, bowAim);
      world.gameObjects.push(arrow);
      world.scene.add(arrow.mesh);
    }

  }

  Bow.prototype.stick = function(axes, delta) {

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

  return Bow;

});