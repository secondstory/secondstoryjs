/**
 * @class String
 * These functions are available on every String object.
 */
Ext.applyIf(String, {
    /**
     * Allows you to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
     * token must be unique, and must increment in the format {0}, {1}, etc.  Example usage:
     * <pre><code>
var cls = 'my-class', text = 'Some text';
var s = String.format('&lt;div class="{0}">{1}&lt;/div>', cls, text);
// s now contains the string: '&lt;div class="my-class">Some text&lt;/div>'
     * </code></pre>
     * @param {String} string The tokenized string to be formatted
     * @param {String} value1 The value to replace token {0}
     * @param {String} value2 Etc...
     * @return {String} The formatted string
     * @static
     */
    format : function(format){
        var args = Ext.toArray(arguments, 1);
        return format.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    }
});

Ext.ns('Ext.lib.Event');

Ext.apply(Ext.lib.Event, {
    resolveTextNode : Ext.isGecko ? function(node){
        if(!node){
            return;
        }
        // work around firefox bug, https://bugzilla.mozilla.org/show_bug.cgi?id=101197
        var s = HTMLElement.prototype.toString.call(node);
        if(s == '[xpconnect wrapped native prototype]' || s == '[object XULElement]'){
            return;
        }
        return node.nodeType == 3 ? node.parentNode : node;
    } : function(node){
        return node && node.nodeType == 3 ? node.parentNode : node;
    },

    getRelatedTarget : function(ev) {
        ev = ev.browserEvent || ev;
        return this.resolveTextNode(ev.relatedTarget ||
                (ev.type == 'mouseout' ? ev.toElement :
                 ev.type == 'mouseover' ? ev.fromElement : null));
    }
});

Ext.override(Ext.TouchEventObjectImpl, {
    /**
     * Gets the related target.
     * @return {HTMLElement}
     */
    getRelatedTarget : function() {
        return this.browserEvent ? Ext.lib.Event.getRelatedTarget(this.browserEvent) : null;
    }
});

Ext.override(Ext.util.MixedCollection, {
    /**
     * Reorders each of the items based on a mapping from old index to new index. Internally this
     * just translates into a sort. The 'sort' event is fired whenever reordering has occured.
     * @param {Object} mapping Mapping from old item index to new item index
     */
    reorder: function(mapping) {
        this.suspendEvents();

        var items     = this.items,
            index     = 0,
            length    = items.length,
            order     = [],
            remaining = [];

        //object of {oldPosition: newPosition} reversed to {newPosition: oldPosition}
        for (oldIndex in mapping) {
            order[mapping[oldIndex]] = items[oldIndex];
        }

        for (index = 0; index < length; index++) {
            if (mapping[index] == undefined) {
                remaining.push(items[index]);
            }
        }

        for (index = 0; index < length; index++) {
            if (order[index] == undefined) {
                order[index] = remaining.shift();
            }
        }

        this.clear();
        this.addAll(order);

        this.resumeEvents();
        this.fireEvent('sort', this);
    },
    
    /**
     * Removes all items from the collection.  Fires the {@link #clear} event when complete.
     */
    clear : function(){
        this.length = 0;
        this.items = [];
        this.keys = [];
        this.map = {};
        // this.fireEvent('clear');
    }
});