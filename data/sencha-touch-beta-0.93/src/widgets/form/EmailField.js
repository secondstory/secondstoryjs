/**
 * @class Ext.form.EmailField
 * @extends Ext.form.TextField
 * <p>Wraps an HTML5 email field. See {@link Ext.form.FormPanel FormPanel} for example usage.</p>
 * @xtype emailfield
 */
Ext.form.EmailField = Ext.extend(Ext.form.TextField, {
    inputType: 'email',
    autoCapitalize : false
});

Ext.reg('emailfield', Ext.form.EmailField);
