/**
INPUT MODULE
*/
define(function(require, exports) {
  var gameObject = require('gameObject.js');
  //var input = new THREEx.KeyboardState();

  // Initializiation
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
    var controller = {
      'gamepadIndex': null,
      'lastButtons': [],
      'update': function(delta) {
        if(this.gamepadIndex === null) return;
        var gamepads = navigator.getGamepads();
        if(gamepads[this.gamepadIndex] === undefined) return;

        var updatedValues = navigator.getGamepads()[this.gamepadIndex];
        if(!updatedValues.connected) return;

        var self = this;


        // Handle button presses
        var buttons = updatedValues.buttons;
        if(this.lastButtons !== null) {
          buttons.each(function(buttonValue, buttonIndex) {
            if(self.lastButtons[buttonIndex] !== undefined
              && buttonValue.pressed !== self.lastButtons[buttonIndex]) {
              self.dispatchEvent({
                'type': buttonActionMap['joystick'][buttonIndex] + (buttonValue.pressed ? 'pressed' : 'released'),
                'message': buttonValue,
                'delta': delta
              });
            }
            self.lastButtons[buttonIndex] = buttonValue.pressed;
          });
        }


        // Handle movement on joystick axes
        var axes = updatedValues.axes;
        this.dispatchEvent({
          'type': 'leftstickmoved',
          'message': new THREE.Vector2(axes[0], axes[1]),
          'delta': delta
        });
        this.dispatchEvent({
          'type': 'rightstickmoved',
          'message': new THREE.Vector2(axes[2], axes[3]),
          'delta': delta
        });
      }
    };

    THREE.EventDispatcher.prototype.apply(controller);

    return controller;
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
  // TODO check each frame for new gamepads the events don't work always
  Array.prototype.each.call(navigator.getGamepads(), function(gamepad) {
    onConnected({ 'gamepad': gamepad });
  });

  addEventListener('gamepadconnected', onConnected.bind(this));
  addEventListener('gamepaddisconnected', onDisconnected.bind(this));


  // returns a gamepad controller
  var createGamepad = function() {
    var controller = gamepadController();
    var gamepadIndex = getAvailableController();
    if(gamepadIndex !== undefined)
      controller.gamepadIndex = gamepadIndex;
    else {
      queueGamepadWanter(controller);
    }

    return controller;
  };

  // TODO generalize this
  exports.primary = createGamepad();

  // TODO exports.gamepads.primary
  // TODO exports.gamepads[2]
  // TODO exports.gamepads.any
  // TODO exports.keyboard

  exports.update = function(delta) {
    // TODO generalize this
    exports.primary.update(delta);
  }
})