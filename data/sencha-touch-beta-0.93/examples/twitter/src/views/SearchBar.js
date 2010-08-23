/**
 * @class twitter.SearchBar
 * @extends Ext.DataView
 * Displays a search field and list of saved searches
 */
twitter.SearchBar = Ext.extend(Ext.DataView, {
    cls: 'x-nested-list twitter-search-bar',
    width: 200,
    dock : 'left',
    
    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="x-button x-button-normal">',
                '<span>{query}</span>',
            '</div>',
        '</tpl>'
    ),
    
    itemSelector: 'div.x-button',
    singleSelect: true,
    
    constructor: function(config) {
        this.addEvents(
          /**
           * @event refresh
           * Fires when the user wishes to refresh the results
           */
          'refresh',
          
          /**
           * @event search
           * Fires when the user wishes to initiate a new search by clicking on one of the saved searches
           * or entering a new one
           * @param {String} query The search query
           */
          'search'
        );
        
        config = config || {};
        
        /**
         * @property searchField
         * @type Ext.form.SearchField
         * Allows a user to enter a search term
         */
        this.searchField = new Ext.form.SearchField({
            name: 'query',
            placeholder: "Search",
            style: 'width: 188px'
        });
        
        /**
         * @property refreshButton
         * @type Ext.Button
         * Fires the 'refresh' even
         */
        this.refreshButton = new Ext.Button({
            ui     : 'mask',
            iconCls: 'refresh',
            scope  : this,
            handler: function() {
                var records = this.getSelectedRecords(),
                    search  = records[0];
                
                if (search) {
                    this.fireEvent('search', search.get('query'));
                }
            }
        });
        
        /**
         * @property resetButton
         * @type Ext.Button
         * Clears the store of saved queries and adds the default queries back in
         */
        this.resetButton = new Ext.Button({
            ui     : 'mask',
            iconCls: 'trash',
            scope  : this,
            handler: this.reset
        });
        
        /**
         * @property searchForm
         * @type Ext.form.FormPanel
         * FormPanel used internally to capture the submit event on the search field
         */
        this.searchForm = new Ext.form.FormPanel({
            baseCls: 'x-form-nostyle',
            items: this.searchField,
            
            listeners: {
                scope: this,
                submit: this.onFormSubmit
            }
        });
        
        Ext.applyIf(config, {
            store: new Ext.data.Store({
                model: 'Search',
                proxy: {
                    type: 'localstorage',
                    id: 'twitter-searches'
                },
                autoLoad: {
                    scope: this,
                    callback: this.addDefaultSearches
                }
            }),
            dockedItems: [
                {
                    dock : 'top',
                    xtype: 'toolbar',
                    items: this.searchForm
                },
                {
                    dock: 'bottom',
                    xtype: 'toolbar',
                    items: [
                        this.refreshButton,
                        this.resetButton,
                        {xtype: 'spacer'},
                        {
                            // ui     : 'mask',
                            // iconCls: 'info'
                            text   : 'About',
                            xtype  : 'button',
                            handler: function() {
                                new twitter.About({}).show();
                            }
                        }
                    ]
                }
            ]
        });
        
        twitter.SearchBar.superclass.constructor.call(this, config);
        
        this.on('selectionchange', function(me, nodes) {
            var records = me.getSelectedRecords(),
                search  = records[0];
            
            if (search) {                
                me.fireEvent('search', search.get('query'));
            }
        });
    },
    
    /**
     * Removes all saved searches from the store
     */
    reset: function() {
        var store   = this.store,
            records = store.data.items,
            length  = records.length,
            i;
        
        for (var i = 0; i < length; i++) {
            store.remove(records[0]);
        }
        
        store.destroy({
            scope: this,
            callback: this.addDefaultSearches
        });
    },
    
    /**
     * @private
     * Checks the contents of the searches store and adds default searches if it is currently empty
     */
    addDefaultSearches: function() {
        var store = this.store;

        if (store.data.items.length == 0) {
            (function() {
                store.add({query: "Ext JS"});
                store.add({query: "Sencha Touch"});
                store.sync();
            
                this.fireEvent('search', "Ext JS");
                
                this.selectFirst();
            }).defer(100, this);
        } else {
            this.selectFirst();
        }
    },
    
    /**
     * @private
     * Selects the first record in the store and fires the search event
     */
    selectFirst: function() {
        var record = this.store.data.first();
        
        if (record) {
            this.select(record);
        }
    },
    
    /**
     * Attached to the FormPanel's element's submit event - cancels the event and fires our own
     */
    onFormSubmit: function(form, values) {
        var field = this.searchField,
            value = field.getValue(),
            store = this.store;
        
        var record = store.add({query: value})[0];
        store.sync();
        Ext.getBody().dom.focus();
        
        this.select(store.data.last());
    }
});

Ext.reg('searchbar', twitter.SearchBar);