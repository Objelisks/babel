/*
STICK MODULE
*/
define(function(require, exports) {
  // stick for hitting things

  var stickLength = 1.0;
  var stickMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

  var Stick = function() {
    THREE.Object3D.call(this);

    var geometry = new THREE.BoxGeometry(0.1, stickLength, 0.1);
    var material = stickMaterial;
    this.add(new THREE.Mesh(geometry, material));
  }

  Stick.prototype = Object.create(THREE.Object3D.prototype);

  Stick.update = function(delta) {
    var rayStart = this.position.clone().add(this.velocity.clone().multiplyScalar(delta));
    var raycaster = new THREE.Raycaster(this.position, this.up, 0.1, stickLength);
    var intersects = raycaster.intersectObjects(world.scene, true);
    if(intersets.length > 0) {
      var collision = intersects[0];
      var object = collision.object;
      
      if(object.shake) {
        object.shake(this.position.clone().sub(object.position).normalize());
      }

      this.velocity.negate();
    }
  }

  return Stick;
  
});