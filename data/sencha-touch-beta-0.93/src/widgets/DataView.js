/**
 * @class Ext.DataView
 * @extends Ext.DataPanel
 * A mechanism for displaying data using custom layout templates and formatting. DataView uses an {@link Ext.XTemplate}
 * as its internal templating mechanism, and is bound to an {@link Ext.data.Store}
 * so that as the data in the store changes the view is automatically updated to reflect the changes.  The view also
 * provides built-in behavior for many common events that can occur for its contained items including itemtap, containertap,
 * etc. as well as a built-in selection model. <b>In order to use these features, an {@link #itemSelector}
 * config must be provided for the DataView to determine what nodes it will be working with.</b>
 *
 * <p>The example below binds a DataView to a {@link Ext.data.Store} and renders it into an {@link Ext.Panel}.</p>
 * <pre><code>
var store = new Ext.data.JsonStore({
    url: 'get-images.php',
    root: 'images',
    fields: [
        'name', 'url',
        {name:'size', type: 'float'},
        {name:'lastmod', type:'date', dateFormat:'timestamp'}
    ]
});
store.load();

var tpl = new Ext.XTemplate(
    '&lt;tpl for="."&gt;',
        '&lt;div class="thumb-wrap" id="{name}"&gt;',
        '&lt;div class="thumb"&gt;&lt;img src="{url}" title="{name}"&gt;&lt;/div&gt;',
        '&lt;span class="x-editable"&gt;{shortName}&lt;/span&gt;&lt;/div&gt;',
    '&lt;/tpl&gt;',
    '&lt;div class="x-clear"&gt;&lt;/div&gt;'
);

var panel = new Ext.Panel({
    id:'images-view',
    frame:true,
    width:535,
    autoHeight:true,
    collapsible:true,
    layout:'fit',
    title:'Simple DataView',

    items: new Ext.DataView({
        store: store,
        tpl: tpl,
        autoHeight:true,
        multiSelect: true,
        overClass:'x-view-over',
        itemSelector:'div.thumb-wrap',
        emptyText: 'No images to display'
    })
});
panel.render(Ext.getBody());
   </code></pre>
 * @constructor
 * Create a new DataView
 * @param {Object} config The config object
 * @xtype dataview
 */
Ext.DataView = Ext.extend(Ext.DataPanel, {
    scroll: 'vertical',

    /**
     * @cfg {Boolean} multiSelect
     * True to allow selection of more than one item at a time, false to allow selection of only a single item
     * at a time or no selection at all, depending on the value of {@link #singleSelect} (defaults to false).
     */
    /**
     * @cfg {Boolean} singleSelect
     * True to allow selection of exactly one item at a time, false to allow no selection at all (defaults to false).
     * Note that if {@link #multiSelect} = true, this value will be ignored.
     */
    /**
     * @cfg {String} loadingText
     * A string to display during data load operations (defaults to undefined).  If specified, this text will be
     * displayed in a loading div and the view's contents will be cleared while loading, otherwise the view's
     * contents will continue to display normally until the new data is loaded and the contents are replaced.
     */
    /**
     * @cfg {String} selectedCls
     * A CSS class to apply to each selected item in the view (defaults to 'x-item-selected').
     */
    selectedCls : "x-item-selected",
    /**
     * @cfg {String} selectedCls
     * A CSS class to apply to each selected item in the view (defaults to 'x-item-selected').
     */
    pressedCls : "x-item-pressed",

    /**
     * @cfg {Number} pressedDelay
     * The amount of delay between the tapstart and the moment we add the pressedCls.
     * Settings this to true defaults to 100ms
     */
    pressedDelay: 100,

    /**
     * @cfg {String} emptyText
     * The text to display in the view when there is no data to display (defaults to '').
     */
    emptyText : "",

    /**
     * @cfg {Boolean} deferEmptyText True to defer emptyText being applied until the store's first load
     */
    deferEmptyText: true,

    // @private
    last: false,

    // @private
    initComponent: function() {
        Ext.DataView.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event itemtap
             * Fires when a node is tapped on
             * @param {Ext.DataView} this The DataView object
             * @param {Number} index The index of the item that was tapped
             * @param {Ext.Element} item The item element
             * @param {Ext.EventObject} e The event object
             */
            'itemtap',
            /**
             * @event itemtap
             * Fires when a node is double tapped on
             * @param {Ext.DataView} this The DataView object
             * @param {Number} index The index of the item that was tapped
             * @param {Ext.Element} item The item element
             * @param {Ext.EventObject} e The event object
             */
            'itemdoubletap',
            /**
             * @event containertap
             * Fires when a tap occurs and it is not on a template node.
             * @param {Ext.DataView} this
             * @param {Ext.EventObject} e The raw event object
             */
            "containertap",

            /**
             * @event selectionchange
             * Fires when the selected nodes change.
             * @param {Ext.DataView} this
             * @param {Array} selections Array of the selected nodes
             */
            "selectionchange",

            /**
             * @event beforeselect
             * Fires before a selection is made. If any handlers return false, the selection is cancelled.
             * @param {Ext.DataView} this
             * @param {HTMLElement} node The node to be selected
             * @param {Array} selections Array of currently selected nodes
             */
            "beforeselect"
        );

        this.selected = new Ext.CompositeElementLite();
    },

    // @private
    afterRender: function(){
        Ext.DataView.superclass.afterRender.call(this);

        this.mon(this.getTemplateTarget(), {
            tap: this.onTap,
            tapstart: this.onTapStart,
            tapcancel: this.onTapCancel,
            touchend: this.onTapCancel,
            doubletap: this.onDoubleTap,
            scope: this
        });
    },

    /**
     * Refreshes the view by reloading the data from the store and re-rendering the template.
     */
    refresh: function() {
        if (!this.rendered) {
            return;
        }

        var el = this.getTemplateTarget();
        el.update('');

        this.clearSelections(false, true);
        if (this.store.getRange().length < 1 && (!this.deferEmptyText || this.hasSkippedEmptyText)) {
            el.update(this.emptyText);
        }
        this.hasSkippedEmptyText = true;
        Ext.DataView.superclass.refresh.call(this);
    },

    // @private
    onTap: function(e) {
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if (item) {
            Ext.fly(item).removeClass(this.pressedCls);
            var index = this.indexOf(item);
            if (this.onItemTap(item, index, e) !== false) {
                e.stopEvent();
                this.fireEvent("itemtap", this, index, item, e);
            }
        }
        else {
            if(this.fireEvent("containertap", this, e) !== false) {
                this.onContainerTap(e);
            }
        }
    },

    // @private
    onTapStart: function(e, t) {
        var me = this,
            item = e.getTarget(me.itemSelector, me.getTemplateTarget());

        if (item) {
            if (me.pressedDelay) {
                if (me.pressedTimeout) {
                    clearTimeout(me.pressedTimeout);
                }
                me.pressedTimeout = setTimeout(function() {
                    Ext.fly(item).addClass(me.pressedCls);
                }, Ext.isNumber(me.pressedDelay) ? me.pressedDelay : 100);
            }
            else {
                Ext.fly(item).addClass(me.pressedCls);
            }
        }
    },

    // @private
    onTapCancel: function(e, t) {
        var me = this,
            item = e.getTarget(me.itemSelector, me.getTemplateTarget());

        if (me.pressedTimeout) {
            clearTimeout(me.pressedTimeout);
            delete me.pressedTimeout;
        }

        if (item) {
            Ext.fly(item).removeClass(me.pressedCls);
        }
    },

    // @private
    onContainerTap: function(e) {
        this.clearSelections();
    },

    // @private
    onDoubleTap: function(e) {
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if (item) {
            this.fireEvent("itemdoubletap", this, this.indexOf(item), item, e);
        }
    },

    // @private
    onItemTap: function(item, index, e) {
        if (this.pressedTimeout) {
            clearTimeout(this.pressedTimeout);
            delete this.pressedTimeout;
        }

        if (this.multiSelect) {
            this.doMultiSelection(item, index, e);
            e.preventDefault();
        }
        else if (this.singleSelect) {
            this.doSingleSelection(item, index, e);
            e.preventDefault();
        }
        return true;
    },

    // @private
    doSingleSelection: function(item, index, e) {
        if (this.isSelected(index)) {
            this.deselect(index);
        }
        else {
            this.select(index, false);
        }
    },

    // @private
    doMultiSelection: function(item, index, e) {
        if (this.isSelected(index)) {
            this.deselect(index);
        }
        else {
            this.select(index, true);
        }
    },

    /**
     * Gets the number of selected nodes.
     * @return {Number} The node count
     */
    getSelectionCount: function() {
        return this.selected.getCount();
    },

    /**
     * Gets the currently selected nodes.
     * @return {Array} An array of HTMLElements
     */
    getSelectedNodes: function() {
        return this.selected.elements;
    },

    /**
     * Gets the indexes of the selected nodes.
     * @return {Array} An array of numeric indexes
     */
    getSelectedIndexes: function() {
        var indexes = [],
            s = this.selected.elements,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            indexes.push(s[i].viewIndex);
        }
        return indexes;
    },

    /**
     * Gets an array of the selected records
     * @return {Array} An array of {@link Ext.data.Model} objects
     */
    getSelectedRecords: function() {
        var r = [],
            s = this.selected.elements,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            r[r.length] = this.store.getAt(s[i].viewIndex);
        }
        return r;
    },

    /**
     * Clears all selections.
     * @param {Boolean} suppressEvent (optional) True to skip firing of the selectionchange event
     */
    clearSelections: function(suppressEvent, skipUpdate) {
        if ((this.multiSelect || this.singleSelect) && this.selected.getCount() > 0) {
            if (!skipUpdate) {
                this.selected.removeClass(this.selectedCls);
            }
            this.selected.clear();
            this.last = false;
            if (!suppressEvent) {
                this.fireEvent("selectionchange", this, this.selected.elements, this.getSelectedRecords());
            }
        }
    },

    /**
     * Returns true if the passed node is selected, else false.
     * @param {HTMLElement/Number/Ext.data.Model} node The node, node index or record to check
     * @return {Boolean} True if selected, else false
     */
    isSelected: function(node) {
        return this.selected.contains(this.getNode(node));
    },

    /**
     * Deselects a node.
     * @param {HTMLElement/Number/Record} node The node, node index or record to deselect
     */
    deselect: function(node) {
        if (this.isSelected(node)) {
            node = this.getNode(node);
            this.selected.removeElement(node);
            if (this.last == node.viewIndex) {
                this.last = false;
            }
            Ext.fly(node).removeClass(this.selectedCls);
            this.fireEvent("selectionchange", this, this.selected.elements, []);
        }
    },

    /**
     * Selects a set of nodes.
     * @param {Array/HTMLElement/String/Number/Ext.data.Model} nodeInfo An HTMLElement template node, index of a template node,
     * id of a template node, record associated with a node or an array of any of those to select
     * @param {Boolean} keepExisting (optional) true to keep existing selections
     * @param {Boolean} suppressEvent (optional) true to skip firing of the selectionchange vent
     */
    select: function(nodeInfo, keepExisting, suppressEvent) {
        if (Ext.isArray(nodeInfo)) {
            if(!keepExisting){
                this.clearSelections(true);
            }
            for (var i = 0, len = nodeInfo.length; i < len; i++) {
                this.select(nodeInfo[i], true, true);
            }
            if (!suppressEvent) {
                this.fireEvent("selectionchange", this, this.selected.elements, this.getSelectedRecords());
            }
        } else{
            var node = this.getNode(nodeInfo);
            if (!keepExisting) {
                this.clearSelections(true);
            }
            if (node && !this.isSelected(node)) {
                if (this.fireEvent("beforeselect", this, node, this.selected.elements) !== false) {
                    Ext.fly(node).addClass(this.selectedCls);
                    this.selected.add(node);
                    this.last = node.viewIndex;
                    if (!suppressEvent) {
                        this.fireEvent("selectionchange", this, this.selected.elements, this.getSelectedRecords());
                    }
                }
            }
        }
    },

    /**
     * Selects a range of nodes. All nodes between start and end are selected.
     * @param {Number} start The index of the first node in the range
     * @param {Number} end The index of the last node in the range
     * @param {Boolean} keepExisting (optional) True to retain existing selections
     */
    selectRange: function(start, end, keepExisting) {
        if (!keepExisting) {
            this.clearSelections(true);
        }
        this.select(this.getNodes(start, end), true);
    },

    // @private
    onBeforeLoad: function() {
        if (this.loadingText) {
            this.clearSelections(false, true);
            this.getTemplateTarget().update('<div class="loading-indicator">'+this.loadingText+'</div>');
            this.all.clear();
        }
    },

    // @private
    onDestroy: function() {
        this.selected.clear();
        Ext.DataView.superclass.onDestroy.call(this);
    }
});

/**
 * Changes the data store bound to this view and refreshes it. (deprecated in favor of bindStore)
 * @param {Store} store The store to bind to this view
 */
Ext.DataView.prototype.setStore = Ext.DataView.prototype.bindStore;

Ext.reg('dataview', Ext.DataView);
