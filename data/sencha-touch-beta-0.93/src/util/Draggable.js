/**
 * @class Ext.util.Draggable
 * @extends Ext.util.Observable
 *
 *
 */

Ext.util.Draggable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-draggable',
    dragCls: 'x-dragging',
    proxyCls: 'x-draggable-proxy',

    /**
     * @cfg {String} direction
     * Possible values: 'vertical', 'horizontal', or 'both'
     * Defaults to 'both'
     */
    direction: 'both',

    /**
     * @cfg {Number} delay
     * How many milliseconds a user must hold the draggable before starting a
     * drag operation. Defaults to 0 or immediate.
     */
    delay: 0,

    /**
     * @cfg {String} cancelSelector
     * A simple CSS selector that represents elements within the draggable
     * that should NOT initiate a drag.
     */
    cancelSelector: null,

    /**
     * @cfg {Boolean} disabled
     */
    disabled: false,

    /**
     * @cfg {Boolean} revert
     */
    revert: false,

    /**
     * @cfg {Element} constrain
     */
    constrain: window,

    /**
     * @cfg {String} group
     * Draggable and Droppable objects can participate in a group which are
     * capable of interacting. Defaults to 'base'
     */
    group: 'base',

    // not implemented yet.
    grid: null,
    snap: null,
    proxy: null,
    stack: false,


    // Properties
    /**
     * Read-only Property representing the region that the Draggable
     * is constrained to.
     * @type Ext.util.Region
     */
    constrainRegion: null,

    /**
     * Read-only Property representing whether or not the Draggable is currently
     * dragging or not.
     * @type Boolean
     */
    dragging: false,

    /**
     * Read-only value representing whether the Draggable can be moved vertically.
     * This is automatically calculated by Draggable by the direction configuration.
     * @type Boolean
     */
    vertical: false,

    /**
     * Read-only value representing whether the Draggable can be moved horizontally.
     * This is automatically calculated by Draggable by the direction configuration.
     * @type Boolean
     */
    horizontal: false,

    /**
     * The amount of pixels you have to move before the drag operation starts.
     * Defaults to 0.
     * @type Number
     */
    threshold: 0,

    /**
     * @constructor
     * @param {Mixed} el String, HtmlElement or Ext.Element representing an
     * element on the page.
     * @param {Object} config Configuration options for this class.
     */
    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event dragstart
             * @param {Ext.Draggable} this
             * @param {Ext.EventObject} e
             */
            'dragstart',
            'beforedragend',
            /**
             * @event dragend
             * @param {Ext.Draggable} this
             * @param {Ext.EventObject} e
             */
            'dragend',
            /**
             * @event drag
             * @param {Ext.Draggable} this
             * @param {Ext.EventObject} e
             */
            'drag'
        );

        this.el = Ext.get(el);

        Ext.util.Draggable.superclass.constructor.call(this);

        if (this.direction == 'both') {
            this.horizontal = true;
            this.vertical = true;
        }
        else if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else {
            this.vertical = true;
        }

        this.el.addClass(this.baseCls);

        this.tapEvent = (this.delay > 0) ? 'taphold' : 'tapstart';

        this.initialRegion = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };
        
        if (!this.disabled) {
            this.enable();
        }
    },

    // @private
    onTapEvent : function(e, t) {
        if (Ext.platform.isAndroidOS) {
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
        }

        if (this.cancelSelector && e.getTarget(this.cancelSelector)) {
            return;
        }
        if (!this.dragging && (e.type === 'tapstart' || e.deltaTime >= this.delay)) {
            this.canDrag = true;
        }
    },

    // @private
    prepareDrag : function(e) {
        this.reset();

        if (this.constrain) {
            if (this.constrain === window) {
                var w = window.innerWidth,
                    h = window.innerHeight;
                this.constrainRegion = new Ext.util.Region(0, w, h, 0);
            }
            else {
                this.constrainRegion = Ext.fly(this.constrain).getPageBox(true);
            }
        }

        this.startRegion = this.getProxyEl().getPageBox(true);

        this.offsetToCorner = {
            x: e.pageX - this.startRegion.left,
            y: e.pageY - this.startRegion.top
        };
    },

    // @private
    onDragStart : function(e) {
        this.prepareDrag(e);

        if (!this.dragging) {
            this.el.addClass(this.dragCls);
            this.dragging = true;
            this.fireEvent('dragstart', this, e);
        }
    },

    // @private
    onTouchMove : function(e) {
        e.stopEvent();

        if (!this.canDrag) {
            return;
        }

        if (!this.dragging) {
            if (Math.abs(e.deltaX) >= this.threshold || Math.abs(e.deltaY) >= this.threshold) {
                this.onDragStart(e);
            }
            else {
                return;
            }
        }

        var x = 0,
            y = 0,
            initialRegion = this.initialRegion,
            constrainRegion = this.constrainRegion;

        if (this.horizontal) {
            x = e.pageX - this.initialRegion.left - this.offsetToCorner.x;
        }
        if (this.vertical) {
            y = e.pageY - this.initialRegion.top - this.offsetToCorner.y;
        }

        if (this.constrain) {
            if (initialRegion.left + x < constrainRegion.left) {
                x = constrainRegion.left - initialRegion.left;
            }
            if (initialRegion.right + x > constrainRegion.right) {
                x = constrainRegion.right - initialRegion.right;
            }
            if (initialRegion.top + y < constrainRegion.top) {
                y = constrainRegion.top - initialRegion.top;
            }
            if (initialRegion.bottom + y > constrainRegion.bottom) {
                y = constrainRegion.bottom - initialRegion.bottom;
            }
        }

        this.transformTo(x, y);
        this.fireEvent('drag', this, e);
    },

    // @private
    transformTo : function(x, y) {
        var proxyEl       = this.getProxyEl(),
            initialRegion = this.initialRegion,
            startPos      = this.startPosition || {x: 0, y: 0};

        proxyEl.dom.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';

        this.transform = {x: x, y: y};
        this.position = {
            x: startPos.x + x,
            y: startPos.y + y
        };

        this.region = new Ext.util.Region(
            initialRegion.top + y,
            initialRegion.right + x,
            initialRegion.bottom + y,
            initialRegion.left + x
        );
    },

    /**
     * @private
     * moveTo is used to absolute page co-ordinates
     * @param x {Number}
     * @param y {Number}
     */
    moveTo : function(x, y) {
        this.transformTo(x - this.initialRegion.left, y - this.initialRegion.top);
    },

    /**
     * @private
     * Resets an element back to where it initially started dragging.
     * Note, a drag must be initiated before you can call this method.
     */
    reset : function() {
        var proxyEl = this.getProxyEl();

        this.startPosition = this.position = {
            x: proxyEl.getLeft() || 0,
            y: proxyEl.getTop() || 0
        };
        this.transformTo(0, 0);
        this.initialRegion = this.region = proxyEl.getPageBox(true);
        this.transform = {x: 0, y: 0};
    },

    // @private
    onTouchEnd : function(e) {
        this.canDrag = false;
        this.dragging = false;
        this.fireEvent('beforedragend', this, e);
        var proxyEl = this.getProxyEl();

        if (this.revert && !this.cancelRevert && this.transform) {
            new Ext.Anim({
                from: {
                    '-webkit-transform': 'translate3d(' + this.transform.x + 'px, ' + this.transform.y + 'px, 0px)'
                },
                to: {
                    '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                },
                duration: 200
            }).run(proxyEl);
        }
        else if (this.transform) {
            var style    = proxyEl.dom.style,
                position = this.position;

            style.webkitTransform = null;
            style.left = position.x + 'px';
            style.top = position.y + 'px';
        }

        this.transform = this.startPosition = null;
        this.el.removeClass(this.dragCls);
        this.fireEvent('dragend', this, e);
    },

    /**
     * Enable dragging.
     * This is invoked immediately after constructing a Draggable, if the
     * disabled parameter is NOT set to true.
     */
    enable : function() {
        this.el.on(this.tapEvent, this.onTapEvent, this, {
            horizontal: this.horizontal,
            vertical  : this.vertical
        });

        this.el.on({
            touchmove: this.onTouchMove,
            touchend: this.onTouchEnd,
            scope: this
        });

        this.disabled = false;
    },

    /**
     * Disable dragging.
     */
    disable : function() {
        this.el.un(this.tapEvent, this.onTapEvent, this);
        this.disabled = true;
    },

    /**
     * Remove the draggable functionality from the bound element.
     */
    destroy : function() {
        this.el.removeClass(this.baseCls);
        this.purgeListeners();
        this.el.un(this.tapEvent, this.onTapEvent, this);
        this.el.un({
            touchmove: this.onTouchMove,
            touchend: this.onTouchEnd,
            scope: this
        });
    },

    /**
     * @returns {Ext.Element}
     * Returns the Proxy element
     */
    getProxyEl: function() {
        return this.proxy || this.el;
    }
});
