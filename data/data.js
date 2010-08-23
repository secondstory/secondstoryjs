steal.then("lib/custom-extjs").then(function($) {

  Ext.ns('SS', 'SS.Stores');
  
  SS.serverPrefix = '/srv/';
  
}).then("proxy", "store");
