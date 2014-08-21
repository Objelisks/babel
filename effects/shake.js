define(function(require, exports) {

  var shakeStrength = 5.0;
  var shakeDrag = 4.0;
  var shakeElasticity = 100.0;
  var left = new THREE.Vector3(1, 0, 0);
  var forward = new THREE.Vector3(0, 0, 1);

  // dir is a Vector2
  exports.shaker = function(obj) {
    obj.shake = function(dir) {
      var self = this;
      var originalPosition = this.up.clone();
      var originalRotation = this.quaternion.clone();
      var shakeVelocity = dir.clone().multiplyScalar(shakeStrength);
      var shakePosition = new THREE.Vector2();

      this.currentShake = setUpdate(function(delta) {
        
        shakeVelocity.x -= shakeVelocity.x * shakeDrag * delta;
        shakeVelocity.y -= shakeVelocity.y * shakeDrag * delta;

        shakeVelocity.x -= shakePosition.x * shakeElasticity * delta;
        shakeVelocity.y -= shakePosition.y * shakeElasticity * delta;

        shakePosition.x += shakeVelocity.x * delta;
        shakePosition.y += shakeVelocity.y * delta;

        self.rotateOnAxis(left, shakeVelocity.x * Math.PI / 180);
        self.rotateOnAxis(forward, shakeVelocity.y * Math.PI / 180);

        if(shakeVelocity.length() <= 0.0001 && shakePosition.length() <= 0.0001) {
          self.quaternion.copy(originalRotation);
          self.currentShake = null;
          return true;
        }
      });
    };
  };

});