/**
 * @class Ext.data.MemoryProxy
 * @extends Ext.data.ClientProxy
 * <p>In-memory proxy. This proxy simply uses a local variable for data storage/retrieval, so its contents are
 * lost on every page refresh.</p>
 */
Ext.data.MemoryProxy = Ext.extend(Ext.data.ClientProxy, {
    constructor: function(config) {
        Ext.data.MemoryProxy.superclass.constructor.call(this, config);
        
        this.data = {};
    }
});

Ext.data.ProxyMgr.registerType('memory', Ext.data.MemoryProxy);