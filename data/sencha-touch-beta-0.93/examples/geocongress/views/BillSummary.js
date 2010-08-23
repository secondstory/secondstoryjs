Geo.views.BillSummary = Ext.extend(Ext.Panel, {
    scroll: true,
    html: "Loading...",
    styleHtmlContent: true,
    initComponent: function() {                
        this.tpl = Ext.XTemplate.from('billsummary');
        Geo.views.BillSummary.superclass.initComponent.call(this);
    },
    
    getBill: function(bill) {        
        Geo.CongressService.getBillSummary({
            bill: bill
        }, this.onBillSummaryResponse, this);
    },
    
    onBillSummaryResponse: function(billSummary) {
        if (Ext.isArray(billSummary.Paragraph)) {
            this.update(billSummary);
        } else {
            this.update('No Bill Summary Available');
        }
        
    }
});