define(function(require, exports) {
  var builders = {};
  var destructors = {};

  /**
   * Adds components registry and methods to add components to gameObject.
   */
  exports.construct = function(obj) {
    // Give the object a component list
    obj.components = [];

    // Add method for adding components
    obj.addComponent = function(componentBuilder) {
      this.components.push(componentBuilder.call(this));
      return this;
    }

    // Add a method for updating all components
    var superUpdate = obj.update; // save existing update
    obj.update = function(delta) {
      if(superUpdate) superUpdate.call(this, delta);
      this.components.each(function(component) {
        if(component.update) {
          component.update(delta);
        }
      })
    }
    return obj;
  }
});