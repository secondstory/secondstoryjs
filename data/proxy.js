SS.Proxy = Ext.extend(Ext.data.ScriptTagProxy, {

  constructor: function(config) {
    Ext.apply(config, {
      reader: {
        type: 'json',
        root: 'list',
        totalProperty: "pagination.totalItems"
      }
    });
    
    SS.Proxy.superclass.constructor.call(this, config);
  },
  
  buildRequest: function(operation) {
    var params = Ext.applyIf({
      itemsPerPage: operation.limit,
      page: Math.ceil(operation.start / operation.limit) + 1
    }, this.extraParams || {});
        
    var request = new Ext.data.Request({
      params  : params,
      action  : operation.action,
      records : operation.records,
      operation : operation
    });
    
    request.url = this.buildUrl(request);
    operation.request = request;
    
    return request;
  },

  buildUrl: function(request) {
    var url = SS.Proxy.superclass.buildUrl.call(this, request);
    url     = url.replace("{prefixPlaceholder}", SS.serverPrefix);
    return url;
  }
});

Ext.data.ProxyMgr.registerType('ss', SS.Proxy);
