/**
 * @class Ext.form.TextField
 * @extends Ext.form.Field
 * Simple text input class
 * @xtype textfield
 */
Ext.form.TextField = Ext.extend(Ext.form.Field, {
    type: 'text',
    maskField: Ext.platform.isIPhoneOS
    
    /**
     * @cfg {Integer} maxLength Maximum number of character permit by the input. 
     */
});

Ext.reg('textfield', Ext.form.TextField);
