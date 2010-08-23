/**
 * @class Ext.layout.Layout
 * @extends Object
 * Base Layout class - extended by ComponentLayout and ContainerLayout
 */

Ext.layout.Layout = Ext.extend(Object, {
    type: 'layout',

    constructor : function(config) {
        this.id = Ext.id(null, 'ext-layout-');
        Ext.apply(this, config);
    },

    // @private Sets the layout owner
    setOwner : function(owner) {
        this.owner = owner;
    },

    /**
     * @private
     * Adds the layout's targetCls if necessary and calls onLayout.
     * layedOut flag set when complete.
     */
    layout : function() {
        var owner = this.owner,
            target = this.getTarget();

        if (!this.layedOut && !Ext.isEmpty(this.targetCls)) {
            target.addClass(this.targetCls);
        }

        this.onLayout(owner, target, arguments.length ? arguments : []);
        this.layedOut = true;

        this.afterLayout();
    },

    // Placeholder empty functions for subclasses to extend
    afterLayout : Ext.emptyFn,
    getLayoutItems : Ext.emptyFn,
    getTarget : Ext.emptyFn,
    onLayout : Ext.emptyFn,
    onRemove : Ext.emptyFn,
    onDestroy : Ext.emptyFn,

    // @private - Validates item is in the proper place in the dom.
    isValidParent : function(item, target) {
        var dom = item.el ? item.el.dom : Ext.getDom(item);
        return target && (dom.parentNode == (target.dom || target));
    },

    /**
     * @private
     * Iterates over all passed items, enuring they are rendered.  If the items are already rendered,
     * also determines if the items are in the proper place dom.
     */
    renderItems : function(items, target) {
        var ln = items.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item && !item.rendered) {
                this.renderItem(item, i, target);
            }
            else if (!this.isValidParent(item, target)) {
                this.moveItem(item, i, target);
            }
            this.configureItem(item, i);
        }
    },

    /**
     * @private
     * Renders the given Component into the target Element.
     * @param {Ext.Component} c The Component to render
     * @param {Number} position The position within the target to render the item to
     * @param {Ext.Element} target The target Element
     */
    renderItem : function(item, position, target) {
        if (!item.rendered) {
            item.render(target, position);
        }
    },

    /**
     * Returns the target box measurements
     */
    getTargetBox : function() {
        return this.getTarget().getBox(true, true);
    },

    /**
     * @private
     * Moved Component to the provided target instead.
     */
    moveItem : function(item, position, target) {
        if (typeof position == 'number') {
            position = target.dom.childNodes[position];
        }
        // Make sure target is a dom element
        target = target.dom || target;

        target.insertBefore(item.getPositionEl().dom, position || null);

        item.container = target;
        this.configureItem(item, position);
    },

    /**
     * @private
     * Applies extraCls
     */
    configureItem: function(item, position) {
        if (this.extraCls) {
            item.getPositionEl().addClass(this.extraCls);
        }
    },

    /**
     * @private
     * Removes extraCls
     */
    afterRemove : function(item) {
        if (this.extraCls && item.rendered) {
            item.getPositionEl().removeClass(this.extraCls);
        }
    },

    /*
     * Destroys this layout. This is a template method that is empty by default, but should be implemented
     * by subclasses that require explicit destruction to purge event handlers or remove DOM nodes.
     * @protected
     */
    destroy : function() {
        if (!Ext.isEmpty(this.targetCls)) {
            var target = this.owner.getLayoutTarget();
            if (target) {
                target.removeClass(this.targetCls);
            }
        }
        this.onDestroy();
    }
});
