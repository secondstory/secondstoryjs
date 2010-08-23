/**
 * @class Ext.Button
 * @extends Ext.Component
 *
 * A simple button class
 *
 * <pre><code>
var buttons = [
    {text: 'Back', ui: 'back', handler: tapMe},
    {text: 'Default', handler: tapMe},
    {text: 'Round', ui: 'round', handler: tapMe},
    {xtype: 'spacer'},
    {text: 'Action', ui: 'action', handler: tapMe},
    {text: 'Forward', ui: 'forward', handler: tapMe}
];

var toolbar1 = new Ext.Toolbar({
    dock: 'top',
    title: 'Toolbar',
    items: buttons
});</code></pre>
 */

/**
 * @constructor
 * Create a new button
 * @param {Object} config The config object
 * @xtype button
 */
Ext.Button = Ext.extend(Ext.Component, {
    /**
     * Read-only. True if this button is hidden
     * @type Boolean
     */
    hidden : false,
    /**
     * Read-only. True if this button is disabled
     * @type Boolean
     */
    disabled : false,

    /**
     * @cfg {String} iconCls
     * A css class which sets a background image to be used as the icon for this button
     */

    /**
     * @cfg {String} pressEvent
     * The DOM event that will fire the handler of the button. This can be any valid event name.
     * Defaults to <tt>'tap'</tt>.
     */
    pressEvent : 'tap',


    /**
     * @cfg {String} text The button text to be used as innerHTML (html tags are accepted)
     */

    /**
     * @cfg {String} icon The path to an image to display in the button (the image will be set as the background-image
     * CSS property of the button by default, so if you want a mixed icon/text button, set cls:'x-btn-text-icon')
     */

    /**
     * @cfg {Function} handler A function called when the button is clicked (can be used instead of click event).
     * The handler is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>b</code> : Button<div class="sub-desc">This Button.</div></li>
     * <li><code>e</code> : EventObject<div class="sub-desc">The click event.</div></li>
     * </ul></div>
     */

    /**
     * @cfg {Object} scope The scope (<tt><b>this</b></tt> reference) in which the
     * <code>{@link #handler}</code> and <code>{@link #toggleHandler}</code> is
     * executed. Defaults to this Button.
     */

    /**
     * @cfg {Boolean} hidden True to start hidden (defaults to false)
     */

    /**
     * @cfg {Boolean} disabled True to start disabled (defaults to false)
     */

    baseCls: 'x-button',

    pressedCls: 'x-button-pressed',
    
    /**
     * @cfg {String} badgeText The text to be used for a small badge on the button.
     * Defaults to <tt>''</tt>.
     */
    badgeText: '',

    badgeCls: 'x-badge',

    hasBadgeCls: 'x-hasbadge',

    labelCls: 'x-button-label',
    
    /**
     * @cfg {String} ui
     * Determines the UI look and feel of the button. Valid options are 'normal', 'back', 'round', 'action', 'forward'.
     * Defaults to 'normal'.
     */
    ui: 'normal',

    isButton: true,

    /**
     * @cfg {String} cls
     * A CSS class string to apply to the button's main element.
     */

    /**
     * @cfg {Number} pressedDelay
     * The amount of delay between the tapstart and the moment we add the pressedCls.
     * Settings this to true defaults to 100ms
     */
    pressedDelay: 0,

    // @private
    afterRender : function(ct, position) {
        this.mon(this.el, this.pressEvent, this.onPress, this);
        this.mon(this.el, 'tapstart', this.onTapStart, this);
        this.mon(this.el, 'tapcancel', this.onTapCancel, this);

        Ext.Button.superclass.afterRender.call(this, ct, position);

        var text = this.text,
            icon = this.icon,
            iconCls = this.iconCls,
            badgeText = this.badgeText;

        this.text = this.icon = this.iconCls = this.badgeText = null;

        this.setText(text);
        this.setIcon(icon);
        this.setIconClass(iconCls);
        this.setBadge(badgeText);
    },

    // @private
    onTapStart : function() {
        if (!this.disabled) {
            var me = this;
            if (me.pressedDelay) {
                me.pressedTimeout = setTimeout(function() {
                    me.el.addClass(me.pressedCls);
                }, Ext.isNumber(me.pressedDelay) ? me.pressedDelay : 100);
            }
            else {
                me.el.addClass(me.pressedCls);
            }
        }
    },

    // @private
    onTapCancel : function() {
        if (this.pressedTimeout) {
            clearTimeout(this.pressedTimeout);
            delete this.pressedTimeout;
        }
        this.el.removeClass(this.pressedCls);
    },

    /**
     * Assigns this Button's click handler
     * @param {Function} handler The function to call when the button is clicked
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the handler function is executed.
     * Defaults to this Button.
     * @return {Ext.Button} this
     */
    setHandler : function(handler, scope) {
        this.handler = handler;
        this.scope = scope;
        return this;
    },

    /**
     * Sets this Button's text
     * @param {String} text The button text. If you pass null or undefined the text will be removed.
     * @return {Ext.Button} this
     */
    setText : function(text) {
        if (this.rendered) {
            if (!this.textEl && text) {
                this.textEl = this.el.createChild({
                    tag: 'span',
                    html: text,
                    cls: this.labelCls
                });
            }
            else if (this.textEl && text != this.text) {
                if (text) {
                    this.textEl.setHTML(text);
                }
                else {
                    this.textEl.remove();
                    this.textEl = null;
                }
            }
        }
        this.text = text;
        return this;
    },

    /**
     * Sets the background image (inline style) of the button.  This method also changes
     * the value of the {@link icon} config internally.
     * @param {String} icon The path to an image to display in the button. If you pass null or undefined the icon will be removed.
     * @return {Ext.Button} this
     */
    setIcon : function(icon) {
        if (this.rendered) {
            if (!this.iconEl && icon) {
                this.iconEl = this.el.createChild({
                    tag: 'img',
                    src: Ext.BLANK_IMAGE_URL,
                    style: 'background-image: ' + (icon ? 'url(' + icon + ')' : '')
                });
            }
            else if (this.iconEl && icon != this.icon) {
                if (icon) {
                    this.iconEl.setStyle('background-image', icon ? 'url(' + icon + ')' : '');
                }
                else {
                    this.iconEl.remove();
                    this.iconEl = null;
                }
            }
        }
        this.icon = icon;
        return this;
    },

    /**
     * Sets the CSS class that provides a background image to use as the button's icon.  This method also changes
     * the value of the {@link iconCls} config internally.
     * @param {String} cls The CSS class providing the icon image. If you pass null or undefined the iconCls will be removed.
     * @return {Ext.Button} this
     */
    setIconClass : function(cls) {
        if (this.rendered) {
            if (!this.iconEl && cls) {
                this.iconEl = this.el.createChild({
                    tag: 'img',
                    src: Ext.BLANK_IMAGE_URL,
                    cls: cls
                });
            }
            else if (this.iconEl && cls != this.iconCls) {
                if (cls) {
                    if (this.iconCls) {
                        this.iconEl.removeClass(this.iconCls);
                    }
                    this.iconEl.addClass(cls);
                }
                else {
                    this.iconEl.remove();
                    this.iconEl = null;
                }
            }
        }
        this.iconCls = cls;
        return this;
    },

    /**
     * Creates a badge overlay on the button for displaying notifications.
     * @param {String} text The text going into the badge. If you pass null or undefined the badge will be removed.
     * @return {Ext.Button} this
     */
    setBadge : function(text) {
        if (this.rendered) {
            if (!this.badgeEl && text) {
                this.badgeEl = this.el.createChild({
                    tag: 'span',
                    cls: this.badgeCls,
                    html: text
                });
                this.el.addClass(this.hasBadgeCls);
            }
            else if (this.badgeEl && text != this.badgeText) {
                if (text) {
                    this.badgeEl.setHTML(text);
                    this.el.addClass(this.hasBadgeCls);
                }
                else {
                    this.badgeEl.remove();
                    this.badgeEl = null;
                    this.el.removeClass(this.hasBadgeCls);
                }
            }
        }
        this.badgeText = text;
        return this;
    },

    /**
     * Gets the text for this Button
     * @return {String} The button text
     */
    getText : function() {
        return this.text;
    },

    /**
     * Gets the text for this Button's badge
     * @return {String} The button text
     */
    getBadgeText : function() {
        return this.badgeText;
    },

    // @private
    onDisable : function() {
        this.onDisableChange(true);
    },

    // @private
    onEnable : function() {
        this.onDisableChange(false);
    },

    // @private
    onDisableChange : function(disabled) {
        if (this.el) {
            this.el[disabled ? 'addClass' : 'removeClass'](this.disabledClass);
            this.el.dom.disabled = disabled;
        }
        this.disabled = disabled;
    },

    // @private
    onPress : function(e) {
        if (!this.disabled) {
            this.onTapCancel();
            if(this.handler) {
                this.handler.call(this.scope || this, this, e);
            }
        }
    }
});

Ext.reg('button', Ext.Button);
