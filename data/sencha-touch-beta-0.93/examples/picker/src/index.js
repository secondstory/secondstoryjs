Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: function(options) {
        var picker = new Ext.DatePicker({
            floating: true,
            hideOnMaskTap: false,
            width: (!Ext.platform.isPhone ? 400 : 320),
            height: Ext.platform.isAndroidOS ? 320 : (!Ext.platform.isPhone ? 356 : 300),
            useTitles: false,
            value: {
                day: 23,
                month: 2,
                year: 1984
            },
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                title: 'Birthdate',
                // custom alignment of titlebar to left
                titleCls: 'x-toolbar-title x-toolbar-left',
                
                // alignment of the button to the right via
                // flexed components
                items: [{xtype: 'component', flex: 1},{
                    xtype: 'button',
                    ui: 'action',
                    text: 'Show Value',
                    handler: function() {
                        var v = picker.getValue();
                        alert(Ext.encode(v));
                    }
                }]
            }]
        });
        
        /*
        picker.on('pick', function(p, name, value, oldValue, r) {
            console.log('Changed ' + name + ' from ' + oldValue + ' to ' + value);
            console.log('Current value is :' + Ext.encode(p.getValue()));
        });
        */
        picker.show();
    }
});