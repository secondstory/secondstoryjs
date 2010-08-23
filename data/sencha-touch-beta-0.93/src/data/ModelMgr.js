/**
 * @class Ext.ModelMgr
 * @extends Ext.AbstractManager
 * Creates and manages the current set of models
 */
Ext.ModelMgr = new Ext.AbstractManager({
    typeName: 'mtype',
    
    /**
     * Registers a model definition. All model plugins marked with isDefault: true are bootstrapped
     * immediately, as are any addition plugins defined in the model config.
     */
    registerType: function(name, config) {
        var PluginMgr = Ext.PluginMgr,
            plugins   = PluginMgr.findByType('model', true),
            fields    = config.fields || [],
            model     = Ext.extend(Ext.data.Model, config);
        
        var modelPlugins = config.plugins || [];
        
        for (var index = 0, length = modelPlugins.length; index < length; index++) {
            plugins.push(PluginMgr.create(modelPlugins[index]));
        }
        
        var fieldsMC = new Ext.util.MixedCollection(false, function(field) {
            return field.name;
        });
        
        for (var index = 0, length = fields.length; index < length; index++) {
            fieldsMC.add(new Ext.data.Field(fields[index]));
        }
        
        Ext.override(model, {
            fields : fieldsMC,
            plugins: plugins
        });
        
        for (var index = 0, length = plugins.length; index < length; index++) {
            plugins[index].bootstrap(model, config);
        }
        
        this.types[name] = model;
        
        return model;
    },
    
    /**
     * 
     * @param {String/Object} id The id of the model or the model instance.
     */
    getModel: function(id){
        var model = id;
        if(typeof model == 'string'){
            model = this.types[model];
        }
        return model;
    },
    
    create: function(config, name) {
        var con = typeof name == 'function' ? name : this.types[name || config.name];
        
        return new con(config);
    }
});

Ext.regModel = function() {
    return Ext.ModelMgr.registerType.apply(Ext.ModelMgr, arguments);
};