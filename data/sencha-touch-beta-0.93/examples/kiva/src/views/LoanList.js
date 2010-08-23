kiva.ui.LoanList = Ext.extend(Ext.List, {
    title: 'Loans',
    
    itemSelector: 'div.loan',
    singleSelect: true,
    emptyText: 'No loans matching that query.',
    
    ui: 'kiva',
    
    isLoaded: false,
    
    queries: {
        search: new Ext.XTemplate('use "http://github.com/extjs/YQL-Tables/raw/master/kiva/loanSearch.xml" as loansearch; use "http://github.com/extjs/YQL-Tables/raw/master/kiva/loanInfo.xml" as loaninfo; select * from loaninfo where ids IN (select id from loansearch where status="fundraising"<tpl if="sort_by"> AND sort_by="{sort_by}"</tpl><tpl if="gender"> AND gender="{gender}"</tpl><tpl if="region"> AND region="{region}"</tpl><tpl if="sector"> AND sector="{sector}"</tpl><tpl if="q"> AND q="{q}"</tpl>)', {compiled: true})
    },
    
    initComponent : function() {
        this.filterBar = new kiva.ui.FilterBar({
            dock: 'top',
            id: 'filters',
            listeners: {
                change: this.filterResults,
                scope: this
            }
        });
        
        this.dockedItems = [this.filterBar];
        
        Ext.regModel('Loan', {
            fields: ['activity','basket_amount','borrower_count','id', 'image', 'loan_amount', 'location', 'partner_id', 'status', 'loan_amount', 'sort_by', 'sector']
        });
        this.store = new Ext.data.Store({model: 'Loan'});
        
        this.tpl = new Ext.XTemplate.from('loan', {compiled: true});
        
        this.on('selectionchange', function(e, row, rowdata) {
            if (this.dataPopup) {
                this.dataPopup.destroy();
            }
            
            this.dataPopup = new kiva.ui.LoanInfo({
                record: rowdata[0],
                listeners: {
                    hide: function(){
                        this.clearSelections(true);
                    },
                    scope: this
                }
            });
            this.dataPopup.show();
        });
        
        kiva.ui.LoanList.superclass.initComponent.call(this);
    },
    
    filterResults : function(filterBar, values) {
        var data = Ext.applyIf(values || {}, {
            gender: null,
            region: null,
            sector: null,
            sort_by: null,
            q: null
        });

        if (data.q) {
            // reset filters
        }
        
        setTimeout(function(){
            if (!this.isLoaded) {
                Ext.getBody().mask(false, '<div class="loading">Loading&hellip;</div>');
            }
        }, 1);
        
        this.isLoaded = false;
        
        Ext.YQL.request({
            query: this.queries.search.applyTemplate(data),
            scope: this,
            callback: function(response) {
                Ext.getBody().unmask();
                this.isLoaded = true;
                
                this.update('');
                
                var row, i, ln;
                if (response && response.query && response.query.results) {   
                    for (i = 0, ln = response.query.results.loans.length; i < ln; i++) {
                        row = response.query.results.loans[i];
                        row.percentfunded = Math.round(row.funded_amount/row.terms.loan_amount * 100);
                        
                        // var timeLeft = Date.parseDate(loaninfo.due_date, 'c') - new Date()/(1000*60*60*24);
                        
                        var payments = row.terms.scheduled_payments;
                        if (!Ext.isArray(payments)) payments = [payments];
                        var count = payments.length;
                        for (var j = count-1; j >= 0; j--){
                            var p = payments[j];
                            p.formatted_due_date = Date.parseDate(p.due_date, 'c');
                        };
                        
                        // console.log(row);
                    }
                    
                    
                    this.store.loadData(response.query.results.loans);
                    this.scroller.scrollTo({x: 0, y: 0}, true);
                }
            }
        });
    }
});

Ext.reg('kiva-loanlist', kiva.ui.LoanList);