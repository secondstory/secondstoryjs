demos.Overlay = new Ext.Panel({
    layout: {
        type: 'vbox',
        pack: 'center'
    },
    items: [{
        xtype: 'button',
        text: 'Launch Overlay',
        handler: function() {
            if (!this.popup) {
                this.popup = new Ext.Panel({
                    floating: true,
                    modal: true,
                    centered: true,
                    width: 320,
                    height: 300,
                    styleHtmlContent: true,
                    html: '<p>Tap anywhere outside the overlay to close it.</p>',
                    dockedItems: [{
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'Overlay Title'
                    }],
                    scroll: 'vertical'
                });
            }
            this.popup.show('pop');
        }
    }]
});