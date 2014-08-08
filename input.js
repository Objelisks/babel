
/**
INPUT MODULE
*/
define(function(require, exports) {
  var gameObject = require('gameObject.js');
  //var input = new THREEx.KeyboardState();

  // Event Dispatcher
  THREE.EventDispatcher.prototype.apply(exports);

  // Initializiation
  var axisThreshold = 0.15;
  var connectedGamepads = [];
  var available = [];
  var gamepadWanters = [];

  var buttonActionMap = {
    'joystick': {
      0: 'a',
      1: 'b',
      2: 'x',
      3: 'y',
      4: 'leftshoulder',
      5: 'rightshoulder',
      8: 'back',
      9: 'start',
      10: 'leftstick',
      11: 'rightstick',
      12: 'up',
      13: 'down',
      14: 'left',
      15: 'right'
    }
  }

  var gamepadController = function() {
    return {
      'gamepadIndex': null,
      'target': null,
      'controlling': function(target) {
        this.target = target;
        return this;
      },
      'floorObjects': null,
      'floorHeight': 0,
      'cameraOffset': new THREE.Vector3(-1.5, 2.5, -1.5),
      'mode': {},
      'lastButtons': [],
      'update': function(delta) {
        if(this.gamepadIndex === null) return;
        if(this.target === null) return;

        var updatedValues = navigator.getGamepads()[this.gamepadIndex];
        if(!updatedValues.connected) return;


        // Handle button presses
        var buttons = updatedValues.buttons;
        if(this.lastButtons !== null) {
          buttons.each(function(buttonValue, buttonIndex) {
            if(buttonValue !== this.lastButtons[buttonIndex]) {
              this.dispatchEvent({
                'type': 'button' + buttonValue ? 'pressed' : 'released',
                'message': buttonActionMap['joystick'][buttonIndex]
              });
            }
          });
        }
        this.lastButtons = buttons;


        // Handle movement on joystick axes
        var axes = updatedValues.axes;

        var facingAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(this.camera.quaternion);
        facingAxis.setY(0).normalize();
        var facing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), facingAxis);

        var left = axes[0];
        var forward = axes[1];
        var movement = new THREE.Vector3(left, 0, forward).applyQuaternion(facing);
        var magnitude = movement.length();

        var dir = movement.clone().normalize();
        var dist = magnitude * this.target.moveSpeed * delta;
        if(magnitude > axisThreshold) {
          this.target.translateOnAxis(dir, dist);
        }

        var fallSpeed = 4.5;
        if(this.floorObjects) {
          var pos = this.target.position.clone();

          var origin = pos.setY(pos.y).add(dir.setLength(dist));
          var raycasterMove = new THREE.Raycaster(origin, new THREE.Vector3(0, -1, 0), 0.1, 100);

          var halfHeight = this.target.height / 2.0;

          results = raycasterMove.intersectObjects(this.floorObjects, true);
          if(results.length > 0) {
            this.floorHeight = results[0].point.y;
          } else {
            this.floorHeight = pos.y - halfHeight;
          }

          if(this.target.position.y - halfHeight > this.floorHeight) {
            this.target.position.y = Math.max(this.floorHeight + halfHeight,
                                              this.target.position.y - fallSpeed * delta);
          } else {
            this.target.position.y = this.floorHeight + halfHeight;
          }
        }

        this.camera.position.copy(this.target.position).add(this.cameraOffset);
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
  exports.gamepad = function(camera, floorObjects) {
    return function() {
      this.moveSpeed = 0.7;
      this.height = 1.0;

      var component = gamepadController().controlling(this);
      component.floorObjects = floorObjects;
      component.camera = camera;
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