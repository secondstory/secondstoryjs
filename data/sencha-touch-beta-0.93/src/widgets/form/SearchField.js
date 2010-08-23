/**
 * @class Ext.form.SearchField
 * @extends Ext.form.Field
 * Wraps an HTML5 search field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 * @xtype searchfield
 */
Ext.form.SearchField = Ext.extend(Ext.form.Field, {
    inputType: 'search'
    /**
     * @cfg {Boolean} showClear @hide
     */
});

Ext.reg('searchfield', Ext.form.SearchField);
