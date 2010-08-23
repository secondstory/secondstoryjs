Geo.views.LegislatorBio = Ext.extend(Ext.Panel, {
    cls: 'bio',
    scroll: 'vertical',
    
    initComponent: function() {
        this.basic = new Ext.Panel({
            styleHtmlContent: true,
            height: 70,
            tpl: Ext.XTemplate.from('legislatorbrief', {
                calcAge: function(value) {
                    var dateParts = value.split('-'),
                        date = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2]);
                    return Math.floor((new Date() - date) / 1000 / 60 / 60 / 24 / 365);
                },
                
                ordinal: function(value) {
                    if (isNaN(parseInt(value, 10))) {
                        return value;
                    }
                    var endings = ['th', 'st', 'nd', 'rd'],
                        digit = value % 10;
                        
                    if (value == 0) {
                        return 'At-large District';
                    } 
                    else if (digit > 3 || (value > 10 && value < 20)) {
                        return value + 'th District';
                    } 
                    else {
                        return value + endings[digit] + ' District';
                    }
                }
            })
        });
        this.contact = new Ext.Panel({
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                title: 'Contact Info'
            }],
            height: 100,
            styleHtmlContent: true,
            tpl: Ext.XTemplate.from('contact', {
                notAvailable: function(value) {
                    return value ? value : 'Not Available';
                },
                siteNotAvailable: function(value) {
                    return value ? '<a class="goOutside" href="' + value + '">' + value + '</a>' : 'Not Available';
                }
            })
        });
        
        this.committees = new Ext.List({
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                title: 'Committee Assignments'
            }],
            scroll: false,
            emptyText: 'No Committee Assignments',
            tpl: Ext.XTemplate.from('committees'),
            store: Geo.stores.Committees,
            itemSelector: '.committees'
        });
        
        this.items = [this.basic, this.contact, this.committees];
        Geo.views.LegislatorBio.superclass.initComponent.call(this);
        
        this.committees.on('itemtap', this.onCommitteeTap, this);
    },
    
    onCommitteeTap: function(dv, idx) {
        var ds = dv.getStore(),
            r = ds.getAt(idx);
        Geo.Util.openUrl('http://www.govtrack.us/congress/committee.xpd?id=' + r.get('id'));
    },
    
    update: function(data) {
        var committees = Geo.cache.Committees[data.govtrack_id];
        
        this.data = data;
        this.contact.update(data);
        this.basic.update(data);
        
        if (!committees) {
            this.committees.update("Loading...");
            Geo.CongressService.getCommitteesForLegislator(data.bioguide_id, this.onCommitteesUpdate, this);        
        } 
        else {
            Geo.stores.Committees.loadData(committees);
        }
    },
    
    onCommitteesUpdate: function(committees) {
        Geo.cache.Committees[this.data.govtrack_id] = committees;
        Geo.stores.Committees.loadData(committees);
    }
});