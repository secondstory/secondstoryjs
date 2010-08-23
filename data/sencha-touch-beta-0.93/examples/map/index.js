Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: function() {
        var toolbar = new Ext.Toolbar({
            dock: 'top',
            xtype: 'toolbar',
            title: 'Map'
        });
        
        var position = new google.maps.LatLng(37.44885,-122.158592);
        
        var mapdemo = new Ext.Map({
            center: position
        });
        
        new Ext.Panel({
            fullscreen: true,
            dockedItems: [toolbar],
            items: [mapdemo]
        });
        
        // The following is accomplished with the Google Map API
        
        var infowindow = new google.maps.InfoWindow({
            content: 'Ext JS'
        })
        
        var marker = new google.maps.Marker({
             position: position,
             map: mapdemo.map
        });
        
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(mapdemo.map, marker);
        });
    }
});