/**
 * @class Ext.data.Reader
 * @extends Object
 * <p>Base Reader class used by most subclasses of {@link Ext.data.ServerProxy}. Readers
 * are used to parse the (string) response of some server request, returning a set of 
 * {@link Ext.data.Model} instances.</p>
 * <p>These classes are not usually instantiated directly, instead the {@link Ext.data.Proxy}
 * will create a Reader as needed.</p>
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Reader = Ext.extend(Object, {
    /**
     * @cfg {String} idProperty Name of the property within a row object
     * that contains a record identifier value.
     */
    
    /**
     * @cfg {String} totalProperty Name of the property from which to
     * retrieve the total number of records in the dataset. This is only needed
     * if the whole dataset is not passed in one go, but is being paged from
     * the remote server.
     */
    
    /**
     * @cfg {String} successProperty Name of the property from which to
     * retrieve the success attribute. See
     * {@link Ext.data.DataProxy}.{@link Ext.data.DataProxy#exception exception}
     * for additional information.
     */
    
    /**
     * @cfg {String} root <b>Required</b>.  The name of the property
     * which contains the Array of row objects.  Defaults to <tt>undefined</tt>.
     * An exception will be thrown if the root property is undefined. The data
     * packet value for this property should be an empty array to clear the data
     * or show no data.
     */
    root: '',
    
    constructor: function(config) {
        Ext.apply(this, config || {});
        
        this.model = Ext.ModelMgr.getModel(config.model);
        if (this.model) {
            this.buildExtractors();
        }
    },
    
    /**
     * Sets a new model for the reader.
     * @private
     * @param {Object} model The model to set.
     */
    setModel: function(model){
        this.model = Ext.ModelMgr.getModel(model);
        delete this.extractorFunctions;
        this.buildExtractors();
    },
    
    /**
     * Reads the given response object. This method normalizes the different types of response object that may be passed
     * to it, before handing off the reading of records to the {@link readRecords} function.
     * @param {Object} response The response object. This may be either an XMLHttpRequest object or a plain JS object
     * @return {Ext.data.ResultSet} The parsed ResultSet object
     */
    read: function(response) {
        var data = response;
        
        if (response.responseText) {
            data = this.getResponseData(response);
        }
        
        return this.readRecords(data);
    },
    
    /**
     * Abstracts common functionality used by all Reader subclasses. Each subclass is expected to call
     * this function before running its own logic and returning the Ext.data.ResultSet instance. For most
     * Readers additional processing should not be needed.
     * @param {Mixed} data The raw data object
     * @return {Ext.data.ResultSet} A ResultSet object
     */
    readRecords: function(data) {
        /**
         * The raw data object that was last passed to readRecords. Stored for further processing if needed
         * @property rawData
         * @type Mixed
         */
        this.rawData = data;
        
        var data    = this.getData(data),
            root    = this.getRoot(data),
            total   = root.length,
            success = true;
        
        if (this.totalProperty) {
            var value = parseInt(this.getTotal(data), 10);
            
            if (!isNaN(value)) {
                total = value;
            }
        }
        
        if (this.successProperty) {
            var value = this.getSuccess(data);
            
            if (value === false || value === 'false') {
                success = false;
            }
        }
        
        var records = this.extractData(root, true);
        
        return new Ext.data.ResultSet({
            total  : total || records.length,
            count  : records.length,
            records: records,
            success: success
        });
    },
    
    /**
     * Returns extracted, type-cast rows of data.  Iterates to call #extractValues for each row
     * @param {Object[]/Object} data-root from server response
     * @param {Boolean} returnRecords [false] Set true to return instances of Ext.data.Record
     * @private
     */
    extractData : function(root, returnRecords) {
        var values  = [],
            records = [],
            model   = this.model,
            length  = root.length,
            idProp  = this.idProperty;
        
        for (var i = 0; i < length; i++) {
            var node   = root[i],
                values = this.extractValues(node),
                id     = this.getId(node);
            
            if (returnRecords === true) {
                var record = new model(values, id);
                record.raw = node;
                records.push(record);
            } else {
                values[idProperty] = id;
                records.push(values);
            }
        }
        
        return records;
    },
    
    /**
     * @private
     * Given an object representing a single model instance's data, iterates over the model's fields and 
     * builds an object with the value for each field, running the field's convert function first if present
     * @param {Object} data The data object to convert
     * @return {Object} Data object suitable for use with a model constructor
     */
    extractValues: function(data) {
        var fields = this.model.prototype.fields.items,
            length = fields.length,
            output = {};
        
        for (var i = 0; i < length; i++) {
            var field = fields[i],
                value = this.extractorFunctions[i](data) || field.defaultValue;
            
            output[field.name] = field.convert(value, data);
        }
        
        return output;
    },
    
    /**
     * @private
     * By default this function just returns what is passed to it. It can be overridden in a subclass
     * to return something else. See XmlReader for an example.
     * @param {Object} data The data object
     * @return {Object} The normalized data object
     */
    getData: function(data) {
        return data;
    },
    
    /**
     * @private
     * This will usually need to be implemented in a subclass. Given a generic data object (the type depends on the type
     * of data we are reading), this function should return the object as configured by the Reader's 'root' meta data config.
     * See XmlReader's getRoot implementation for an example. By default the same data object will simply be returned.
     * @param {Mixed} data The data object
     * @return {Mixed} The same data object
     */
    getRoot: function(data) {
        return data;
    },
    
    /**
     * Takes a raw response object (as passed to this.read) and returns the useful data segment of it. This must be implemented by each subclass
     * @param {Object} response The responce object
     * @return {Object} The useful data from the response
     */
    getResponseData: function(response) {
        throw new Error("getResponseData must be implemented in the Ext.data.Reader subclass");
    },
    
    /**
     * @private
     * Reconfigures the meta data tied to this Reader
     */
    onMetaChange : function(meta) {
        Ext.apply(this, meta || {});
        
        delete this.extractorFunctions;
        this.buildExtractors();
    },
    
    /**
     * @private
     * This builds optimized functions for retrieving record data and meta data from an object.
     * Subclasses may need to implement their own getRoot function.
     */
    buildExtractors: function() {
        if (this.extractorFunctions) {
            return;
        }
        
        var idProp      = this.id || this.idProperty,
            totalProp   = this.totalProperty,
            successProp = this.successProperty,
            messageProp = this.messageProperty;
        
        //build the extractors for all the meta data
        if (totalProp) {
            this.getTotal = this.createAccessor(totalProp);
        }
        
        if (successProp) {
            this.getSuccess = this.createAccessor(successProp);
        }
        
        if (messageProp) {
            this.getMessage = this.createAccessor(messageProp);
        }
        
        if (idProp) {
            var accessor = this.createAccessor(idProp);
            
            this.getId = function(record) {
                var id = accessor(record);
                
                return (id == undefined || id == '') ? null : id;
            };
        } else {
            this.getId = function() {
                return null;
            };
        }
        
        //now build the extractors for all the fields
        var fields = this.model.prototype.fields.items,
            extractorFunctions = [];
        
        for (var i = 0, length = fields.length; i < length; i++) {
            var field = fields[i],
                map   = (field.mapping !== undefined && field.mapping !== null) ? field.mapping : field.name;
            
            extractorFunctions.push(this.createAccessor(map));
        }
        
        this.extractorFunctions = extractorFunctions;
    }
});