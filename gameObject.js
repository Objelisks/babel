define(function(require, exports) {
  var builders = {};
  var destructors = {};

  /**
   * Adds components registry and methods to add components to gameObject.
   */
  exports.construct = function(obj) {
    obj.components = [];
    obj.addComponent = function(componentName) {
      obj[componentName] = builders[componentName].call(obj);
      if(obj.components.indexOf(componentName) === -1) {
        obj.components.push(componentName);
      }
      return obj;
    }
    obj.removeComponent = function(componentName) {
      if(destructors[componentName]) {
        destructors[componentName].call(obj);
      }
      delete obj[componentName];
      var componentIndex = obj.components.indexOf(componentName);
      if(componentIndex !== -1) {
        delete obj.components.splice(componentIndex, 1);
      }
    }
    obj.updateComponent = function(componentName, component) {
      obj[componentName] = component;
      if(obj.components.indexOf(componentName) === -1) {
        obj.components.push(componentName);
      }
      return obj;
    }
    obj.update = function(delta) {
      obj.components.each(function(component) {
        if(obj[component].update) {
          obj[component].update(delta);
        }
      })
    }
    return obj;
  }

  /**
   * Registers a component builder to a name.
   * componentBuilder: function() { this === object being added to };
   * componentDestructor: function() { this === object being removed from }; (optional)
   */
  exports.register = function(name, componentBuilder, componentDestructor) {
    builders[name] = componentBuilder;
    if(componentDestructor) {
      destructors[name] = componentDestructor;
    }
  }

  /*// Example Usage

  var components = require('components.js');

  var gamepadBuilder = function() {
    return Gamepad.getController().control(this);
  }

  components.registerComponent('gamepad', gamepadBuilder);

  components.construct(player)
    .addComponent('gamepad');

  player.update(delta);
  // calls player.gamepad.update(delta);
  */
});