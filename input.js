define(function(require, exports) {
  var gameObject = require('gameObject.js');
  var input = new THREEx.KeyboardState();
  exports.pressed = input.pressed.bind(input);

  var axisThreshold = 0.15;

  var controller = function(gamepad) {
    return {
      'gamepad': gamepad,
      'target': null,
      'control': function(obj) {
        this.target = obj;
        return this;
      },
      'update': function(delta) {
        // logic for moving object based on controller input
        var updatedValues = navigator.getGamepads()[this.gamepad.index];
        var axes = updatedValues.axes;
        var buttons = updatedValues.buttons;
        if(axes[0] > axisThreshold) { // left stick right
          this.target.position.z += this.target.moveSpeed * delta * axes[0];
        }
        if(axes[0] < -axisThreshold) { // left stick left
          this.target.position.z += this.target.moveSpeed * delta * axes[0];
        }
        if(axes[1] > axisThreshold) { // left stick down
          this.target.position.x -= this.target.moveSpeed * delta * axes[1];
        }
        if(axes[1] < -axisThreshold) { // left stick up
          this.target.position.x -= this.target.moveSpeed * delta * axes[1];
        }
      }
    }
  }

  var Gamepad = function() {
    this.controllers = [];
    this.controlWanters = [];
    var self = this;
    Array.prototype.each.call(navigator.getGamepads(), function(gamepad) {
      self.onConnected({ 'gamepad': gamepad });
    });
    addEventListener('gamepadconnected', this.onConnected.bind(this));
    addEventListener('gamepaddisconnected', this.onDisconnected.bind(this));
  }

  Gamepad.prototype.onConnected = function(e) {
    var gamepad = e.gamepad;
    console.log('gamepad connected:', gamepad.index);
    var controllerComponent = controller(gamepad);
    this.controllers[gamepad.index] = controllerComponent;

    // dequeue control wanters
    if(this.controlWanters.length > 0) {
      var controlWanter = this.controlWanters.shift();
      controllerComponent.control(controlWanter);
      controlWanter.updateComponent('gamepad', controllerComponent);
      console.log(controlWanter);
    }
  }

  Gamepad.prototype.onDisconnected = function(e) {
    var gamepad = e.gamepad;
    console.log('gamepad disconnected:', gamepad.index);
    delete this.controllers[gamepad.index];
    if(gamepad.target) {
      // update component
    }
  }

  Gamepad.prototype.getAvailableController = function() {
    return this.controllers.filter(function(controller) {
      return controller.target === null;
    })[0];
  }

  Gamepad.prototype.queueControlWanter = function(obj) {
    this.controlWanters.push(obj);
    return {
      'gamepad': null,
      'target': obj
    }
  }

  exports.Gamepad = new Gamepad();

  // returns a gamepad component controlling the obj
  gameObject.register('gamepad', function() {
    this.moveSpeed = 1.0;

    var controller = exports.Gamepad.getAvailableController();
    if(controller)
      return controller.control(this);
    else {
      controller = exports.Gamepad.queueControlWanter(this);
      return controller;
    }
  });

})