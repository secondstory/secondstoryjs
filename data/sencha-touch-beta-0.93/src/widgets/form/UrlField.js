/**
 * @class Ext.form.UrlField
 * @extends Ext.form.TextField
 * Wraps an HTML5 url field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 * @xtype urlfield
 */
Ext.form.UrlField = Ext.extend(Ext.form.TextField, {
    inputType: 'url',    
    autoCapitalize : false
});

Ext.reg('urlfield', Ext.form.UrlField);
