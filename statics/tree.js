define(function(require, exports) {
  var loader = require('../loader.js');
  var statics = require('../statics.js');
  var timing = require('../effects/timing.js');
  var shake = require('../effects/shake.js');

  var treeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

  exports.Tree = function() {
    THREE.Object3D.call(this);
    this.rotateOnAxis(this.up, Math.random() * Math.PI);

    var self = this;
    statics.loadModel('tree', function(geometry) {
      self.add(geometry);
    });
    
    this.currentShake = null;

    shake.shaker(this);
    this.shake(new THREE.Vector2(Math.random(), Math.random()));
  }

  exports.Tree.prototype = Object.create(THREE.Object3D.prototype);

});