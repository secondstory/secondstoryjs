/**
 * @class Ext.layout.AutoComponentLayout
 * @extends Ext.layout.ComponentLayout
 *
 * <p>The AutoLayout is the default layout manager delegated by {@link Ext.Component} to
 * render any child Elements when no <tt>{@link Ext.Component#layout layout}</tt> is configured.</p>
 */
Ext.layout.AutoComponentLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'component',

    // @private
    onLayout : function(owner, target, args) {
        var w = args[0],
            h = args[1];

        w = (typeof w == 'number' || w == 'auto') ? args[0] : undefined;
        h = (typeof h == 'number' || h == 'auto') ? args[1] : undefined;

        this.setTargetSize(w, h);

        Ext.layout.AutoComponentLayout.superclass.onLayout.call(this, owner, target, args);
    }
});

Ext.layout.TYPES['component'] = Ext.layout.AutoComponentLayout;
