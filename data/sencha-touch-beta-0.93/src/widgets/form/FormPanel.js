/**
 * @class Ext.form.FormPanel
 * @extends Ext.Panel
 * <p>Simple form panel which enables easy getting and setting of field values. Can load model instances. Example usage:</p>
<pre><code>
var form = new Ext.form.FormPanel({
    items: [
        {
            xtype: 'textfield',
            name : 'first',
            label: 'First name'
        },
        {
            xtype: 'textfield',
            name : 'last',
            label: 'Last name'
        },
        {
            xtype: 'numberfield',
            name : 'age',
            label: 'Age'
        },
        {
            xtype: 'urlfield',
            name : 'url',
            label: 'Website'
        }
    ]
});
</code></pre>
 * <p>Loading model instances:</p>
<pre><code>
Ext.regModel('User', {
    fields: [
        {name: 'first', type: 'string'},
        {name: 'last',  type: 'string'},
        {name: 'age',   type: 'int'},
        {name: 'url',   type: 'string'}
    ]
});

var user = Ext.ModelMgr.create({
    first: 'Ed',
    last : 'Spencer',
    age  : 24,
    url  : 'http://extjs.com'
}, 'User');

form.load(user);
</code></pre>
 * @xtype form
 */
Ext.form.FormPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Boolean} standardSubmit
     * Wether or not we want to perform a standard form submit. Defaults to false/
     */
    standardSubmit: false,

    cmpCls: 'x-form',
    
    /**
     * @cfg {String} url
     * The default Url for submit actions
     */
    url : undefined,
    
    /**
     * @cfg {Object} baseParams
     * Optional hash of params to be sent (when standardSubmit configuration is false) on every submit.
     */
    baseParams : undefined,

    renderTpl: [
        '<form <tpl if="id">id="{id}"</tpl> class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<div class="{baseCls}-body"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>',
        '</form>'
    ],
    
    /**
     * @cfg {Object} waitTpl
     * The defined {@link #waitMsg} template.  Used for precise control over the masking agent used
     * to mask the FormPanel (or other Element) during form Ajax/submission actions. For more options, see
     * {@link #showMask} method.
     */
    waitTpl: new Ext.XTemplate(
        '<div class="{cls}">{message}&hellip;</div>'
    ),

    // @private
    initComponent : function() {
        this.addEvents(
           /**
             * @event submit
             * Fires upon successful (Ajax-based) form submission
             * @param {Ext.FormPanel} this This FormPanel
             * @param {Object} result The result object as returned by the server
             */
            'submit', 
           /**
             * @event beforesubmit
             * Fires immediately preceding any Form submit action.
             * Implementations may adjust submitted form values or options prior to execution.
             * A return value of <tt>false</tt> from this listener will abort the submission 
             * attempt (regardless of standardSubmit configuration) 
             * @param {Ext.FormPanel} this This FormPanel
             * @param {Object} values A hash collection of the qualified form values about to be submitted
             * @param {Object} options Submission options hash (only available when standardSubmit is false) 
             */
             'beforesubmit', 
           /**
             * @event exception
             * Fires when either the Ajax HTTP request reports a failure OR the server returns a success:false
             * response in the result payload.
             * @param {Ext.FormPanel} this This FormPanel
             * @param {Object} result Either a failed Ext.data.Connection request object or a failed (logical) server
             * response payload.
             */
             'exception'
        );
        Ext.form.FormPanel.superclass.initComponent.call(this);
    },

    // @private
    afterRender : function() {
        Ext.form.FormPanel.superclass.afterRender.call(this);
        this.el.on('submit', this.onSubmit, this);
    },

    // @private
    onSubmit : function(e, t) {
        if (!this.standardSubmit || this.fireEvent('beforesubmit', this, this.getValues(true)) === false) {
            if (e) {
                e.stopEvent();
            }       
        }
    },
    
    /**
     * Performs a Ajax-based submission of form values (if standardSubmit is false) or otherwise 
     * executes a standard HTML Form submit action.
     * @param {Object} options Unless otherwise noted, options may include the following:
     *
     * url : String
     * The url for the action (defaults to the form's {@link #url url}.)
     *
     * method : String
     * The form method to use (defaults to the form's method, or POST if not defined)
     *
     * params : String/Object
     * The params to pass
     * (defaults to the FormPanel's baseParams, or none if not defined)
     * Parameters are encoded as standard HTTP parameters using {@link Ext#urlEncode}.
     *
     * headers : Object
     * Request headers to set for the action
     * (defaults to the form's default headers)
     * 
     * autoAbort : Boolean
     * <tt>true</tt> to abort any pending Ajax request prior to submission (defaults to false)
     * Note: Has no effect when standardSubmit is enabled.
     * 
     * submitDisabled : Boolean
     * <tt>true</tt> to submit all fields regardless of disabled state (defaults to false)
     * Note: Has no effect when standardSubmit is enabled.
     *
     * waitMsg : String/Config
     * If specified, the value is applied to the {@link #waitTpl} if defined, and rendered to the
     * {@link #waitMsgTarget} prior to a Form submit action.
     * 
     * success : Function
     * The callback that will be invoked after a successful response 
     * 
     *  The function is passed the following parameters:
     *
      o      * form : Ext.FormPanel The form that requested the action
      o      * result : The result object returned by the server as a result of the submit request.
     * 
     *
     * failure : Function
     * The callback that will be invoked after a
     * failed transaction attempt. The function is passed the following parameters:
     *     form : The Ext.FormPanel that requested the submit.
     *     result : The failed response or result object returned by the server which performed the operation.
     *
     * scope : Object
     * The scope in which to call the callback functions (The this reference for the callback functions).
     *
     *
     * @return {Ext.data.Connection} request Object
     */

    submit : function(options) {
        var form = this.el.dom || {};
        
        options = Ext.applyIf(options || {},{
           url : this.url || form.action,
           submitDisabled : false,
           method : form.method || 'post',
           params : null,
           autoAbort : false,
           waitMsg : null,
           headers : null,
           success : Ext.emptyFn,
           failure : Ext.emptyFn
        });
        
        var formValues = this.getValues(this.standardSubmit || !options.submitDisabled);
        
        if (this.standardSubmit) {
            if (form) {
                if (options.url && Ext.isEmpty(form.action)) {
                    form.action = options.url;
                }
                form.method = (options.method || form.method).toLowerCase();
                form.submit();
            }
            return null;
        }
        if (this.fireEvent('beforesubmit', this, formValues, options ) !== false) {
            if (options.waitMsg) {
                this.showMask(options.waitMsg);
            }
            
            return Ext.Ajax.request({
                url : options.url,
                method : options.method,
                rawData : Ext.urlEncode(Ext.apply(
                    Ext.apply({},this.baseParams || {}),
                    options.params || {},
                    formValues
                  )),
                autoAbort : options.autoAbort,
                headers  : Ext.apply(
                   {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    options.headers || {}),
                scope : this,
                callback: function(options, success, response) {
                     var R = response;
                     this.hideMask();   
                        
                     if (success) {
                          R = Ext.decode(R.responseText);
                          success = !!R.success;
                          if (success) {
                              if (typeof options.success == 'function') {
                                options.success.call(options.scope, this, R);
                              }
                              this.fireEvent('submit', this, R);
                              return;
                          }
                     }
                    if (typeof options.failure == 'function') {
                        options.failure.call(options.scope, this, R);
                    }
                    this.fireEvent('exception', this, R);
                }
            });
        }
    },

    /**
     * Loads matching fields from a model instance into this form
     * @param {Ext.data.Model} instance The model instance
     * @return {Ext.form.FormPanel} this
     */
    loadModel: function(instance) {        
        if(instance && instance.data){
            this.setValues(instance.data);
        }
        return this;
    },
    
    /**
     * Updates a model instance with the current values of this form
     * @param {Ext.data.Model} instance The model instance
     * @param {Boolean} enabled <tt>true</tt> to update the Model with values from enabled fields only
     * @return {Ext.form.FormPanel} this
     */
    updateModel: function(instance, enabled) {
        var fields, values, name;
        
        if(instance && (fields = instance.fields)){
            values = this.getValues(enabled);
            for (name in values) {
                if(values.hasOwnProperty(name) && fields.containsKey(name)){
                   instance.set(name, values[name]);     
                }
            }
        }
        return this;
         
    },

    /**
     * Sets the values of form fields in bulk. Example usage:
<pre><code>
myForm.setValues({
    name: 'Ed',
    crazy: true,
    username: 'edspencer'
});
</code></pre>
     * @param {Object} values field name => value mapping object
     * @return {Ext.form.FormPanel} this
     */
    setValues: function(values) {
         var fields = this.getFields(),
            name, field;
        values = values || {};
        for (name in values) {
            if (values.hasOwnProperty(name) && name in fields) {
                field = fields[name];
                field.setValue && field.setValue(values[name]);
            }       
        }
        return this;
    },

    /**
     * Returns an object containing the value of each field in the form, keyed to the field's name
     * @param {Boolean} enabled <tt>true</tt> to return only enabled fields
     * @return {Object} Object mapping field name to its value
     */
    getValues: function(enabled) {
        var fields = this.getFields(),
            field,
            values = {},
            name;

        for (name in fields) {
            if (fields.hasOwnProperty(name)) {
                field = fields[name];
                if (enabled && field.disabled) {
                    continue;
                }
                if (field.getValue) {
                    values[name] = field.getGroupValue ? field.getGroupValue() : field.getValue();
                }
            }
        }

        return values;

    },

    /**
     * Resets all fields in the form back to their original values
     */
    reset: function() {
        var fields = this.getFields(),
            name;
        for (name in fields) {
            if(fields.hasOwnProperty(name)){
                fields[name].reset();
            }
        }
    },

    /**
     * @private
     * Returns all {@link Ext.Field field} instances inside this form
     * @return {Object} All field instances, mapped by field name
     */
    getFields: function() {
        var fields = {};

        var getFieldsFrom = function(item) {
            if (item.isField) {
                fields[item.getName()] = item;
            }

            if (item.isContainer) {
                item.items.each(getFieldsFrom);
            }
        };

        this.items.each(getFieldsFrom);
        return fields;
    },
    /**
     * Shows a generic/custom mask over a designated Element.
     * @param {String/Object} cfg Either a string message or a configuration object supporting
     * the following options:
<pre><code>
    {        
           message : 'Please Wait',
       transparent : false,
           target  : Ext.getBody(),  //optional target Element
               cls : 'form-mask',
    customImageUrl : 'trident.jpg'
    }
</code></pre>This object is passed to the {@link #waitTpl} for use with a custom masking implementation.
     * @param {String/Element} target The target Element instance or Element id to use
     * as the masking agent for the operation (defaults the container Element of the component)
     * @return {Ext.form.FormPanel} this
     */
    showMask : function(cfg, target){
        
        cfg = Ext.isString(cfg)? {message : cfg, transparent : false} : cfg; 
        
        if(cfg && this.waitTpl){
            this.maskTarget = target = Ext.get(target || cfg.target) || this.el;
            target && target.mask(!!cfg.transparent, this.waitTpl.apply(cfg));
        }
        return this;
    },
    
    /**
     * Hides a previously shown wait mask (See {@link #showMask})
     * @return {Ext.form.FormPanel} this
     */
    hideMask : function(){
        if(this.maskTarget){
            this.maskTarget.unmask();
            delete this.maskTarget;
        }
        return this;
    }
});

 /**
     * (Shortcut to {@link #loadModel} method) Loads matching fields from a model instance into this form
     * @param {Ext.data.Model} instance The model instance
     * @return {Ext.form.FormPanel} this
     */
Ext.form.FormPanel.prototype.load = Ext.form.FormPanel.prototype.loadModel; 
Ext.reg('form', Ext.form.FormPanel);
