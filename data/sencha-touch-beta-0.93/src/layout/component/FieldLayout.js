/**
 * @class Ext.layout.FieldLayout
 * @extends Ext.layout.ComponentLayout
 *
 * <p>The FieldLayout is the default layout manager delegated by {@link Ext.Field} to
 * render field Elements.</p>
 */
Ext.layout.FieldLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'field',

    // @private
    onLayout: function(owner, target, args) {
        var w = args[0],
            h = args[1];

        this.owner = owner;
        this.handleLabel();

        owner.el.setSize(w, h);

        Ext.layout.FieldLayout.superclass.onLayout.call(this, owner, target);
    },

    // @private - Set width of the label
    handleLabel : function() {
        this.owner.labelEl.setWidth(this.owner.labelWidth);
    }
});

Ext.layout.TYPES['field'] = Ext.layout.FieldLayout;
