define(function(require, exports) {
  var loader =      require('statics/loader');
  var statics =     require('statics/statics');
  var timing =      require('effects/timing');
  var shake =       require('effects/shake');

  var treeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

  exports.Tree = function() {
    THREE.Object3D.call(this);
    this.rotateOnAxis(this.up, Math.random() * Math.PI);
    this.isGameObject = true;

    var self = this;
    statics.loadModel('tree', function(mesh) {
      self.add(mesh);
    });
    
    this.currentShake = null;

    this.shake(new THREE.Vector2(Math.random(), Math.random()));
  }

  exports.Tree.prototype = Object.create(THREE.Object3D.prototype);

  shake.shaker(exports.Tree.prototype);
});