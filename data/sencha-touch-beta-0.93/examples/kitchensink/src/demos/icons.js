demos.Icons = new Ext.TabPanel({
    items: [{
        iconCls: 'bookmarks',
        title: 'Bookmarks',
        cls: 'card card3',
        html: 'Both toolbars and tabbars have built-in, ready to use icons. Styling custom icons is no hassle.<p><small>If you cant see all of the buttons below, try scrolling left/right.</small></p>'
    },
    {
        iconCls: 'download',
        title: 'Download'
    },
    {
        iconCls: 'favorites',
        title: 'Favorites'
    },
    {
        iconCls: 'info',
        title: 'Info'
    },
    {
        iconCls: 'more',
        title: 'More'
    }, 
    {
        iconCls: 'search',
        title: 'Search'
    },
    {
        iconCls: 'settings',
        title: 'Settings'
    },
    {
        iconCls: 'team',
        title: 'Team'
    },
    {
        iconCls: 'time',
        title: 'Time'
    },
    {
        iconCls: 'user',
        title: 'User'
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        ui: 'light',
        defaults: {
            ui: 'mask'
        },    
        scroll: {
            direction: 'horizontal',
            scrollbars: false
        },
        layout: {
            pack: 'center'
        },
        items: [{
            iconCls: 'action'
        },
        {
            iconCls: 'add'
        },
        {
            iconCls: 'attachment'
        },
        {
            iconCls: 'bookmarks'
        },
        {
            iconCls: 'bolt'
        },
        {
            iconCls: 'chat'
        },
        {
            iconCls: 'compose'
        },
        {
            iconCls: 'maps'
        },
        {
            iconCls: 'delete'
        },
        {
            iconCls: 'home'
        },
        {
            iconCls: 'locate'
        },
        {
            iconCls: 'organize'
        },
        {
            iconCls: 'refresh'
        },
        {
            iconCls: 'reply'
        },
        {
            iconCls: 'search'
        },
        {
            iconCls: 'tag'
        },
        {
            iconCls: 'trash'
        }]
    }],
    tabBar: {
        dock: 'bottom',
        scroll: {
            direction: 'horizontal',
            scrollbars: false
        },
        layout: {
            pack: 'center'
        }
    }
});
