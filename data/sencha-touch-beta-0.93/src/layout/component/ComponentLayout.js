/**
* @class Ext.layout.ComponentLayout
* @extends Ext.layout.Layout
* <p>This class is intended to be extended or created via the <tt><b>{@link Ext.Component#componentLayout layout}</b></tt>
* configuration property.  See <tt><b>{@link Ext.Component#componentLayout}</b></tt> for additional details.</p>
*/
Ext.layout.ComponentLayout = Ext.extend(Ext.layout.Layout, {
    // @private
    onLayout : function(owner, target, args) {
        var layout = owner.layout;
        owner.afterComponentLayout(this);

        // Run the container layout if it exists (layout for child items)
        if(layout && typeof layout.layout == 'function') {
            layout.layout();
        }
    },

    // @private - Returns empty array
    getLayoutItems : function() {
        return [];
    },

    /**
    * Returns the owner component's resize element.
    * @return {Ext.Element}
    */
    getTarget : function() {
        return this.owner.getResizeEl();
    },

    /**
    * Set the size of the target element.
    * @param {Mixed} width The new width to set.
    * @param {Mixed} height The new height to set.
    */
    setTargetSize : function(w, h) {
        var target = this.getTarget();

        if (w !== undefined && h !== undefined) {
            target.setSize(w, h);
        }
        else if (h !== undefined) {
            target.setHeight(h);
        }
        else if (w !== undefined) {
            target.setWidth(w);
        }
    }
});