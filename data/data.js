steal.then("lib/core", "lib/data-foundation", "lib/data-json").then(function($) {

  Ext.ns('SS', 'SS.Stores');
  
  SS.serverPrefix = '/srv/';
  
}).then("proxy", "store");
