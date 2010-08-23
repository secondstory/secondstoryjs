Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: function() {
        var nestedList = new Ext.NestedList({
            fullscreen: true,          
            items: [{
                text: 'Option A',
                items: [{
                    text: 'Option A.1',
                    customAttribute: 123,
                    items: [{
                        text: 'Option A.1.a'
                    },{
                        text: 'Option A.1.b'
                    }]
                },{
                    text: 'Option A.2',
                    customAttribute: 389
                }]
            },{
                text: 'Option B',
                items: [{
                    text: 'Option B.1',
                    customAttribute: 233
                },{
                    text: 'Option B.2',
                    customAttribute: 2390
                }]
            },{
                text: 'Option C',
                items: [{
                    text: 'Option C.1',
                    customAttribute: 903
                },{
                    text: 'Option C.2',
                    customAttribute: 77
                }]
            }]        
        });
        
        nestedList.on('listchange', function(list, item) {
            if (!item.items && item.text) {
                alert('You chose the ' + item.text + ' item.');
            }            
        });        
    }
});
