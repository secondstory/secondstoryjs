steal.plugins("ss/model",
              "ss/controller/state_machine")
     .then(function($) {

  SS.Controller.StateMachine.autoload = function(modelClass, params) {
    params = params || {};
    
    this.modelClass       = modelClass;
    this.startOnInit      = (params && typeof params.startOnInit === "boolean")
                              ? params.startOnInit
                              : true;
    this.modelClassDomain = (params && typeof params.modelClassDomain === "string")
                              ? params.modelClassDomain
                              : "one";

    this.states = $.extend(true, {}, this.states || {}, {
      initial:         { beginAutoloading:    "autoloading",
                         onEnter:             ["checkForAutoload"] },
      autoloading:     { finishedAutoloading: "autoloaded",
                         onEnter:             ["autoloadFromServer"],
                         onExit:              ["didCompleteLoading"] },
      autoloaded:      { }
    });
    
    this.intializeStateMachine();
    
    $.extend(this.prototype, { 
      checkForAutoload: function() {
        if (this.Class.modelClass && (this.Class.startOnInit === true)) {
          this.publishState("beginAutoloading");
        }
      },
    
      autoloadFromServer: function() {
        if (this.Class.modelClassDomain == "one") {
          this.modelId   = this.modelId || this.getModelFromIdentityClass(this.Class.modelClass.shortName.toLowerCase());
          this.modelData = this.modelData || { id: this.modelId };
          if (this.modelId) {
            this.Class.modelClass.findOne(this.modelId, {}, this.callback("autoloadingCallback"));
          }
        } else {
          this.modelId = "all";
          this.Class.modelClass.findAll({}, this.callback("autoloadingCallback"));
        }
      },
      
      autoloadingCallback: function(newData) {
        this.modelData = newData;
        this.publishState("finishedAutoloading");
     
        //@steal-remove-start
        steal.dev.log(
          "FSM (" + this.stateSuffix + "): autoloaded " + 
          this.Class.modelClass.shortName + "#" + 
          (this.Class.modelClassDomain == "one" ? this.modelId : this.Class.modelClassDomain)
        );
        //@steal-remove-end
      },
      
      getModelFromIdentityClass: function(modelName) {
        if (!this.element) {
          return;
        }
        
        var reg    = new RegExp(modelName + "_(\\d+)"),
            result = this.element[0].className.match(reg);
        return result && result[1];
      }
    });
  };
});
