/**
 * @class Ext.form.HiddenField
 * @extends Ext.form.Field
 * <p>Wraps a hidden field. See {@link Ext.form.FormPanel FormPanel} for example usage.</p>
 * @xtype hidden
 */
Ext.form.HiddenField = Ext.extend(Ext.form.Field, {
    inputType: 'hidden',
    ui: 'hidden',
    autoCreateField: false
    /**
     * @cfg {Boolean} showClear @hide
     */
});

Ext.reg('hidden', Ext.form.HiddenField);
