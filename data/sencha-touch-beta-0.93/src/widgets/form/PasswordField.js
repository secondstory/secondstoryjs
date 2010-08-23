/**
 * @class Ext.form.PasswordField
 * @extends Ext.form.Field
 * <p>Wraps an HTML5 password field. See {@link Ext.form.FormPanel FormPanel} for example usage.</p>
 * @xtype passwordfield
 */
Ext.form.PasswordField = Ext.extend(Ext.form.Field, {
    maskField: Ext.platform.isIPhoneOS,
    inputType: 'password'
});

Ext.reg('passwordfield', Ext.form.PasswordField);
