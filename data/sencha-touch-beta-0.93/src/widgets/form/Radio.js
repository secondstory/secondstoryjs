/**
 * @class Ext.form.Radio
 * @extends Ext.form.Checkbox
 * <p>Single radio field.  Same as Checkbox, but provided as a convenience for automatically setting the input type.
 * Radio grouping is handled automatically by the browser if you give each radio in a group the same name.</p>
 * @constructor
 * Creates a new Radio
 * @param {Object} config Configuration options
 * @xtype radio
 */
Ext.form.Radio = Ext.extend(Ext.form.Checkbox, {
    inputType: 'radio',
    ui: 'radio',
    /**
     * @cfg {Boolean} showClear @hide
     */

    /**
     * If this radio is part of a group, it will return the selected value
     * @return {String}
     */
    getGroupValue: function() {
        var p = this.el.up('form') || Ext.getBody(),
            c = p.down('input[name=' + this.fieldEl.dom.name + ']:checked', true);
        return c ? c.value: null;
    },

    // @private
    onClick: function() {
        if (this.fieldEl.dom.checked != this.checked) {
            var els = this.getCheckEl().select('input[name=' + this.fieldEl.dom.name + ']');
            els.each(function(el) {
                if (el.dom.id == this.id) {
                    this.setValue(true);
                } else {
                    Ext.getCmp(el.dom.id).setValue(false);
                }
            },
            this);
        }
    },

    /**
     * Sets either the checked/unchecked status of this Radio, or, if a string value
     * is passed, checks a sibling Radio of the same name whose value is the value specified.
     * @param value {String/Boolean} Checked value, or the value of the sibling radio button to check.
     */
    setValue: function(v) {
        if (typeof v == 'boolean') {
            Ext.form.Radio.superclass.setValue.call(this, v);
        } 
        else if (this.rendered && v != undefined) {
            var wrap,
                r = this.getCheckEl().down('input[name=' + this.fieldEl.dom.name + '][value=' + v + ']');
            if (r && (wrap = r.up('.' + this.renderData.baseCls))) {
                Ext.getCmp(wrap.id).setValue(true);
            }
        }
    },

    // @private
    getCheckEl: function() {
        if (this.inGroup) {
            return this.el.up('.x-form-radio-group');
        }
        return this.el.up('form') || Ext.getBody();
    }
});
Ext.reg('radio', Ext.form.Radio);
