Geo.views.StartScreen = Ext.extend(Ext.Panel, {
    cls: 'start-screen',
    layout: 'card',
    activeItem: 0,
    titleTpl: new Ext.Template('<strong>{state}</strong> District {number}'),
    initComponent: function() {        
        this.settingsIcon = new Ext.Button({
            iconCls: 'settings',
            handler: this.onSettingsTap,
            disabled: true
        });
        this.refreshIcon = new Ext.Button({
            iconCls: 'refresh',
            handler: this.onRefreshTap,
            disabled: true
        });
        
        this.toolbar = new Ext.Toolbar({
            title: 'Finding location...',
            dock: 'top',
            layout: {
                pack: 'end'
            },
            defaults: {
                scope: this,
                ui: 'mask'
            },
            items: [this.settingsIcon,{flex: 1},this.refreshIcon]
        });
        this.dockedItems = [this.toolbar];
        this.list = new Geo.views.LegislatorList({
            scroll: false
        });
        
        this.main = new Ext.Container({
            scroll: true,
            items: [this.list, {
                height: 40,
                cls: 'attribution',
                html: 'Data provided by GovTrack.us and Sunlight Labs.'
            }]
        });
        
        this.form = new Geo.views.DistrictInfo();
        this.items = [this.main, this.form];
        Geo.views.StartScreen.superclass.initComponent.call(this);
        this.form.on('lookupDistrict', this.onFormLookup, this);
        this.list.on('itemtap', this.onListItemTap, this);
        
        this.geo = new Ext.util.GeoLocation();
        this.geo.on('beforeupdate', this.onBeforeGeoUpdate, this);
        this.geo.on('update', this.onGeoUpdate, this);
    },
    
    onListItemTap: function(dv, index, item, e) {
        var ds = dv.getStore(),
            r = ds.getAt(index);
        this.fireEvent('legislatorselect', r.get('govtrack_id'));
    },
    
   onFormLookup: function(district) {
        this.updateDistrict(district);
        this.setCard(0, Ext.platform.isAndroidOS ? false : 'flip');
    },
    
    onRefreshTap: function() {
        this.geo.updateLocation();
        this.settingsIcon.setDisabled(true);
        this.refreshIcon.setDisabled(true);
    },
    
    updateDistrict: function(district) {
        this.district = district;
        this.form.updateDistrict(district);
        var title = this.titleTpl.applyTemplate(district);
        this.toolbar.setTitle(title);
        this.settingsIcon.setDisabled(false);
        this.refreshIcon.setDisabled(false);

        Geo.CongressService.getLegislatorsByDistrict(district, this.loadLegislatorStore, this);
    },
    
    onGeoUpdate: function(coords) {
        Geo.CongressService.getDistrictFromCoords(coords, this.updateDistrict, this);
    },
    
    onBeforeGeoUpdate: function(){
        this.toolbar.setTitle('Finding location...');
        this.refreshIcon.setDisabled(true);
    },
    
    loadLegislatorStore: function(legislators) {
        Geo.stores.Legislators.loadData(legislators);
        // needed to paint the initial list on iPad.
        Ext.repaint();
    },
    
    onSettingsTap: function() {        
        this.setCard(1, Ext.platform.isAndroidOS ? false : 'flip');
    }
});