Geo.views.LegislatorList = Ext.extend(Ext.List, {
    itemSelector: '.legislator-list-item',
    singleSelect: true,
    initComponent: function() {
        this.store = Geo.stores.Legislators;
        this.tpl = Ext.XTemplate.from('legislator-list');
        Geo.views.LegislatorList.superclass.initComponent.call(this);
    }
});