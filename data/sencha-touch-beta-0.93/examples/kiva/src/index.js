Ext.ns('kiva', 'kiva.ui', 'kiva.data');

Ext.setup({
    tabletStartupScreen: 'img/tablet_startup.png',
    // phoneStartupScreen: 'phone_startup.png',
    icon: 'img/kiva.png',
    glossOnIcon: false,
    
    onReady: function() {
        var viewport = new kiva.ui.LoanList({
            fullscreen: true,
            ui: 'kiva',
            id: 'viewport',
            listeners: {
                afterrender: function() {
                    this.filterResults();
                },
                single: true
            }
        });
    }
});