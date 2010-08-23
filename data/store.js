steal.then("//steal/generate/inflector").then(function($) {

  SS.Store = Ext.extend(Ext.data.Store, {
    pageSize:   20,
    
    constructor: function(modelName, config) {
      config = config || { };
      
      var pluralModelName = config.pluralModelName || steal.Inflector.pluralize(modelName.toLowerCase());
      
      Ext.apply(config, {
        model:    modelName,
        proxy:    {
          type: "ss",
          url:  "{prefixPlaceholder}" + pluralModelName + '.json'
        }
      });
      
      SS.Store.superclass.constructor.call(this, config);
    }
  });
  
})
