/**
 * @class Ext.Component
 * @extends Ext.util.Observable
 * <p>Base class for all Ext components.  All subclasses of Component may participate in the automated
 * Ext component lifecycle of creation, rendering and destruction which is provided by the {@link Ext.Container Container} class.
 * Components may be added to a Container through the {@link Ext.Container#items items} config option at the time the Container is created,
 * or they may be added dynamically via the {@link Ext.Container#add add} method.</p>
 * <p>The Component base class has built-in support for basic hide/show and enable/disable behavior.</p>
 * <p>All Components are registered with the {@link Ext.ComponentMgr} on construction so that they can be referenced at any time via
 * {@link Ext#getCmp}, passing the {@link #id}.</p>
 * <p>All user-developed visual widgets that are required to participate in automated lifecycle and size management should subclass Component (or
 * {@link Ext.BoxComponent} if managed box model handling is required, ie height and width management).</p>
 * <p>See the <a href="http://extjs.com/learn/Tutorial:Creating_new_UI_controls">Creating new UI controls</a> tutorial for details on how
 * and to either extend or augment ExtJs base classes to create custom Components.</p>
 * <p>Every component has a specific xtype, which is its Ext-specific type name, along with methods for checking the
 * xtype like {@link #getXType} and {@link #isXType}. This is the list of all valid xtypes:</p>
 * <pre>
xtype            Class
-------------    ------------------
button           {@link Ext.Button}
component        {@link Ext.Component}
container        {@link Ext.Container}
dataview         {@link Ext.DataView}
panel            {@link Ext.Panel}
slider           {@link Ext.form.Slider}
toolbar          {@link Ext.Toolbar}
spacer           {@link Ext.Spacer}
tabpanel         {@link Ext.TabPanel}

Form components
---------------------------------------
form             {@link Ext.form.FormPanel}
checkbox         {@link Ext.form.Checkbox}
select           {@link Ext.form.Select}
field            {@link Ext.form.Field}
fieldset         {@link Ext.form.FieldSet}
hidden           {@link Ext.form.Hidden}
numberfield      {@link Ext.form.NumberField}
radio            {@link Ext.form.Radio}
textarea         {@link Ext.form.TextArea}
textfield        {@link Ext.form.TextField}

Store xtypes
---------------------------------------
store            {@link Ext.data.Store}
arraystore       {@link Ext.data.ArrayStore}
jsonstore        {@link Ext.data.JsonStore}
xmlstore         {@link Ext.data.XmlStore}
</pre>
 * @constructor
 * @param {Ext.Element/String/Object} config The configuration options may be specified as either:
 * <div class="mdetail-params"><ul>
 * <li><b>an element</b> :
 * <p class="sub-desc">it is set as the internal element and its id used as the component id</p></li>
 * <li><b>a string</b> :
 * <p class="sub-desc">it is assumed to be the id of an existing element and is used as the component id</p></li>
 * <li><b>anything else</b> :
 * <p class="sub-desc">it is assumed to be a standard config object and is applied to the component</p></li>
 * </ul></div>
 * @xtype component
 */
Ext.Component = Ext.extend(Ext.util.Observable, {
    /**
     * @cfg {Boolean} disabled
     * Defaults to false.
     */
    disabled: false,

    /**
     * @cfg {Boolean} hidden
     * Defaults to false.
     */
    hidden: false,

    /**
     * @cfg {Mixed} renderTpl
     * <p>An {@link Ext.XTemplate XTemplate} used to create the {@link #getEl Element} which will
     * encapsulate this Component.</p>
     * <p>You do not normally need to specify this. For the base classes {@link Ext.Component}, {@link Ext.Component},
     * and {@link Ext.Container}, this defaults to <b><tt>'div'</tt></b>. The more complex Ext classes use a more complex
     * DOM structure.</p>
     * <p>This is intended to allow the developer to create application-specific utility Components encapsulated by
     * different DOM elements.
     */
     renderTpl: [
         '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>"<tpl if="style"> style="{style}"</tpl>></div>'
     ],

    /**
     * @cfg {String} disabledClass
     * CSS class to add when the Component is disabled. Defaults to 'x-item-disabled'.
     */
    disabledClass: 'x-item-disabled',

    /**
     * @cfg {String} styleHtmlContent
     * True to automatically style the html inside the content target of this component (body for panels).
     * Defaults to false.
     */
    styleHtmlContent: false,

    // @private
    allowDomMove: true,
    autoShow: false,

    /**
     * Read-only property indicating whether or not the component has been rendered.
     * @property rendered
     * @type {Boolean}
     */
    rendered: false,

    /**
     * @cfg {Mixed} tpl
     * An <bold>{@link Ext.Template}</bold>, <bold>{@link Ext.XTemplate}</bold>
     * or an array of strings to form an Ext.XTemplate.
     * Used in conjunction with the <code>{@link #data}</code> and
     * <code>{@link #tplWriteMode}</code> configurations.
     */

    /**
     * @cfg {String} tplWriteMode The Ext.(X)Template method to use when
     * updating the content area of the Component. Defaults to <tt>'overwrite'</tt>
     * (see <code>{@link Ext.XTemplate#overwrite}</code>).
     */
    tplWriteMode: 'overwrite',
    bubbleEvents: [],
    isComponent: true,
    autoRender: true,

    // @private
    actionMode: 'el',
    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to this panel's element (defaults to <code>'x-panel'</code>).
     * <p>Another option available by default is to specify <code>'x-plain'</code> which strips all styling
     * except for required attributes for Ext layouts to function (e.g. overflow:hidden).
     * See <code>{@link #unstyled}</code> also.</p>
     */
    baseCls: 'x-component',
    monPropRe: /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/,
    domEventsRe: /^(?:tap|doubletap|pinch|unpich|swipe|swipeleft|swiperight|scroll|scrollstart|scrollend|touchstart|touchmove|touchend|taphold|tapstart|tapcancel)$/i,

    /**
     * @cfg {String} floatingCls
     * CSS class added when floating is enabled to the component.
     */
    floatingCls: 'x-floating',

    /**
     * @cfg {Boolean} modal
     * True to make the Component modal and mask everything behind it when displayed, false to display it without
     * restricting access to other UI elements (defaults to false).
     */
    modal: false,

    /**
     * @cfg {Boolean} floating
     * Create the Component as a floating and use absolute positioning.
     */
    /**
     * Read-only property indicating whether or not the component is floating
     * @property floating
     * @type {Boolean}
     */
    floating: false,

    /**
     * @cfg {Boolean} draggable
     * Allows the component to be dragged via the touch event.
     */
    /**
     * Read-only property indicating whether or not the component can be dragged
     * @property draggable
     * @type {Boolean}
     */
    draggable: false,

    /**
     * @cfg {Boolean} centered
     * Center the Component. Defaults to false.
     */
    centered: false,

    /**
    * @cfg {Boolean} hideOnMaskTap
    * True to automatically bind a tap listener to the mask that hides the window.
    * Defaults to true. Note: if you set this property to false you have to programmaticaly
    * hide the overlay.
    */
    hideOnMaskTap: true,

    /**
    * @cfg {Object/String/Boolean} showAnimation
    * The type of animation you want to use when this component is shown. If you set this
    * this hide animation will automatically be the opposite.
    */
    showAnimation: null,

    /**
     * @cfg {Boolean} monitorOrientation
     * Monitor Orientation change
     */
    monitorOrientation: false,
    
    /**
     * @cfg {Object/Array} plugins
     * An object or array of objects that will provide custom functionality for this component.  The only
     * requirement for a valid plugin is that it contain an init method that accepts a reference of type Ext.Component.
     * When a component is created, if any plugins are available, the component will call the init method on each
     * plugin, passing a reference to itself.  Each plugin can then call methods or respond to events on the
     * component as needed to provide its functionality.
     */
    /**
     * @cfg {Mixed} scroll
     * Configure the component to be scrollable.
     * Acceptable values are: 'horizontal', 'vertical', 'both', and false
     * Setting this configuration immediately sets the monitorOrientation config to true (for Ext.Panel's)
     */

    /**
     * @cfg {String/Object} componentLayout
     * <br><p>The sizing and positioning of the component Elements is the responsibility of
     * the Component's layout manager which creates and manages the type of layout specific to the component.
     * <p>If the {@link #layout} configuration is not explicitly specified for
     * a general purpose compopnent the
     * {@link Ext.layout.AutoComponentLayout default layout manager} will be used.
     */

    /**
     * @cfg {String} ui
     * A set of predefined ui styles for individual components.
     *
     * Most components support 'light' and 'dark'.
     *
     * Extra string added to the baseCls with an extra '-'.
     * <pre><code>
      new Ext.Panel({
          title: 'Some Title',
          baseCls: 'x-component'
          ui: 'green'
      });
       </code></pre>
     * <p>The ui configuration in this example would add 'x-component-green' as an additional class.</p>
     */

    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to '').  This can be
     * useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    /**
      * @cfg {String} style
      * A custom style specification to be applied to this component's Element.  Should be a valid argument to
      * {@link Ext.Element#applyStyles}.
      * <pre><code>
     new Ext.Panel({
         title: 'Some Title',
         renderTo: Ext.getBody(),
         width: 400, height: 300,
         layout: 'form',
         items: [{
             xtype: 'textarea',
             style: {
                 width: '95%',
                 marginBottom: '10px'
             }
         },
             new Ext.Button({
                 text: 'Send',
                 minWidth: '100',
                 style: {
                     marginBottom: '10px'
                 }
             })
         ]
     });
        </code></pre>
      */
    /**
     * @cfg {String} overCls
     * CSS class added when hovering over the outer element of the component.
     */
    /**
     * @cfg {String/Object} html
     * An HTML fragment, or a {@link Ext.DomHelper DomHelper} specification to use as the layout element
     * content (defaults to ''). The HTML content is added after the component is rendered,
     * so the document will not contain this HTML at the time the {@link #render} event is fired.
     * This content is inserted into the body <i>before</i> any configured {@link #contentEl} is appended.
     */
    /**
     * @cfg {Mixed} data
     * The initial set of data to apply to the <code>{@link #tpl}</code> to
     * update the content area of the Component.
     */
    /**
     * @cfg {String} contentEl
     * <p>Optional. Specify an existing HTML element, or the <code>id</code> of an existing HTML element to use as the content
     * for this component.</p>
     * <ul>
     * <li><b>Description</b> :
     * <div class="sub-desc">This config option is used to take an existing HTML element and place it in the layout element
     * of a new component (it simply moves the specified DOM element <i>after the Component is rendered</i> to use as the content.</div></li>
     * <li><b>Notes</b> :
     * <div class="sub-desc">The specified HTML element is appended to the layout element of the component <i>after any configured
     * {@link #html HTML} has been inserted</i>, and so the document will not contain this element at the time the {@link #render} event is fired.</div>
     * <div class="sub-desc">The specified HTML element used will not participate in any <code><b>{@link Ext.Container#layout layout}</b></code>
     * scheme that the Component may use. It is just HTML. Layouts operate on child <code><b>{@link Ext.Container#items items}</b></code>.</div>
     * <div class="sub-desc">Add either the <code>x-hidden</code> or the <code>x-hide-display</code> CSS class to
     * prevent a brief flicker of the content before it is rendered to the panel.</div></li>
     * </ul>
     */
    /**
     * @cfg {Mixed} renderTo
     * <p>Specify the id of the element, a DOM element or an existing Element that this component
     * will be rendered into.</p><div><ul>
     * <li><b>Notes</b> : <ul>
     * <div class="sub-desc">Do <u>not</u> use this option if the Component is to be a child item of
     * a {@link Ext.Container Container}. It is the responsibility of the
     * {@link Ext.Container Container}'s {@link Ext.Container#layout layout manager}
     * to render and manage its child items.</div>
     * <div class="sub-desc">When using this config, a call to render() is not required.</div>
     * </ul></li>
     * </ul></div>
     * <p>See <tt>{@link #render}</tt> also.</p>
     */
    /**
     * @cfg {Number} minHeight
     * <p>The minimum value in pixels which this Component will set its height to.</p>
     * <p><b>Warning:</b> This will override any size management applied by layout managers.</p>
     */
    /**
     * @cfg {Number} minWidth
     * <p>The minimum value in pixels which this Component will set its width to.</p>
     * <p><b>Warning:</b> This will override any size management applied by layout managers.</p>
     */
    /**
     * @cfg {Number} maxHeight
     * <p>The maximum value in pixels which this Component will set its height to.</p>
     * <p><b>Warning:</b> This will override any size management applied by layout managers.</p>
     */
    /**
     * @cfg {Number} maxWidth
     * <p>The maximum value in pixels which this Component will set its width to.</p>
     * <p><b>Warning:</b> This will override any size management applied by layout managers.</p>
     */

    constructor : function(config) {
        config = config || {};
        this.initialConfig = config;
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event beforeactivate
             * Fires before a Component has been visually activated.
             * Returning false from an event listener can prevent the activate
             * from occurring.
             * @param {Ext.Component} this
             */
             'beforeactivate',
            /**
             * @event activate
             * Fires after a Component has been visually activated.
             * @param {Ext.Component} this
             */
             'activate',
            /**
             * @event beforedeactivate
             * Fires before a Component has been visually deactivated.
             * Returning false from an event listener can prevent the deactivate
             * from occurring.
             * @param {Ext.Component} this
             */
             'beforedeactivate',
            /**
             * @event deactivate
             * Fires after a Component has been visually deactivated.
             * @param {Ext.Component} this
             */
             'deactivate',
            /**
             * @event added
             * Fires after a Component had been added to a Container.
             * @param {Ext.Component} this
             * @param {Ext.Container} container Parent Container
             * @param {Number} pos position of Component
             */
             'added',
            /**
             * @event disable
             * Fires after the component is disabled.
             * @param {Ext.Component} this
             */
             'disable',
            /**
             * @event enable
             * Fires after the component is enabled.
             * @param {Ext.Component} this
             */
             'enable',
            /**
             * @event beforeshow
             * Fires before the component is shown when calling the {@link #show} method.
             * Return false from an event handler to stop the show.
             * @param {Ext.Component} this
             */
             'beforeshow',
            /**
             * @event show
             * Fires after the component is shown when calling the {@link #show} method.
             * @param {Ext.Component} this
             */
             'show',
            /**
             * @event beforehide
             * Fires before the component is hidden when calling the {@link #hide} method.
             * Return false from an event handler to stop the hide.
             * @param {Ext.Component} this
             */
             'beforehide',
            /**
             * @event hide
             * Fires after the component is hidden.
             * Fires after the component is hidden when calling the {@link #hide} method.
             * @param {Ext.Component} this
             */
             'hide',
            /**
             * @event removed
             * Fires when a component is removed from an Ext.Container
             * @param {Ext.Component} this
             * @param {Ext.Container} ownerCt Container which holds the component
             */
             'removed',
            /**
             * @event beforerender
             * Fires before the component is {@link #rendered}. Return false from an
             * event handler to stop the {@link #render}.
             * @param {Ext.Component} this
             */
             'beforerender',
            /**
             * @event render
             * Fires after the component markup is {@link #rendered}.
             * @param {Ext.Component} this
             */
             'render',
            /**
             * @event afterrender
             * <p>Fires after the component rendering is finished.</p>
             * <p>The afterrender event is fired after this Component has been {@link #rendered}, been postprocesed
             * by any afterRender method defined for the Component, and, if {@link #stateful}, after state
             * has been restored.</p>
             * @param {Ext.Component} this
             */
             'afterrender',
            /**
             * @event beforedestroy
             * Fires before the component is {@link #destroy}ed. Return false from an event handler to stop the {@link #destroy}.
             * @param {Ext.Component} this
             */
             'beforedestroy',
            /**
             * @event destroy
             * Fires after the component is {@link #destroy}ed.
             * @param {Ext.Component} this
             */
             'destroy',
            /**
             * @event resize
             * Fires after the component is resized.
             * @param {Ext.Component} this
             * @param {Number} adjWidth The box-adjusted width that was set
             * @param {Number} adjHeight The box-adjusted height that was set
             * @param {Number} rawWidth The width that was originally specified
             * @param {Number} rawHeight The height that was originally specified
             */
             'resize',
            /**
             * @event move
             * Fires after the component is moved.
             * @param {Ext.Component} this
             * @param {Number} x The new x position
             * @param {Number} y The new y position
             */
             'move',
             /**
              * @event beforeorientationchange
              * Fires before the orientation changes, if the monitorOrientation
              * configuration is set to true. Return false to stop the orientation change.
              * @param this {Ext.Panel}
              * @param orientation {String} 'landscape' or 'portrait'
              * @param width {Number}
              * @param height {Number}
              */
             'beforeorientationchange',
             /**
              * @event orientationchange
              * Fires when the orientation changes, if the monitorOrientation
              * configuration is set to true.
              * @param this {Ext.Panel}
              * @param orientation {String} 'landscape' or 'portrait'
              * @param width {Number}
              * @param height {Number}
              */
             'orientationchange'
        );

        this.getId();

        Ext.ComponentMgr.register(this);
        Ext.Component.superclass.constructor.call(this);

        this.mons = [];
        this.renderData = this.renderData || {};
        this.renderSelectors = this.renderSelectors || {};

        this.initComponent();

        if (this.plugins) {
            if (Ext.isArray(this.plugins)) {
                for (var i = 0, len = this.plugins.length; i < len; i++) {
                    this.plugins[i] = this.initPlugin(this.plugins[i]);
                }
            }
            else {
                this.plugins = this.initPlugin(this.plugins);
            }
        }

        if (this.renderTo) {
            this.render(this.renderTo);
            delete this.renderTo;
        }

        if (this.fullscreen || this.floating) {
            this.monitorOrientation = true;
        }

        if (this.fullscreen) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.cls = (this.cls || '') + ' x-fullscreen';
            this.render(document.body);
            //this.hideBrowserChrome();
        }
    },

    // @private
    initComponent : function() {
        this.enableBubble(this.bubbleEvents);
    },

    // @private
    initPlugin : function(plugin) {
        if (plugin.ptype && typeof plugin.init != 'function') {
            plugin = Ext.PluginMgr.create(plugin);
        }
        else if (typeof plugin == 'string') {
            plugin = Ext.PluginMgr.create({
                ptype: plugin
            });
        }

        plugin.init(this);

        return plugin;
    },

    // @private
    initLayout : function(layout, defaultType) {
        var layoutConfig = {};

        if (!layout) {
            layout = defaultType;
        }

        if (Ext.isObject(layout) && !layout.layout) {
            layoutConfig = layout;
            layout = layoutConfig.type;
        }

        if (typeof layout == 'string') {
            layout = new Ext.layout.TYPES[layout.toLowerCase()](layoutConfig);
        }

        return layout;
    },

    // @private
    render : function(container, position) {
        var addCls = [];
        if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
            if (!container && this.el) {
                this.el = Ext.get(this.el);
                container = this.el.dom.parentNode;
                this.allowDomMove = false;
            }

            this.container = Ext.get(container);

            if (this.ctCls) {
                this.container.addClass(this.ctCls);
            }

            this.rendered = true;

            if (position !== undefined) {
                if (Ext.isNumber(position)) {
                    position = this.container.dom.childNodes[position];
                }
                else {
                    position = Ext.getDom(position);
                }
            }

            this.onRender(this.container, position || null);

            if (this.autoShow) {
                this.el.show();
            }

            delete this.style;
            delete this.cls;

            if (this.floating) {
                this.setFloating(true);
            }

            if (this.draggable) {
                this.setDraggable(true);
            }

            this.fireEvent('render', this);

            if (this.scroll) {
                this.setScrollable(this.scroll);
            }

            // Populate content of the component with html, contentEl or
            // a tpl.
            var target = this.getContentTarget();
            if (this.html) {
                target.update(Ext.DomHelper.markup(this.html));
                delete this.html;
            }
            if (this.contentEl) {
                var ce = Ext.getDom(this.contentEl);
                Ext.fly(ce).show();
                target.appendChild(ce);
            }

            if (this.tpl) {
                if (!this.tpl.compile) {
                    this.tpl = new Ext.XTemplate(this.tpl);
                }
                if (this.data) {
                    this.tpl[this.tplWriteMode](target, this.data);
                    delete this.data;
                }
            }

            this.afterRender(this.container);

            if (this.styleHtmlContent) {
                target.addClass('x-htmlcontent');
            }

            if (this.hidden) {
                // call this so we don't fire initial hide events.
                this.onHide();
            }

            if (this.disabled) {
                // pass silent so the event doesn't fire the first time.
                this.disable(true);
            }

            this.fireEvent('afterrender', this);
        }

        return this;
    },

    // @private
    onRender : function(ct, position) {
        var el = this.el,
            renderTpl = this.renderTpl;
        if (!el) {
            // Use renderTpl and renderData to build and insert this.el
            if (renderTpl) {
                Ext.applyIf(this.renderData, {
                    id: this.id,
                    baseCls: this.baseCls,
                    cls: this.cls,
                    cmpCls: this.cmpCls,
                    uiBase: this.cmpCls ? this.cmpCls : this.baseCls,
                    ui: this.ui,
                    style: this.style
                });
                
                if (typeof position == 'number') {
                    position = ct.dom.childNodes[position] || null;
                }
                
                if (Ext.isArray(renderTpl)) {
                    renderTpl = this.proto.renderTpl = new Ext.XTemplate(renderTpl);
                }                

                if (position) {
                    el = renderTpl.insertBefore(position, this.renderData, true);
                }
                else {
                    el = renderTpl.append(ct, this.renderData, true);
                }
            }
        }
        else {
            el = Ext.get(el);
            if (this.allowDomMove !== false) {
                ct.dom.insertBefore(el.dom, position);
            }
        }
        Ext.apply(this, this.applyRefs(el.dom));
        this.el = el;
    },

    // Applies refSelectors if present.
    // @return {Object} object containing template references.
    applyRefs: function(el) {
        var ref,
            refObj = this.renderSelectors || {},
            ret = {};

        for (ref in refObj) {
            ret[ref] = Ext.get(Ext.DomQuery.selectNode(refObj[ref], el));
        }
        return ret;
    },

    // @private
    afterRender : function() {
        this.componentLayout = this.initLayout(this.componentLayout, 'component');
        this.setComponentLayout(this.componentLayout);

        // If there is a width or height set on this component we will call setSize
        // which will trigger the component layout
        if (!this.ownerCt) {
            this.setSize(this.width, this.height);
        }

        if (this.x || this.y) {
            this.setPosition(this.x, this.y);
        }

        if (this.minWidth) {
            this.el.setStyle('min-width', this.minWidth + 'px');
        }
        if (this.maxWidth) {
            this.el.setStyle('max-width', this.maxWidth + 'px');
        }

        if (this.minHeight) {
            this.el.setStyle('min-height', this.minHeight + 'px');
        }
        if (this.maxHeight) {
            this.el.setStyle('max-height', this.maxHeight + 'px');
        }

        if (this.relayDomEvents) {
            this.relayEvents(this.el, this.relayDomEvents);
        }

        if (this.monitorOrientation) {
            if (this.fullscreen) {
                this.setOrientation(Ext.Element.getOrientation());
            }
            Ext.EventManager.onOrientationChange(this.setOrientation, this);
        }

        this.initEvents();
    },

    /**
     * Sets the orientation for the Panel.
     * @param orientation {String} 'landscape' or 'portrait'
     * @param {Number/String} width New width of the Panel.
     * @param {Number/String} height New height of the Panel.
     */
    setOrientation : function(orientation, w, h) {
        if (orientation != this.orientation) {
            if (this.fireEvent('beforeorientationchange', this, orientation, w, h) !== false) {
                if (this.fullscreen) {
                    this.setSize(w, h);
                }

                if (this.floating && this.centered) {
                    this.setCentered(true, true);
                }

                if (this.orientation) {
                    this.el.removeClass('x-' + this.orientation);
                }

                this.el.addClass('x-' + orientation);

                this.orientation = orientation;
                this.onOrientationChange(orientation, w, h);
                this.fireEvent('orientationchange', this, orientation, w, h);
            }
        }
    },

    // @private
    onOrientationChange : function(orientation, w, h) {
        Ext.repaint.defer(50);
    },
    
    hideBrowserChrome : function() {
        setTimeout(function() {
            window.scrollTo(0, 0);
            this.setSize(window.innerWidth, window.innerHeight);
        }, 100);
    },

    // inherited docs.
    addListener : function(ename) {
        if (!Ext.isObject(ename) && this.domEventsRe.test(ename)) {
            if (this.rendered) {
                this.relayEvents(this.el, ename);
            }
            else {
                this.relayDomEvents = this.relayDomEvents || [];
                this.relayDomEvents.push(ename);
            }
            return null;
        }
        return Ext.Component.superclass.addListener.apply(this, arguments);
    },

    /**
     * Sets a Component as scrollable.
     * @param config {Mixed}
     * Acceptable values are a Ext.Scroller configuration, 'horizontal', 'vertical', 'both', and false
     */
    setScrollable : function(config) {
        if (config !== false) {
            var direction = Ext.isObject(config) ? config.direction: config,
                both = direction === 'both',
                horizontal = both || direction === 'horizontal',
                vertical = both || direction === true || direction === 'vertical';

            config = Ext.apply({},
            Ext.isObject(config) ? config: {}, {
                jumpTo: this.jumpTo,
                momentum: true,
                horizontal: horizontal,
                vertical: vertical
            });

            this.scrollEl = this.getContentTarget().createChild();

            this.originalGetContentTarget = this.getContentTarget;
            this.getContentTarget = function() {
                return this.scrollEl;
            };

            this.scroller = new Ext.util.Scroller(this.scrollEl, config);
        }
        else {
            this.getContentTarget = this.originalGetContentTarget;
            this.scroller.destroy();
        }
    },

    /**
     * Sets a Component as floating.
     * @param {Boolean} floating
     * @param {Boolean} autoShow
     */
    setFloating : function(floating, autoShow) {
        this.floating = !!floating;
        if (this.rendered) {
            if (floating !== false) {
                this.el.addClass(this.floatingCls);
                if (autoShow) {
                    this.show();
                }
            }
            else {
                this.el.removeClass(this.floatingCls);
                Ext.getDoc().un('touchstart', this.onFloatingTouchStart, this);
            }
        }
    },

    /**
     * Sets a Component as draggable.
     * @param {Boolean} draggable
     * @param {Boolean} autoShow
     */
    setDraggable : function(draggable, autoShow) {
        this.draggable = !!draggable;
        if (this.rendered) {
            if (draggable === false) {
                if (this.dragObj) {
                    this.dragObj.disable();
                }
            } else {
                if (autoShow) {
                    this.show();
                }
                if (this.dragObj) {
                    this.dragObj.enable();
                } else {
                    this.dragObj = new Ext.util.Draggable(this.el, Ext.apply({}, this.dragConfig || {}));
                    this.relayEvents(this.dragObj, ['dragstart', 'drag', 'dragend']);
                }
            }
        }
    },

    // @private
    initEvents : function() {
        if (this.monitorResize === true) {
            Ext.EventManager.onWindowResize(this.setSize, this);
        }
    },

    // @private
    setComponentLayout : function(layout) {
        if (this.componentLayout && this.componentLayout != layout) {
            this.componentLayout.setOwner(null);
        }
        this.componentLayout = layout;
        layout.setOwner(this);
    },

    /**
     * This method needs to be called whenever you change something on this component that requires the components 
     * layout to be recalculated. An example is adding, showing or hiding a docked item to a Panel, or changing the 
     * label of a form field. After a component layout, the container layout will automatically be run. So you could
     * be on the safe side and always call doComponentLayout instead of doLayout.
     * @return {Ext.Container} this
     */
    doComponentLayout : function(w, h) {
        if (this.rendered && this.componentLayout) {
            this.componentLayout.layout(w, h);
        }
        return this;
    },

    // Template method that can be overriden to perform logic after the panel has layed out itself
    // e.g. Resized the body and positioned all docked items.
    afterComponentLayout : function() {
        if (this.scrollEl) {
            if (this.scroller.horizontal) {
                this.scrollEl.setStyle('min-width', (this.body || this.el).getWidth(true) + 'px');
                this.scrollEl.setHeight((this.body || this.el).getHeight(true) || null);
            }
            else {
                this.scrollEl.setStyle('min-height', (this.body || this.el).getHeight(true) + 'px');
                this.scrollEl.setWidth((this.body || this.el).getWidth(true) || null);
            }
            this.scroller.updateBounds();
        }
    },

    /**
     * Sets the left and top of the component.  To set the page XY position instead, use {@link #setPagePosition}.
     * This method fires the {@link #move} event.
     * @param {Number} left The new left
     * @param {Number} top The new top
     * @return {Ext.Component} this
     */
    setPosition : function(x, y) {
        if (Ext.isObject(x)) {
            y = x.y;
            x = x.x;
        }

        if (!this.rendered) {
            return this;
        }

        var adjusted = this.adjustPosition(x, y),
        el = this.getPositionEl(),
        undefined;

        x = adjusted.x;
        y = adjusted.y;

        if (x !== undefined || y !== undefined) {
            if (y !== undefined && x !== undefined) {
                el.setBox(x, y);
            }
            else if (x !== undefined) {
                el.setLeft(x);
            }
            else if (y !== undefined) {
                el.setTop(y);
            }
            this.onPosition(x, y);
            this.fireEvent('move', this, x, y);
        }
        return this;
    },

    /* @private
     * Called after the component is moved, this method is empty by default but can be implemented by any
     * subclass that needs to perform custom logic after a move occurs.
     * @param {Number} x The new x position
     * @param {Number} y The new y position
     */
    onPosition: Ext.emptyFn,

    /**
     * Sets the width and height of this Component. This method fires the {@link #resize} event. This method can accept
     * either width and height as separate arguments, or you can pass a size object like <code>{width:10, height:20}</code>.
     * @param {Mixed} width The new width to set. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new width in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS width style.</li>
     * <li>A size object in the format <code>{width: widthValue, height: heightValue}</code>.</li>
     * <li><code>undefined</code> to leave the width unchanged.</li>
     * </ul></div>
     * @param {Mixed} height The new height to set (not required if a size object is passed as the first arg).
     * This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new height in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
     * <li><code>undefined</code> to leave the height unchanged.</li>
     * </ul></div>
     * @return {Ext.Component} this
     */
    setSize : function(w, h) {
        // support for standard size objects
        if (Ext.isObject(w)) {
            h = w.height;
            w = w.width;
        }

        w = w !== undefined ? w: this.width;
        h = h !== undefined ? h: this.height;

        if (w !== undefined) {
            w = w.constrain(this.boxMinWidth, this.boxMaxWidth);
        }
        if (h !== undefined) {
            h = h.constrain(this.boxMinHeight, this.boxMaxHeight);
        }

        if (!this.rendered) {
            this.width = w;
            this.height = h;
            return this;
        }

        // Prevent recalcs when not needed
        if (this.cacheSizes !== false && this.lastSize && this.lastSize.width == w && this.lastSize.height == h) {
            return this;
        }

        // Cache the new size
        this.lastSize = {
            width: w,
            height: h
        };

        var adjustedSize = this.adjustSize(w, h);

        w = adjustedSize.width;
        h = adjustedSize.height;

        if (w !== undefined || h !== undefined) {
            this.doComponentLayout(w, h);

            // Stub method only.
            this.onResize(w, h);
            this.fireEvent('resize', this, w, h);
        }

        return this;
    },

    /**
     * Sets the width of the component.  This method fires the {@link #resize} event.
     * @param {Number} width The new width to setThis may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new width in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS width style.</li>
     * </ul></div>
     * @return {Ext.Component} this
     */
    setWidth : function(width) {
        return this.setSize(width);
    },

    /**
     * Sets the height of the component.  This method fires the {@link #resize} event.
     * @param {Number} height The new height to set. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new height in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS height style.</li>
     * <li><i>undefined</i> to leave the height unchanged.</li>
     * </ul></div>
     * @return {Ext.Component} this
     */
    setHeight : function(height) {
        return this.setSize(undefined, height);
    },

    /**
     * Gets the current size of the component's underlying element.
     * @return {Object} An object containing the element's size {width: (element width), height: (element height)}
     */
    getSize : function() {
        return this.getResizeEl().getSize();
    },

    /**
     * Gets the current width of the component's underlying element.
     * @return {Number}
     */
    getWidth : function() {
        return this.getResizeEl().getWidth();
    },

    /**
     * Gets the current height of the component's underlying element.
     * @return {Number}
     */
    getHeight : function() {
        return this.getResizeEl().getHeight();
    },

    // Include margins
    /**
     * Returns the size of the Element including the margins.
     * @returns {Object} size
     * This object has a width and height property.
     */
    getOuterSize : function() {
        var el = this.getResizeEl();
        return {
            width: el.getOuterWidth(),
            height: el.getOuterHeight()
        };
    },

    // @private
    getTargetBox : function() {
        return this.el.getBox(true, true);
    },

    // @private
    getResizeEl : function() {
        return this.el;
    },

    // @private
    onResize : Ext.emptyFn,

    // @private
    adjustSize : function(w, h) {
        if (this.autoWidth) {
            w = 'auto';
        }

        if (this.autoHeight) {
            h = 'auto';
        }

        return {
            width: w,
            height: h
        };
    },

    // @private
    adjustPosition : function(x, y) {
        return {
            x: x,
            y: y
        };
    },

    /**
     * Retrieves the id of this component.
     * Will autogenerate an id if one has not already been set.
     */
    getId : function() {
        return this.id || (this.id = 'ext-comp-' + (++Ext.Component.AUTO_ID));
    },

    /**
     * Retrieves the itemId of this component if defined.
     * Falls back to an id, retrieved by getId().
     */
    getItemId : function() {
        return this.itemId || this.getId();
    },

    /**
     * Retrieves the top level element representing this component.
     */
    getEl : function() {
        return this.el;
    },

    // @private
    getActionEl : function() {
        return this[this.actionMode];
    },

    /**
     * Provides the link for Observable's fireEvent method to bubble up the ownership hierarchy.
     * @return {Ext.Container} the Container which owns this Component.
     */
    getBubbleTarget : function() {
        return this.ownerCt;
    },

    // @private
    getContentTarget : function() {
        return this.el;
    },

    /**
     * Adds a CSS class to the top level element representing this component.
     * @returns {Ext.Component} Returns the Component to allow method chaining.
     */
    addClass : function(cls) {
        if (this.el) {
            this.el.addClass(cls);
        }
        else {
            this.cls = this.cls ? this.cls + ' ' + cls: cls;
        }
        return this;
    },

    /**
     * Removes a CSS class from the top level element representing this component.
     * @returns {Ext.Component} Returns the Component to allow method chaining.
     */
    removeClass : function(cls) {
        if (this.el) {
            this.el.removeClass(cls);
        }
        else if (this.cls) {
            this.cls = this.cls.split(' ').remove(cls).join(' ');
        }
        return this;
    },

    /**
     * Enable the component
     * @param {Boolean} silent
     * Passing false will supress the 'enable' event from being fired.
     */
    enable : function(silent) {
        if (this.rendered) {
            this.onEnable();
        }

        this.disabled = false;

        if (silent !== true) {
            this.fireEvent('enable', this);
        }

        return this;
    },

    /**
     * Disable the component.
     * @param {Boolean} silent
     * Passing true, will supress the 'disable' event from being fired.
     */
    disable : function(silent) {
        if (this.rendered) {
            this.onDisable();
        }

        this.disabled = true;

        if (silent !== true) {
            this.fireEvent('disable', this);
        }

        return this;
    },

    // @private
    onEnable : function() {
        this.getActionEl().removeClass(this.disabledClass);
        this.el.dom.disabled = false;
    },

    // @private
    onDisable : function() {
        this.getActionEl().addClass(this.disabledClass);
        this.el.dom.disabled = true;
    },

    /**
     * Enable or disable the component.
     * @param {Boolean} disabled
     */
    setDisabled : function(disabled) {
        return this[disabled ? 'disable': 'enable']();
    },

    /**
     * Show the component.
     * @param {Object/String/Boolean} animation (optional) Defaults to false.
     */
    show : function(animation) {
        if (this.fireEvent('beforeshow', this) !== false) {
            if (this.anchorEl) {
                this.anchorEl.hide();
            }
            this.hidden = false;
            if (!this.rendered && this.autoRender) {
                this.render(Ext.isBoolean(this.autoRender) ? Ext.getBody() : this.autoRender);
            }
            if (this.rendered) {
                this.onShow(animation);
            }
            this.fireEvent('show', this);
        }
        return this;
    },

    /**
     * Show this component by another component or element.
     * @param {Mixed} elOrCmp Element or Component
     * @param {Object/String/Boolean} animation
     * @param {Array} xyOffsets An array of x and y offsets.
     * @returns {Ext.Component} this
     */
    showBy : function(el, animation, xyOffsets) {
        xyOffsets = xyOffsets || [0, 20];
        if (!this.floating) {
            return this;
        }

        if (el.isComponent) {
            el = el.el;
        }
        else {
            el = Ext.get(el);
        }

        var pageBox = el.getPageBox();
        
        this.x = pageBox.left + xyOffsets[0];
        this.y = pageBox.bottom + xyOffsets[1];

        this.show(animation);

        if (!this.anchorEl) {
            this.anchorEl = this.el.createChild({
                cls: 'x-anchor'
            });
        }
        this.anchorEl.show();

        var viewSize = Ext.Element.getViewSize(),
            box = this.el.getPageBox(),
            x, y;

        if (box.right > viewSize.width) {
            x = pageBox.right - xyOffsets[0] - box.width;
            this.anchorEl.removeClass('x-anchor-left').addClass('x-anchor-right');
        }
        else {
            this.anchorEl.removeClass('x-anchor-right').addClass('x-anchor-left');
        }

        if (box.bottom > viewSize.height) {
            y = pageBox.top - xyOffsets[1] - box.height;
            this.anchorEl.removeClass('x-anchor-top').addClass('x-anchor-bottom');
        }
        else {
            this.anchorEl.removeClass('x-anchor-bottom').addClass('x-anchor-top');
        }
        
        if (x != undefined || y != undefined) {
            this.setPosition(x != undefined ? x : this.x, y != undefined ? y : this.y);
        }

        return this;
    },

    /**
     * Show this component centered of its parent or the window
     * This only applies when the component is floating.
     * @param {Boolean} centered True to center, false to remove centering
     * @returns {Ext.Component} this
     */
    setCentered : function(centered, update) {
        this.centered = centered;

        if (this.rendered && update) {
            var x, y;
            if (!this.ownerCt) {
                x = (Ext.Element.getViewportWidth() / 2) - (this.getWidth() / 2);
                y = (Ext.Element.getViewportHeight() / 2) - (this.getHeight() / 2);
            }
            else {
                x = (this.ownerCt.getContentTarget().getWidth() / 2) - (this.getWidth() / 2);
                y = (this.ownerCt.getContentTarget().getHeight() / 2) - (this.getHeight() / 2);
            }
            this.setPosition(x, y);
        }

        return this;
    },

    /**
     * Hide the component
     * @param {Object/String/Boolean} animation (optional) Defaults to false.
     */
    hide : function(animation) {
        if (this.fireEvent('beforehide', this) !== false) {
            this.hidden = true;
            if (this.rendered) {
                this.onHide(animation);
            }
            this.fireEvent('hide', this);
        }
        return this;
    },

    // @private
    onShow : function(animation) {
        animation = animation || this.showAnimation;
        if (this.floating) {
            this.el.appendTo(document.body);

            this.getVisibilityEl().show();
            if (animation) {
                this.el.setStyle('opacity', 0.01);
            }

            if (this.centered) {
                this.setCentered(true, true);
            }
            else {
                this.setPosition(this.x, this.y);
            }

            if (animation) {
                var showConfig = {}, showAnim, doc = Ext.getDoc();

                if (Ext.isObject(animation) && !animation.run) {
                    showConfig = Ext.apply({}, animation || {});
                    showAnim = showConfig.type;
                }
                else if (Ext.isString(animation)) {
                    showAnim = animation;
                }
                else if (animation.run) {
                    animation.run(this.el, {
                        out: false
                    });
                    this.showAnimation = animation;
                    return;
                }

                function preventDefault(e) {
                    e.preventDefault();
                };
                doc.on('click', preventDefault, this, {single: true});

                showConfig.after = function() {
                    (function() {
                        doc.un('click', preventDefault, this);
                    }).defer(50, this);
                };
                showConfig.scope = this;
                showConfig.out = false;
                showConfig.autoClear = true;

                Ext.anims[showAnim].run(this.el, showConfig);

                this.showAnimation = showAnim;
            }

            // Then we reset the size to the width and height given in the config
            // and if they were not given use the default css dimensions.
            // This will also relayout the item which is good since things might
            // change based on the styling we give to floating items
            delete this.lastSize;
            this.doComponentLayout(this.width, this.height);

            if (this.modal) {
                if (this.ownerCt) {
                    this.ownerCt.el.mask();
                }
                else {
                    Ext.getBody().mask();
                }
            }
            if (this.hideOnMaskTap) {
                Ext.getDoc().on('touchstart', this.onFloatingTouchStart, this);
            }
        }
        else {
            this.getVisibilityEl().show();
        }
    },

    // @private
    onFloatingTouchStart : function(e, t) {
        var doc = Ext.getDoc();
        if (!this.el.contains(t)) {
            doc.on('touchend', function(e) {
                this.hide();
                e.stopEvent();
            }, this, {single: true});

            e.stopEvent();
        }
    },

    // @private
    onHide : function(animation) {
        animation = animation || this.showAnimation;

        if (this.hideOnMaskTap && this.floating) {
            Ext.getDoc().un('touchstart', this.onFloatingTouchStart, this);
        }

        if (this.floating && this.modal) {
            if (this.ownerCt) {
                this.ownerCt.el.unmask();
            }
            else {
                Ext.getBody().unmask();
            }
        }

        if (animation) {
            var hideConfig = {}, hideAnim;

            if (Ext.isObject(animation) && !animation.run) {
                hideConfig = Ext.apply({}, animation || {});
                hideAnim = hideConfig.type;
            }
            else if (Ext.isString(animation)) {
                hideAnim = animation;
            }

            hideConfig.after = function() {
                this.getVisibilityEl().hide();
            };
            hideConfig.scope = this;
            hideConfig.out = true;
            hideConfig.autoClear = true;

            Ext.anims[hideAnim].run(this.el, hideConfig);
        } else {
            this.getVisibilityEl().hide();
        }
    },

    /**
     * <p>Adds listeners to any Observable object (or Element) which are automatically removed when this Component
     * is destroyed.
     * @param {Observable|Element} item The item to which to add a listener/listeners.
     * @param {Object|String} ename The event name, or an object containing event name properties.
     * @param {Function} fn Optional. If the <code>ename</code> parameter was an event name, this
     * is the handler function.
     * @param {Object} scope Optional. If the <code>ename</code> parameter was an event name, this
     * is the scope (<code>this</code> reference) in which the handler function is executed.
     * @param {Object} opt Optional. If the <code>ename</code> parameter was an event name, this
     * is the {@link Ext.util.Observable#addListener addListener} options.
     */
    mon : function(item, ename, fn, scope, opt) {
        if (Ext.isObject(ename)) {
            var o = ename,
            e;
            for (e in o) {
                if (this.monPropRe.test(e)) {
                    continue;
                }

                this.mons.push({
                    item: item,
                    ename: e,
                    fn: o[e],
                    scope: o.scope
                });

                if (typeof o[e] == 'function') {
                    // shared options
                    item.on(e, o[e], o.scope, o);
                }
                else {
                    // individual options
                    item.on(e, o[e]);
                }
            }
            return;
        }

        this.mons.push({
            item: item,
            ename: ename,
            fn: fn,
            scope: scope
        });

        item.on(ename, fn, scope, opt);
    },

    /**
     * Removes listeners that were added by the {@link #mon} method.
     * @param {Observable|Element} item The item from which to remove a listener/listeners.
     * @param {Object|String} ename The event name, or an object containing event name properties.
     * @param {Function} fn Optional. If the <code>ename</code> parameter was an event name, this
     * is the handler function.
     * @param {Object} scope Optional. If the <code>ename</code> parameter was an event name, this
     * is the scope (<code>this</code> reference) in which the handler function is executed.
     */
    mun : function(item, ename, fn, scope) {
        if (Ext.isObject(ename)) {
            for (var e in ename) {
                if (this.monPropRe.test(e)) {
                    continue;
                }
                if (typeof ename[e] == 'function') {
                    this.mun(item, e, ename[e], ename.scope);
                }
                else {
                    this.mun(item, e, ename[e].fn, ename[e].scope);
                }

            }
            return;
        }

        var mons = this.mons.slice(),
        ln = mons.length,
        i,
        mon;

        for (i = 0; i < ln; i++) {
            mon = mons[i];
            if (mon.item === item && mon.ename === ename && (!fn || mon.fn === fn) && (!scope || mon.scope === scope)) {
                this.mons.remove(mon);
                item.un(mon.ename, mon.fn, mon.scope);
            }
        }
    },

    // @private
    purgeListeners : function() {
        Ext.Component.superclass.purgeListeners.call(this);
        this.clearMons();
    },

    // @private
    clearMons : function() {
        var mons = this.mons,
        ln = mons.length,
        i,
        mon;

        for (i = 0; i < ln; i++) {
            mon = mons[i];
            mon.item.un(mon.ename, mon.fn, mon.scope);
        }

        this.mons = [];
    },

    // @private
    beforeDestroy : function() {
        this.clearMons();
        if (this.monitorResize) {
            Ext.EventManager.removeResizeListener(this.doComponentLayout, this);
        }
    },

    /**
     * Destroys the Component.
     */
    destroy : function() {
        if (!this.isDestroyed) {
            if (this.fireEvent('beforedestroy', this) !== false) {
                this.destroying = true;
                this.beforeDestroy();

                if (this.ownerCt && this.ownerCt.remove) {
                    this.ownerCt.remove(this, false);
                }

                if (this.rendered) {
                    this.el.remove();
                    if (this.actionMode == 'container' || this.removeMode == 'container') {
                        this.container.remove();
                    }
                }

                this.onDestroy();

                Ext.ComponentMgr.unregister(this);
                this.fireEvent('destroy', this);

                this.purgeListeners();
                this.destroying = false;
                this.isDestroyed = true;
            }
        }
    },

    // @private
    onDestroy: Ext.emptyFn,

    /**
     * Update the content area of a component.
     * @param {Mixed} htmlOrData
     * If this component has been configured with a template via the tpl config
     * then it will use this argument as data to populate the template.
     * If this component was not configured with a template, the components
     * content area will be updated via Ext.Element update
     * @param {Boolean} loadScripts
     * (optional) Only legitimate when using the html configuration. Defaults to false
     * @param {Function} callback
     * (optional) Only legitimate when using the html configuration. Callback to execute when scripts have finished loading
     */
    update : function(htmlOrData, loadScripts, cb) {
        var contentTarget = this.getContentTarget();

        if (this.tpl && typeof htmlOrData !== "string") {
            this.data = htmlOrData;
            this.tpl[this.tplWriteMode](contentTarget, htmlOrData || {});
        }
        else {
            var html = Ext.isObject(htmlOrData) ? Ext.DomHelper.markup(htmlOrData) : htmlOrData;
            if (this.rendered) {
                contentTarget.update(html, loadScripts, cb);
            }
            else {
                this.html = html;
            }
        }
        this.doComponentLayout();
        Ext.repaint();
    },

    /**
     * @private
     * Method to manage awareness of when components are added to their
     * respective Container, firing an added event.
     * References are established at add time rather than at render time.
     * @param {Ext.Container} container Container which holds the component
     * @param {number} pos Position at which the component was added
     */
    onAdded : function(container, pos) {
        this.ownerCt = container;
        this.fireEvent('added', this, container, pos);
    },

    /**
     * @private
     * Method to manage awareness of when components are removed from their
     * respective Container, firing an removed event. References are properly
     * cleaned up after removing a component from its owning container.
     */
    onRemoved : function() {
        this.fireEvent('removed', this, this.ownerCt);
        delete this.ownerCt;
    },

    /**
     * Convenience function to hide or show this component by boolean.
     * @param {Boolean} visible True to show, false to hide
     * @return {Ext.Component} this
     */
    setVisible : function(visible) {
        return this[visible ? 'show': 'hide']();
    },

    /**
     * Returns true if this component is visible.
     * @return {Boolean} True if this component is visible, false otherwise.
     */
    isVisible : function() {
        if (!this.rendered) {
            return false;
        }
        var p = this,
            visible = true;
        while (p) {
            if (p.hidden) {
                visible = false;
                break;
            }
            p = p.ownerCt;
        }
        return visible;
    },

    // @private
    getPositionEl : function() {
        return this.positionEl || this.el;
    },

    // @private
    getVisibilityEl : function() {
        return this.el;
    }
});

Ext.layout.TYPES = {};

// @private
Ext.Component.AUTO_ID = 1000;
// @xtype box
Ext.BoxComponent = Ext.Component;

Ext.reg('component', Ext.Component);
Ext.reg('box', Ext.BoxComponent);

Ext.Component.prototype.on = Ext.Component.prototype.addListener;
