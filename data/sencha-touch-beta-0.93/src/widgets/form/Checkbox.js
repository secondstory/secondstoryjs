/**
 * @class Ext.form.Checkbox
 * @extends Ext.form.Field
 * Simple Checkbox class. Can be used as a direct replacement for traditional checkbox fields.
 * @constructor
 * @param {Object} config Optional config object
 * @xtype checkbox
 */
Ext.form.Checkbox = Ext.extend(Ext.form.Field, {
    inputType: 'checkbox',
    ui: 'checkbox',
    
    /**
     * @cfg {Boolean} showClear @hide
     */

    /**
     * @cfg {Boolean} checked <tt>true</tt> if the checkbox should render initially checked (defaults to <tt>false</tt>)
     */
    checked : false,
    
    /**
     * @cfg {String} inputValue The string value to submit if the item is in a checked state.
     */
    inputValue : undefined,

    // @private
    constructor: function(config) {
        this.addEvents(
            /**
             * @event check
             * Fires when the checkbox is checked or unchecked.
             * @param {Ext.form.Checkbox} this This checkbox
             * @param {Boolean} checked The new checked value
             */
            'check'
        );

        Ext.form.Checkbox.superclass.constructor.call(this, config);
    },
    
    renderTpl: [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls}<tpl if="required"> {required}</tpl><tpl if="cls"> {cls}</tpl><tpl if="cmpCls"> {cmpCls}</tpl><tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>><span>{label}</span></label></tpl>',
            '<tpl if="fieldEl"><input id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="style">style="{style}" </tpl> value="{inputValue}" ',
            '/></tpl>',
        '</div>'
    ],

    // @private
    onRender : function(ct, position) {
        
        this.renderData.inputValue = this.inputValue || this.value || '';
        Ext.form.Checkbox.superclass.onRender.call(this, ct, position);

        if (this.checked) {
            this.setValue(true);
        } else {
            this.checked = this.fieldEl.dom.checked;
        }
    },

    /**
     * Returns the checked state of the checkbox.
     * @return {Boolean} True if checked, else false
     */
    getValue : function(){
        if (this.rendered) {
            return this.fieldEl.dom.checked;
        }
        return this.checked;
    },

    /**
     * Sets the checked state of the checkbox and fires the 'check' event.
     * @param {Boolean/String} checked The following values will check the checkbox:
     * <code>true, 'true', '1', or 'on'</code>. Any other value will uncheck the checkbox.
     */
    setValue : function(v) {

        var checked = this.checked;
        this.checked = (v === true || v === 'true' || v == '1' || String(v).toLowerCase() == 'on');

        if (this.rendered) {
            this.fieldEl.dom.checked = this.checked;
            this.fieldEl.dom.defaultChecked = this.checked;
        }

        if (checked != this.checked) {
            this.fireEvent('check', this, this.checked);
        }
    }
});

Ext.reg('checkbox', Ext.form.Checkbox);
