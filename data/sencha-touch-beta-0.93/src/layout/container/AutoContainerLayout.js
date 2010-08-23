/**
 * @class Ext.layout.AutoContainerLayout
 * @extends Ext.layout.ContainerLayout
 *
 * <p>The AutoLayout is the default layout manager delegated by {@link Ext.Container} to
 * render any child Components when no <tt>{@link Ext.Container#layout layout}</tt> is configured into
 * a <tt>{@link Ext.Container Container}.</tt>.  AutoLayout provides only a passthrough of any layout calls
 * to any child containers.</p>
 */
Ext.layout.AutoContainerLayout = Ext.extend(Ext.layout.ContainerLayout, {
    type: 'container',

    // @private
    onLayout : function(owner, target) {
        var items = this.getLayoutItems(),
            ln = items.length,
            i;

        this.renderItems(items, target);
        for (i = 0; i < ln; i++) {
            items[i].doComponentLayout(items[i].width || undefined, items[i].height || undefined);
        }
    }
});

Ext.layout.TYPES['auto'] = Ext.layout.AutoContainerLayout;