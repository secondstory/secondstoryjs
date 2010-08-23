Ext.data.TwitterReader = Ext.extend(Ext.data.JsonReader, {
    root: 'results'
});

Ext.data.ReaderMgr.registerType('twitter', Ext.data.TwitterReader);