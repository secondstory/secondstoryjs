/**
* @class Ext.layout.ContainerLayout
* @extends Ext.layout.Layout
* <p>This class is intended to be extended or created via the <tt><b>{@link Ext.Container#layout layout}</b></tt>
* configuration property.  See <tt><b>{@link Ext.Container#layout}</b></tt> for additional details.</p>
*/
Ext.layout.ContainerLayout = Ext.extend(Ext.layout.Layout, {
    /**
     * @cfg {String} extraCls
     * <p>An optional extra CSS class that will be added to the container. This can be useful for adding
     * customized styles to the container or any of its children using standard CSS rules. See
     * {@link Ext.Component}.{@link Ext.Component#ctCls ctCls} also.</p>
     * </p>
     */

    // @private
    onLayout : function(items, target) {
        this.renderItems(this.getLayoutItems(), target);
    },

    afterLayout : function() {
        this.owner.afterLayout(this);
    },

    /**
     * Returns an array of child components.
     * @return {Array} of child components
     */
    getLayoutItems : function() {
        return this.owner && this.owner.items && this.owner.items.items || [];
    },

    /**
     * Return the {@link #getLayoutTarget Ext.Container} container element used to contain the child Components.
     * @return {Ext.Element}
     */
    getTarget : function() {
        return this.owner.getLayoutTarget();
    },

    /**
     * Returns all items that have been rendered
     * @return {Array} All matching items
     */
    getRenderedItems: function() {
        var target   = this.getTarget(),
            items = this.getLayoutItems(),
            ln = items.length,
            renderedItems = [],
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.rendered && this.isValidParent(item, target)) {
                renderedItems.push(item);
            }
        }

        return renderedItems;
    },

    /**
     * Returns all items that are both rendered and visible
     * @return {Array} All matching items
     */
    getVisibleItems: function() {
        var target   = this.getTarget(),
            items = this.getLayoutItems(),
            ln = items.length,
            visibleItems = [],
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.rendered && this.isValidParent(item, target) && item.hidden !== true) {
                visibleItems.push(item);
            }
        }

        return visibleItems;
    }
});

Ext.layout.TYPES['container'] = Ext.layout.ContainerLayout;