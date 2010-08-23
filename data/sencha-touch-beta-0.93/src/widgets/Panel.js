/**
 * @class Ext.Panel
 * @extends Ext.Container
 * <p>Panel is a container that has specific functionality and structural components that make
 * it the perfect building block for application-oriented user interfaces.</p>
 * <p>Panels are, by virtue of their inheritance from {@link Ext.Container}, capable
 * of being configured with a {@link Ext.Container#layout layout}, and containing child Components.</p>
 * <p>When either specifying child {@link Ext.Component#items items} of a Panel, or dynamically {@link Ext.Container#add adding} Components
 * to a Panel, remember to consider how you wish the Panel to arrange those child elements, and whether
 * those child elements need to be sized using one of Ext's built-in <code><b>{@link Ext.Container#layout layout}</b></code> schemes. By
 * default, Panels use the {@link Ext.layout.ContainerLayout ContainerLayout} scheme. This simply renders
 * child components, appending them one after the other inside the Container, and <b>does not apply any sizing</b>
 * at all.</p>
 * @param {Object} config The config object
 *
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    dockedItems: [{
        dock: 'top',
        xtype: 'toolbar',
        title: 'Standard Titlebar'
    },{
        dock: 'top',
        xtype: 'toolbar',
        type: 'light',
        items: [{
            text: 'Test Button'
        }]
    }],
    html: 'Testing'
});</code></pre>
 * @xtype panel
 */
Ext.Panel = Ext.extend(Ext.Container, {
    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to this panel's element (defaults to <code>'x-panel'</code>).
     */
    baseCls : 'x-panel',

    /**
     * @cfg {Number/String} padding
     * A shortcut for setting a padding style on the body element. The value can either be
     * a number to be applied to all sides, or a normal css string describing padding.
     * Defaults to <tt>undefined</tt>.
     */
    padding: undefined,

    // inherited
    scroll: false,

    /**
     * @cfg {Boolean} fullscreen
     * Force the component to take up 100% width and height available. Defaults to false.
     * Setting this configuration immediately sets the monitorOrientation config to true.
     */
    fullscreen: false,

    isPanel: true,
    componentLayout: 'dock',

    renderTpl: [
        '<div <tpl if="id">id="{id}"</tpl> class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<div class="{baseCls}-body"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>',
        '</div>'
    ],

    /**
     * @cfg {Object/Array} dockedItems
     * A component or series of components to be added as docked items to this panel.
     * The docked items can be docked to either the top, right, left or bottom of a panel.
     * This is typically used for things like toolbars or tab bars:
     * <pre><code>
var panel = new Ext.Panel({
    fullscreen: true,
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            text: 'Docked to the bottom'
        }]
    }]
});</pre></code>
     */

    initComponent : function() {
        Ext.Panel.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event bodyresize
             * Fires after the Panel has been resized.
             * @param {Ext.Panel} p the Panel which has been resized.
             * @param {Number} width The Panel body's new width.
             * @param {Number} height The Panel body's new height.
             */
            'bodyresize',
            // inherited
            'activate',
            // inherited
            'deactivate'
        );
    },

    // @private
    initItems : function() {
        Ext.Panel.superclass.initItems.call(this);

        var items = this.dockedItems;
        this.dockedItems = new Ext.util.MixedCollection(false, this.getComponentId);
        if (items) {
            this.addDocked(items);
        }
    },

    // @private
    onRender : function(ct, position) {
        var bodyStyle = [],
            undefined;

        if (this.padding != undefined) {
            bodyStyle.push('padding: ' + Ext.Element.parseBox((this.padding === true) ? 5 : this.padding));
        }
        if (this.margin != undefined) {
            bodyStyle.push('margin: ' + Ext.Element.parseBox((this.margin === true) ? 1 : this.margin));
        }
        if (this.border != undefined) {
            bodyStyle.push('border-width: ' + Ext.Element.parseBox((this.border === true) ? 1 : this.border));
        }

        Ext.applyIf(this.renderData, {
            bodyStyle: bodyStyle.length ? bodyStyle.join(';') : undefined
        });
        Ext.applyIf(this.renderSelectors, {
            body: ':first-child'
        });
        Ext.Panel.superclass.onRender.call(this, ct, position);
    },

    /**
     * Adds docked item(s) to the panel.
     * @param {Object/Array} component. The Component or array of components to add. The components
     * must include a 'dock' paramater on each component to indicate where it should be docked ('top', 'right',
     * 'bottom', 'left').
     * @param {Number} pos (optional) The index at which the Component will be added
     */
    addDocked : function(items, pos) {
        items = this.prepareItems(items);

        var item, i, ln;
        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            if (pos !== undefined) {
                this.dockedItems.insert(pos+i, item);
            }
            else {
                this.dockedItems.add(item);
            }
            item.onAdded(this, i);
            this.onDockedAdd(item);
        }
        if (this.rendered) {
            this.doComponentLayout();
        }
    },

    // Placeholder empty functions
    onDockedAdd : Ext.emptyFn,
    onDockedRemove : Ext.emptyFn,

    /**
     * Inserts docked item(s) to the panel at the indicated position.
     * @param {Object/Array} component. The Component or array of components to add. The components
     * must include a 'dock' paramater on each component to indicate where it should be docked ('top', 'right',
     * 'bottom', 'left').
     * @param {Number} pos The index at which the Component will be inserted
     */
    insertDocked : function(pos, items) {
        this.addDocked(items, pos);
    },

    /**
     * Removes the docked item from the panel.
     * @param {Ext.Component} item. The Component to remove.
     * @param {Boolean} autoDestroy (optional) Destroy the component after removal.
     */
    removeDocked : function(item, autoDestroy) {
        if (!this.dockedItems.contains(item)) {
            return item;
        }

        var layout = this.componentLayout,
            hasLayout = layout && this.rendered;

        if (hasLayout) {
            layout.onRemove(item);
        }

        this.dockedItems.remove(item);
        item.onRemoved();
        this.onDockedRemove(item);

        if (autoDestroy === true || (autoDestroy !== false && this.autoDestroy)) {
            item.destroy();
        }

        if (hasLayout) {
            layout.afterRemove(item);
        }

        if (this.rendered) {
            this.doComponentLayout();
        }

        return item;
    },

    /**
     * Retrieve an array of all currently docked components.
     * @returns {Array} An array of components.
     */
    getDockedItems : function() {
        if (this.dockedItems && this.dockedItems.items.length) {
            return this.dockedItems.items.slice();
        }
        return [];
    },

    /**
     * <p>Returns the Element to be used to contain the child Components of this Container.</p>
     * <p>An implementation is provided which returns the Container's {@link #getEl Element}, but
     * if there is a more complex structure to a Container, this may be overridden to return
     * the element into which the {@link #layout layout} renders child Components.</p>
     * @return {Ext.Element} The Element to render child Components into.
     */
    getLayoutTarget : function(){
        return this.body;
    },

    // @private
    getContentTarget : function() {
        return this.body;
    },

    // @private
    getTargetSize : function() {
        var ret = this.body.getViewSize();
        ret.width  -= this.body.getPadding('lr');
        ret.height -= this.body.getPadding('tb');
        return ret;
    }
});

Ext.reg('panel', Ext.Panel);
