/*
STICK MODULE
*/
define(function(require, exports) {
  var world = require('system/world');
  var timing = require('effects/timing');

  // stick for hitting things

  var stickLength = 1.3;
  var stickMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  var stickDrag = 5.0;
  var swingSpeed = 40.0;
  var armScale = 3.0;

  var Stick = function() {
    THREE.Object3D.call(this);

    var geometry = new THREE.BoxGeometry(0.07, stickLength, 0.07);
    var material = stickMaterial;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = 0.8;
    this.add(this.mesh);

    this.rayHelper = new THREE.ArrowHelper(new THREE.Vector3(1.0, 0, 0), new THREE.Vector3(0, 1.0, 0), 1.0, 0x0000ff);
    this.add(this.rayHelper);
    this.rayHelper.visible = false;

    // polar quardinit
    this.swingPosition = new THREE.Vector2(0, 0);
    this.swingVelocity = new THREE.Vector2(0, 0);

    this.stickPosition = new THREE.Vector2();
    this.lastStickPostition = new THREE.Vector2();
    this.stickVelocity = new THREE.Vector2();

    setUpdate(this.update.bind(this));
  }

  Stick.prototype = Object.create(THREE.Object3D.prototype);

  Stick.prototype.trigger = function(value, delta) {

  }

  Stick.prototype.stick = function(axes, delta) {

    var rightStick = new THREE.Vector3(axes.x, 0, axes.y);
    
    var cameraFacingAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(world.camera.quaternion);
    cameraFacingAxis.setY(0).normalize();
    var cameraFacing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), cameraFacingAxis);

    var left = axes.x;
    var forward = axes.y;
    var rawAim = new THREE.Vector3(left, 0, forward).applyQuaternion(cameraFacing);
    var magnitude = rawAim.length();

    this.lastStickPostition.copy(this.stickPosition);
    this.stickPosition.set(rawAim.x, rawAim.z);
    this.stickVelocity.subVectors(this.stickPosition, this.lastStickPostition);
  }

  Stick.prototype.update = function(delta) {
    var lastSwingPosition = this.swingPosition.clone();
    this.swingVelocity
      .add(this.stickPosition.clone().sub(this.swingPosition).multiplyScalar(delta))
      .sub(this.swingVelocity.clone().multiplyScalar(stickDrag * delta));
    this.swingPosition.add(this.swingVelocity.clone().multiplyScalar(swingSpeed * delta));

    this.position.set(this.swingPosition.x / armScale, 0, this.swingPosition.y / armScale);
    this.quaternion.setFromUnitVectors(this.up, new THREE.Vector3(this.swingPosition.x, 1, this.swingPosition.y));
    
    var rayPosition = this.localToWorld(this.position.clone().add(new THREE.Vector3(0, 1.0, 0)));
    var rayDirection = new THREE.Vector3(this.swingVelocity.x, 0, this.swingVelocity.y);
    this.rayHelper.setDirection(rayDirection);
    var raycaster = new THREE.Raycaster(rayPosition, rayDirection, -1.0, 0.1);
    var intersects = raycaster.intersectObjects(world.trees, true);
    if(intersects.length > 0) {
      var collision = intersects[0];
      var object = collision.object;
      while(object != null && !object.isGameObject) {
        object = object.parent;
      }
      if(object.shake) {
        object.shake(this.swingVelocity.clone().multiplyScalar(5.0));
      }

      this.swingVelocity.multiplyScalar(-3.0);
    }
  }

  return Stick;

});