Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: function() {
        Ext.getBody().mask(false, '<div class="demos-loading">Loading&hellip;</div>');
        var panel = new Ext.Panel({
            fullscreen: true,
            layout: 'fit',
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'First card',
                    handler: function(){
                        var carousel = panel.getComponent('carousel'); 
                        carousel.setCard(0, 'fade');
                    }
                },{
                    text: 'Last Card',
                    handler: function(){
                        var carousel = panel.getComponent('carousel');
                        carousel.setCard(carousel.items.getCount() - 1, 'fade');
                    }
                }]
            }]
        });
        
        Ext.regModel('Card', {
            fields: ['content', 'cls']    
        });
        
        var store = new Ext.data.Store({
            model: 'Card',
            proxy: {
                type: 'ajax',
                url: 'data.xml',
                reader: {
                    type: 'xml',
                    record: 'card'
                }
            },
            listeners: {
                single: true,
                datachanged: function(){
                    Ext.getBody().unmask();
                    var items = [];
                    
                    store.each(function(rec){
                        items.push({
                            html: rec.get('content'),
                            cls: 'card ' + rec.get('cls')
                        });
                    });
                    
                    var carousel = new Ext.Carousel({
                        items: items,
                        itemId: 'carousel'
                    });
                    panel.add(carousel);
                    panel.doLayout();
                }
            }    
        });
        store.read();
    }
});