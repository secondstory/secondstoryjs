Ext.setup({
    icon: 'icon.png',
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    glossOnIcon: false,
    onReady: function() {
        var tabpanel = new Ext.TabPanel({
            fullscreen: true,
            // type: 'light',
            tabBar: {
                dock: 'bottom',
                scroll: 'horizontal',
                sortable: true,
                layout: {
                    pack: 'center'
                }
            },
            cls: 'card1',
            html: 'Both toolbars and tabbars have built-in, ready to use icons. Styling custom icons is no hassle.<p><small>If you cant see all of the buttons below, try scrolling left/right.</small></p>',
            items: [
                { iconCls: 'bookmarks', title: 'Bookmarks' },
                { iconCls: 'download', title: 'Download' },
                { iconCls: 'favorites', title: 'Favorites' },
                { iconCls: 'info', title: 'Info' },
                { iconCls: 'more', title: 'More' },
                { iconCls: 'search', title: 'Search' },
                { iconCls: 'settings', title: 'Settings' },
                { iconCls: 'team', title: 'Team' },
                { iconCls: 'time', title: 'Time' },
                { iconCls: 'user', title: 'User' }
            ],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                defaults: {
                    ui: 'mask'
                },
                scroll: 'horizontal',
                layout: {
                    pack: 'center'
                },
                items: [
                    { iconCls: 'action' },
                    { iconCls: 'add' },
                    { iconCls: 'attachment' },
                    { iconCls: 'bookmarks' },
                    { iconCls: 'bolt' },
                    { iconCls: 'chat' },
                    { iconCls: 'compose' },
                    { iconCls: 'delete' },
                    { iconCls: 'home' },
                    { iconCls: 'locate' },
                    { iconCls: 'maps' },
                    { iconCls: 'organize' },
                    { iconCls: 'refresh' },
                    { iconCls: 'reply' },
                    { iconCls: 'search' },
                    { iconCls: 'tag' },
                    { iconCls: 'trash' }
                ]
            }]
        });
    }
});