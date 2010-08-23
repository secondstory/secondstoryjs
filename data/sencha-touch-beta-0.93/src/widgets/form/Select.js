/**
 * @class Ext.form.Select
 * @extends Ext.form.Field
 * Simple Select field wrapper. Example usage:
<pre><code>
new Ext.form.Select({
    options: [
        {text: 'First Option',  value: 'first'},
        {text: 'Second Option', value: 'second'},
        {text: 'Third Option',  value: 'third'}
    ]
});
</code></pre>
 * @xtype select
 */
Ext.form.Select = Ext.extend(Ext.form.Field, {
    ui: 'select',
    /**
     * @cfg {Boolean} showClear @hide
     */

    /**
     * @cfg {String/Integer} valueField The underlying {@link Ext.data.Field#name data value name} (or numeric Array index) to bind to this
     * Select control. (defaults to 'value') 
     */
    valueField: 'value',
    
    /**
     * @cfg {String/Integer} displayField The underlying {@link Ext.data.Field#name data value name} (or numeric Array index) to bind to this
     * Select control. This resolved value is the visibly rendered value of the available selection options.
     * (defaults to 'text')
     */
    displayField: 'text',
    
    /**
     * @cfg {Ext.data.Store} store (Optional) store instance used to provide selection options data.  
     */

    /**
     * @cfg {Array} options (Optional) An inline array of selection option objects containing corresponding
     * {@link #valueField valueField} and {@link #displayField displayField} suitable for rendering the options list. 
     */
    
    renderTpl : [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
            '<tpl if="fieldEl"><select id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
            '</select></tpl>',
        '</div>'
     ],
     
     // @private
     onRender : function(ct, position) {
        Ext.form.Select.superclass.onRender.call(this, ct, position);
        if (this.options) {
            this.setOptions();
        }
        else {
	        var store = this.store || {};
	        delete this.store;
            //load the options immediately if the store has contents
	        this.bindStore(store, store.getCount && store.getCount()>0);
        }
     },
    
    /**
     * Returns the Template instance used to render the component's options list.
     * Implementations may override this method to customize rendered &lt;options&gt; output.
     * 
     * @return {Ext.util.XTemplate} optionsTemplate
     */
    getOptionsTpl : function() {
        return new Ext.XTemplate(
           '<tpl for="options">',
              '<option value="{' + this.valueField + '}">{' + this.displayField + '}</option>',
           '</tpl>',
           {compiled : true}
        );
    },
    
    /**
     * Updates the underlying &lt;options&gt; list with new values.
     * @param {Array} options An array of options configurations to insert or append.
     * @param {Boolean} append <tt>true</tt> to append the new options existing values.
<pre><code>
selectBox.setOptions(
    [   {text: 'First Option',  value: 'first'},
        {text: 'Second Option', value: 'second'},
        {text: 'Third Option',  value: 'third'}
    ]).setValue('third');
</code></pre>
     * Note: option object member names should correspond with defined {@link #valueField valueField} and 
     * {@link #displayField displayField} values.
     * @return {Ext.form.Select} this  
     */
    setOptions : function(options, append) {
        var me = this;
        options || (append = false);
        options = options || me.options;

        if (Ext.isArray(options)) {
            if (me.rendered) { 
                var tpl = me.getOptionsTpl();
                if (tpl && tpl.applyTemplate) {
                    if (append && me.fieldEl.child('option')) {
                        tpl.insertAfter(me.fieldEl.dom.lastChild, {options: options});
                    }
                    else {
                        tpl.overwrite(me.fieldEl, {options : options });    
                    }
                }
                else {
                    throw 'Error: Missing/invalid options template.';
                }
            }
            me.options = append ? (me.options || []).concat(options) : options;
        }
        return me;
    },
    
    /**
     * Returns the store (if assigned) associated with this Select.
     * @return {Ext.data.Store} The store
     */
    getStore : function() {
        return this.store;
    },
    
    bindStore : function(store, loadImmediate) {
        var me = this,
            listen = {
              datachanged : me.onDataChanged,
              scope : me
            };

        if (me.store) {
            me.store.un(listen);
            me.store = null;
        }
        if (store && store.getRange) {
            me.store = store;
            store.on(listen);
            if (loadImmediate) {
                me.onDataChanged(store);
            }
        }
        return me;
    },
    
    // @private
    onDataChanged : function(store) {
        store = store || this.store;
        if (store && store.getRange) {
            this.setOptions(Ext.pluck(store.data.items, 'data'));
        }
    },
    
    // @private
    onDestroy : function() {
        this.bindStore(null);
        Ext.form.Select.superclass.onDestroy.call(this);
    }
});

Ext.reg('select', Ext.form.Select);
