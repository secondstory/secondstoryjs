Ext.regModel('Contact', {
    fields: ['firstName', 'lastName']
});

demos.ListStore = new Ext.data.Store({
    model: 'Contact',
    sorters: 'firstName',
    getGroupString : function(record) {
        return record.get('firstName')[0];
    },
    data: [
        {firstName: 'Julio', lastName: 'Benesh'},
        {firstName: 'Julio', lastName: 'Minich'},
        {firstName: 'Tania', lastName: 'Ricco'},
        {firstName: 'Odessa', lastName: 'Steuck'},
        {firstName: 'Nelson', lastName: 'Raber'},
        {firstName: 'Tyrone', lastName: 'Scannell'},
        {firstName: 'Allan', lastName: 'Disbrow'},
        {firstName: 'Cody', lastName: 'Herrell'},
        {firstName: 'Julio', lastName: 'Burgoyne'},
        {firstName: 'Jessie', lastName: 'Boedeker'},
        {firstName: 'Allan', lastName: 'Leyendecker'},
        {firstName: 'Javier', lastName: 'Lockley'},
        {firstName: 'Guy', lastName: 'Reasor'},
        {firstName: 'Jamie', lastName: 'Brummer'},
        {firstName: 'Jessie', lastName: 'Casa'},
        {firstName: 'Marcie', lastName: 'Ricca'},
        {firstName: 'Gay', lastName: 'Lamoureaux'},
        {firstName: 'Althea', lastName: 'Sturtz'},
        {firstName: 'Kenya', lastName: 'Morocco'},
        {firstName: 'Rae', lastName: 'Pasquariello'},
        {firstName: 'Ted', lastName: 'Abundis'},
        {firstName: 'Jessie', lastName: 'Schacherer'},
        {firstName: 'Jamie', lastName: 'Gleaves'},
        {firstName: 'Hillary', lastName: 'Spiva'},
        {firstName: 'Elinor', lastName: 'Rockefeller'},
        {firstName: 'Dona', lastName: 'Clauss'},
        {firstName: 'Ashlee', lastName: 'Kennerly'},
        {firstName: 'Alana', lastName: 'Wiersma'},
        {firstName: 'Kelly', lastName: 'Holdman'},
        {firstName: 'Mathew', lastName: 'Lofthouse'},
        {firstName: 'Dona', lastName: 'Tatman'},
        {firstName: 'Clayton', lastName: 'Clear'},
        {firstName: 'Rosalinda', lastName: 'Urman'},
        {firstName: 'Cody', lastName: 'Sayler'},
        {firstName: 'Odessa', lastName: 'Averitt'},
        {firstName: 'Ted', lastName: 'Poage'},
        {firstName: 'Penelope', lastName: 'Gayer'},
        {firstName: 'Katy', lastName: 'Bluford'},
        {firstName: 'Kelly', lastName: 'Mchargue'},
        {firstName: 'Kathrine', lastName: 'Gustavson'},
        {firstName: 'Kelly', lastName: 'Hartson'},
        {firstName: 'Carlene', lastName: 'Summitt'},
        {firstName: 'Kathrine', lastName: 'Vrabel'},
        {firstName: 'Roxie', lastName: 'Mcconn'},
        {firstName: 'Margery', lastName: 'Pullman'},
        {firstName: 'Avis', lastName: 'Bueche'},
        {firstName: 'Esmeralda', lastName: 'Katzer'},
        {firstName: 'Tania', lastName: 'Belmonte'},
        {firstName: 'Malinda', lastName: 'Kwak'},
        {firstName: 'Tanisha', lastName: 'Jobin'},
        {firstName: 'Kelly', lastName: 'Dziedzic'},
        {firstName: 'Darren', lastName: 'Devalle'},
        {firstName: 'Julio', lastName: 'Buchannon'},
        {firstName: 'Darren', lastName: 'Schreier'},
        {firstName: 'Jamie', lastName: 'Pollman'},
        {firstName: 'Karina', lastName: 'Pompey'},
        {firstName: 'Hugh', lastName: 'Snover'},
        {firstName: 'Zebra', lastName: 'Evilias'}
    ]
});


demos.List = new Ext.Panel({
    layout: Ext.platform.isPhone ? 'fit' : {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },
    cls: 'demo-list',
    items: [{
        width: 300,
        height: 500,
        xtype: 'list',
        disclosure: {
            scope: demos.ListStore,
            handler: function(record, btn, index) {
                alert('Disclose more info for ' + record.get('firstName'));
            }
        },
        store: demos.ListStore,
        tpl: '<tpl for="."><div class="contact"><strong>{firstName}</strong> {lastName}</div></tpl>',
        itemSelector: 'div.contact',
        singleSelect: true,
        grouped: true,
        indexBar: true
    }]
});