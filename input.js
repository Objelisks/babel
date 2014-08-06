define(function(require, exports) {
  var gameObject = require('gameObject.js');
  //var input = new THREEx.KeyboardState();
  //exports.pressed = input.pressed.bind(input);

  // Initializiation
  var axisThreshold = 0.15;
  var connectedGamepads = [];
  var available = [];
  var gamepadWanters = [];

  var gamepadController = function() {
    return {
      'gamepadIndex': null,
      'target': null,
      'controlling': function(target) {
        this.target = target;
        return this;
      },
      'update': function(delta) {
        if(this.gamepadIndex === null) return;
        if(this.target === null) return;

        var updatedValues = navigator.getGamepads()[this.gamepadIndex];
        if(!updatedValues.connected) return;

        var axes = updatedValues.axes;
        var buttons = updatedValues.buttons;

        var facingAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(this.target.camera.quaternion);
        facingAxis.setY(0).normalize();
        var facing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), facingAxis);

        var left = axes[0];
        var forward = axes[1];
        var movement = new THREE.Vector3(left, 0, forward).applyQuaternion(facing);
        var magnitude = movement.length();

        if(magnitude > axisThreshold) {
          this.target.translateOnAxis(movement.clone().normalize(), magnitude * this.target.moveSpeed * delta);
        }
      }
    }
  }

  var onConnected = function(e) {
    var index = e.gamepad.index;
    console.log('gamepad connected:', index);
    connectedGamepads.push(index);

    // dequeue gamepad wanters
    if(gamepadWanters.length > 0) {
      var gamepadWanter = gamepadWanters.shift();
      gamepadWanter.gamepadIndex = index;
    } else {
      available.push(index);
    }
  }

  var onDisconnected = function(e) {
    var index = e.gamepad.index;
    console.log('gamepad disconnected:', index);
    connectedGamepads = connectedGamepads.slice(connectedGamepads.indexOf(index), 1);
  }

  var getAvailableController = function() {
    var availableIndex = available.shift();
    return availableIndex;
  }

  var queueGamepadWanter = function(target) {
    gamepadWanters.push(target);
  }


  // Final setup
  Array.prototype.each.call(navigator.getGamepads(), function(gamepad) {
    onConnected({ 'gamepad': gamepad });
  });

  addEventListener('gamepadconnected', onConnected.bind(this));
  addEventListener('gamepaddisconnected', onDisconnected.bind(this));


  // returns a gamepad component controlling the this
  exports.gamepad = function(camera) {
    return function() {
      this.moveSpeed = 0.7;
      this.camera = camera;

      var component = gamepadController().controlling(this);
      var gamepadIndex = getAvailableController();
      if(gamepadIndex !== undefined)
        component.gamepadIndex = gamepadIndex;
      else {
        queueGamepadWanter(component);
      }

      return component;
    }
  };
})