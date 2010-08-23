/**
 * @class Ext.data.Store
 * @extends Ext.util.Observable
 * 
 * <p>The Store class encapsulates a client side cache of {@link Ext.data.Model Model} objects. Stores load
 * data via a {@link Ext.data.Proxy Proxy}, and also provide functions for {@link #sort sorting}, 
 * {@link #filter filtering} and querying the {@link Ext.data.Model model} instances contained within it.</p>
 * <p>Creating a Store is easy - we just tell it the Model and the Proxy to use to load and save its data:</p>
<pre><code>
// Set up a {@link Ext.data.Model model} to use in our Store
Ext.regModel('User', {
    fields: [
        {name: 'firstName', type: 'string'},
        {name: 'lastName',  type: 'string'}
    ]
});

var myStore = new Ext.data.Store({
    model: 'User',
    proxy: {
        type: 'ajax',
        url : '/users.json',
        reader: {
            type: 'json',
            root: 'users'
        }
    },
    autoLoad: true
});
</code></pre>
 * <p>In the example above we configured an AJAX proxy to load data from the url '/users.json'. We told our Proxy
 * to use a {@link Ext.data.JsonReader JsonReader} to parse the response from the server into Model object - 
 * {@link Ext.data.JsonReader see the docs on JsonReader} for details.</p>
 * <p><u>Inline data</u></p>
 * <p>Stores can also load data inline. Internally, Store converts each of the objects we pass in as {@link #data} 
 * into Model instances:</p>
<pre><code>
new Ext.data.Store({
    model: 'User',
    data : [
        {firstName: 'Ed',    lastName: 'Spencer'},
        {firstName: 'Tommy', lastName: 'Maintz'},
        {firstName: 'Aaron', lastName: 'Conran'},
        {firstName: 'Jamie', lastName: 'Avins'}
    ]
});
</code></pre>
 * <p>Additional data can also be loaded locally using {@link #loadData}.</p>
 * <p><u>Further Reading</u></p>
 * <p>Stores are backed up by an ecosystem of classes that enables their operation. To gain a full understanding of these
 * pieces and how they fit together, see:</p>
 * <ul style="list-style-type: disc; padding-left: 25px">
 * <li>{@link Ext.data.Proxy Proxy} - overview of what Proxies are and how they are used</li>
 * <li>{@link Ext.data.Model Model} - the core class in the data package</li>
 * <li>{@link Ext.data.Reader Reader} - used by any subclass of {@link Ext.data.ServerProxy ServerProxy} to read a response</li>
 * </ul>
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Store = Ext.extend(Ext.util.Observable, {
    remoteSort  : false,
    remoteFilter: false,
    
    /**
     * @cfg {String/Ext.data.Proxy/Object} proxy The Proxy to use for this Store. This can be either a string, a config
     * object or a Proxy instance - see {@link #setProxy} for details.
     */
    
    /**
     * @cfg {Array} data Optional array of Model instances or data objects to load locally. See "Inline data" above for details.
     */
    
    /**
     * @cfg {Boolean/Object} autoLoad If data is not specified, and if autoLoad is true or an Object, this store's load method 
     * is automatically called after creation. If the value of autoLoad is an Object, this Object will be passed to the store's 
     * load method. Defaults to false.
     */
    autoLoad: false,
    
    /**
     * @cfg {Boolean} autoSave True to automatically sync the Store with its Proxy after every edit to one of its Records.
     * Defaults to false.
     */
    autoSave: false,
    
    /**
     * The (optional) field by which to group data in the store. Internally, grouping is very similar to sorting - the
     * groupField and {@link #groupDir} are injected as the first sorter (see {@link #sort}). Stores support a single 
     * level of grouping, and groups can be fetched via the {@link #getGroups} method.
     * @property groupField
     * @type String
     */
    groupField: undefined,
    
    /**
     * The direction in which sorting should be applied when grouping. Defaults to "ASC" - the other supported value is "DESC"
     * @property groupDir
     * @type String
     */
    groupDir: "ASC",
    
    /**
     * The number of records considered to form a 'page'. This is used to power the built-in
     * paging using the nextPage and previousPage functions. Defaults to 25.
     * @property pageSize
     * @type Number
     */
    pageSize: 25,
    
    /**
     * Sets the updating behavior based on batch synchronization. 'operation' (the default) will update the Store's
     * internal representation of the data after each operation of the batch has completed, 'complete' will wait until
     * the entire batch has been completed before updating the Store's data. 'complete' is a good choice for local
     * storage proxies, 'operation' is better for remote proxies, where there is a comparatively high latency.
     * @property batchUpdateMode
     * @type String
     */
    batchUpdateMode: 'operation',
    
    /**
     * If true, any filters attached to this Store will be run after loading data, before the datachanged event is fired.
     * Defaults to true.
     * @property filterOnLoad
     * @type Boolean
     */
    filterOnLoad: true,
    
    /**
     * If true, any sorters attached to this Store will be run after loading data, before the datachanged event is fired.
     * Defaults to true.
     * @property sortOnLoad
     * @type Boolean
     */
    sortOnLoad: true,
    
    /**
     * The number of the page of data currently loaded
     * @property currentPage
     * @type Number
     */
    currentPage: 1,
    
    /**
     * True if a model was created implicitly for this Store. This happens if a fields array is passed to the Store's constructor
     * instead of a model constructor or name.
     * @property implicitModel
     * @type Boolean
     * @private
     */
    implicitModel: true,
    
    /**
     * The string type of the Proxy to create if none is specified. This defaults to creating a {@link Ext.data.MemoryProxy memory proxy}.
     * @property defaultProxyType
     * @type String
     */
    defaultProxyType: 'memory',
    
    //documented above
    constructor: function(config) {
        this.addEvents(
            /**
             * @event add
             * Fired when a Model instance has been added to this Store
             * @param {Ext.data.Store} store The store
             * @param {Array} records The Model instances that were added
             * @param {Number} index The index at which the instances were inserted
             */
            'add',
            
            /**
             * @event remove
             * Fired when a Model instance has been removed from this Store
             * @param {Ext.data.Model} record The record that was removed
             */
            'remove',
            
            /**
             * @event update
             * Fires when a Record has been updated
             * @param {Store} this
             * @param {Ext.data.Model} record The Model instance that was updated
             * @param {String} operation The update operation being performed. Value may be one of:
             * <pre><code>
               Ext.data.Model.EDIT
               Ext.data.Model.REJECT
               Ext.data.Model.COMMIT
             * </code></pre>
             */
            'update',
            
            /**
             * @event datachanged
             * Fires whenever the records in the Store have changed in some way - this could include adding or removing records,
             * or updating the data in existing records
             * @param {Ext.data.Store} this The data store
             */
            'datachanged'
        );
        
        /**
         * Temporary cache in which removed model instances are kept until successfully synchronised with a Proxy,
         * at which point this is cleared.
         * @private
         * @property removed
         * @type Array
         */
        this.removed = [];
        
        /**
         * Stores the current sort direction ('ASC' or 'DESC') for each field. Used internally to manage the toggling
         * of sort direction per field. Read only
         * @property sortToggle
         * @type Object
         */
        this.sortToggle = {};
        
        /**
         * The MixedCollection that holds this store's local cache of records
         * @property data
         * @type Ext.util.MixedCollection
         */
        this.data = new Ext.util.MixedCollection(false, function(record) {
            return record.id;
        });
        
        if (config.data) {
            this.inlineData = config.data;
            delete config.data;
        }
        
        Ext.data.Store.superclass.constructor.apply(this, arguments);
        
        this.model = Ext.ModelMgr.getModel(config.model);
        
        //Supports the 3.x style of simply passing an array of fields to the store, implicitly creating a model
        if (!this.model && config.fields) {
            this.model = Ext.regModel('ImplicitModel-' + this.storeId || Ext.id(), {
                fields: config.fields
            });
            
            delete this.fields;
            
            this.implicitModel = true;
        }
        
        //ensures that the Proxy is instantiated correctly
        this.setProxy(config.proxy);
        
        if (this.inlineData) {
            this.loadData(this.inlineData);
            delete this.inlineData;
        } else if (this.autoLoad) {
            this.load.defer(10, this, [typeof this.autoLoad == 'object' ? this.autoLoad : undefined]);
        }
        
        if (this.id) {
            this.storeId = this.id;
            delete this.id;
            
            Ext.StoreMgr.register(this);
        }
    },
    
    /**
     * Sets the Store's Proxy by string, config object or Proxy instance
     * @param {String|Object|Ext.data.Proxy} proxy The new Proxy, which can be either a type string, a configuration object
     * or an Ext.data.Proxy instance
     * @return {Ext.data.Proxy} The attached Proxy object
     */
    setProxy: function(proxy) {
        if (proxy == undefined || typeof proxy == 'string') {
            proxy = {
                type: proxy
            };
        }

        if (!(proxy instanceof Ext.data.Proxy)) {
            Ext.applyIf(proxy, {
                type : this.defaultProxyType,
                model: this.model
            });

            this.proxy = Ext.data.ProxyMgr.create(proxy);
        }else{
            this.proxy.setModel(this.model);
        }
        return this.proxy;
    },

    /**
     * Returns the proxy currently attached to this proxy instance
     * @return {Ext.data.Proxy} The Proxy instance
     */
    getProxy: function() {
        return this.proxy;
    },
    
    /**
     * Returns an object containing the result of applying grouping to the records in this store. See {@link #groupField}, 
     * {@link #groupDir} and {@link #getGroupString}. Example for a store containing records with a color field:
<pre><code>
var myStore = new Ext.data.Store({
    groupField: 'color',
    groupDir  : 'DESC'
});

myStore.getGroups(); //returns:
[
    {
        name: 'yellow',
        children: [
            //all records where the color field is 'yellow'
        ]
    },
    {
        name: 'red',
        children: [
            //all records where the color field is 'red'
        ]
    }
]
</code></pre>
     * @return {Array} The grouped data
     */
    getGroups: function() {
        var records  = this.data.items,
            length   = records.length,
            groups   = [],
            pointers = {},
            record, groupStr, group, i;
        
        for (i = 0; i < length; i++) {
            record = records[i];
            groupStr = this.getGroupString(record);
            group = pointers[groupStr];
            
            if (group == undefined) {
                group = {
                    name: groupStr,
                    children: []
                };
                
                groups.push(group);
                pointers[groupStr] = group;
            }
            
            group.children.push(record);
        }
        
        return groups;
    },
    
    /**
     * Returns the string to group on for a given model instance. The default implementation of this method returns the model's
     * {@link #groupField}, but this can be overridden to group by an arbitrary string. For example, to group by the first letter
     * of a model's 'name' field, use the following code:
<pre><code>
new Ext.data.Store({
    groupDir: 'ASC',
    getGroupString: function(instance) {
        return instance.get('name')[0];
    }
});
</code></pre>
     * @param {Ext.data.Model} instance The model instance
     * @return {String} The string to compare when forming groups
     */
    getGroupString: function(instance) {
        return instance.get(this.groupField);
    },
    
    /**
     * Inserts Model instances into the Store at the given index and fires the {@link #add} event.
     * See also <code>{@link #add}</code> and <code>{@link #addSorted}</code>.
     * @param {Number} index The start index at which to insert the passed Records.
     * @param {Ext.data.Model[]} records An Array of Ext.data.Model objects to add to the cache.
     */
    insert : function(index, records) {
        records = [].concat(records);
        for (var i = 0, len = records.length; i < len; i++) {
            this.data.insert(index, records[i]);
            records[i].join(this);
        }
        if (this.snapshot) {
            this.snapshot.addAll(records);
        }
        this.fireEvent('add', this, records, index);
    },
    
    /**
     * Adds Model instances to the Store by instantiating them based on a JavaScript object. When adding already-
     * instantiated Models, use {@link #insert} instead. The instances will be added at the end of the existing collection.
     * Sample usage:
<pre><code>
myStore.add({some: 'data'}, {some: 'other data'});
</code></pre>
     * @param {Object} data The data for each model
     * @return {Array} The array of newly created model instances
     */
    add: function() {
        var records = Array.prototype.slice.apply(arguments),
            length  = records.length,
            i;
        
        for (i = 0; i < length; i++) {
            if (!(records[i] instanceof Ext.data.Model)) {
                records[i] = Ext.ModelMgr.create(records[i], this.model);
            }
        }
        
        this.insert(this.data.length, records);
        
        return records;
    },
    
    //saves any phantom records
    create: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'create',
            records: this.getNewRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.create(operation, this.onProxyWrite, this);
    },

    /**
     * Calls the specified function for each of the {@link Ext.data.Record Records} in the cache.
     * @param {Function} fn The function to call. The {@link Ext.data.Record Record} is passed as the first parameter.
     * Returning <tt>false</tt> aborts and exits the iteration.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed.
     * Defaults to the current {@link Ext.data.Record Record} in the iteration.
     */
    each : function(fn, scope){
        this.data.each(fn, scope);
    },

    /**
     * Removes the given record from the Store, firing the 'remove' event for each instance that is removed, plus a single
     * 'datachanged' event after removal.
     * @param {Ext.data.Model/Array} records The Ext.data.Model instance or array of instances to remove
     */
    remove: function(records) {
        if (!Ext.isArray(records)) {
            records = [records];
        }
        
        var length = records.length,
            i, index, record;
        
        for (i = 0; i < length; i++) {
            record = records[i];
            
            this.removed.push(record);

            index = this.data.indexOf(record);

            if (this.snapshot) {
                this.snapshot.remove(record);
            }

            if (index > -1) {
                record.unjoin(this);
                this.data.removeAt(index);

                this.fireEvent('remove', this, record, index);
            }
        }
        
        this.fireEvent('datachanged', this);
    },
    
    /**
     * Removes the model instance at the given index
     * @param {Number} index The record index
     */
    removeAt: function(index) {
        var record = this.getAt(index);
        
        if (record) {
            this.remove(record);
        }
    },
    
    //tells the attached proxy to destroy the given records
    destroy: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'destroy',
            records: this.getRemovedRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.destroy(operation, this.onProxyWrite, this);
    },
    
    update: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'update',
            records: this.getUpdatedRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.update(operation, this.onProxyWrite, this);
    },
    
    read: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'read',
            filters: this.filters,
            sorters: this.sorters,
            group  : {field: this.groupField, direction: this.groupDir},
            start  : 0,
            limit  : this.pageSize,
            
            addRecords: false
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.read(operation, this.onProxyRead, this);
    },
    
    
    onProxyRead: function(operation) {
        var records = operation.getRecords();
        this.loadRecords(records, operation.addRecords);
        
        //this is a callback that would have been passed to the 'read' function and is optional
        var callback = operation.callback;
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },
    
    onProxyWrite: function(operation) {
        var data    = this.data,
            action  = operation.action,
            records = operation.getRecords(),
            length  = records.length,
            record, i;
        
        if (action == 'create' || action == 'update') {
            for (i = 0; i < length; i++) {
                record = records[i];
                
                record.phantom = false;
                record.join(this);
                data.replace(record);
            }
        }
        
        else if (action == 'destroy') {
            for (i = 0; i < length; i++) {
                record = records[i];
                
                record.unjoin(this);
                data.remove(record);
            }
            
            this.removed = [];
        }
        
        this.fireEvent('datachanged');
        
        //this is a callback that would have been passed to the 'create', 'update' or 'destroy' function and is optional
        var callback = operation.callback;
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },
    
    onBatchOperationComplete: function(batch, operation) {
        
    },
    
    /**
     * @private
     * Attached as the 'complete' event listener to a proxy's Batch object. Iterates over the batch operations
     * and updates the Store's internal data MixedCollection.
     */
    onBatchComplete: function(batch, operation) {
        var operations = batch.operations,
            length = operations.length,
            i;
        
        this.suspendEvents();
        
        for (i = 0; i < length; i++) {
            this.onProxyWrite(operations[i]);
        }
        
        this.resumeEvents();
        
        this.fireEvent('datachanged', this);
    },
    
    onBatchException: function(batch, operation) {
        // //decide what to do... could continue with the next operation
        // batch.start();
        // 
        // //or retry the last operation
        // batch.retry();
    },
    
    
    //returns any records that have not yet been realized
    getNewRecords: function() {
        return this.data.filterBy(this.filterNew).items;
    },
    
    /**
     * @private
     * Filter function for new records.
     */
    filterNew: function(item){
        return item.phantom == true;
    },
    
    //returns any records that have been updated in the store but not yet updated on the proxy
    getUpdatedRecords: function() {
        return this.data.filterBy(this.filterDirty).items;
    },
    
    /**
     * @private
     * Filter function for dirty records.
     */
    filterDirty: function(item){
        return item.dirty == true;    
    },
    
    //returns any records that have been removed from the store but not yet destroyed on the proxy
    getRemovedRecords: function() {
        return this.removed;
    },
    
    /**
     * The default sort direction to use if one is not specified (defaults to "ASC")
     * @property defaultSortDirection
     * @type String
     */
    defaultSortDirection: "ASC",
    
    /**
     * Sorts the data in the Store by one or more of its properties. Example usage:
<pre><code>
//sort by a single field
myStore.sort('myField', 'DESC');

//sorting by multiple fields
myStore.sort([
    {
        field    : 'age',
        direction: 'ASC'
    },
    {
        field    : 'name',
        direction: 'DESC'
    }
]);
</code></pre>
     * @param {String|Array} sorters Either a string name of one of the fields in this Store's configured {@link Ext.data.Model Model},
     * or an Array of sorter configurations.
     * @param {String} direction The overall direction to sort the data by. Defaults to "ASC".
     * @param {Boolean} suppressEvent If true, the 'datachanged' event is not fired. Defaults to false
     */
    sort: function(sorters, direction, suppressEvent) {
        sorters = sorters || this.sorters;
        direction = (this.sortToggle[name] || this.defaultSortDirection).toggle('ASC', 'DESC');
        
        this.sortToggle[name] = direction;
        
        //first we need to normalize the arguments. This is to support the previous 2-argument
        //single sort function signature
        if (typeof sorters == 'string') {
            sorters = [{
                field    : sorters,
                direction: direction
            }];
        }
        
        this.sortInfo = {
            sorters: sorters,
            direction: direction
        };
        
        if (this.remoteSort) {
            //the read function will pick up the new sorters and request the sorted data from the proxy
            this.read();
        } else {
            if (sorters == undefined || sorters.length == 0) {
                return;
            }
            
            var sortFns = [],
                length  = sorters.length,
                i;
            
            //create a sorter function for each sorter field/direction combo
            for (i = 0; i < length; i++) {
                sortFns.push(this.createSortFunction(sorters[i].field, sorters[i].direction));
            }

            //the direction modifier is multiplied with the result of the sorting functions to provide overall sort direction
            //(as opposed to direction per field)
            var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

            //create a function which ORs each sorter together to enable multi-sort
            var fn = function(r1, r2) {
                var result = sortFns[0].call(this, r1, r2);
               
                //if we have more than one sorter, OR any additional sorter functions together
                if (sortFns.length > 1) {
                    for (var i=1, j = sortFns.length; i < j; i++) {
                        result = result || sortFns[i].call(this, r1, r2);
                    }
                }
               
                return directionModifier * result;
            };

            //sort the data
            this.data.sort(direction, fn);
            
            if (!suppressEvent) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    /**
     * @private
     * Creates and returns a function which sorts an array by the given field and direction
     * @param {String} field The field to create the sorter for
     * @param {String} direction The direction to sort by (defaults to "ASC")
     * @return {Function} A function which sorts by the field/direction combination provided
     */
    createSortFunction: function(field, direction) {
        direction = direction || "ASC";
        var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

        var fields   = this.model.prototype.fields,
            sortType = fields.get(field).sortType;

        //create a comparison function. Takes 2 records, returns 1 if record 1 is greater,
        //-1 if record 2 is greater or 0 if they are equal
        return function(r1, r2) {
            var v1 = sortType(r1.data[field]),
                v2 = sortType(r2.data[field]);

            return directionModifier * (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
        };
    },
    
    /**
     * Filters the loaded set of records by a given set of filters. Optionally fires the 'datachanged' event.
     * @param {Mixed} filters The set of filters to apply to the data. These are stored internally on the store,
     * but the filtering itself is done on the Store's {@link Ext.util.MixedCollection MixedCollection}. See
     * MixedCollection's {@link Ext.util.MixedCollection#filter filter} method for filter syntax.
     * @param {Boolean} suppressEvent If true, the 'datachanged' event is not fired. Defaults to false
     */
    filter: function(filters, suppressEvent) {
        this.filters = filters || this.filters;
        
        if (this.remoteFilter) {
            //the read function will pick up the new filters and request the filtered data from the proxy
            this.read();
        } else {
            /**
             * A pristine (unfiltered) collection of the records in this store. This is used to reinstate
             * records when a filter is removed or changed
             * @property snapshot
             * @type Ext.util.MixedCollection
             */
            this.snapshot = this.snapshot || this.data.clone();
            
            this.data = this.data.filter(this.filters);
            
            if (!suppressEvent) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    /**
     * Revert to a view of the Record cache with no filtering applied.
     * @param {Boolean} suppressEvent If <tt>true</tt> the filter is cleared silently without firing the
     * {@link #datachanged} event.
     */
    clearFilter : function(suppressEvent){
        if (this.isFiltered()) {
            this.data = this.snapshot.clone();
            delete this.snapshot;
            
            if (suppressEvent !== true) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    /**
     * Returns true if this store is currently filtered
     * @return {Boolean}
     */
    isFiltered : function(){
        return !!this.snapshot && this.snapshot != this.data;
    },
    
    /**
     * Synchronizes the Store with its Proxy. This asks the Proxy to batch together any new, updated
     * and deleted records in the store, updating the Store's internal representation of the records
     * as each operation completes.
     */
    sync: function() {
        this.proxy.batch({
            create : this.getNewRecords(),
            update : this.getUpdatedRecords(),
            destroy: this.getRemovedRecords()
        }, this.getBatchListeners());
    },
    
    /**
     * @private
     * Returns an object which is passed in as the listeners argument to proxy.batch inside this.sync.
     * This is broken out into a separate function to allow for customisation of the listeners
     * @return {Object} The listeners object
     */
    getBatchListeners: function() {
        var listeners = {
            scope: this,
            exception: this.onBatchException
        };
        
        if (this.batchUpdateMode == 'operation') {
            listeners['operationComplete'] = this.onBatchOperationComplete;
        } else {
            listeners['complete'] = this.onBatchComplete;            
        }
        
        return listeners;
    },
    
    //deprecated, will be removed in 5.0
    save: function() {
        return this.sync.apply(this, arguments);
    },
    
    //pass straight through to this.read - could deprecate in 5.0
    load: function() {
        return this.read.apply(this, arguments);
    },
    
    /**
     * Loads an array of {@Ext.data.Model model} instances into the store, fires the datachanged event.
     * @param {Array} records The array of records to load
     * @param {Boolean} add True to add these records to the existing records, false to remove the Store's existing records first
     */
    loadRecords: function(records, add) {
        if (!add) {
            this.data.clear();
        }
        
        for (var i = 0, length = records.length; i < length; i++) {
            records[i].join(this);
        }
        
        this.data.addAll(records);
        
        if (this.filterOnLoad) {
            this.filter();
        }
        
        if (this.sortOnLoad) {
            this.sort();
        }
        
        this.fireEvent('datachanged', this);
    },
    
    /**
     * @private
     * A model instance should call this method on the Store it has been {@link Ext.data.Model#join joined} to.
     * @param {Ext.data.Model} record The model instance that was edited
     */
    afterEdit : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.EDIT);
    },
    
    /**
     * @private
     * A model instance should call this method on the Store it has been {@link Ext.data.Model#join joined} to..
     * @param {Ext.data.Model} record The model instance that was edited
     */
    afterReject : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.REJECT);
    },

    /**
     * @private
     * A model instance should call this method on the Store it has been {@link Ext.data.Model#join joined} to.
     * @param {Ext.data.Model} record The model instance that was edited
     */
    afterCommit : function(record) {
        if (this.autoSave) {
            this.sync();
        }
        
        this.fireEvent('update', this, record, Ext.data.Model.COMMIT);
    },
    
    /**
     * Loads an array of data straight into the Store
     * @param {Array} data Array of data to load. Any non-model instances will be cast into model instances first
     * @param {Boolean} append True to add the records to the existing records in the store, false to remove the old ones first
     */
    loadData: function(data, append) {
        var model = this.model,
            i, length, record;
        
        //make sure each data element is an Ext.data.Model instance
        for (i = 0, length = data.length; i < length; i++) {
            record = data[i];
            
            if (!(record instanceof Ext.data.Model)) {
                data[i] = Ext.ModelMgr.create(record, model);
            }
        }
        
        this.loadRecords(data, append);
    },
    
    
    // PAGING METHODS
    
    /**
     * Loads a given 'page' of data by setting the start and limit values appropriately
     * @param {Number} page The number of the page to load
     */
    loadPage: function(page) {
        this.currentPage = page;
        
        this.read({
            start: (page - 1) * this.pageSize,
            limit: this.pageSize
        });
    },
    
    /**
     * Loads the next 'page' in the current data set
     */
    nextPage: function() {
        this.loadPage(this.currentPage + 1);
    },
    
    /**
     * Loads the previous 'page' in the current data set
     */
    previousPage: function() {
        this.loadPage(this.currentPage - 1);
    },
    
    
    // UTILITY METHODS
    
    destroyStore: function() {
        if (!this.isDestroyed) {
            if (this.storeId) {
                Ext.StoreMgr.unregister(this);
            }
            this.clearData();
            this.data = null;
            Ext.destroy(this.proxy);
            this.reader = this.writer = null;
            this.purgeListeners();
            this.isDestroyed = true;
            
            if (this.implicitModel) {
                Ext.destroy(this.model);
            }
        }
    },
    
    // private
    clearData: function(){
        this.data.each(function(record) {
            record.unjoin();
        });
        
        this.data.clear();
    },
    
    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     * @param {String} fieldName The name of the Record field to test.
     * @param {String/RegExp} value Either a string that the field value
     * should begin with, or a RegExp to test against the field.
     * @param {Number} startIndex (optional) The index to start searching at
     * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning
     * @param {Boolean} caseSensitive (optional) True for case sensitive comparison
     * @return {Number} The matched index or -1
     */
    find : function(property, value, start, anyMatch, caseSensitive) {
        var fn = this.createFilterFn(property, value, anyMatch, caseSensitive);
        return fn ? this.data.findIndexBy(fn, null, start) : -1;
    },
    
    /**
     * @private
     * Returns a filter function used to test a the given property's value. Defers most of the work to
     * Ext.util.MixedCollection's createValueMatcher function
     * @param {String} property The property to create the filter function for
     * @param {String/RegExp} value The string/regex to compare the property value to
     * @param {Boolean} anyMatch True if we don't care if the filter value is not the full value (defaults to false)
     * @param {Boolean} caseSensitive True to create a case-sensitive regex (defaults to false)
     * @param {Boolean} exactMatch True to force exact match (^ and $ characters added to the regex). Defaults to false. Ignored if anyMatch is true.
     */
    createFilterFn : function(property, value, anyMatch, caseSensitive, exactMatch){
        if(Ext.isEmpty(value, false)){
            return false;
        }
        value = this.data.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r.data[property]);
        };
    },

    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     * @param {String} fieldName The name of the Record field to test.
     * @param {Mixed} value The value to match the field against.
     * @param {Number} startIndex (optional) The index to start searching at
     * @return {Number} The matched index or -1
     */
    findExact: function(property, value, start){
        return this.data.findIndexBy(function(rec){
            return rec.get(property) === value;
        }, this, start);
    },

    /**
     * Find the index of the first matching Record in this Store by a function.
     * If the function returns <tt>true</tt> it is considered a match.
     * @param {Function} fn The function to be called. It will be passed the following parameters:<ul>
     * <li><b>record</b> : Ext.data.Record<p class="sub-desc">The {@link Ext.data.Record record}
     * to test for filtering. Access field values using {@link Ext.data.Record#get}.</p></li>
     * <li><b>id</b> : Object<p class="sub-desc">The ID of the Record passed.</p></li>
     * </ul>
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Store.
     * @param {Number} startIndex (optional) The index to start searching at
     * @return {Number} The matched index or -1
     */
    findBy : function(fn, scope, start){
        return this.data.findIndexBy(fn, scope, start);
    },
    
    /**
     * Gets the number of cached records.
     * <p>If using paging, this may not be the total size of the dataset. If the data object
     * used by the Reader contains the dataset size, then the {@link #getTotalCount} function returns
     * the dataset size.  <b>Note</b>: see the Important note in {@link #load}.</p>
     * @return {Number} The number of Records in the Store's cache.
     */
    getCount : function() {
        return this.data.length || 0;
    },
    
    /**
     * Get the Record at the specified index.
     * @param {Number} index The index of the Record to find.
     * @return {Ext.data.Model} The Record at the passed index. Returns undefined if not found.
     */
    getAt : function(index) {
        return this.data.itemAt(index);
    },

    /**
     * Returns a range of Records between specified indices.
     * @param {Number} startIndex (optional) The starting index (defaults to 0)
     * @param {Number} endIndex (optional) The ending index (defaults to the last Record in the Store)
     * @return {Ext.data.Model[]} An array of Records
     */
    getRange : function(start, end) {
        return this.data.getRange(start, end);
    },
    
    /**
     * Get the Record with the specified id.
     * @param {String} id The id of the Record to find.
     * @return {Ext.data.Record} The Record with the passed id. Returns undefined if not found.
     */
    getById : function(id) {
        return (this.snapshot || this.data).find(function(record) {
            return record.getId() === id;
        });
    },
    
    /**
     * Get the index within the cache of the passed Record.
     * @param {Ext.data.Model} record The Ext.data.Model object to find.
     * @return {Number} The index of the passed Record. Returns -1 if not found.
     */
    indexOf : function(record) {
        return this.data.indexOf(record);
    },

    /**
     * Get the index within the cache of the Record with the passed id.
     * @param {String} id The id of the Record to find.
     * @return {Number} The index of the Record. Returns -1 if not found.
     */
    indexOfId : function(id) {
        return this.data.indexOfKey(id);
    },
    
    /**
     * Returns an object describing the current sort state of this Store.
     * @return {Object} The sort state of the Store. An object with two properties:<ul>
     * <li><b>field : String<p class="sub-desc">The name of the field by which the Records are sorted.</p></li>
     * <li><b>direction : String<p class="sub-desc">The sort order, 'ASC' or 'DESC' (case-sensitive).</p></li>
     * </ul>
     * See <tt>{@link #sortInfo}</tt> for additional details.
     */
    getSortState : function() {
        return this.sortInfo;
    }
});