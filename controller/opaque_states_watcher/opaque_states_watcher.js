steal.plugins("ss/controller/state_machine")
     .then(function($) {
  $.Controller.extend('SS.Controller.OpaqueStatesWatcher',
  {
    onDocument:     true,
    opaqueClass:    "opaque",
    nonOpaqueClass: "transparent",
    setup: function() {
      this._super.apply(this, arguments);
      if (typeof SS.Controller.StateMachine.prototype.currentlyOpaque !== "undefined") {
        SS.Controller.StateMachine.prototype.currentlyOpaque = false;
      }
    }
  },
  {    
    "didMoveToState subscribe": function(event_name, params) {
      var controller = params.controller;
      
      if ($.isArray(controller.Class.opaqueStates)) {
        var opaqueClass    = controller.Class.opaqueClass
                               ? controller.Class.opaqueClass
                               : this.Class.opaqueClass,
            nonOpaqueClass = controller.Class.nonOpaqueClass
                               ? controller.Class.nonOpaqueClass
                               : this.Class.nonOpaqueClass;
        
        if (controller.changeOpacity) {
          var opacityCallback = controller.callback("changeOpacity");
        } else {
          var opacityCallback = function(newValue) {
            if (!controller.currentlyOpaque && (newValue === 1)) {
              controller.element.addClass(opaqueClass).removeClass(nonOpaqueClass);
            } else if (controller.currentlyOpaque && (newValue === 0)) {
              controller.element.addClass(nonOpaqueClass).removeClass(opaqueClass);
            }
          };
        }
        
        // If the new state is an opaque state
        if (controller.Class.opaqueStates.indexOf(params.to) !== -1) {
          opacityCallback(1);
          controller.currentlyOpaque = true;
        } else {
          opacityCallback(0);
          controller.currentlyOpaque = false;
        }
      }
    }
  }
  );
});
