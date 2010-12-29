steal("//steal/generate/ejs", '//steal/generate/inflector', '//steal/rhino/prompt', function(steal){

steal.plugins('jquery/model', 'jquery/model/associations', 'ss/model/list')
     .then(function($) {
  var _model = window.SS && window.SS.Model;

  $.Model.extend("SS.Model",
  {
    fetchMethod: "getJSON",
    
    setup: function(){
		  this.listType = SS.Model.List;
      this._super.apply(this, arguments);
      this.addAttr("fullyLoaded", "boolean");
    },

    findOne: function(id, params, success) {
      var cachedModel = this.list.get(id)[0];
      if ((typeof cachedModel !== "undefined") && cachedModel) {
        //@steal-remove-start
        if (cachedModel.fullyLoaded) {
          steal.dev.log("CACHE (Hit): " + this.shortName + "#" + cachedModel.id);
        }
        //@steal-remove-end
        cachedModel.loadFully(success);
      } else {
        $[this.fetchMethod](this.apiPath() + '/' + id + '.json', params, this.callback(["wrap", "markAsFullyLoaded", success]));
      }
    },
    
    wrap: function(attributes) {
	    if (!attributes) { return null; }
	    
      var cachedModel = this.list.get(attributes.id);
      if ((typeof cachedModel !== "undefined") && cachedModel) {
        return cachedModel;
      } else {
        return this._super(attributes);
      }
    },

    findAll: function(params, success){
      $.extend(params, { itemsPerPage: "all" });
      $[this.fetchMethod](this.apiPath() + ".json", params, this.callback(function(collection) {
        var result = this.wrapMany(collection.list);
        if (typeof success !== "undefined") {
          success(result);
        }
      }));
    },
    
    markAsFullyLoaded: function(modelData) {
      modelData.attr("fullyLoaded", true);
      return modelData;
    },
    
    apiPath: function() {
      return '/srv/' + steal.Inflector.pluralize(this.shortName.toLowerCase());
    }
  },
  {
    // TODO: Link up with $.model.service.json_rest
    loadFully: function(aCallback) {
      if (this.attr("fullyLoaded") === true) {
        aCallback(this);
      } else {
        $[this.Class.fetchMethod](this.Class.apiPath() + '/' + this.id + '.json', {}, this.callback(function(newData) {
          this.attrs(newData);
          this.attr("fullyLoaded", true);

          // Push updates to backing list
          this.Class.list.remove(this.id);
          this.Class.list.add(this);
                  
          aCallback(this);
        }));
      }
    }
  }
  );

  if (_model) {
    $.extend(SS.Model, _model);
    _model = null;
  }
});
});
