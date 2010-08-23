module("Ext Data");

//SS.serverPrefix = 'http://secondstory.com/srv/';
SS.serverPrefix = 'http://chm-dev.2s.lan/revolution/srv/';

Ext.regModel('Thread', {
  fields: [
    'uri',
    'title'
  ]
});

asyncTest("Small paging windows", function(){
  expect(1);
  stop();
  
  var smallPageStory = new SS.Store('Thread', { pageSize: 2 });
  
  smallPageStory.on("datachanged", function(store) {
    start();
    equals(store.data.items.length, 2);
  }, this, {single: true});
  
  smallPageStory.load();
});

