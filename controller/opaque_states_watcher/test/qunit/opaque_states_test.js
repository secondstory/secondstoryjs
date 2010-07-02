module("Opaque States Controller");

SS.Controller.StateMachine.extend("OpaqueStatesTestController", {
  states: {
    initial:    {},
    stateTwo:   {},
    stateThree: {}
  },

  opaqueClass:     "customOpaque",
  nonOpaqueClass:  "customTransparent",
  opaqueStates:    ["stateTwo"]
},
{
});

test("Initial should be non-opaque", function(){
  var testController = new OpaqueStatesTestController($("<div />").get(0));
  equals(testController.currentlyOpaque, false);
});

asyncTest("stateTwo should be opaque", function(){
  var testController = new OpaqueStatesTestController($("<div />").get(0));
  
  testController.changeOpacity = start;
  testController.moveToState("stateTwo");
  stop();
  equals(testController.currentlyOpaque, true);
});

asyncTest("stateThree should be non-opaque", function(){
  var testController = new OpaqueStatesTestController($("<div />").get(0));
  testController.moveToState("stateTwo");
  testController.changeOpacity = start;
  testController.moveToState("stateThree");
  stop();
  equals(testController.currentlyOpaque, false);
});

asyncTest("Custom changeOpacity should fire", function(){
  var testController = new OpaqueStatesTestController($("<div />").get(0));
  
  testController.changeOpacity = function(newOpacity) {
    start();
    equals(newOpacity, 1);
  };
  stop();
  testController.moveToState("stateTwo");
  
  testController.changeOpacity = function(newOpacity) {
    start();
    equals(newOpacity, 0);
  };
  stop();
  testController.moveToState("stateThree");
});

asyncTest("Should use custom opaqueState", function(){
  var testController = new OpaqueStatesTestController($("<div />").get(0));
  
  testController.changeOpacity = function() {
    start();
    equals(this.Class.opaqueClass, "customOpaque");
  };
  
  testController.moveToState("stateTwo");
  stop();
});

asyncTest("Should use custom nonOpaqueState", function(){
  var testController = new OpaqueStatesTestController($("<div />").get(0));
  
  testController.changeOpacity = function() {
    start();
    equals(this.Class.nonOpaqueClass, "customTransparent");
  };
  
  testController.moveToState("stateThree");
  stop();
});
