Ext.regModel('Work', {
  fields: [
    'uri',
    'name',
    'alias',
    'width',
    { name: 'completed', type: 'date' },
    'clients',
    'summary',
    'primary_asset'
  ]
});

SS.Stores.Works = new SS.Store('Work', { /*autoLoad: true*/ });
