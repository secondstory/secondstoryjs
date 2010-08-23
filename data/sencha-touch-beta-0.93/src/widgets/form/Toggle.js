/**
 * @class Ext.form.Toggle
 * @extends Ext.form.Slider
 * <p>Specialized Slider with a single thumb and only two values. By default the toggle component can
 * be switched between the values of 0 and 1.</p>
 * @xtype toggle
 */
Ext.form.Toggle = Ext.extend(Ext.form.Slider, {
    minValue: 0,
    maxValue: 1,
    ui: 'toggle',
    
    /**
     * @cfg {Boolean} showClear @hide
     */

    /**
     * @cfg {String} minValueCls CSS class added to the field when toggled to its minValue
     */
    minValueCls: 'x-toggle-off',

    /**
     * @cfg {String} maxValueCls CSS class added to the field when toggled to its maxValue
     */
    maxValueCls: 'x-toggle-on',

    /**
     * Toggles between the minValue (0 by default) and the maxValue (1 by default)
     */
    toggle: function() {
        var thumb = this.thumbs[0],
            value = thumb.getValue();

        this.setValue(value == this.minValue ? this.maxValue : this.minValue);
    },

    // inherit docs
    setValue: function(value) {
        Ext.form.Toggle.superclass.setValue.apply(this, arguments);

        var fieldEl = this.fieldEl;

        if (this.constrain(value) === this.minValue) {
            fieldEl.addClass(this.minValueCls);
            fieldEl.removeClass(this.maxValueCls);
        } 
        else {
            fieldEl.addClass(this.maxValueCls);
            fieldEl.removeClass(this.minValueCls);
        }
    },

    /**
     * @private
     * Listener to the tap event, just toggles the value
     */
    onTap: function() {
        this.toggle();
    }
});

Ext.reg('toggle', Ext.form.Toggle);
