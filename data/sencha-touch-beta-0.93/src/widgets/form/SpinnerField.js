/**
 * @class Ext.form.SpinnerField
 * @extends Ext.form.Field
 * <p>Wraps an HTML5 number field. See {@link Ext.form.FormPanel FormPanel} for example usage.</p>
 * @xtype spinnerfield
 */
Ext.form.SpinnerField = Ext.extend(Ext.form.NumberField, {

    /**
     * @cfg {Boolean} showClear @hide
     */
    cmpCls: 'x-spinner',
    
    /**
     * @cfg {Number} minValue The minimum allowed value (defaults to Number.NEGATIVE_INFINITY)
     */
    minValue: Number.NEGATIVE_INFINITY,
    /**
     * @cfg {Number} maxValue The maximum allowed value (defaults to Number.MAX_VALUE)
     */
    maxValue: Number.MAX_VALUE,
    /**
     * @cfg {Number} incrementValue Value that is added or subtracted from the current value when a spinner is used.
     * Defaults to <tt>1</tt>.
     */
    incrementValue: 1,
    /**
     * @cfg {Boolean} accelerate True if autorepeating should start slowly and accelerate.
     * Defaults to <tt>true</tt>.
     */
    accelerate: true,
    /**
     * @cfg {Number} defaultValue Value for the spinnerField. Defaults to <tt>false</tt>.
     */
    defaultValue: 0,

    /**
     * @cfg {Boolean} cycle When set to true, it will loop the values of a minimum or maximum is reached.
     * If the maximum value is reached, the value will be set to the minimum.
     * If the minimum value is reached, the value will be set to the maximum.
     * Defaults to <tt>false</tt>.
     */
    cycle: false,
    
    /**
     * @cfg {Boolean} disableInput True to disable the input field, meaning that only the spinner buttons
     * can be used. Defaults to <tt>false</tt>.
     */
    disableInput: false,

    renderTpl: [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
            '<tpl if="fieldEl">',
                '<div class="{cmpCls}-body">',
                    '<div class="{cmpCls}-down"><span>-</span></div>',
                    '<input id="{inputId}" type="number" name="{name}" class="{fieldCls}"',
                        '<tpl if="disableInput">disabled </tpl>',
                        '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                        '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                        '<tpl if="style">style="{style}" </tpl>',
                        '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                    '/>',
                    '<div class="{cmpCls}-up"><span>+</span></div>',
                '</div>',
            '</tpl>',
            '<div class="x-field-mask"></div>',
        '</div>'
    ],
    
    initComponent: function(){
        this.addEvents(
            /**
             * @event spin
             * Fires when the value is changed via either spinner buttons
             * @param {Ext.form.SpinnerField} this
             * @param {Number} value
             * @param {String} direction 'up' or 'down'
             */
            'spin',
            /**
             * @event spindown
             * Fires when the value is changed via the spinner down button
             * @param {Ext.form.SpinnerField} this
             * @param {Number} value
             */
            'spindown',
            /**
             * @event spinup
             * Fires when the value is changed via the spinner up button
             * @param {Ext.form.SpinnerField} this
             * @param {Number} value
             */
            'spinup'
        );
        Ext.form.SpinnerField.superclass.initComponent.call(this);    
    },

    // @private
    onRender: function(ct, position) {
        var me = this;
        me.renderData.disableInput = me.disableInput;

        Ext.applyIf(me.renderSelectors, {
            spinUpEl: '.x-spinner-up',
            spinDownEl: '.x-spinner-down'
        });

        Ext.form.SpinnerField.superclass.onRender.call(me, ct, position);
        
        me.downRepeater = me.createRepeater(me.spinDownEl, me.onSpinDown);
        me.upRepeater = me.createRepeater(me.spinUpEl, me.onSpinUp);
    },
    
    // @private
    createRepeater: function(el, fn){
        var repeat = new Ext.util.TapRepeater(el, {
            accelerate: this.accelerate
        });
        this.mon(repeat, {
            tap: fn,
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            preventDefault: true,
            scope: this
        });
        return repeat;
    },

    // @private
    onSpinDown: function() {
        if (!this.disabled) {
            this.spin(true);
        }
    },

    // @private
    onSpinUp: function() {
        if (!this.disabled) {
            this.spin(false);
        }
    },

    // @private
    onTouchStart : function(btn) {
        btn.el.addClass('x-button-pressed');
    },

    // @private
    onTouchEnd : function(btn) {
        btn.el.removeClass('x-button-pressed');
    },

    // @private
    spin: function(down) {
        var me = this,
            value = parseFloat(me.getValue()),
            increment = me.incrementValue,
            cycle = me.cycle,
            min = me.minValue,
            max = me.maxValue,
            direction = down ? 'down' : 'up';

        if(down){
            value -= increment;
        }else{
            value += increment;
        }

        value = (isNaN(value)) ? me.defaultValue: value;
        if (value < min) {
            value = cycle ? max : min;
        }
        else if (value > max) {
            value = cycle ? min : max;
        }
        me.setValue(value);
        this.fireEvent('spin' + direction, this, value);
        this.fireEvent('spin', this, value, direction);
    },

    // @private
    destroy : function() {
        Ext.destroy(this.downRepeater, this.upRepeater);
        Ext.form.SpinnerField.superclass.destroy.call(this, arguments);
    }
});

Ext.reg('spinnerfield', Ext.form.SpinnerField);
