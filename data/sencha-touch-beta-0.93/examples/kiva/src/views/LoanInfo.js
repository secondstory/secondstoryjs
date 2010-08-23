kiva.ui.LoanInfo = Ext.extend(Ext.Panel, {
    floating: true,
    width: 320,
    height: 540,
    data: null,
    cls: 'loaninfo',
    layout: 'fit',
    
    initComponent : function() {        
        var cardItems = [];
        
        // Basic info card
        this.basicCard = new Ext.Component({
            tpl: new Ext.XTemplate.from('loaninfo-basic', {compiled: true}),
            scroll: 'vertical',
            styleHtmlContent: true,
            html: ''
        });
        cardItems.push(this.basicCard);

        // Repayment schedule card
        if (this.record.data.terms.scheduled_payments) {
            this.paymentsCard = new Ext.Component({
                scroll: 'vertical',
                styleHtmlContent: true,
                tpl: new Ext.XTemplate.from('loaninfo-payment', {compiled: true}),
                html: ''
            });
            cardItems.push(this.paymentsCard);
        }
        
        // Map card
        var geo = this.record.data.location.geo.pairs.split(' ');
        this.mapPosition = new google.maps.LatLng(geo[0], geo[1]);                        
        this.mapCard = new Ext.Map({
            mapOptions: {
                center: this.mapPosition,
                disableDefaultUI: true,
                zoom: 5,
            },
            maskMap: true,
            listeners: {
                activate: function(){
                    new google.maps.Marker({ map: this.mapCard.map, position: this.mapPosition });
                },
                scope: this
            }
        });

        cardItems.push(this.mapCard);
        
        this.carousel = new Ext.Carousel({
            items: cardItems
        });
        
        this.items = [this.carousel];
        this.dockedItems = {
            xtype: 'button',
            text: '<a href="http://www.kiva.org/lend/' + this.record.data.id + '" target="_blank">Lend $25</a>',
            ui: 'action',
            dock: 'bottom'
        };
        
        kiva.ui.LoanInfo.superclass.initComponent.call(this);
        
        // Ugly hack
        var me = this;
        setTimeout(function(){
            me.updateCards();
        }, 10);
    },
    
    onFieldChange : function() {
        this.fireEvent('change', this, this.getValues());
    },

    updateCards : function() {
        this.basicCard.update(this.record.data);       
        this.paymentsCard.update(this.record.data.terms.scheduled_payments);
    }
});

Ext.reg('kiva-loaninfo', kiva.ui.LoanInfo);