/**
 * @class Ext.form.FieldSet
 * @extends Ext.Container
 * <p>Simple FieldSet, can contain fields as items. FieldSets do not add any behavior, other than an optional title, and
 * are just used to group similar fields together. Example usage (within a form):</p>
<pre><code>
new Ext.form.FormPanel({
    items: [
        {
            xtype: 'fieldset',
            title: 'About Me',
            items: [
                {
                    xtype: 'textfield',
                    name : 'firstName',
                    label: 'First Name'
                },
                {
                    xtype: 'textfield',
                    name : 'lastName',
                    label: 'Last Name'
                }
            ]
        }
    ]
});
</code></pre>
 * @xtype fieldset
 */
Ext.form.FieldSet = Ext.extend(Ext.Panel, {
    cmpCls: 'x-form-fieldset',

    // @private
    initComponent : function() {
        this.componentLayout = new Ext.layout.AutoComponentLayout();
        Ext.form.FieldSet.superclass.initComponent.call(this);
    },

    /**
     * @cfg {String} title Optional fieldset title, rendered just above the grouped fields
     */

    /**
     * @cfg {String} instructions Optional fieldset instructions, rendered just below the grouped fields
     */

    // @private
    afterLayout : function(layout) {
        Ext.form.FieldSet.superclass.afterLayout.call(this, layout);
        if (this.title && !this.titleEl) {
            this.titleEl = this.el.insertFirst({
                cls: this.cmpCls + '-title',
                html: this.title
            });
        }
        else if (this.titleEl) {
            this.el.insertFirst(this.titleEl);
        }

        if (this.instructions && !this.instructionsEl) {
            this.instructionsEl = this.el.createChild({
                cls: this.cmpCls + '-instructions',
                html: this.instructions
            });
        }
        else if (this.instructionsEl) {
            this.el.appendChild(this.instructionsEl);
        }
    }
});

Ext.reg('fieldset', Ext.form.FieldSet);
