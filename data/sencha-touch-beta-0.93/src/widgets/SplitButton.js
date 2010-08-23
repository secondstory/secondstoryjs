/**
 * @class Ext.SplitButton
 * @extends Ext.Container
 * <p>SplitButton is a container for a group of {@link Ext.Button}s. Example usage:</p>
 * <pre><code>
var splitBtn = new Ext.SplitButton({
    allowMultiple: true,
    items: [{
        text: 'Option 1',
        active: true,
        handler: tapMe
    },{
        text: 'Option 2',
        active: true,
        handler: tapMe
    },{
        text: 'Option 3',
        handler: tapMe
    }]
});</code></pre>
 * @constructor
 * @param {Object} config The config object
 * @xtype splitbutton
 */
Ext.SplitButton = Ext.extend(Ext.Container, {
    defaultType: 'button',

    cmpCls: 'x-splitbutton',
    activeCls: 'x-button-active',

    /**
     * @cfg {Boolean} allowMultiple
     * Allow multiple active buttons (defaults to false).
     */
    allowMultiple: false,
    // XXX unused
    //allowNone: false,

    // @private
    initComponent : function() {
        this.layout = {
            type: 'hbox',
            align: 'stretch'
        };

        Ext.SplitButton.superclass.initComponent.call(this);
    },

    // @private
    afterRender : function() {
        Ext.SplitButton.superclass.afterRender.call(this);

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });
    },

    // @private
    afterLayout : function(layout) {
        Ext.SplitButton.superclass.afterLayout.call(this, layout);

        if (!this.initialized) {
            this.items.each(function(item) {
                if (item.active) {
                    this.setActive(item);
                }
            }, this);
            this.initialized = true;
        }
    },

    // @private
    onTap : function(e, t) {
        t = e.getTarget('.x-button');

        if (t && !this.disabled) {
            this.setActive(Ext.getCmp(t.id));
        }
    },

    /**
     * Gets the active button(s)
     * @returns {Array/Button} The active button or an array of active buttons (if allowMultiple is true)
     */
    getActive : function() {
        return this.allowMultiple ? this.activeButtons : this.activeButton;
    },

    /**
     * Activates a button
     * @param {Number/String/Button} position/id/button. The button to activate.
     * If allowMultiple is true, then setActive will toggle the button state.
     */
    setActive : function(btn) {
        if (Ext.isNumber(btn)) {
            btn = this.items.get(btn);
        }
        else if (Ext.isString(btn)) {
            btn = Ext.getCmp(btn);
        }
        else if (!btn.isButton) {
            btn = null;
        }

        if (this.allowMultiple) {
            this.activeButtons = this.activeButtons || [];
            if (btn) {
                var idx = this.activeButtons.indexOf(btn);
                if (idx == -1) {
                    this.activeButtons.push(btn);
                    btn.el.addClass(this.activeCls);
                } else {
                    this.activeButtons.splice(idx,1);
                    btn.el.removeClass(this.activeCls);
                }
            }
        }
        else {
            this.activeButton = btn;
            if (this.activeButton) {
                btn.el.radioClass(this.activeCls);
            }
        }
    },

    /**
     * Disables all buttons
     */
    disable : function() {
        this.items.each(function(item) {
            item.disable();
        }, this);

        Ext.SplitButton.superclass.disable.apply(this, arguments);
    },

    /**
     * Enables all buttons
     */
    enable : function() {
        this.items.each(function(item) {
            item.enable();
        }, this);

        Ext.SplitButton.superclass.enable.apply(this, arguments);
    }
});

Ext.reg('splitbutton', Ext.SplitButton);
