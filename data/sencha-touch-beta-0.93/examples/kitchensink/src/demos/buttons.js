demos.Buttons = new Ext.Panel({
    layout: {
        type: 'vbox',
        pack: 'center',
        align: 'stretch'
    },
    scroll: 'vertical',
    defaults: {
        layout: 'hbox',
        flex: 1,
        defaults: {
            cls: 'demobtn',
            flex: 1
        }
    },
    items: [{
        items: [{
            xtype: 'button',
            text: 'Normal'
        }, {
            xtype: 'button',
            ui: 'round',
            text: 'Round'
        }]
    }, {
        items: [{
            xtype: 'button',
            ui: 'drastic',
            text: 'Drastic'
        },{
            xtype: 'button',
            ui: 'drastic_round',
            text: 'Round'
        }]
    }, {
        items: [{
            xtype: 'button',
            ui: 'action',
            text: 'Action'
        }, {
            xtype: 'button',
            ui: 'action_round',
            text: 'Round'
        }]
    }]
});