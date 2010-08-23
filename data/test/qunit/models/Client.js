Ext.regModel('Client', {
  fields: [
    'uri',
    'name',
    'alias',
    'works'
  ]
});

SS.Stores.Clients = new SS.Store('Client', { /*autoLoad: true*/ });
