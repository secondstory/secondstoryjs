module("Autoloading Controller");

SS.Model.extend("AutoloadingPerson",
{
},
{
}
);

//AutoloadingPerson.list.clear();
var testPerson = new AutoloadingPerson({ id: 1, name: "Testy" });
testPerson.attr("fullyLoaded", true);

asyncTest("Should autoload based on dom class", function(){  
  SS.Controller.StateMachine.extend("AutoloadingTestController1", {
    init: function() {
      this.autoload(AutoloadingPerson);
    }
  },
  {
    didCompleteLoading: function() {
      start();
    }
  });
  
  stop();
  var jqueryElem     = $("<div class='autoloadingperson_" + testPerson.id +"' />"),
      testController = new AutoloadingTestController1(jqueryElem.get(0));
  equals(testController.modelData.name, testPerson.attr('name'));
  equals(testController.currentStateName, "autoloaded");
});

asyncTest("Should autoload based on modelId", function(){  
  SS.Controller.StateMachine.extend("AutoloadingTestController2", {
    init: function() {
      this.autoload(AutoloadingPerson);
    }
  },
  {
    modelId: 1,
    didCompleteLoading: function() {
      start();
    }
  });
  
  stop();
  var testController = new AutoloadingTestController2($("<div />").get(0));
  equals(testController.modelData.name, testPerson.attr('name'));
  equals(testController.currentStateName, "autoloaded");
});

asyncTest("Should be able to manually trigger autoload", function(){  
  SS.Controller.StateMachine.extend("AutoloadingTestController3", {
    init: function() {
      this.autoload(AutoloadingPerson, { startOnInit: false });
    }
  },
  {
    modelId: 1,
    didCompleteLoading: function() {
      start();
    }
  });
  
  var testController = new AutoloadingTestController3($("<div />").get(0));
  testController.publishState("beginAutoloading");
  stop();
  equals(testController.modelData.name, testPerson.attr('name'));
  equals(testController.currentStateName, "autoloaded");
});
