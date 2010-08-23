Ext.ns('twitter');

Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: function() {
        var searchBar = new twitter.SearchBar();
            timeline  = new twitter.TimeLine();

        var viewport = new Ext.Panel({
            fullscreen : true,
            scroll     : 'vertical',
            dockedItems: [searchBar],
            items      : [timeline],
            cls        : 'twitter-main'
        });

        searchBar.on({
            search: function(query) {
                if (query) {
                    timeline.store.read({
                        params: {
                            q: query
                        }
                    });

                    viewport.scroller.scrollTo({x: 0, y: 0});
                }
            }
        });
    }
});