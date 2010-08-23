/**
 * @class Ext.form.NumberField
 * @extends Ext.form.Field
 * <p>Wraps an HTML5 number field. See {@link Ext.form.FormPanel FormPanel} for example usage.</p>
 * @xtype numberfield
 */
Ext.form.NumberField = Ext.extend(Ext.form.Field, {
    inputType: 'number',
    
    minValue : undefined,
    
    maxValue : undefined,
    
    stepValue : undefined,
    
    renderTpl: [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
            '<tpl if="fieldEl"><input id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="minValue != undefined">min="{minValue}" </tpl>',
                '<tpl if="maxValue != undefined">max="{maxValue}" </tpl>',
                '<tpl if="stepValue != undefined">step="{stepValue}" </tpl>',
                '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
            '/></tpl>',
            '<tpl if="showClear"><div class="x-field-clear x-hidden-display"></div></tpl>',
        '</div>'
    ],
    
    ui: 'number',
    maskField: Ext.platform.isIPhoneOS,
    
    // @private
    onRender : function(ct, position) {
        Ext.apply(this.renderData, {
            maxValue : this.maxValue,
            minValue : this.minValue,
            stepValue : this.stepValue 
        });
        Ext.form.NumberField.superclass.onRender.call(this, ct, position);
    }
});

Ext.reg('numberfield', Ext.form.NumberField);
