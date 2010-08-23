/*
None
*/

/**
 * @class Ext
 * Ext core utilities and functions.
 * @singleton
 */
Ext = {
    /**
     * The version of the framework
     * @type String
     */
    version : '0.9.3',
    versionDetail : {
        major : 0,
        minor : 9,
        patch : 3
    }
};

/**
 * Sets up a page for use on a mobile device.
 * @param {Object} config
 *
 * Valid configurations are:
 * <ul>
 *  <li>fullscreen - Boolean - Sets an appropriate meta tag for Apple devices to run in full-screen mode.</li>
 *  <li>tabletStartupScreen - String - Startup screen to be used on an iPad. The image must be 768x1004 and in portrait orientation.</li>
 *  <li>phoneStartupScreen - String - Startup screen to be used on an iPhone or iPod touch. The image must be 320x460 and in portrait orientation.</li>
 *  <li>icon - Default icon to use. This will automatically apply to both tablets and phones. These should be 72x72.</li>
 *  <li>tabletIcon - String - An icon for only tablets. (This config supersedes icon.) These should be 72x72.</li>
 *  <li>phoneIcon - String - An icon for only phones. (This config supersedes icon.) These should be 57x57.</li>
 *  <li>glossOnIcon - Boolean - Add gloss on icon on iPhone, iPad and iPod Touch</li>
 *  <li>statusBarStyle - String - Sets the status bar style for fullscreen iPhone OS web apps. Valid options are default, black, or black-translucent.</li>
 *  <li>preloadImages - Array - An array of urls of images to be loaded.</li>
 *  <li>onReady - Function - Function to be run when the DOM is ready.<li>
 *  <li>scope - Scope - Scope for the onReady configuraiton to be run in.</li>
 * </ul>
 */
Ext.setup = function(config) {
    var P = Ext.platform;
    if (config && typeof config == 'object') {
        if (config.addMetaTags !== false) {
            var viewport = Ext.get(document.createElement('meta')),
                app = Ext.get(document.createElement('meta')),
                statusBar = Ext.get(document.createElement('meta')),
                startupScreen = Ext.get(document.createElement('link')),
                appIcon = Ext.get(document.createElement('link'));

            viewport.set({
                name: 'viewport',
                content: 'width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0;'
            });

            if (config.fullscreen !== false) {
                app.set({
                    name: 'apple-mobile-web-app-capable',
                    content: 'yes'
                });

                if (Ext.isString(config.statusBarStyle)) {
                    statusBar.set({
                        name: 'apple-mobile-web-app-status-bar-style',
                        content: config.statusBarStyle
                    });
                }
            }

            if (Ext.isString(config.tabletStartupScreen) && P.isTablet) {
                startupScreen.set({
                    rel: 'apple-touch-startup-image',
                    href: config.tabletStartupScreen
                });
            } else if (Ext.isString(config.phoneStartupScreen) && P.isPhone) {
                startupScreen.set({
                    rel: 'apple-touch-startup-image',
                    href: config.phoneStartupScreen
                });
            }

            if (config.icon) {
                config.phoneIcon = config.tabletIcon = config.icon;
            }

            var precomposed = (config.glossOnIcon === false) ? '-precomposed' : '';
            if (Ext.isString(config.tabletIcon) && P.isTablet) {
                appIcon.set({
                    rel: 'apple-touch-icon' + precomposed,
                    href: config.tabletIcon
                });
            } else if (Ext.isString(config.phoneIcon) && P.isPhone) {
                appIcon.set({
                    rel: 'apple-touch-icon' + precomposed,
                    href: config.phoneIcon
                });
            }

            var head = Ext.get(document.getElementsByTagName('head')[0]);
            head.appendChild(viewport);
            if (app.getAttribute('name')) head.appendChild(app);
            if (statusBar.getAttribute('name')) head.appendChild(statusBar);

            if (appIcon.getAttribute('href')) head.appendChild(appIcon);
            if (startupScreen.getAttribute('href')) head.appendChild(startupScreen);
        }

        if (Ext.isArray(config.preloadImages)) {
            for (var i = config.preloadImages.length - 1; i >= 0; i--) {
                (new Image()).src = config.preloadImages[i];
            };
        }

        if (Ext.isFunction(config.onReady)) {
            Ext.onReady(config.onReady, config.scope || window);
        }
    }
};

/**
 * Copies all the properties of config to obj.
 * @param {Object} object The receiver of the properties
 * @param {Object} config The source of the properties
 * @param {Object} defaults A different object that will also be applied for default values
 * @return {Object} returns obj
 * @member Ext apply
 */
Ext.apply = function(object, config, defaults) {
    // no "this" reference for friendly out of scope calls
    if (defaults) {
        Ext.apply(object, defaults);
    }
    if (object && config && typeof config == 'object') {
        for (var key in config) {
            object[key] = config[key];
        }
    }
    return object;
};

Ext.apply(Ext, {
    userAgent: navigator.userAgent.toLowerCase(),
    cache: {},
    idSeed: 1000,
    BLANK_IMAGE_URL : 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
    isStrict: document.compatMode == "CSS1Compat",

    /**
    * A reusable empty function
    * @property
    * @type Function
    */
    emptyFn : function(){},

    /**
     * True if the page is running over SSL
     * @type Boolean
     */
    isSecure : /^https/i.test(window.location.protocol),
    /**
     * True when the document is fully initialized and ready for action
     * @type Boolean
     */
    isReady : false,

    /**
     * True to automatically uncache orphaned Ext.Elements periodically (defaults to true)
     * @type Boolean
     */
    enableGarbageCollector : true,

    /**
     * True to automatically purge event listeners during garbageCollection (defaults to true).
     * @type Boolean
     */
    enableListenerCollection : true,

    /**
     * Copies all the properties of config to obj if they don't already exist.
     * @param {Object} obj The receiver of the properties
     * @param {Object} config The source of the properties
     * @return {Object} returns obj
     */
    applyIf : function(object, config) {
        var property, undefined;
        if (object) {
            for (property in config) {
                if (object[property] === undefined) {
                    object[property] = config[property];
                }
            }
        }
        return object;
    },

    /**
     * Repaints the whole page. This fixes frequently encountered painting issues in mobile Safari.
     */
    repaint : function() {
        var mask = Ext.getBody().createChild({
            cls: 'x-mask x-mask-transparent'
        });        
        setTimeout(function() {
            mask.remove();
        }, 0);
    },

    /**
     * Generates unique ids. If the element already has an id, it is unchanged
     * @param {Mixed} el (optional) The element to generate an id for
     * @param {String} prefix (optional) Id prefix (defaults "ext-gen")
     * @return {String} The generated Id.
     */
    id : function(el, prefix) {
        return (el = Ext.getDom(el) || {}).id = el.id || (prefix || "ext-gen") + (++Ext.idSeed);
    },

    /**
     * <p>Extends one class to create a subclass and optionally overrides members with the passed literal. This method
     * also adds the function "override()" to the subclass that can be used to override members of the class.</p>
     * For example, to create a subclass of Ext GridPanel:
     * <pre><code>
MyGridPanel = Ext.extend(Ext.grid.GridPanel, {
constructor: function(config) {

//      Create configuration for this Grid.
    var store = new Ext.data.Store({...});
    var colModel = new Ext.grid.ColumnModel({...});

//      Create a new config object containing our computed properties
//      *plus* whatever was in the config parameter.
    config = Ext.apply({
        store: store,
        colModel: colModel
    }, config);

    MyGridPanel.superclass.constructor.call(this, config);

//      Your postprocessing here
},

yourMethod: function() {
    // etc.
}
});
       </code></pre>
     *
     * <p>This function also supports a 3-argument call in which the subclass's constructor is
     * passed as an argument. In this form, the parameters are as follows:</p>
     * <div class="mdetail-params"><ul>
     * <li><code>subclass</code> : Function <div class="sub-desc">The subclass constructor.</div></li>
     * <li><code>superclass</code> : Function <div class="sub-desc">The constructor of class being extended</div></li>
     * <li><code>overrides</code> : Object <div class="sub-desc">A literal with members which are copied into the subclass's
     * prototype, and are therefore shared among all instances of the new class.</div></li>
     * </ul></div>
     *
     * @param {Function} superclass The constructor of class being extended.
     * @param {Object} overrides <p>A literal with members which are copied into the subclass's
     * prototype, and are therefore shared between all instances of the new class.</p>
     * <p>This may contain a special member named <tt><b>constructor</b></tt>. This is used
     * to define the constructor of the new class, and is returned. If this property is
     * <i>not</i> specified, a constructor is generated and returned which just calls the
     * superclass's constructor passing on its parameters.</p>
     * <p><b>It is essential that you call the superclass constructor in any provided constructor. See example code.</b></p>
     * @return {Function} The subclass constructor from the <code>overrides</code> parameter, or a generated one if not provided.
     */
    extend : function() {
        // inline overrides
        var inlineOverrides = function(o){
            for(var m in o){
                this[m] = o[m];
            }
        };

        var objectConstructor = Object.prototype.constructor;

        return function(subclass, superclass, overrides){
            // First we check if the user passed in just the superClass with overrides
            if(Ext.isObject(superclass)){
                overrides = superclass;
                superclass = subclass;
                subclass = overrides.constructor != objectConstructor
                    ? overrides.constructor
                    : function(){ superclass.apply(this, arguments); };
            }

            // We create a new temporary class
            var F = function(){},
                subclassProto,
                superclassProto = superclass.prototype;

            F.prototype = superclassProto;
            subclassProto = subclass.prototype = new F();
            subclassProto.constructor = subclass;
            subclass.superclass = superclassProto;

            if(superclassProto.constructor == objectConstructor){
                superclassProto.constructor = superclass;
            }

            subclass.override = function(overrides){
                Ext.override(subclass, overrides);
            };

            subclassProto.superclass = subclassProto.supr = (function(){
                return superclassProto;
            });

            subclassProto.override = inlineOverrides;
            subclass.override(overrides);
            subclass.extend = function(o){return Ext.extend(subclass, o);};
            subclass.prototype.proto = subclass.prototype;
            
            return subclass;
        };
    }(),

    /**
     * Adds a list of functions to the prototype of an existing class, overwriting any existing methods with the same name.
     * Usage:<pre><code>
Ext.override(MyClass, {
newMethod1: function(){
    // etc.
},
newMethod2: function(foo){
    // etc.
}
});
       </code></pre>
     * @param {Object} origclass The class to override
     * @param {Object} overrides The list of functions to add to origClass.  This should be specified as an object literal
     * containing one or more methods.
     * @method override
     */
    override : function(origclass, overrides) {
        if (overrides) {
            Ext.apply(origclass.prototype, overrides);
        }
    },


    /**
     * Creates namespaces to be used for scoping variables and classes so that they are not global.
     * Specifying the last node of a namespace implicitly creates all other nodes. Usage:
     * <pre><code>
Ext.namespace('Company', 'Company.data');
Ext.namespace('Company.data'); // equivalent and preferable to above syntax
Company.Widget = function() { ... }
Company.data.CustomStore = function(config) { ... }
       </code></pre>
     * @param {String} namespace1
     * @param {String} namespace2
     * @param {String} etc
     * @return {Object} The namespace object. (If multiple arguments are passed, this will be the last namespace created)
     * @method namespace
     */
    namespace : function() {
        var ln = arguments.length,
            i, value, split, x, xln, parts, object;

        for (i = 0; i < ln; i++) {
            value = arguments[i];
            parts = value.split(".");
            object = window[parts[0]] = Object(window[parts[0]]);
            for (x = 1, xln = parts.length; x < xln; x++) {
                object = object[parts[x]] = Object(object[parts[x]]);
            }
        }
        return object;
    },

    /**
     * Takes an object and converts it to an encoded URL. e.g. Ext.urlEncode({foo: 1, bar: 2}); would return "foo=1&bar=2".  Optionally, property values can be arrays, instead of keys and the resulting string that's returned will contain a name/value pair for each array value.
     * @param {Object} o
     * @param {String} pre (optional) A prefix to add to the url encoded string
     * @return {String}
     */
    urlEncode : function(o, pre){
        var empty,
            buf = [],
            e = encodeURIComponent;

        Ext.iterate(o, function(key, item){
            empty = Ext.isEmpty(item);
            Ext.each(empty ? key : item, function(val){
                buf.push('&', e(key), '=', (!Ext.isEmpty(val) && (val != key || !empty)) ? (Ext.isDate(val) ? Ext.encode(val).replace(/"/g, '') : e(val)) : '');
            });
        });
        if(!pre){
            buf.shift();
            pre = '';
        }
        return pre + buf.join('');
    },

    /**
     * Takes an encoded URL and and converts it to an object. Example:
     * <pre><code>
Ext.urlDecode("foo=1&bar=2"); // returns {foo: "1", bar: "2"}
Ext.urlDecode("foo=1&bar=2&bar=3&bar=4", false); // returns {foo: "1", bar: ["2", "3", "4"]}
       </code></pre>
     * @param {String} string
     * @param {Boolean} overwrite (optional) Items of the same name will overwrite previous values instead of creating an an array (Defaults to false).
     * @return {Object} A literal with members
     */
    urlDecode : function(string, overwrite){
        if(Ext.isEmpty(string)){
            return {};
        }
        var obj = {},
            pairs = string.split('&'),
            d = decodeURIComponent,
            name,
            value;
        Ext.each(pairs, function(pair) {
            pair = pair.split('=');
            name = d(pair[0]);
            value = d(pair[1]);
            obj[name] = overwrite || !obj[name] ? value : [].concat(obj[name]).concat(value);
        });
        return obj;
    },

    /**
     * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
     * @param {String} value The string to encode
     * @return {String} The encoded text
     */
    htmlEncode : function(value){
        return Ext.util.Format.htmlEncode(value);
    },

    /**
     * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
     * @param {String} value The string to decode
     * @return {String} The decoded text
     */
    htmlDecode : function(value){
         return Ext.util.Format.htmlDecode(value);
    },

    /**
     * Appends content to the query string of a URL, handling logic for whether to place
     * a question mark or ampersand.
     * @param {String} url The URL to append to.
     * @param {String} s The content to append to the URL.
     * @return (String) The resulting URL
     */
    urlAppend : function(url, s){
        if(!Ext.isEmpty(s)){
            return url + (url.indexOf('?') === -1 ? '?' : '&') + s;
        }
        return url;
    },

    /**
     * Converts any iterable (numeric indices and a length property) into a true array
     * Don't use this on strings. IE doesn't support "abc"[0] which this implementation depends on.
     * For strings, use this instead: "abc".match(/./g) => [a,b,c];
     * @param {Iterable} the iterable object to be turned into a true Array.
     * @return (Array) array
     */
     toArray : function(array, start, end){
        return Array.prototype.slice.call(array, start || 0, end || array.length);
     },

     /**
      * Iterates an array calling the supplied function.
      * @param {Array/NodeList/Mixed} array The array to be iterated. If this
      * argument is not really an array, the supplied function is called once.
      * @param {Function} fn The function to be called with each item. If the
      * supplied function returns false, iteration stops and this method returns
      * the current <code>index</code>. This function is called with
      * the following arguments:
      * <div class="mdetail-params"><ul>
      * <li><code>item</code> : <i>Mixed</i>
      * <div class="sub-desc">The item at the current <code>index</code>
      * in the passed <code>array</code></div></li>
      * <li><code>index</code> : <i>Number</i>
      * <div class="sub-desc">The current index within the array</div></li>
      * <li><code>allItems</code> : <i>Array</i>
      * <div class="sub-desc">The <code>array</code> passed as the first
      * argument to <code>Ext.each</code>.</div></li>
      * </ul></div>
      * @param {Object} scope The scope (<code>this</code> reference) in which the specified function is executed.
      * Defaults to the <code>item</code> at the current <code>index</code>util
      * within the passed <code>array</code>.
      * @return See description for the fn parameter.
      */
     each : function(array, fn, scope) {
         if (Ext.isEmpty(array, true)) {
             return 0;
         }
         if (!Ext.isIterable(array) || Ext.isPrimitive(array)) {
             array = [array];
         }
         for (var i = 0, len = array.length; i < len; i++) {
             if (fn.call(scope || array[i], array[i], i, array) === false) {
                 return i;
             };
         }
         return true;
     },

     /**
      * Iterates either the elements in an array, or each of the properties in an object.
      * <b>Note</b>: If you are only iterating arrays, it is better to call {@link #each}.
      * @param {Object/Array} object The object or array to be iterated
      * @param {Function} fn The function to be called for each iteration.
      * The iteration will stop if the supplied function returns false, or
      * all array elements / object properties have been covered. The signature
      * varies depending on the type of object being interated:
      * <div class="mdetail-params"><ul>
      * <li>Arrays : <tt>(Object item, Number index, Array allItems)</tt>
      * <div class="sub-desc">
      * When iterating an array, the supplied function is called with each item.</div></li>
      * <li>Objects : <tt>(String key, Object value, Object)</tt>
      * <div class="sub-desc">
      * When iterating an object, the supplied function is called with each key-value pair in
      * the object, and the iterated object</div></li>
      * </ul></divutil>
      * @param {Object} scope The scope (<code>this</code> reference) in which the specified function is executed. Defaults to
      * the <code>object</code> being iterated.
      */
     iterate : function(obj, fn, scope){
         if(Ext.isEmpty(obj)){
             return;
         }
         if (Ext.isIterable(obj)) {
             Ext.each(obj, fn, scope);
             return;
         }
         else if(Ext.isObject(obj)) {
             for (var prop in obj) {
                 if (obj.hasOwnProperty(prop)) {
                     if (fn.call(scope || obj, prop, obj[prop], obj) === false) {
                         return;
                     };
                 }
             }
         }
     },
     
     /**
      * Plucks the value of a property from each item in the Array
      * 
// Example:
Ext.pluck(Ext.query("p"), "className"); // [el1.className, el2.className, ..., elN.className]
      * 
      * @param {Array|NodeList} arr The Array of items to pluck the value from.
      * @param {String} prop The property name to pluck from each element.
      * @return {Array} The value from each item in the Array.
      */
     pluck : function(arr, prop){
            var ret = [];
            Ext.each(arr, function(v) {
                ret.push( v[prop] );
            });
            return ret;
      },

     /**
      * Return the dom node for the passed String (id), dom node, or Ext.Element.
      * Here are some examples:
      * <pre><code>
// gets dom node based on id
var elDom = Ext.getDom('elId');
// gets dom node based on the dom node
var elDom1 = Ext.getDom(elDom);

// If we don&#39;t know if we are working with an
// Ext.Element or a dom node use Ext.getDom
function(el){
 var dom = Ext.getDom(el);
 // do something with the dom node
}
       </code></pre>
     * <b>Note</b>: the dom node to be found actually needs to exist (be rendered, etc)
     * when this method is called to be successful.
     * @param {Mixed} el
     * @return HTMLElement
     */
    getDom : function(el) {
        if (!el || !document) {
            return null;
        }
        return el.dom ? el.dom : (typeof el == 'string' ? document.getElementById(el) : el);
    },

    /**
     * Returns the current document body as an {@link Ext.Element}.
     * @return Ext.Element The document body
     */
    getBody : function(){
        return Ext.get(document.body || false);
    },

    /**
     * Returns the current HTML document object as an {@link Ext.Element}.
     * @return Ext.Element The document
     */
    getDoc : function(){
        return Ext.get(document);
    },

    /**
     * This is shorthand reference to {@link Ext.ComponentMgr#get}.
     * Looks up an existing {@link Ext.Component Component} by {@link Ext.Component#id id}
     * @param {String} id The component {@link Ext.Component#id id}
     * @return Ext.Component The Component, <tt>undefined</tt> if not found, or <tt>null</tt> if a
     * Class was found.
    */
    getCmp : function(id){
        return Ext.ComponentMgr.get(id);
    },

    /**
     * Returns the current orientation of the mobile device
     * @return {String} Either 'portrait' or 'landscape'
     */
    getOrientation: function() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    },

    /**
     * <p>Removes this element from the document, removes all DOM event listeners, and deletes the cache reference.
     * All DOM event listeners are removed from this element. If {@link Ext#enableNestedListenerRemoval} is
     * <code>true</code>, then DOM event listeners are also removed from all child nodes. The body node
     * will be ignored if passed in.</p>
     * @param {HTMLElement} node The node to remove
     */
    removeNode : function(n){
        if (n && n.parentNode && n.tagName != 'BODY') {
            Ext.EventManager.removeAll(n);
            n.parentNode.removeChild(n);
            delete Ext.cache[n.id];
        }
    },

    /**
     * Attempts to destroy any objects passed to it by removing all event listeners, removing them from the
     * DOM (if applicable) and calling their destroy functions (if available).  This method is primarily
     * intended for arguments of type {@link Ext.Element} and {@link Ext.Component}, but any subclass of
     * {@link Ext.util.Observable} can be passed in.  Any number of elements and/or components can be
     * passed into this function in a single call as separate arguments.
     * @param {Mixed} arg1 An {@link Ext.Element}, {@link Ext.Component}, or an Array of either of these to destroy
     * @param {Mixed} arg2 (optional)
     * @param {Mixed} etc... (optional)
     */
    destroy : function() {
        var ln = arguments.length,
            i, arg;
        for (i = 0; i < ln; i++) {
            arg = arguments[i];
            if (arg) {
                if (Ext.isArray(arg)) {
                    this.destroy.apply(this, arg);
                }
                else if (Ext.isFunction(arg.destroy)) {
                    arg.destroy();
                }
                else if (arg.dom) {
                    arg.remove();
                }
            }
        }
    },

    isIterable : function(v){
        //check for array or arguments
        if(Ext.isArray(v) || v.callee){
            return true;
        }
        //check for node list type
        if(/NodeList|HTMLCollection/.test(Object.prototype.toString.call(v))){
            return true;
        }
        //NodeList has an item and length property
        //IXMLDOMNodeList has nextNode method, needs to be checked first.
        return ((typeof v.nextNode != 'undefined' || v.item) && Ext.isNumber(v.length));
    },

    /**
     * Utility method for validating that a value is numeric, returning the specified default value if it is not.
     * @param {Mixed} value Should be a number, but any type will be handled appropriately
     * @param {Number} defaultValue The value to return if the original value is non-numeric
     * @return {Number} Value, if numeric, else defaultValue
     */
    num : function(v, defaultValue){
        v = Number(Ext.isEmpty(v) || Ext.isArray(v) || typeof v == 'boolean' || (typeof v == 'string' && v.trim().length == 0) ? NaN : v);
        return isNaN(v) ? defaultValue : v;
    },

    /**
     * <p>Returns true if the passed value is empty.</p>
     * <p>The value is deemed to be empty if it is<div class="mdetail-params"><ul>
     * <li>null</li>
     * <li>undefined</li>
     * <li>an empty array</li>
     * <li>a zero length string (Unless the <tt>allowBlank</tt> parameter is <tt>true</tt>)</li>
     * </ul></div>
     * @param {Mixed} value The value to test
     * @param {Boolean} allowBlank (optional) true to allow empty strings (defaults to false)
     * @return {Boolean}
     */
    isEmpty : function(v, allowBlank) {
        return v == null || ((Ext.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
    },

    /**
     * Returns true if the passed value is a JavaScript array, otherwise false.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isArray : function(v) {
        return Object.prototype.toString.apply(v) === '[object Array]';
    },

    /**
     * Returns true if the passed object is a JavaScript date object, otherwise false.
     * @param {Object} object The object to test
     * @return {Boolean}
     */
    isDate : function(v) {
        return Object.prototype.toString.apply(v) === '[object Date]';
    },

    /**
     * Returns true if the passed value is a JavaScript Object, otherwise false.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isObject : function(v) {
        return !!v && Object.prototype.toString.call(v) === '[object Object]';
    },

    /**
     * Returns true if the passed value is a JavaScript 'primitive', a string, number or boolean.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isPrimitive : function(v) {
        return Ext.isString(v) || Ext.isNumber(v) || Ext.isBoolean(v);
    },

    /**
     * Returns true if the passed value is a JavaScript Function, otherwise false.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isFunction : function(v) {
        return Object.prototype.toString.apply(v) === '[object Function]';
    },

    /**
     * Returns true if the passed value is a number. Returns false for non-finite numbers.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isNumber : function(v) {
        return Object.prototype.toString.apply(v) === '[object Number]' && isFinite(v);
    },

    /**
     * Returns true if the passed value is a string.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isString : function(v) {
        return Object.prototype.toString.apply(v) === '[object String]';
    },

    /**util
     * Returns true if the passed value is a boolean.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isBoolean : function(v) {
        return Object.prototype.toString.apply(v) === '[object Boolean]';
    },

    /**
     * Returns true if the passed value is an HTMLElement
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isElement : function(v) {
        return !!v && v.tagName;
    },

    /**
     * Returns true if the passed value is not undefined.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isDefined : function(v){
        return typeof v !== 'undefined';
    },

    /**
     * Escapes the passed string for use in a regular expression
     * @param {String} str
     * @return {String}
     */
    escapeRe : function(s) {
        return s.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
    }
});

/**
 * URL to a blank file used by Ext when in secure mode for iframe src and onReady src to prevent
 * the IE insecure content warning (<tt>'about:blank'</tt>, except for IE in secure mode, which is <tt>'javascript:""'</tt>).
 * @type String
 */
Ext.SSL_SECURE_URL = Ext.isSecure && 'about:blank';

Ext.ns = Ext.namespace;

Ext.ns(
    'Ext.util',
    'Ext.data',
    'Ext.list',
    'Ext.form',
    'Ext.menu',
    'Ext.state',
    'Ext.layout',
    'Ext.app',
    'Ext.ux',
    'Ext.plugins',
    'Ext.direct'
);

/**
 * @class Function
 * These functions are available on every Function object (any JavaScript function).
 */
Ext.apply(Function.prototype, {
     /**
     * Creates an interceptor function. The passed function is called before the original one. If it returns false,
     * the original one is not called. The resulting function returns the results of the original function.
     * The passed function is called with the parameters of the original function. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

sayHi('Fred'); // alerts "Hi, Fred"

// create a new function that validates input without
// directly modifying the original function:
var sayHiToFriend = sayHi.createInterceptor(function(name){
    return name == 'Brian';
});

sayHiToFriend('Fred');  // no alert
sayHiToFriend('Brian'); // alerts "Hi, Brian"
       </code></pre>
     * @param {Function} fcn The function to call before the original
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the passed function is executed.
     * <b>If omitted, defaults to the scope in which the original function is called or the browser window.</b>
     * @return {Function} The new function
     */
    createInterceptor : function(fn, scope) {
        if (!Ext.isFunction(fn)) {
            return this;
        }
        else {
            var method = this;
            return function() {
                var me = this,
                    args = arguments;

                fn.target = me;
                fn.method = method;

                if (fn.apply(scope || me || window, args) !== false) {
                    return method.apply(me || window, args);
                }

                return null;
            };
        }
    },

    /**
     * Creates a delegate (callback) that sets the scope to obj.
     * Call directly on any function. Example: <code>this.myFunction.createDelegate(this, [arg1, arg2])</code>
     * Will create a function that is automatically scoped to obj so that the <tt>this</tt> variable inside the
     * callback points to obj. Example usage:
     * <pre><code>
var sayHi = function(name){
    // Note this use of "this.text" here.  This function expects to
    // execute within a scope that contains a text property.  In this
    // example, the "this" variable is pointing to the btn object that
    // was passed in createDelegate below.
    alert('Hi, ' + name + '. You clicked the "' + this.text + '" button.');
}

var btn = new Ext.Button({
    text: 'Say Hi',
    renderTo: Ext.getBody()
});

// This callback will execute in the scope of the
// button instance. Clicking the button alerts
// "Hi, Fred. You clicked the "Say Hi" button."
btn.on('click', sayHi.createDelegate(btn, ['Fred']));
       </code></pre>
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the function is executed.
     * <b>If omitted, defaults to the browser window.</b>
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     * if a number the args are inserted at the specified position
     * @return {Function} The new function
     */
    createDelegate : function(obj, args, appendArgs) {
        var method = this;
        return function() {
            var callArgs = args || arguments;
            if (appendArgs === true) {
                callArgs = Array.prototype.slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }
            else if (Ext.isNumber(appendArgs)) {
                callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
                var applyArgs = [appendArgs, 0].concat(args); // create method call params
                Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
            }
            return method.apply(obj || window, callArgs);
        };
    },

    /**
     * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

// executes immediately:
sayHi('Fred');

// executes after 2 seconds:
sayHi.defer(2000, this, ['Fred']);

// this syntax is sometimes useful for deferring
// execution of an anonymous function:
(function(){
    alert('Anonymous');
}).defer(100);
       </code></pre>
     * @param {Number} millis The number of milliseconds for the setTimeout call (if less than or equal to 0 the function is executed immediately)
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the function is executed.
     * <b>If omitted, defaults to the browser window.</b>
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     * if a number the args are inserted at the specified position
     * @return {Number} The timeout id that can be used with clearTimeout
     */
    defer : function(millis, obj, args, appendArgs) {
        var fn = this.createDelegate(obj, args, appendArgs);
        if (millis > 0) {
            return setTimeout(fn, millis);
        }
        fn();
        return 0;
    }
});

/**
 * @class String
 * These functions are available on every String object.
 */
Ext.applyIf(String.prototype, {
    /**
     * Escapes the passed string for ' and \
     * @param {String} string The string to escape
     * @return {String} The escaped string
     * @static
     */
    escape : function(string) {
        return string.replace(/('|\\)/g, "\\$1");
    },

    /**
     * Utility function that allows you to easily switch a string between two alternating values.  The passed value
     * is compared to the current string, and if they are equal, the other value that was passed in is returned.  If
     * they are already different, the first value passed in is returned.  Note that this method returns the new value
     * but does not change the current string.
     * <pre><code>
    // alternate sort directions
    sort = sort.toggle('ASC', 'DESC');

    // instead of conditional logic:
    sort = (sort == 'ASC' ? 'DESC' : 'ASC');
       </code></pre>
     * @param {String} value The value to compare to the current string
     * @param {String} other The new value to use if the string already equals the first value passed in
     * @return {String} The new value
     */
    toggle : function(value, other){
        return this == value ? other : value;
    },

    /**
     * Trims whitespace from either end of a string, leaving spaces within the string intact.  Example:
     * <pre><code>
    var s = '  foo bar  ';
    alert('-' + s + '-');         //alerts "- foo bar -"
    alert('-' + s.trim() + '-');  //alerts "-foo bar-"
       </code></pre>
     * @return {String} The trimmed string
     */
    trim : function() {
        var re = /^\s+|\s+$/g;
        return function() {
            return this.replace(re, "");
        };
    }()
});

/**
 * @class String
 * These functions are available on every String object.
 */
Ext.applyIf(String, {
    /**
     * Escapes the passed string for ' and \
     * @param {String} string The string to escape
     * @return {String} The escaped string
     * @static
     */
    escape : function(string) {
        return string.replace(/('|\\)/g, "\\$1");
    },

    /**
     * Pads the left side of a string with a specified character.  This is especially useful
     * for normalizing number and date strings.  Example usage:
     *
     * <pre><code>
var s = String.leftPad('123', 5, '0');
// s now contains the string: '00123'
       </code></pre>
     * @param {String} string The original string
     * @param {Number} size The total length of the output string
     * @param {String} char (optional) The character with which to pad the original string (defaults to empty string " ")
     * @return {String} The padded string
     * @static
     */
    leftPad : function (val, size, ch) {
        var result = String(val);
        if(!ch) {
            ch = " ";
        }
        while (result.length < size) {
            result = ch + result;
        }
        return result;
    },

    /**
     * Allows you to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
     * token must be unique, and must increment in the format {0}, {1}, etc.  Example usage:
     * <pre><code>
var cls = 'my-class', text = 'Some text';
var s = String.format('&lt;div class="{0}">{1}&lt;/div>', cls, text);
// s now contains the string: '&lt;div class="my-class">Some text&lt;/div>'
       </code></pre>
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

/**
 Returns the number of milliseconds between this date and date
 @param {Date} date (optional) Defaults to now
 @return {Number} The diff in milliseconds
 @member Date getElapsed
 */
Ext.applyIf(Date.prototype, {
    getElapsed: function(date) {
        return Math.abs((date || new Date()).getTime()-this.getTime());
    }
});

/**
 * @class Array
 */
Ext.applyIf(Array.prototype, {
    /**
     * Checks whether or not the specified object exists in the array.
     * @param {Object} o The object to check for
     * @param {Number} from (Optional) The index at which to begin the search
     * @return {Number} The index of o in the array (or -1 if it is not found)
     */
    indexOf : function(o, from) {
        var len = this.length;
        from = from || 0;
        from += (from < 0) ? len : 0;
        for (; from < len; ++from){
            if(this[from] === o){
                return from;
            }
        }
        return -1;
    },

    /**
     * Removes the specified object from the array.  If the object is not found nothing happens.
     * @param {Object} o The object to remove
     * @return {Array} this array
     */
    remove : function(o) {
        var index = this.indexOf(o);
        if(index != -1){
            this.splice(index, 1);
        }
        return this;
    },

    contains : function(o){
        return this.indexOf(o) !== -1;
    }
});

/**
 * @class Number
 */
Ext.applyIf(Number.prototype, {
    /**
     * Checks whether or not the current number is within a desired range.  If the number is already within the
     * range it is returned, otherwise the min or max value is returned depending on which side of the range is
     * exceeded.  Note that this method returns the constrained value but does not change the current number.
     * @param {Number} min The minimum number in the range
     * @param {Number} max The maximum number in the range
     * @return {Number} The constrained value if outside the range, otherwise the current value
     */
    constrain : function(min, max) {
        var number = parseInt(this, 10);
        if (typeof min == 'number') {
            number = Math.max(number, min);
        }
        if (typeof max == 'number') {
            number = Math.min(number, max);
        }
        return number;
    }
});

/**
 * @class Ext.Element
 * <p>Encapsulates a DOM element, adding simple DOM manipulation facilities, normalizing for browser differences.</p>
 * <p>All instances of this class inherit the methods of {@link Ext.Fx} making visual effects easily available to all DOM elements.</p>
 * <p>Note that the events documented in this class are not Ext events, they encapsulate browser events. To
 * access the underlying browser event, see {@link Ext.EventObject#browserEvent}. Some older
 * browsers may not support the full range of events. Which events are supported is beyond the control of ExtJs.</p>
 * Usage:<br>
<pre><code>
// by id
var el = Ext.get("my-div");

// by DOM element reference
var el = Ext.get(myDivElement);
</code></pre>
 * <b>Animations</b><br />
 * <p>When an element is manipulated, by default there is no animation.</p>
 * <pre><code>
var el = Ext.get("my-div");

// no animation
el.setWidth(100);
 * </code></pre>
 * <p>Many of the functions for manipulating an element have an optional "animate" parameter.  This
 * parameter can be specified as boolean (<tt>true</tt>) for default animation effects.</p>
 * <pre><code>
// default animation
el.setWidth(100, true);
 * </code></pre>
 *
 * <p>To configure the effects, an object literal with animation options to use as the Element animation
 * configuration object can also be specified. Note that the supported Element animation configuration
 * options are a subset of the {@link Ext.Fx} animation options specific to Fx effects.  The supported
 * Element animation configuration options are:</p>
<pre>
Option    Default   Description
--------- --------  ---------------------------------------------
{@link Ext.Fx#duration duration}  .35       The duration of the animation in seconds
{@link Ext.Fx#easing easing}    easeOut   The easing method
{@link Ext.Fx#callback callback}  none      A function to execute when the anim completes
{@link Ext.Fx#scope scope}     this      The scope (this) of the callback function
</pre>
 *
 * <pre><code>
// Element animation options object
var opt = {
    {@link Ext.Fx#duration duration}: 1,
    {@link Ext.Fx#easing easing}: 'elasticIn',
    {@link Ext.Fx#callback callback}: this.foo,
    {@link Ext.Fx#scope scope}: this
};
// animation with some options set
el.setWidth(100, opt);
 * </code></pre>
 * <p>The Element animation object being used for the animation will be set on the options
 * object as "anim", which allows you to stop or manipulate the animation. Here is an example:</p>
 * <pre><code>
// using the "anim" property to get the Anim object
if(opt.anim.isAnimated()){
    opt.anim.stop();
}
 * </code></pre>
 * <p>Also see the <tt>{@link #animate}</tt> method for another animation technique.</p>
 * <p><b> Composite (Collections of) Elements</b></p>
 * <p>For working with collections of Elements, see {@link Ext.CompositeElement}</p>
 * @constructor Create a new Element directly.
 * @param {String/HTMLElement} element
 * @param {Boolean} forceNew (optional) By default the constructor checks to see if there is already an instance of this element in the cache and if there is it returns the same instance. This will skip that check (useful for extending this class).
 */

(function() {
var El = Ext.Element = Ext.extend(Object, {
    /**
     * The default unit to append to CSS values where a unit isn't provided (defaults to px).
     * @type String
     */
    defaultUnit : "px",

    constructor : function(element, forceNew) {
        var dom = typeof element == 'string'
                ? document.getElementById(element)
                : element,
            id;

        if (!dom) {
            return null;
        }

        id = dom.id;
        if (!forceNew && id && Ext.cache[id]) {
            return Ext.cache[id].el;
        }

        /**
         * The DOM element
         * @type HTMLElement
         */
        this.dom = dom;

        /**
         * The DOM element ID
         * @type String
         */
        this.id = id || Ext.id(dom);
        
    },

    /**
     * Sets the passed attributes as attributes of this element (a style attribute can be a string, object or function)
     * @param {Object} o The object with the attributes
     * @param {Boolean} useSet (optional) false to override the default setAttribute to use expandos.
     * @return {Ext.Element} this
     */
    set : function(o, useSet) {
        var el = this.dom,
            attr,
            value;

        for (attr in o) {
            if (o.hasOwnProperty(attr)) {
                value = o[attr];
                if (attr == 'style') {
                    this.applyStyles(value);
                }
                else if (attr == 'cls') {
                    el.className = value;
                }
                else if (useSet !== false) {
                    el.setAttribute(attr, value);
                }
                else {
                    el[attr] = value;
                }
            }
        }
        return this;
    },

    /**
     * Returns true if this element matches the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @return {Boolean} True if this element matches the selector, else false
     */
    is : function(simpleSelector) {
        return Ext.DomQuery.is(this.dom, simpleSelector);
    },

    /**
     * Returns the value of the "value" attribute
     * @param {Boolean} asNumber true to parse the value as a number
     * @return {String/Number}
     */
    getValue : function(asNumber){
        var val = this.dom.value;
        return asNumber ? parseInt(val, 10) : val;
    },

    /**
     * Appends an event handler to this element.  The shorthand version {@link #on} is equivalent.
     * @param {String} eventName The name of event to handle.
     * @param {Function} fn The handler function the event invokes. This function is passed
     * the following parameters:<ul>
     * <li><b>evt</b> : EventObject<div class="sub-desc">The {@link Ext.EventObject EventObject} describing the event.</div></li>
     * <li><b>el</b> : HtmlElement<div class="sub-desc">The DOM element which was the target of the event.
     * Note that this may be filtered by using the <tt>delegate</tt> option.</div></li>
     * <li><b>o</b> : Object<div class="sub-desc">The options object from the addListener call.</div></li>
     * </ul>
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to this Element.</b>.
     * @param {Object} options (optional) An object containing handler configuration properties.
     * This may contain any of the following properties:<ul>
     * <li><b>scope</b> Object : <div class="sub-desc">The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to this Element.</b></div></li>
     * <li><b>delegate</b> String: <div class="sub-desc">A simple selector to filter the target or look for a descendant of the target. See below for additional details.</div></li>
     * <li><b>stopEvent</b> Boolean: <div class="sub-desc">True to stop the event. That is stop propagation, and prevent the default action.</div></li>
     * <li><b>preventDefault</b> Boolean: <div class="sub-desc">True to prevent the default action</div></li>
     * <li><b>stopPropagation</b> Boolean: <div class="sub-desc">True to prevent event propagation</div></li>
     * <li><b>normalized</b> Boolean: <div class="sub-desc">False to pass a browser event to the handler function instead of an Ext.EventObject</div></li>
     * <li><b>target</b> Ext.Element: <div class="sub-desc">Only call the handler if the event was fired on the target Element, <i>not</i> if the event was bubbled up from a child node.</div></li>
     * <li><b>delay</b> Number: <div class="sub-desc">The number of milliseconds to delay the invocation of the handler after the event fires.</div></li>
     * <li><b>single</b> Boolean: <div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
     * <li><b>buffer</b> Number: <div class="sub-desc">Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
     * by the specified number of milliseconds. If the event fires again within that time, the original
     * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
     * </ul><br>
     * <p>
     * <b>Combining Options</b><br>
     * In the following examples, the shorthand form {@link #on} is used rather than the more verbose
     * addListener.  The two are equivalent.  Using the options argument, it is possible to combine different
     * types of listeners:<br>
     * <br>
     * A delayed, one-time listener that auto stops the event and adds a custom argument (forumId) to the
     * options object. The options object is available as the third parameter in the handler function.<div style="margin: 5px 20px 20px;">
     * Code:<pre><code>
el.on('tap', this.onTap, this, {
    single: true,
    delay: 100,
    stopEvent : true
});</code></pre></p>
     * <p>
     * <b>Attaching multiple handlers in 1 call</b><br>
     * The method also allows for a single argument to be passed which is a config object containing properties
     * which specify multiple handlers.</p>
     * <p>
     * Code:<pre><code>
el.on({
    'tap' : {
        fn: this.onTap,
        scope: this
    },
    'doubletap' : {
        fn: this.onDoubleTap,
        scope: this
    },
    'swipe' : {
        fn: this.onSwipe,
        scope: this
    }
});</code></pre>
     * <p>
     * Or a shorthand syntax:<br>
     * Code:<pre><code></p>
el.on({
    'tap' : this.onTap,
    'doubletap' : this.onDoubleTap,
    'swipe' : this.onSwipe,
    scope: this
});
     * </code></pre></p>
     * <p><b>delegate</b></p>
     * <p>This is a configuration option that you can pass along when registering a handler for
     * an event to assist with event delegation. Event delegation is a technique that is used to
     * reduce memory consumption and prevent exposure to memory-leaks. By registering an event
     * for a container element as opposed to each element within a container. By setting this
     * configuration option to a simple selector, the target element will be filtered to look for
     * a descendant of the target.
     * For example:<pre><code>
// using this markup:
&lt;div id='elId'>
    &lt;p id='p1'>paragraph one&lt;/p>
    &lt;p id='p2' class='clickable'>paragraph two&lt;/p>
    &lt;p id='p3'>paragraph three&lt;/p>
&lt;/div>
// utilize event delegation to registering just one handler on the container element:
el = Ext.get('elId');
el.on(
    'tap',
    function(e,t) {
        // handle click
        console.info(t.id); // 'p2'
    },
    this,
    {
        // filter the target element to be a descendant with the class 'tappable'
        delegate: '.tappable'
    }
);
     * </code></pre></p>
     * @return {Ext.Element} this
     */
    addListener : function(eventName, fn, scope, options){
        Ext.EventManager.on(this.dom,  eventName, fn, scope || this, options);
        return this;
    },

    /**
     * Removes an event handler from this element.  The shorthand version {@link #un} is equivalent.
     * <b>Note</b>: if a <i>scope</i> was explicitly specified when {@link #addListener adding} the
     * listener, the same scope must be specified here.
     * Example:
     * <pre><code>
el.removeListener('tap', this.handlerFn);
// or
el.un('tap', this.handlerFn);
</code></pre>
     * @param {String} eventName The name of the event from which to remove the handler.
     * @param {Function} fn The handler function to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object} scope If a scope (<b><code>this</code></b> reference) was specified when the listener was added,
     * then this must refer to the same object.
     * @return {Ext.Element} this
     */
    removeListener : function(eventName, fn, scope) {
        Ext.EventManager.un(this.dom, eventName, fn, scope);
        return this;
    },

    /**
     * Removes all previous added listeners from this element
     * @return {Ext.Element} this
     */
    removeAllListeners : function(){
        Ext.EventManager.removeAll(this.dom);
        return this;
    },

    /**
     * Recursively removes all previous added listeners from this element and its children
     * @return {Ext.Element} this
     */
    purgeAllListeners : function() {
        Ext.EventManager.purgeElement(this, true);
        return this;
    },

    /**
     * <p>Removes this element's dom reference.  Note that event and cache removal is handled at {@link Ext#removeNode}</p>
     */
    remove : function() {
        var me = this,
            dom = me.dom;

        if (dom) {
            delete me.dom;
            Ext.removeNode(dom);
        }
    },

    isAncestor : function(c) {
        var p = this.dom;
        c = Ext.getDom(c);
        if (p && c) {
            return p.contains(c);
        }
        return false;
    },

    /**
     * Determines if this element is a descendent of the passed in Element.
     * @param {Mixed} element An Ext.Element, HTMLElement or string linking to an id of an Element.
     * @returns {Boolean}
     */
    isDescendent : function(p) {
        return Ext.fly(p).isAncestorOf(this);
    },

    /**
     * Returns true if this element is an ancestor of the passed element
     * @param {HTMLElement/String} el The element to check
     * @return {Boolean} True if this element is an ancestor of el, else false
     */
    contains : function(el) {
        return !el ? false : this.isAncestor(el);
    },

    /**
     * Returns the value of an attribute from the element's underlying DOM node.
     * @param {String} name The attribute name
     * @param {String} namespace (optional) The namespace in which to look for the attribute
     * @return {String} The attribute value
     */
    getAttribute : function(name, ns) {
        var d = this.dom;
        return d.getAttributeNS(ns, name) || d.getAttribute(ns + ":" + name) || d.getAttribute(name) || d[name];
    },

    /**
    * Set the innerHTML of this element
    * @param {String} html The new HTML
    * @return {Ext.Element} this
     */
    setHTML : function(html) {
        if(this.dom) {
            this.dom.innerHTML = html;
        }
        return this;
    },

    /**
     * Returns the innerHTML of an Element or an empty string if the element's
     * dom no longer exists.
     */
    getHTML : function() {
        return this.dom ? this.dom.innerHTML : '';
    },

    /**
     * Hide this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    hide : function() {
        this.setVisible(false);
        return this;
    },

    /**
    * Show this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
    * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    show : function() {
        this.setVisible(true);
        return this;
    },

    /**
     * Sets the visibility of the element (see details). If the visibilityMode is set to Element.DISPLAY, it will use
     * the display property to hide the element, otherwise it uses visibility. The default is to hide and show using the visibility property.
     * @param {Boolean} visible Whether the element is visible
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
     setVisible : function(visible, animate) {
        var me = this,
            dom = me.dom,
            mode = this.getVisibilityMode();

        switch (mode) {
            case El.VISIBILITY:
                this.removeClass(['x-hidden-display', 'x-hidden-offsets']);
                this[visible ? 'removeClass' : 'addClass']('x-hidden-visibility');
            break;

            case El.DISPLAY:
                this.removeClass(['x-hidden-visibility', 'x-hidden-offsets']);
                this[visible ? 'removeClass' : 'addClass']('x-hidden-display');
            break;

            case El.OFFSETS:
                this.removeClass(['x-hidden-visibility', 'x-hidden-display']);
                this[visible ? 'removeClass' : 'addClass']('x-hidden-offsets');
            break;
        }

        return me;
    },

    getVisibilityMode: function() {
        var dom = this.dom,
            mode = El.data(dom, 'visibilityMode');

        if (mode === undefined) {
            El.data(dom, 'visibilityMode', mode = El.DISPLAY);
        }

        return mode;
    },

    setDisplayMode : function(mode) {
        El.data(this.dom, 'visibilityMode', mode);
        return this;
    }
});

var Elp = El.prototype;

/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use visibility to hide element
 * @static
 * @type Number
 */
El.VISIBILITY = 1;
/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use display to hide element
 * @static
 * @type Number
 */
El.DISPLAY = 2;
/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use offsets to hide element
 * @static
 * @type Number
 */
El.OFFSETS = 3;


El.addMethods = function(o){
   Ext.apply(Elp, o);
};


Elp.on = Elp.addListener;
Elp.un = Elp.removeListener;

// Alias for people used to Ext JS and Ext Core
Elp.update = Elp.setHTML;

/**
 * Retrieves Ext.Element objects.
 * <p><b>This method does not retrieve {@link Ext.Component Component}s.</b> This method
 * retrieves Ext.Element objects which encapsulate DOM elements. To retrieve a Component by
 * its ID, use {@link Ext.ComponentMgr#get}.</p>
 * <p>Uses simple caching to consistently return the same object. Automatically fixes if an
 * object was recreated with the same id via AJAX or DOM.</p>
 * @param {Mixed} el The id of the node, a DOM Node or an existing Element.
 * @return {Element} The Element object (or null if no matching element was found)
 * @static
 * @member Ext.Element
 * @method get
 */
El.get = function(el){
    var extEl,
        dom,
        id;

    if(!el){
        return null;
    }

    if (typeof el == "string") { // element id
        if (!(dom = document.getElementById(el))) {
            return null;
        }
        if (Ext.cache[el] && Ext.cache[el].el) {
            extEl = Ext.cache[el].el;
            extEl.dom = dom;
        } else {
            extEl = El.addToCache(new El(dom));
        }
        return extEl;
    } else if (el.tagName) { // dom element
        if(!(id = el.id)){
            id = Ext.id(el);
        }
        if (Ext.cache[id] && Ext.cache[id].el) {
            extEl = Ext.cache[id].el;
            extEl.dom = el;
        } else {
            extEl = El.addToCache(new El(el));
        }
        return extEl;
    } else if (el instanceof El) {
        if(el != El.docEl){
            // refresh dom element in case no longer valid,
            // catch case where it hasn't been appended
            el.dom = document.getElementById(el.id) || el.dom;
        }
        return el;
    } else if(el.isComposite) {
        return el;
    } else if(Ext.isArray(el)) {
        return El.select(el);
    } else if(el == document) {
        // create a bogus element object representing the document object
        if(!El.docEl){
            var F = function(){};
            F.prototype = Elp;
            El.docEl = new F();
            El.docEl.dom = document;
        }
        return El.docEl;
    }
    return null;
};

// private
El.addToCache = function(el, id){
    id = id || el.id;
    Ext.cache[id] = {
        el:  el,
        data: {},
        events: {}
    };
    return el;
};

// private method for getting and setting element data
El.data = function(el, key, value) {
    el = El.get(el);
    if (!el) {
        return null;
    }
    var c = Ext.cache[el.id].data;
    if(arguments.length == 2) {
        return c[key];
    }
    else {
        return (c[key] = value);
    }
};

// private
// Garbage collection - uncache elements/purge listeners on orphaned elements
// so we don't hold a reference and cause the browser to retain them
El.garbageCollect = function(){
    if(!Ext.enableGarbageCollector){
        clearInterval(El.collectorThreadId);
    } else {
        var id,
            el,
            dom,
            o;

        for(id in Ext.cache){
            o = Ext.cache[id];
            if(o.skipGarbageCollection){
                continue;
            }
            el = o.el;
            dom = el.dom;
            if(!dom || !dom.parentNode || (!dom.offsetParent && !document.getElementById(id))){
                if(Ext.enableListenerCollection){
                    Ext.EventManager.removeAll(dom);
                }
                delete Ext.cache[eid];
            }
        }
    }
};
//El.collectorThreadId = setInterval(El.garbageCollect, 20000);

// dom is optional
El.Flyweight = function(dom) {
    this.dom = dom;
};

var F = function(){};
F.prototype = Elp;

El.Flyweight.prototype = new F;
El.Flyweight.prototype.isFlyweight = true;

El._flyweights = {};

/**
 * <p>Gets the globally shared flyweight Element, with the passed node as the active element. Do not store a reference to this element -
 * the dom node can be overwritten by other code. Shorthand of {@link Ext.Element#fly}</p>
 * <p>Use this to make one-time references to DOM elements which are not going to be accessed again either by
 * application code, or by Ext's classes. If accessing an element which will be processed regularly, then {@link Ext#get}
 * will be more appropriate to take advantage of the caching provided by the Ext.Element class.</p>
 * @param {String/HTMLElement} el The dom node or id
 * @param {String} named (optional) Allows for creation of named reusable flyweights to prevent conflicts
 * (e.g. internally Ext uses "_global")
 * @return {Element} The shared Element object (or null if no matching element was found)
 * @member Ext.Element
 * @method fly
 */
El.fly = function(el, named) {
    var ret = null;
    named = named || '_global';

    el = Ext.getDom(el);
    if (el) {
        (El._flyweights[named] = El._flyweights[named] || new El.Flyweight()).dom = el;
        ret = El._flyweights[named];
    }

    return ret;
};

/**
 * Retrieves Ext.Element objects.
 * <p><b>This method does not retrieve {@link Ext.Component Component}s.</b> This method
 * retrieves Ext.Element objects which encapsulate DOM elements. To retrieve a Component by
 * its ID, use {@link Ext.ComponentMgr#get}.</p>
 * <p>Uses simple caching to consistently return the same object. Automatically fixes if an
 * object was recreated with the same id via AJAX or DOM.</p>
 * Shorthand of {@link Ext.Element#get}
 * @param {Mixed} el The id of the node, a DOM Node or an existing Element.
 * @return {Element} The Element object (or null if no matching element was found)
 * @member Ext
 * @method get
 */
Ext.get = El.get;

/**
 * <p>Gets the globally shared flyweight Element, with the passed node as the active element. Do not store a reference to this element -
 * the dom node can be overwritten by other code. Shorthand of {@link Ext.Element#fly}</p>
 * <p>Use this to make one-time references to DOM elements which are not going to be accessed again either by
 * application code, or by Ext's classes. If accessing an element which will be processed regularly, then {@link Ext#get}
 * will be more appropriate to take advantage of the caching provided by the Ext.Element class.</p>
 * @param {String/HTMLElement} el The dom node or id
 * @param {String} named (optional) Allows for creation of named reusable flyweights to prevent conflicts
 * (e.g. internally Ext uses "_global")
 * @return {Element} The shared Element object (or null if no matching element was found)
 * @member Ext
 * @method fly
 */
Ext.fly = El.fly;

/*Ext.EventManager.on(window, 'unload', function(){
    delete Ext.cache;
    delete El._flyweights;
});*/

})();

Ext.applyIf(Ext.Element, {
    unitRe: /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,
    camelRe: /(-[a-z])/gi,
    opacityRe: /alpha\(opacity=(.*)\)/i,
    propertyCache: {},
    borders: {l: 'border-left-width', r: 'border-right-width', t: 'border-top-width', b: 'border-bottom-width'},
    paddings: {l: 'padding-left', r: 'padding-right', t: 'padding-top', b: 'padding-bottom'},
    margins: {l: 'margin-left', r: 'margin-right', t: 'margin-top', b: 'margin-bottom'},

    addUnits : function(size) {
        if (size === "" || size == "auto" || size === undefined) {
            size = size || '';
        }
        else if (!isNaN(size) || !this.unitRe.test(size)) {
            size = size + (this.defaultUnit || 'px');
        }
        return size;
    },

    /**
     * Parses a number or string representing margin sizes into an object. Supports CSS-style margin declarations
     * (e.g. 10, "10", "10 10", "10 10 10" and "10 10 10 10" are all valid options and would return the same result)
     * @param {Number|String} v The encoded margins
     * @return {Object} An object with margin sizes for top, right, bottom and left
     */
    parseBox : function(box) {
        if (typeof box != 'string') {
            box = box.toString();
        }
        var parts  = box.split(' '),
            ln = parts.length;

        if (ln == 1) {
            parts[1] = parts[2] = parts[3] = parts[0];
        }
        else if (ln == 2) {
            parts[2] = parts[0];
            parts[3] = parts[1];
        }
        else if (ln == 3) {
            parts[3] = parts[1];
        }

        return {
            top   :parseInt(parts[0], 10) || 0,
            right :parseInt(parts[1], 10) || 0,
            bottom:parseInt(parts[2], 10) || 0,
            left  :parseInt(parts[3], 10) || 0
        };
    },

    // private
    camelReplaceFn : function(m, a) {
        return a.charAt(1).toUpperCase();
    },

    /**
     * Normalizes CSS property keys from dash delimited to camel case JavaScript Syntax.
     * For example:
     * <ul>
     *  <li>border-width -> borderWidth</li>
     *  <li>padding-top -> paddingTop</li>
     * </ul>
     */
    normalize : function(prop) {
        return this.propertyCache[prop] || (this.propertyCache[prop] = prop == 'float' ? 'cssFloat' : prop.replace(this.camelRe, this.camelReplaceFn));
    },

    /**
     * Retrieves the document height
     * @returns {Number} documentHeight
     */
    getDocumentHeight: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollHeight : document.documentElement.scrollHeight, this.getViewportHeight());
    },

    /**
     * Retrieves the document width
     * @returns {Number} documentWidth
     */
    getDocumentWidth: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollWidth : document.documentElement.scrollWidth, this.getViewportWidth());
    },

    /**
     * Retrieves the viewport height of the window.
     * @returns {Number} viewportHeight
     */
    getViewportHeight: function(){
        return window.innerHeight;
    },

    /**
     * Retrieves the viewport width of the window.
     * @returns {Number} viewportWidth
     */
    getViewportWidth : function() {
        return window.innerWidth;
    },

    /**
     * Retrieves the viewport size of the window.
     * @returns {Object} object containing width and height properties
     */
    getViewSize : function() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },

    /**
     * Retrieves the current orientation of the window. This is calculated by
     * determing if the height is greater than the width.
     * @returns {String} Orientation of window: 'portrait' or 'landscape'
     */
    getOrientation : function() {
        return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
    },

    /** Returns the top Element that is located at the passed coordinates
     * Function description
     * @param {Number} x The x coordinate
     * @param {Number} x The y coordinate
     * @return {String} The found Element
     */
    fromPoint: function(x, y) {
        return Ext.get(document.elementFromPoint(x, y));
    }
});

/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
      * Gets the current Y position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
      * @return {Number} The Y position of the element
      */
    getY : function(el) {
        return this.getXY(el)[1];
    },

    /**
      * Gets the current X position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
      * @return {Number} The X position of the element
      */
    getX : function(el) {
        return this.getXY(el)[0];
    },

    /**
      * Gets the current position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
      * @return {Array} The XY position of the element
      */
    getXY : function() {
        // @FEATUREDETECT
        var point = window.webkitConvertPointFromNodeToPage(this.dom, new WebKitPoint(0, 0));
        return [point.x, point.y];
    },

    /**
      * Returns the offsets of this element from the passed element. Both element must be part of the DOM tree and not have display:none to have page coordinates.
      * @param {Mixed} element The element to get the offsets from.
      * @return {Array} The XY page offsets (e.g. [100, -200])
      */
    getOffsetsTo : function(el){
        var o = this.getXY(),
            e = Ext.fly(el, '_internal').getXY();
        return [o[0]-e[0],o[1]-e[1]];
    },

    /**
     * Sets the position of the element in page coordinates, regardless of how the element is positioned.
     * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Array} pos Contains X & Y [x, y] values for new position (coordinates are page-based)
     * @return {Ext.Element} this
     */
    setXY : function(pos) {
        var me = this;

        if(arguments.length > 1) {
            pos = [pos, arguments[1]];
        }

        // me.position();
        var pts = me.translatePoints(pos),
            style = me.dom.style;

        for (pos in pts) {
            if(!isNaN(pts[pos])) style[pos] = pts[pos] + "px";
        }
        return me;
    },

    /**
     * Sets the X position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Number} The X position of the element
     * @return {Ext.Element} this
     */
    setX : function(x){
        return this.setXY([x, this.getY()]);
    },

    /**
     * Sets the Y position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Number} The Y position of the element
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setY : function(y) {
        return this.setXY([this.getX(), y]);
    },

    /**
     * Sets the element's left position directly using CSS style (instead of {@link #setX}).
     * @param {String} left The left CSS property value
     * @return {Ext.Element} this
     */
    setLeft : function(left) {
        this.setStyle('left', Ext.Element.addUnits(left));
        return this;
    },

    /**
     * Sets the element's top position directly using CSS style (instead of {@link #setY}).
     * @param {String} top The top CSS property value
     * @return {Ext.Element} this
     */
    setTop : function(top) {
        this.setStyle('top', Ext.Element.addUnits(top));
        return this;
    },

    /**
     * Sets the element's top and left positions directly using CSS style (instead of {@link #setXY})
     * @param {String} top The top CSS property value
     * @param {String} left The left CSS property value
     */
    setTopLeft: function(top, left) {
        var addUnits = Ext.Element.addUnits;

        this.setStyle('top', addUnits(top));
        this.setStyle('left', addUnits(left));

        return this;
    },

    /**
     * Sets the element's CSS right style.
     * @param {String} right The right CSS property value
     * @return {Ext.Element} this
     */
    setRight : function(right) {
        this.setStyle('right', Ext.Element.addUnits(right));
        return this;
    },

    /**
     * Sets the element's CSS bottom style.
     * @param {String} bottom The bottom CSS property value
     * @return {Ext.Element} this
     */
    setBottom : function(bottom) {
        this.setStyle('bottom', Ext.Element.addUnits(bottom));
        return this;
    },

    /**
     * Gets the left X coordinate
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getLeft : function(local) {
        return parseInt(this.getStyle('left'), 10) || 0;
    },

    /**
     * Gets the right X coordinate of the element (element X position + element width)
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getRight : function(local) {
        return parseInt(this.getStyle('right'), 10) || 0;
    },

    /**
     * Gets the top Y coordinate
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getTop : function(local) {
        return parseInt(this.getStyle('top'), 10) || 0;
    },

    /**
     * Gets the bottom Y coordinate of the element (element Y position + element height)
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getBottom : function(local) {
        return parseInt(this.getStyle('bottom'), 10) || 0;
    },

    /**
     * Sets the element's box. Use getBox() on another element to get a box obj. If animate is true then width, height, x and y will be animated concurrently.
     * @param {Object} box The box to fill {x, y, width, height}
     * @return {Ext.Element} this
     */
    setBox : function(left, top, width, height) {
        var undefined;
        if (Ext.isObject(left)) {
            width = left.width;
            height = left.height;
            top = left.top;
            left = left.left;
        }
        if (left !== undefined || top !== undefined || width !== undefined || height !== undefined) {
            if (left !== undefined) {
                this.setLeft(left);
            }
            if (top !== undefined) {
                this.setTop(top);
            }
            if (width !== undefined) {
                this.setWidth(width);
            }
            if (height !== undefined) {
                this.setHeight(height);
            }
        }
        return this;
    },

    /**
     * Return an object defining the area of this Element which can be passed to {@link #setBox} to
     * set another Element's size/location to match this element.
     * @param {Boolean} contentBox (optional) If true a box for the content of the element is returned.
     * @param {Boolean} local (optional) If true the element's left and top are returned instead of page x/y.
     * @return {Object} box An object in the format<pre><code>
{
    x: &lt;Element's X position>,
    y: &lt;Element's Y position>,
    width: &lt;Element's width>,
    height: &lt;Element's height>,
    bottom: &lt;Element's lower bound>,
    right: &lt;Element's rightmost bound>
}
</code></pre>
     * The returned object may also be addressed as an Array where index 0 contains the X position
     * and index 1 contains the Y position. So the result may also be used for {@link #setXY}
     */
    getBox : function(contentBox, local) {
        var me = this,
            dom = me.dom,
            width = dom.offsetWidth,
            height = dom.offsetHeight,
            xy, box, l, r, t, b;

        if (!local) {
            xy = me.getXY();
        }
        else if (contentBox) {
            xy = [0,0];
        }
        else {
            xy = [parseInt(me.getStyle("left"), 10) || 0, parseInt(me.getStyle("top"), 10) || 0];
        }

        if (!contentBox) {
            box = {
                x: xy[0],
                y: xy[1],
                0: xy[0],
                1: xy[1],
                width: width,
                height: height
            };
        }
        else {
            l = me.getBorderWidth.call(me, "l") + me.getPadding.call(me, "l");
            r = me.getBorderWidth.call(me, "r") + me.getPadding.call(me, "r");
            t = me.getBorderWidth.call(me, "t") + me.getPadding.call(me, "t");
            b = me.getBorderWidth.call(me, "b") + me.getPadding.call(me, "b");
            box = {
                x: xy[0] + l,
                y: xy[1] + t,
                0: xy[0] + l,
                1: xy[1] + t,
                width: width - (l + r),
                height: height - (t + b)
            };
        }

        box.left = box.x;
        box.top = box.y;
        box.right = box.x + box.width;
        box.bottom = box.y + box.height;

        return box;
    },

    /**
     * Return an object defining the area of this Element which can be passed to {@link #setBox} to
     * set another Element's size/location to match this element.
     * @param {Boolean} asRegion(optional) If true an Ext.util.Region will be returned
     * @return {Object} box An object in the format<pre><code>
{
    x: &lt;Element's X position>,
    y: &lt;Element's Y position>,
    width: &lt;Element's width>,
    height: &lt;Element's height>,
    bottom: &lt;Element's lower bound>,
    right: &lt;Element's rightmost bound>
}
</code></pre>
     * The returned object may also be addressed as an Array where index 0 contains the X position
     * and index 1 contains the Y position. So the result may also be used for {@link #setXY}
     */
    getPageBox : function(getRegion) {
        var me = this,
            el = me.dom,
            w = el.offsetWidth,
            h = el.offsetHeight,
            xy = me.getXY(),
            t = xy[1],
            r = xy[0] + w,
            b = xy[1] + h,
            l = xy[0];

        if (getRegion) {
            return new Ext.util.Region(t, r, b, l);
        }
        else {
            return {
                left: l,
                top: t,
                width: w,
                height: h,
                right: r,
                bottom: b
            };
        }
    },

    /**
     * Translates the passed page coordinates into left/top css values for this element
     * @param {Number/Array} x The page x or an array containing [x, y]
     * @param {Number} y (optional) The page y, required if x is not an array
     * @return {Object} An object with left and top properties. e.g. {left: (value), top: (value)}
     */
    translatePoints : function(x, y) {
        y = isNaN(x[1]) ? y : x[1];
        x = isNaN(x[0]) ? x : x[0];
        var me = this,
            relative = me.isStyle('position', 'relative'),
            o = me.getXY(),
            l = parseInt(me.getStyle('left'), 10),
            t = parseInt(me.getStyle('top'), 10);

        l = !isNaN(l) ? l : (relative ? 0 : me.dom.offsetLeft);
        t = !isNaN(t) ? t : (relative ? 0 : me.dom.offsetTop);

        return {left: (x - o[0] + l), top: (y - o[1] + t)};
    }
});

(function(){
	/**
	 * @class Ext.Element
	 */
	Ext.Element.classReCache = {};
	var El = Ext.Element,
        view = document.defaultView;
	
	El.addMethods({
	    marginRightRe: /marginRight/i,
	    trimRe: /^\s+|\s+$/g,
	    spacesRe: /\s+/,
	
	    /**
	     * Adds one or more CSS classes to the element. Duplicate classes are automatically filtered out.
	     * @param {String/Array} className The CSS class to add, or an array of classes
	     * @return {Ext.Element} this
	     */
	    addClass: function(className) {
	        var me = this,
	            i,
	            len,
	            v,
	            cls = [];
	
	        if (!Ext.isArray(className)) {
	            if (className && !this.hasClass(className)) {
	                me.dom.className += " " + className;
	            }
	        }
	        else {
	            for (i = 0, len = className.length; i < len; i++) {
	                v = className[i];
	                if (v && !me.hasClass(v)) {
	                    cls.push(v);
	                }
	            }
	            if (cls.length) {
	                me.dom.className += " " + cls.join(" ");
	            }
	        }
	        return me;
	    },
	
	    /**
	     * Removes one or more CSS classes from the element.
	     * @param {String/Array} className The CSS class to remove, or an array of classes
	     * @return {Ext.Element} this
	     */
	    removeClass: function(className) {
	        var me = this,
	            i,
	            idx,
	            len,
	            cls,
	            elClasses;
	        if (!Ext.isArray(className)) {
	            className = [className];
	        }
	        if (me.dom && me.dom.className) {
	            elClasses = me.dom.className.replace(this.trimRe, '').split(this.spacesRe);
	            for (i = 0, len = className.length; i < len; i++) {
	                cls = className[i];
	                if (typeof cls == 'string') {
	                    cls = cls.replace(this.trimRe, '');
	                    idx = elClasses.indexOf(cls);
	                    if (idx != -1) {
	                        elClasses.splice(idx, 1);
	                    }
	                }
	            }
	            me.dom.className = elClasses.join(" ");
	        }
	        return me;
	    },
	
	    /**
	     * Masks the element.
	     */
	    mask: function(transparent, html) {
	        var me = this,
	            dom = me.dom,
	            el = Ext.Element.data(dom, 'mask'),
	            mask;
	
	        me.addClass('x-masked');
	        if (me.getStyle("position") == "static") {
	            me.addClass('x-masked-relative');
	        }
	        if (el) {
	            el.remove();
	        }
	        mask = me.createChild({
	            cls: 'x-mask' + (transparent ? ' x-mask-transparent': ''),
	            html: html || ''
	        });
	        Ext.Element.data(dom, 'mask', mask);
	    },
	
	    /**
	     * Removes a previously applied mask.
	     */
	    unmask: function() {
	        var me = this,
	            dom = me.dom,
	        mask = Ext.Element.data(dom, 'mask');
	
	        if (mask) {
	            mask.remove();
	            Ext.Element.data(dom, 'mask', undefined);
	        }
	        me.removeClass(['x-masked', 'x-masked-relative']);
	    },
	
	    /**
	     * Adds one or more CSS classes to this element and removes the same class(es) from all siblings.
	     * @param {String/Array} className The CSS class to add, or an array of classes
	     * @return {Ext.Element} this
	     */
	    radioClass: function(className) {
	        var cn = this.dom.parentNode.childNodes,
	            v;
	        className = Ext.isArray(className) ? className: [className];
	        for (var i = 0, len = cn.length; i < len; i++) {
	            v = cn[i];
	            if (v && v.nodeType == 1) {
	                Ext.fly(v, '_internal').removeClass(className);
	            }
	        };
	        return this.addClass(className);
	    },
	
	    /**
	     * Toggles the specified CSS class on this element (removes it if it already exists, otherwise adds it).
	     * @param {String} className The CSS class to toggle
	     * @return {Ext.Element} this
	     */
	    toggleClass: function(className) {
	        return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	    },
	
	    /**
	     * Checks if the specified CSS class exists on this element's DOM node.
	     * @param {String} className The CSS class to check for
	     * @return {Boolean} True if the class exists, else false
	     */
	    hasClass: function(className) {
	        return className && (' ' + this.dom.className + ' ').indexOf(' ' + className + ' ') != -1;
	    },
	
	    /**
	     * Replaces a CSS class on the element with another.  If the old name does not exist, the new name will simply be added.
	     * @param {String} oldClassName The CSS class to replace
	     * @param {String} newClassName The replacement CSS class
	     * @return {Ext.Element} this
	     */
	    replaceClass: function(oldClassName, newClassName) {
	        return this.removeClass(oldClassName).addClass(newClassName);
	    },
	
	    isStyle: function(style, val) {
	        return this.getStyle(style) == val;
	    },
	
	    /**
	     * Normalizes currentStyle and computedStyle.
	     * @param {String} property The style property whose value is returned.
	     * @return {String} The current value of the style property for this element.
	     */
	    getStyle: function(prop) {	    
	        var dom = this.dom,
	            result,
	            display,
                cs,
                platform = Ext.platform,
                style = dom.style;
	
	        prop = El.normalize(prop);
	        cs = (view) ? view.getComputedStyle(dom,'') : dom.currentStyle;
            result = (cs) ? cs[prop] : null;

	        // Fix bug caused by this: https://bugs.webkit.org/show_bug.cgi?id=13343
            if (result && !platform.correctRightMargin && 
                    this.marginRightRe.test(prop) && 
                    style.position != 'absolute' && 
                    result != '0px') {
                display = style.display;
                style.display = 'inline-block';
                result = view.getComputedStyle(dom, null)[prop];
                style.display = display;
            }
	       
            result || (result = style[prop]);
            
	        // Webkit returns rgb values for transparent.
	        if (!platform.correctTransparentColor && result == 'rgba(0, 0, 0, 0)') {
	            result = 'transparent';
	        }
	
	        return result;
	    },
	
	    /**
	     * Wrapper for setting style properties, also takes single object parameter of multiple styles.
	     * @param {String/Object} property The style property to be set, or an object of multiple styles.
	     * @param {String} value (optional) The value to apply to the given property, or null if an object was passed.
	     * @return {Ext.Element} this
	     */
	    setStyle: function(prop, value) {
	        var tmp,
	            style;
	
	        if (typeof prop == 'string') {
	            tmp = {};
	            tmp[prop] = value;
	            prop = tmp;
	        }
	
	        for (style in prop) {
	            if(prop.hasOwnProperty(style)){
		            this.dom.style[El.normalize(style)] = prop[style];
	            }
	        }
	
	        return this;
	    },
	
	    /**
	     * Applies a style specification to an element.
	     * @param {String/HTMLElement} el The element to apply styles to
	     * @param {String/Object/Function} styles A style specification string e.g. 'width:100px', or object in the form {width:'100px'}, or
	     * a function which returns such a specification.
	     */
	    applyStyles: function(styles) {
	        if (styles) {
	            var i,
	                len,
                    dom = this.dom;
                    
	            if (typeof styles == 'function') {
	                styles = styles.call();
	            }
	            if (typeof styles == 'string') {
	                styles = styles.trim().split(/\s*(?::|;)\s*/);
	                for (i = 0, len = styles.length; i < len;) {
	                    dom.style[El.normalize(styles[i++])] = styles[i++];
	                }
	            }
	            else if (typeof styles == 'object') {
	                this.setStyle(styles);
	            }
	        }
	    },
	
	    /**
	     * Returns the offset height of the element
	     * @param {Boolean} contentHeight (optional) true to get the height minus borders and padding
	     * @return {Number} The element's height
	     */
	    getHeight: function(contentHeight) {
	        var dom = this.dom,
	            height = contentHeight ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight;
	        return height > 0 ? height: 0;
	    },
	
	    /**
	     * Returns the offset width of the element
	     * @param {Boolean} contentWidth (optional) true to get the width minus borders and padding
	     * @return {Number} The element's width
	     */
	    getWidth: function(contentWidth) {
	        var dom = this.dom,
	            width = contentWidth ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth;
	        return width > 0 ? width: 0;
	    },
	
	    /**
	     * Set the width of this Element.
	     * @param {Mixed} width The new width. This may be one of:<div class="mdetail-params"><ul>
	     * <li>A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).</li>
	     * <li>A String used to set the CSS width style. Animation may <b>not</b> be used.
	     * </ul></div>
	     * @return {Ext.Element} this
	     */
	    setWidth: function(width) {
	        var me = this;
	            me.dom.style.width = El.addUnits(width);
	        return me;
	    },
	
	    /**
	     * Set the height of this Element.
	     * <pre><code>
	    // change the height to 200px and animate with default configuration
	    Ext.fly('elementId').setHeight(200, true);
	
	    // change the height to 150px and animate with a custom configuration
	    Ext.fly('elId').setHeight(150, {
	    duration : .5, // animation will have a duration of .5 seconds
	    // will change the content to "finished"
	    callback: function(){ this.{@link #update}("finished"); }
	    });
	     * </code></pre>
	     * @param {Mixed} height The new height. This may be one of:<div class="mdetail-params"><ul>
	     * <li>A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels.)</li>
	     * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
	     * </ul></div>
	     * @return {Ext.Element} this
	     */
	    setHeight: function(height) {
	        var me = this;
	            me.dom.style.height = El.addUnits(height);
	        return me;
	    },
	
	    /**
	     * Set the size of this Element. If animation is true, both width and height will be animated concurrently.
	     * @param {Mixed} width The new width. This may be one of:<div class="mdetail-params"><ul>
	     * <li>A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).</li>
	     * <li>A String used to set the CSS width style. Animation may <b>not</b> be used.
	     * <li>A size object in the format <code>{width: widthValue, height: heightValue}</code>.</li>
	     * </ul></div>
	     * @param {Mixed} height The new height. This may be one of:<div class="mdetail-params"><ul>
	     * <li>A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels).</li>
	     * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
	     * </ul></div>
	     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
	     * @return {Ext.Element} this
	     */
	    setSize: function(width, height) {
	        var me = this;
	        if (Ext.isObject(width)) {
	            // in case of object from getSize()
	            height = width.height;
	            width = width.width;
	        }
	        me.dom.style.width = El.addUnits(width);
	        me.dom.style.height = El.addUnits(height);
	        return me;
	    },
	
	    /**
	     * Gets the width of the border(s) for the specified side(s)
	     * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
	     * passing <tt>'lr'</tt> would get the border <b><u>l</u></b>eft width + the border <b><u>r</u></b>ight width.
	     * @return {Number} The width of the sides passed added together
	     */
	    getBorderWidth: function(side) {
	        return this.sumStyles(side, El.borders);
	    },
	
	    /**
	     * Gets the size of the padding(s) for the specified side(s)
	     * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
	     * passing <tt>'lr'</tt> would get the padding <b><u>l</u></b>eft + the padding <b><u>r</u></b>ight.
	     * @return {Number} The padding of the sides passed added together
	     */
	    getPadding: function(side) {
	        return this.sumStyles(side, El.paddings);
	    },
	
	    /**
	     * Gets the size of the margins(s) for the specified side(s)
	     * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
	     * passing <tt>'lr'</tt> would get the margin <b><u>l</u></b>eft + the margin <b><u>r</u></b>ight.
	     * @return {Number} The margin of the sides passed added together
	     */
	    getMargin: function(side) {
	        return this.sumStyles(side, El.margins);
	    },
	
	    /**
	     * <p>Returns the dimensions of the element available to lay content out in.<p>
	     * <p>If the element (or any ancestor element) has CSS style <code>display : none</code>, the dimensions will be zero.</p>
	     */
	    getViewSize: function() {
	        var doc = document,
	            dom = this.dom;
	
	        if (dom == doc || dom == doc.body) {
	            return {
	                width: El.getViewportWidth(),
	                height: El.getViewportHeight()
	            };
	        }
	        else {
	            return {
	                width: dom.clientWidth,
	                height: dom.clientHeight
	            };
	        }
	    },
	
	    /**
	     * Returns the size of the element.
	     * @param {Boolean} contentSize (optional) true to get the width/size minus borders and padding
	     * @return {Object} An object containing the element's size {width: (element width), height: (element height)}
	     */
	    getSize: function(contentSize) {
            var dom = this.dom;
	        return {
	            width: Math.max(0, contentSize ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth),
	            height: Math.max(0, contentSize ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight)
	        };
	    },
	
	    /**
	     * Forces the browser to repaint this element
	     * @return {Ext.Element} this
	     */
	    repaint: function() {
	        var dom = this.dom;
	        this.addClass("x-repaint");
	        dom.style.background = 'transparent none';
	        setTimeout(function() {
	            dom.style.background = null;
	            Ext.get(dom).removeClass("x-repaint");
	        },
	        1);
	        return this;
	    },
	
	    /**
	     * Retrieves the width of the element accounting for the left and right
	     * margins.
	     */
	    getOuterWidth: function() {
	        return this.getWidth() + this.getMargin('lr');
	    },
	
	    /**
	     * Retrieves the height of the element account for the top and bottom
	     * margins.
	     */
	    getOuterHeight: function() {
	        return this.getHeight() + this.getMargin('tb');
	    },
	
	    // private
	    sumStyles: function(sides, styles) {
	        var val = 0,
	            m = sides.match(/\w/g),
	            len = m.length,
	            s,
	            i;
	
	        for (i = 0; i < len; i++) {
	            s = m[i] && parseFloat(this.getStyle(styles[m[i]])) || 0;
	            if (s) {
	                val += Math.abs(s);
	            }
	        }
	        return val;
	    }
	});
})();
/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Looks at this node and then at parent nodes for a match of the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @param {Number/Mixed} maxDepth (optional) The max depth to search as a number or element (defaults to 50 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement} The matching DOM node (or null if no match was found)
     */
    findParent : function(simpleSelector, maxDepth, returnEl) {
        var p = this.dom,
            b = document.body,
            depth = 0,
            stopEl;

        maxDepth = maxDepth || 50;
        if (isNaN(maxDepth)) {
            stopEl = Ext.getDom(maxDepth);
            maxDepth = Number.MAX_VALUE;
        }
        while (p && p.nodeType == 1 && depth < maxDepth && p != b && p != stopEl) {
            if (Ext.DomQuery.is(p, simpleSelector)) {
                return returnEl ? Ext.get(p) : p;
            }
            depth++;
            p = p.parentNode;
        }
        return null;
    },

    /**
     * Looks at parent nodes for a match of the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @param {Number/Mixed} maxDepth (optional) The max depth to
            search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement} The matching DOM node (or null if no match was found)
     */
    findParentNode : function(simpleSelector, maxDepth, returnEl) {
        var p = Ext.fly(this.dom.parentNode, '_internal');
        return p ? p.findParent(simpleSelector, maxDepth, returnEl) : null;
    },

    /**
     * Walks up the dom looking for a parent node that matches the passed simple selector (e.g. div.some-class or span:first-child).
     * This is a shortcut for findParentNode() that always returns an Ext.Element.
     * @param {String} selector The simple selector to test
     * @param {Number/Mixed} maxDepth (optional) The max depth to
            search as a number or element (defaults to 10 || document.body)
     * @return {Ext.Element} The matching DOM node (or null if no match was found)
     */
    up : function(simpleSelector, maxDepth) {
        return this.findParentNode(simpleSelector, maxDepth, true);
    },

    /**
     * Creates a {@link Ext.CompositeElement} for child nodes based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @return {CompositeElement/CompositeElement} The composite element
     */
    select : function(selector, composite) {
        return Ext.Element.select(selector, this.dom, composite);
    },

    /**
     * Selects child nodes based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @return {Array} An array of the matched nodes
     */
    query : function(selector) {
        return Ext.DomQuery.select(selector, this.dom);
    },

    /**
     * Selects a single child at any depth below this element based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @param {Boolean} returnDom (optional) True to return the DOM node instead of Ext.Element (defaults to false)
     * @return {HTMLElement/Ext.Element} The child Ext.Element (or DOM node if returnDom = true)
     */
    down : function(selector, returnDom) {
        var n = Ext.DomQuery.selectNode(selector, this.dom);
        return returnDom ? n : Ext.get(n);
    },

    /**
     * Selects a single *direct* child based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @param {Boolean} returnDom (optional) True to return the DOM node instead of Ext.Element (defaults to false)
     * @return {HTMLElement/Ext.Element} The child Ext.Element (or DOM node if returnDom = true)
     */
    child : function(selector, returnDom) {
        var node,
            me = this,
            id;
        id = Ext.get(me).id;
        // Escape . or :
        id = id.replace(/[\.:]/g, "\\$0");
        node = Ext.DomQuery.selectNode('#' + id + " > " + selector, me.dom);
        return returnDom ? node : Ext.get(node);
    },

     /**
     * Gets the parent node for this element, optionally chaining up trying to match a selector
     * @param {String} selector (optional) Find a parent node that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The parent node or null
     */
    parent : function(selector, returnDom) {
        return this.matchNode('parentNode', 'parentNode', selector, returnDom);
    },

     /**
     * Gets the next sibling, skipping text nodes
     * @param {String} selector (optional) Find the next sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The next sibling or null
     */
    next : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'nextSibling', selector, returnDom);
    },

    /**
     * Gets the previous sibling, skipping text nodes
     * @param {String} selector (optional) Find the previous sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The previous sibling or null
     */
    prev : function(selector, returnDom) {
        return this.matchNode('previousSibling', 'previousSibling', selector, returnDom);
    },


    /**
     * Gets the first child, skipping text nodes
     * @param {String} selector (optional) Find the next sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The first child or null
     */
    first : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'firstChild', selector, returnDom);
    },

    /**
     * Gets the last child, skipping text nodes
     * @param {String} selector (optional) Find the previous sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The last child or null
     */
    last : function(selector, returnDom) {
        return this.matchNode('previousSibling', 'lastChild', selector, returnDom);
    },

    matchNode : function(dir, start, selector, returnDom) {
        var n = this.dom[start];
        while (n) {
            if (n.nodeType == 1 && (!selector || Ext.DomQuery.is(n, selector))) {
                return !returnDom ? Ext.get(n) : n;
            }
            n = n[dir];
        }
        return null;
    }
});

/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Appends the passed element(s) to this element
     * @param {String/HTMLElement/Array/Element/CompositeElement} el
     * @return {Ext.Element} this
     */
    appendChild : function(el) {
        return Ext.get(el).appendTo(this);
    },

    /**
     * Appends this element to the passed element
     * @param {Mixed} el The new parent element
     * @return {Ext.Element} this
     */
    appendTo : function(el) {
        Ext.getDom(el).appendChild(this.dom);
        return this;
    },

    /**
     * Inserts this element before the passed element in the DOM
     * @param {Mixed} el The element before which this element will be inserted
     * @return {Ext.Element} this
     */
    insertBefore : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el);
        return this;
    },

    /**
     * Inserts this element after the passed element in the DOM
     * @param {Mixed} el The element to insert after
     * @return {Ext.Element} this
     */
    insertAfter : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el.nextSibling);
        return this;
    },

    /**
     * Inserts (or creates) an element (or DomHelper config) as the first child of this element
     * @param {Mixed/Object} el The id or element to insert or a DomHelper config to create and insert
     * @return {Ext.Element} The new child
     */
    insertFirst : function(el, returnDom) {
        el = el || {};
        if (el.nodeType || el.dom || typeof el == 'string') { // element
            el = Ext.getDom(el);
            this.dom.insertBefore(el, this.dom.firstChild);
            return !returnDom ? Ext.get(el) : el;
        }
        else { // dh config
            return this.createChild(el, this.dom.firstChild, returnDom);
        }
    },

    /**
     * Inserts (or creates) the passed element (or DomHelper config) as a sibling of this element
     * @param {Mixed/Object/Array} el The id, element to insert or a DomHelper config to create and insert *or* an array of any of those.
     * @param {String} where (optional) 'before' or 'after' defaults to before
     * @param {Boolean} returnDom (optional) True to return the raw DOM element instead of Ext.Element
     * @return {Ext.Element} The inserted Element. If an array is passed, the last inserted element is returned.
     */
    insertSibling: function(el, where, returnDom){
        var me = this, rt,
        isAfter = (where || 'before').toLowerCase() == 'after',
        insertEl;

        if(Ext.isArray(el)){
            insertEl = me;
            Ext.each(el, function(e) {
                rt = Ext.fly(insertEl, '_internal').insertSibling(e, where, returnDom);
                if(isAfter){
                    insertEl = rt;
                }
            });
            return rt;
        }

        el = el || {};

        if(el.nodeType || el.dom){
            rt = me.dom.parentNode.insertBefore(Ext.getDom(el), isAfter ? me.dom.nextSibling : me.dom);
            if (!returnDom) {
                rt = Ext.get(rt);
            }
        }else{
            if (isAfter && !me.dom.nextSibling) {
                rt = Ext.DomHelper.append(me.dom.parentNode, el, !returnDom);
            } else {
                rt = Ext.DomHelper[isAfter ? 'insertAfter' : 'insertBefore'](me.dom, el, !returnDom);
            }
        }
        return rt;
    },

    /**
     * Replaces the passed element with this element
     * @param {Mixed} el The element to replace
     * @return {Ext.Element} this
     */
    replace : function(el) {
        el = Ext.get(el);
        this.insertBefore(el);
        el.remove();
        return this;
    },

    /**
     * Creates the passed DomHelper config and appends it to this element or optionally inserts it before the passed child element.
     * @param {Object} config DomHelper element config object.  If no tag is specified (e.g., {tag:'input'}) then a div will be
     * automatically generated with the specified attributes.
     * @param {HTMLElement} insertBefore (optional) a child element of this element
     * @param {Boolean} returnDom (optional) true to return the dom node instead of creating an Element
     * @return {Ext.Element} The new child element
     */
    createChild : function(config, insertBefore, returnDom) {
        config = config || {tag:'div'};
        if (insertBefore) {
            return Ext.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
        }
        else {
            return Ext.DomHelper[!this.dom.firstChild ? 'overwrite' : 'append'](this.dom, config,  returnDom !== true);
        }
    },

    /**
     * Creates and wraps this element with another element
     * @param {Object} config (optional) DomHelper element config object for the wrapper element or null for an empty div
     * @param {Boolean} returnDom (optional) True to return the raw DOM element instead of Ext.Element
     * @return {HTMLElement/Element} The newly created wrapper element
     */
    wrap : function(config, returnDom) {
        var newEl = Ext.DomHelper.insertBefore(this.dom, config || {tag: "div"}, !returnDom);
        newEl.dom ? newEl.dom.appendChild(this.dom) : newEl.appendChild(this.dom);
        return newEl;
    },

    /**
     * Inserts an html fragment into this element
     * @param {String} where Where to insert the html in relation to this element - beforeBegin, afterBegin, beforeEnd, afterEnd.
     * @param {String} html The HTML fragment
     * @param {Boolean} returnEl (optional) True to return an Ext.Element (defaults to false)
     * @return {HTMLElement/Ext.Element} The inserted node (or nearest related if more than 1 inserted)
     */
    insertHtml : function(where, html, returnEl) {
        var el = Ext.DomHelper.insertHtml(where, this.dom, html);
        return returnEl ? Ext.get(el) : el;
    }
});

/**
 * @class Ext.platform
 * @singleton
 *
 * Determines information about the current platform the application is running
 * on.
 */
Ext.platform = {
    /**
     * Returns true if the application is running on a webkit browser.
     * @return Boolean
     */
    isWebkit: /webkit/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on a phone.
     * @return {Boolean} true if the application is running on a phone.
     */
    isPhone: /android|iphone/i.test(Ext.userAgent) && !(/ipad/i.test(Ext.userAgent)),

    /**
     * Returns true if the application is running on an iPad.
     * @return {Boolean} true if the application is running on an iPad.
     */
    isTablet: /ipad/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on Chrome.
     * @return {Boolean} true if the application is running on Chrome.
     */
    isChrome: /chrome/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on the Android OS.
     * @return {Boolean} true if the application is running on a phone.
     */
    isAndroidOS: /android/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on the iPhone OS.
     * @return {Boolean} true if the application is running on a phone.
     */
    isIPhoneOS: /iphone|ipad/i.test(Ext.userAgent),

    /**
     * Returns true if the browser has the 'orientationchange' event.
     * @return {Boolean} true if the browser has the 'orientationchange' event.
     */
    hasOrientationChange: ('onorientationchange' in window),

    /**
     * Returns true if the browser has the 'ontouchstart' event.
      * @return {Boolean} true if the browser has the 'ontouchstart' event.
     */
    hasTouch: ('ontouchstart' in window)
};


/**
 * @class Ext.util.Observable
 * Base class that provides a common interface for publishing events. Subclasses are expected to
 * to have a property "events" with all the events defined, and, optionally, a property "listeners"
 * with configured listeners defined.<br>
 * For example:
 * <pre><code>
Employee = Ext.extend(Ext.util.Observable, {
    constructor: function(config){
        this.name = config.name;
        this.addEvents({
            "fired" : true,
            "quit" : true
        });

        // Copy configured listeners into *this* object so that the base class&#39;s
        // constructor will add them.
        this.listeners = config.listeners;

        // Call our superclass constructor to complete construction process.
        Employee.superclass.constructor.call(this, config)
    }
});
</code></pre>
 * This could then be used like this:<pre><code>
var newEmployee = new Employee({
    name: employeeName,
    listeners: {
        quit: function() {
            // By default, "this" will be the object that fired the event.
            alert(this.name + " has quit!");
        }
    }
});
</code></pre>
 */

Ext.util.Observable = Ext.extend(Object, {
   /**
    * @cfg {Object} listeners (optional) <p>A config object containing one or more event handlers to be added to this
    * object during initialization.  This should be a valid listeners config object as specified in the
    * {@link #addListener} example for attaching multiple handlers at once.</p>
    * <br><p><b><u>DOM events from ExtJs {@link Ext.Component Components}</u></b></p>
    * <br><p>While <i>some</i> ExtJs Component classes export selected DOM events (e.g. "click", "mouseover" etc), this
    * is usually only done when extra value can be added. For example the {@link Ext.DataView DataView}'s
    * <b><code>{@link Ext.DataView#click click}</code></b> event passing the node clicked on. To access DOM
    * events directly from a Component's HTMLElement, listeners must be added to the <i>{@link Ext.Component#getEl Element}</i> after the Component
    * has been rendered. A plugin can simplify this step:
      <pre><code>
// Plugin is configured with a listeners config object.
// The Component is appended to the argument list of all handler functions.
Ext.DomObserver = Ext.extend(Object, {
    constructor: function(config) {
        this.listeners = config.listeners ? config.listeners : config;
    },

    // Component passes itself into plugin&#39;s init method
    init: function(c) {
        var p, l = this.listeners;
        for (p in l) {
            if (Ext.isFunction(l[p])) {
                l[p] = this.createHandler(l[p], c);
            } else {
                l[p].fn = this.createHandler(l[p].fn, c);
            }
        }

        // Add the listeners to the Element immediately following the render call
        c.render = c.render.{@link Function#createSequence createSequence}(function() {
            var e = c.getEl();
            if (e) {
                e.on(l);
            }
        });
    },

    createHandler: function(fn, c) {
        return function(e) {
            fn.call(this, e, c);
        };
    }
});

var text = new Ext.form.TextField({

    // Collapse combo when its element is clicked on
    plugins: [ new Ext.DomObserver({
        click: function(evt, comp) {
            comp.collapse();
        }
    })]
});
      </code></pre></p>
    */
    // @private
    isObservable: true,

    constructor : function(config) {
        var me = this,
            e  = me.events;

        Ext.apply(me, config);
        if (me.listeners){
            me.on(me.listeners);
            delete me.listeners;
        }
        
        me.events = e || {};
    },

    // @private
    filterOptRe : /^(?:scope|delay|buffer|single)$/,

    /**
     * <p>Fires the specified event with the passed parameters (minus the event name).</p>
     * <p>An event may be set to bubble up an Observable parent hierarchy (See {@link Ext.Component#getBubbleTarget})
     * by calling {@link #enableBubble}.</p>
     * @param {String} eventName The name of the event to fire.
     * @param {Object...} args Variable number of parameters are passed to handlers.
     * @return {Boolean} returns false if any of the handlers return false otherwise it returns true.
     */
    fireEvent : function() {
        var me = this,
            a = Ext.toArray(arguments),
            ename = a[0].toLowerCase(),
            ret = true,
            ev = me.events[ename],
            queue = me.eventQueue,
            parent;

        if (me.eventsSuspended === true && queue) {
            queue.push(a);
        }
        else if (ev && ev.bubble && ev.isEvent) {
            if (ev.fire.apply(ev, a.slice(1)) === false) {
                return false;
            }
            parent = me.getBubbleTarget && me.getBubbleTarget();
            if (parent && parent.isObservable) {
                if(!parent.events[ename] || !Ext.isObject(parent.events[ename]) || !parent.events[ename].bubble) {
                    parent.enableBubble(ename);
                }
                return parent.fireEvent.apply(parent, a);
            }
        }
        else if (ev && ev.isEvent) {
            a.shift();
            ret = ev.fire.apply(ev, a);
        }
        return ret;
    },

    /**
     * Appends an event handler to this object.
     * @param {String}   eventName The name of the event to listen for.
     * @param {Function} handler The method the event invokes.
     * @param {Object}   scope (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b>
     * @param {Object}   options (optional) An object containing handler configuration.
     * properties. This may contain any of the following properties:<ul>
     * <li><b>scope</b> : Object<div class="sub-desc">The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b></div></li>
     * <li><b>delay</b> : Number<div class="sub-desc">The number of milliseconds to delay the invocation of the handler after the event fires.</div></li>
     * <li><b>single</b> : Boolean<div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
     * <li><b>buffer</b> : Number<div class="sub-desc">Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
     * by the specified number of milliseconds. If the event fires again within that time, the original
     * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
     * <li><b>target</b> : Observable<div class="sub-desc">Only call the handler if the event was fired on the target Observable, <i>not</i>
     * if the event was bubbled up from a child Observable.</div></li>
     * </ul><br>
     * <p>
     * <b>Combining Options</b><br>
     * Using the options argument, it is possible to combine different types of listeners:<br>
     * <br>
     * A delayed, one-time listener.
     * <pre><code>
myPanel.on('hide', this.onClick, this, {
single: true,
delay: 100
});</code></pre>
     * <p>
     * <b>Attaching multiple handlers in 1 call</b><br>
     * The method also allows for a single argument to be passed which is a config object containing properties
     * which specify multiple handlers.
     * <p>
     */
    addListener : function(ename, fn, scope, o) {
        var me = this,
            config,
            ev;

        if (Ext.isObject(ename)) {
            o = ename;
            for (ename in o) {
                config = o[ename];
                if (!me.filterOptRe.test(ename)) {
                    me.addListener(ename, config.fn || config, config.scope || o.scope, config.fn ? config : o);
                }
            }
        }
        else {
            ename = ename.toLowerCase();
            me.events[ename] = me.events[ename] || true;
            ev = me.events[ename] || true;
            if (Ext.isBoolean(ev)) {
                me.events[ename] = ev = new Ext.util.Event(me, ename);
            }
            ev.addListener(fn, scope, Ext.isObject(o) ? o : {});
        }
    },

    /**
     * Removes an event handler.
     * @param {String}   eventName The type of event the handler was associated with.
     * @param {Function} handler   The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object}   scope     (optional) The scope originally specified for the handler.
     */
    removeListener : function(ename, fn, scope) {
        var me = this,
            config,
            ev;

        if (Ext.isObject(ename)) {
            var o = ename;
            for (ename in o) {
                config = o[ename];
                if (!me.filterOptRe.test(ename)) {
                    me.removeListener(ename, config.fn || config, config.scope || o.scope);
                }
            }
        }
        else {
            ename = ename.toLowerCase();
            ev = me.events[ename];
            if (ev.isEvent) {
                ev.removeListener(fn, scope);
            }
        }
    },

    /**
     * Removes all listeners for this object
     */
    purgeListeners : function(){
        var events = this.events,
            ev,
            key;

        for(key in events){
            ev = events[key];
            if(ev.isEvent){
                ev.clearListeners();
            }
        }
    },

    /**
     * Adds the specified events to the list of events which this Observable may fire.
     * @param {Object|String} o Either an object with event names as properties with a value of <code>true</code>
     * or the first event name string if multiple event names are being passed as separate parameters.
     * @param {string} Optional. Event name if multiple event names are being passed as separate parameters.
     * Usage:<pre><code>
this.addEvents('storeloaded', 'storecleared');
</code></pre>
     */
    addEvents : function(o){
        var me = this;
        me.events = me.events || {};
        if (Ext.isString(o)) {
            var a = arguments,
                i = a.length;
            while(i--) {
                me.events[a[i]] = me.events[a[i]] || true;
            }
        } else {
            Ext.applyIf(me.events, o);
        }
    },

    /**
     * Checks to see if this object has any listeners for a specified event
     * @param {String} eventName The name of the event to check for
     * @return {Boolean} True if the event is being listened for, else false
     */
    hasListener : function(ename){
        var e = this.events[ename];
        return e.isEvent === true && e.listeners.length > 0;
    },

    /**
     * Suspend the firing of all events. (see {@link #resumeEvents})
     * @param {Boolean} queueSuspended Pass as true to queue up suspended events to be fired
     * after the {@link #resumeEvents} call instead of discarding all suspended events;
     */
    suspendEvents : function(queueSuspended) {
        this.eventsSuspended = true;
        if (queueSuspended && !this.eventQueue){
            this.eventQueue = [];
        }
    },

    /**
     * Resume firing events. (see {@link #suspendEvents})
     * If events were suspended using the <tt><b>queueSuspended</b></tt> parameter, then all
     * events fired during event suspension will be sent to any listeners now.
     */
    resumeEvents : function(){
        var me = this,
            queued = me.eventQueue || [];

        me.eventsSuspended = false;
        delete me.eventQueue;

        Ext.each(queued, function(e) {
            me.fireEvent.apply(me, e);
        });
    },

    /**
     * Relays selected events from the specified Observable as if the events were fired by <tt><b>this</b></tt>.
     * @param {Object} o The Observable whose events this object is to relay.
     * @param {Array} events Array of event names to relay.
     */
    relayEvents : function(o, events) {
        var me = this;
        function createHandler(ename) {
            return function(){
                return me.fireEvent.apply(me, [ename].concat(Ext.toArray(arguments)));
            };
        }
        Ext.each(events, function(ename) {
            me.events[ename] = me.events[ename] || true;
            o.on(ename, createHandler(ename), me);
        });
    },

    /**
     * <p>Enables events fired by this Observable to bubble up an owner hierarchy by calling
     * <code>this.getBubbleTarget()</code> if present. There is no implementation in the Observable base class.</p>
     * <p>This is commonly used by Ext.Components to bubble events to owner Containers. See {@link Ext.Component.getBubbleTarget}. The default
     * implementation in Ext.Component returns the Component's immediate owner. But if a known target is required, this can be overridden to
     * access the required target more quickly.</p>
     * <p>Example:</p><pre><code>
Ext.override(Ext.form.Field, {
//  Add functionality to Field&#39;s initComponent to enable the change event to bubble
initComponent : Ext.form.Field.prototype.initComponent.createSequence(function() {
    this.enableBubble('change');
}),

//  We know that we want Field&#39;s events to bubble directly to the FormPanel.
getBubbleTarget : function() {
    if (!this.formPanel) {
        this.formPanel = this.findParentByType('form');
    }
    return this.formPanel;
}
});

var myForm = new Ext.formPanel({
title: 'User Details',
items: [{
    ...
}],
listeners: {
    change: function() {
        // Title goes red if form has been modified.
        myForm.header.setStyle('color', 'red');
    }
}
});
</code></pre>
     * @param {String/Array} events The event name to bubble, or an Array of event names.
     */
    enableBubble : function(events){
        var me = this;
        if(!Ext.isEmpty(events)){
            events = Ext.isArray(events) ? events : Ext.toArray(arguments);
            Ext.each(events, function(ename){
                ename = ename.toLowerCase();
                var ce = me.events[ename] || true;
                if (Ext.isBoolean(ce)) {
                    ce = new Ext.util.Event(me, ename);
                    me.events[ename] = ce;
                }
                ce.bubble = true;
            });
        }
    }
});

Ext.override(Ext.util.Observable, {
    /**
     * Appends an event handler to this object (shorthand for {@link #addListener}.)
     * @param {String}   eventName     The type of event to listen for
     * @param {Function} handler       The method the event invokes
     * @param {Object}   scope         (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b>
     * @param {Object}   options       (optional) An object containing handler configuration.
     * @method
     */
    on: Ext.util.Observable.prototype.addListener,
    /**
     * Removes an event handler (shorthand for {@link #removeListener}.)
     * @param {String}   eventName     The type of event the handler was associated with.
     * @param {Function} handler       The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object}   scope         (optional) The scope originally specified for the handler.
     * @method
     */
    un: Ext.util.Observable.prototype.removeListener
});

/**
 * Removes <b>all</b> added captures from the Observable.
 * @param {Observable} o The Observable to release
 * @static
 */
Ext.util.Observable.releaseCapture = function(o){
    o.fireEvent = Ext.util.Observable.prototype.fireEvent;
};

/**
 * Starts capture on the specified Observable. All events will be passed
 * to the supplied function with the event name + standard signature of the event
 * <b>before</b> the event is fired. If the supplied function returns false,
 * the event will not fire.
 * @param {Observable} o The Observable to capture events from.
 * @param {Function} fn The function to call when an event is fired.
 * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the Observable firing the event.
 * @static
 */
Ext.util.Observable.capture = function(o, fn, scope) {
    o.fireEvent = o.fireEvent.createInterceptor(fn, scope);
};

/**
 * Sets observability on the passed class constructor.<p>
 * <p>This makes any event fired on any instance of the passed class also fire a single event through
 * the <i>class</i> allowing for central handling of events on many instances at once.</p>
 * <p>Usage:</p><pre><code>
Ext.util.Observable.observe(Ext.data.Connection);
Ext.data.Connection.on('beforerequest', function(con, options) {
    console.log('Ajax request made to ' + options.url);
});</code></pre>
 * @param {Function} c The class constructor to make observable.
 * @param {Object} listeners An object containing a series of listeners to add. See {@link #addListener}.
 * @static
 */
Ext.util.Observable.observe = function(cls, listeners) {
    if (cls) {
        if (!cls.fireEvent) {
            Ext.applyIf(cls, new Ext.util.Observable());
            Ext.util.Observable.capture(cls.prototype, cls.fireEvent, cls);
        }
        if (typeof listeners == 'object') {
            cls.on(listeners);
        }
        return cls;
    }
};

Ext.util.Event = Ext.extend(Object, (function() {
    function createBuffered(handler, listener, o, scope){
        listener.task = new Ext.util.DelayedTask();
        return function(){
            listener.task.delay(o.buffer, handler, scope, Ext.toArray(arguments));
        };
    };

    function createDelayed(handler, listener, o, scope){
        return function(){
            var task = new Ext.util.DelayedTask();
            if(!listener.tasks) {
                listener.tasks = [];
            }
            listener.tasks.push(task);
            task.delay(o.delay || 10, handler, scope, Ext.toArray(arguments));
        };
    };

    function createSingle(handler, listener, o, scope){
        return function(){
            listener.ev.removeListener(listener.fn, scope);
            return handler.apply(scope, arguments);
        };
    };

    return {
        isEvent: true,
        
        constructor : function(observable, name) {
            this.name = name;
            this.observable = observable;
            this.listeners = [];
        },

        addListener : function(fn, scope, options){
            var me = this,
                listener;
            scope = scope || me.observable;

            if(!me.isListening(fn, scope)){
                listener = me.createListener(fn, scope, options);
                if(me.firing){
                                    // if we are currently firing this event, don't disturb the listener loop
                    me.listeners = me.listeners.slice(0);
                }
                me.listeners.push(listener);
            }
        },

        createListener: function(fn, scope, o){
            o = o || {};
            scope = scope || this.observable;

            var listener = {
                    fn: fn,
                scope: scope,
                o: o,
                            ev: this
            }, handler = fn;

            if(o.delay){
                handler = createDelayed(handler, listener, o, scope);
            }
            if(o.buffer){
                handler = createBuffered(handler, listener, o, scope);
            }
                    if(o.single){
                    handler = createSingle(handler, listener, o, scope);
                }

            listener.fireFn = handler;
            return listener;
        },

        findListener : function(fn, scope){
            var listeners = this.listeners,
                i = listeners.length,
                listener, s;

            while(i--) {
                listener = listeners[i];
                if(listener) {
                    s = listener.scope;
                    if(listener.fn == fn && (s == scope || s == this.observable)){
                        return i;
                    }
                }
            }

            return -1;
        },

        isListening : function(fn, scope){
            return this.findListener(fn, scope) !== -1;
        },

        removeListener : function(fn, scope){
            var me = this,
                            index,
                listener,
                k;

            if((index = me.findListener(fn, scope)) != -1){
                            listener = me.listeners[index];

                if (me.firing) {
                    me.listeners = me.listeners.slice(0);
                }

                            // cancel and remove a buffered handler that hasn't fired yet
                if(listener.task) {
                    listener.task.cancel();
                    delete l.task;
                }

                            // cancel and remove all delayed handlers that haven't fired yet
                k = listener.tasks && listener.tasks.length;
                if(k) {
                    while(k--) {
                        listener.tasks[k].cancel();
                    }
                    delete listener.tasks;
                }

                            // remove this listener from the listeners array
                me.listeners.splice(index, 1);
                return true;
            }

                    return false;
        },

        // Iterate to stop any buffered/delayed events
        clearListeners : function(){
            var listeners = this.listeners,
                i = listeners.length;

            while(i--) {
                this.removeListener(listeners[i].fn, listeners[i].scope);
            }
        },

        fire : function() {
            var me = this,
                listeners = me.listeners,
                count = listeners.length,
                i, args, listener;

            if(count > 0){
                me.firing = true;
                for (i = 0; i < count; i++) {
                    listener = listeners[i];
                args = arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
                if (listener.o) {
                    args.push(listener.o);
                }
                    if(listener && listener.fireFn.apply(listener.scope || me.observable, args) === false) {
                        return (me.firing = false);
                    }
                }
            }
            me.firing = false;
            return true;
        }
    };
})());

/**
 * @class Ext.EventManager
 * Registers event handlers that want to receive a normalized EventObject instead of the standard browser event and provides
 * several useful events directly.
 * See {@link Ext.EventObject} for more details on normalized event objects.
 * @singleton
 */
Ext.EventManager = {
    optionsRe: /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|horizontal|vertical)$/,
    touchRe: /^(?:pinch|pinchstart|tap|doubletap|swipe|swipeleft|swiperight|scroll|scrollstart|scrollend|touchstart|touchmove|touchend|taphold|tapstart|tapcancel)$/i,

    windowId: 'ext-window',
    documentId: 'ext-document',

    /**
    * Appends an event handler to an element.  The shorthand version {@link #on} is equivalent.  Typically you will
    * use {@link Ext.Element#addListener} directly on an Element in favor of calling this version.
    * @param {String/HTMLElement} el The html element or id to assign the event handler to.
    * @param {String} eventName The name of the event to listen for.
    * @param {Function} handler The handler function the event invokes. This function is passed
    * the following parameters:<ul>
    * <li>evt : EventObject<div class="sub-desc">The {@link Ext.EventObject EventObject} describing the event.</div></li>
    * <li>t : Element<div class="sub-desc">The {@link Ext.Element Element} which was the target of the event.
    * Note that this may be filtered by using the <tt>delegate</tt> option.</div></li>
    * <li>o : Object<div class="sub-desc">The options object from the addListener call.</div></li>
    * </ul>
    * @param {Object} scope (optional) The scope (<b><code>this</code></b> reference) in which the handler function is executed. <b>Defaults to the Element</b>.
    * @param {Object} options (optional) An object containing handler configuration properties.
    * This may contain any of the following properties:<ul>
    * <li>scope : Object<div class="sub-desc">The scope (<b><code>this</code></b> reference) in which the handler function is executed. <b>Defaults to the Element</b>.</div></li>
    * <li>delegate : String<div class="sub-desc">A simple selector to filter the target or look for a descendant of the target</div></li>
    * <li>stopEvent : Boolean<div class="sub-desc">True to stop the event. That is stop propagation, and prevent the default action.</div></li>
    * <li>preventDefault : Boolean<div class="sub-desc">True to prevent the default action</div></li>
    * <li>stopPropagation : Boolean<div class="sub-desc">True to prevent event propagation</div></li>
    * <li>normalized : Boolean<div class="sub-desc">False to pass a browser event to the handler function instead of an Ext.EventObject</div></li>
    * <li>delay : Number<div class="sub-desc">The number of milliseconds to delay the invocation of the handler after te event fires.</div></li>
    * <li>single : Boolean<div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
    * <li>buffer : Number<div class="sub-desc">Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
    * by the specified number of milliseconds. If the event fires again within that time, the original
    * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
    * <li>target : Element<div class="sub-desc">Only call the handler if the event was fired on the target Element, <i>not</i> if the event was bubbled up from a child node.</div></li>
    * </ul><br>
    * <p>See {@link Ext.Element#addListener} for examples of how to use these options.</p>
    */
    addListener : function(element, eventName, fn, scope, o){
        // handle our listener config object syntax
        if (Ext.isObject(eventName)) {
            this.handleListenerConfig(element, eventName);
            return;
        }

        var dom = Ext.getDom(element);

        // if the element doesnt exist throw an error
        if (!dom){
            throw "Error listening for \"" + eventName + '\". Element "' + element + '" doesn\'t exist.';
        }

        if (!fn) {
            throw 'Error listening for "' + eventName + '". No handler function specified';
        }

        var touch = this.touchRe.test(eventName);

        // create the wrapper function
        var wrap = this.createListenerWrap(dom, eventName, fn, scope, o, touch);

        // add all required data into the event cache
        this.getEventListenerCache(dom, eventName).push({
            fn: fn,
            wrap: wrap,
            scope: scope
        });

        if (touch) {
            Ext.TouchEventManager.addEventListener(dom, eventName, wrap, o);
        }
        else {
            // now add the event listener to the actual element!
            dom.addEventListener(eventName, wrap, false);
        }
    },

    /**
    * Removes an event handler from an element.  The shorthand version {@link #un} is equivalent.  Typically
    * you will use {@link Ext.Element#removeListener} directly on an Element in favor of calling this version.
    * @param {String/HTMLElement} el The id or html element from which to remove the listener.
    * @param {String} eventName The name of the event.
    * @param {Function} fn The handler function to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
    * @param {Object} scope If a scope (<b><code>this</code></b> reference) was specified when the listener was added,
    * then this must refer to the same object.
    */
    removeListener : function(element, eventName, fn, scope) {
        // handle our listener config object syntax
        if (Ext.isObject(eventName)) {
            this.handleListenerConfig(element, eventName, true);
            return;
        }

        var dom = Ext.getDom(element),
            cache = this.getEventListenerCache(dom, eventName),
            i = cache.length, j,
            listener, wrap, tasks;

        while (i--) {
            listener = cache[i];

            if (listener && (!fn || listener.fn == fn) && (!scope || listener.scope === scope)) {
                wrap = listener.wrap;

                // clear buffered calls
                if (wrap.task) {
                    clearTimeout(wrap.task);
                    delete wrap.task;
                }

                // clear delayed calls
                j = wrap.tasks && wrap.tasks.length;
                if (j) {
                    while (j--) {
                        clearTimeout(wrap.tasks[j]);
                    }
                    delete wrap.tasks;
                }

                if (this.touchRe.test(eventName)) {
                    Ext.TouchEventManager.removeEventListener(dom, eventName, wrap);
                }
                else {
                    // now add the event listener to the actual element!
                    dom.removeEventListener(eventName, wrap, false);
                }

                // remove listener from cache
                cache.splice(i, 1);
            }
        }
    },

    /**
    * Removes all event handers from an element.  Typically you will use {@link Ext.Element#removeAllListeners}
    * directly on an Element in favor of calling this version.
    * @param {String/HTMLElement} el The id or html element from which to remove all event handlers.
    */
    removeAll : function(element){
        var dom = Ext.getDom(element),
            cache = this.getElementEventCache(dom),
            ev;

        for(ev in cache) {
            this.removeListener(ev);
        }
        Ext.cache[dom.id].events = {};
    },

    purgeElement : function(element, recurse, eventName) {
        var dom = Ext.getDom(element),
            i = 0, len;

        if(eventName) {
            this.removeListener(dom, eventName);
        }
        else {
            this.removeAll(dom);
        }

        if(recurse && dom && dom.childNodes) {
            for(len = element.childNodes.length; i < len; i++) {
                this.purgeElement(element.childNodes[i], recurse, eventName);
            }
        }
    },

    handleListenerConfig : function(element, config, remove) {
        var key, value;

        // loop over all the keys in the object
        for (key in config) {
            // if the key is something else then an event option
            if (!this.optionsRe.test(key)) {
                value = config[key];
                // if the value is a function it must be something like click: function(){}, scope: this
                // which means that there might be multiple event listeners with shared options
                if (Ext.isFunction(value)) {
                    // shared options
                    this[(remove ? 'remove' : 'add') + 'Listener'](element, key, value, config.scope, config);
                }
                // if its not a function, it must be an object like click: {fn: function(){}, scope: this}
                else {
                    // individual options
                    this[(remove ? 'remove' : 'add') + 'Listener'](element, key, config.fn, config.scope, config);
                }
            }
        }
    },

    getId : function(element) {
        // if we bind listeners to either the document or the window
        // we have to put them in their own id cache since they both
        // can't get id's on the actual element
        var skip = true, id;
        element = Ext.getDom(element);

        if(element === document) {
            id = this.documentId;
        }
        else if(element === window) {
            id = this.windowId;
        }
        else {
            id = Ext.id(element);
            skip = false;
        }
        if(!Ext.cache[id]){
            Ext.Element.addToCache(new Ext.Element(element), id);
            if(skip){
                Ext.cache[id].skipGarbageCollection = true;
            }
        }
        return id;
    },

    // private
    createListenerWrap : function(dom, ename, fn, scope, o, touch) {
        o = !Ext.isObject(o) ? {} : o;

        var f = ["if(!window.Ext) {return;}"];
        
        if (touch) {
            f.push('e = new Ext.TouchEventObjectImpl(e);');
        }
        else {
            if(o.buffer || o.delay) {
                f.push('e = new Ext.EventObjectImpl(e);');
            } else {
                f.push('e = Ext.EventObject.setEvent(e);');
            }
        }

        if (o.delegate) {
            f.push('var t = e.getTarget("' + o.delegate + '", this);');
            f.push('if(!t) {return;}');
        } else {
            f.push('var t = e.target;');
        }

        if(o.target) {
            f.push('if(e.target !== o.target) {return;}');
        }

        if(o.stopEvent) {
            f.push('e.stopEvent();');
        } else {
            if(o.preventDefault) {
                f.push('e.preventDefault();');
            }
            if(o.stopPropagation) {
                f.push('e.stopPropagation();');
            }
        }

        if(o.normalized) {
            f.push('e = e.browserEvent;');
        }

        if(o.buffer) {
            f.push('(wrap.task && clearTimeout(wrap.task));');
            f.push('wrap.task = setTimeout(function(){');
        }

        if(o.delay) {
            f.push('wrap.tasks = wrap.tasks || [];');
            f.push('wrap.tasks.push(setTimeout(function(){');
        }

        // finally call the actual handler fn
        f.push('fn.call(scope || dom, e, t, o);');

        if(o.single) {
            f.push('Ext.EventManager.removeListener(dom, ename, fn, scope);');
        }

        if(o.delay) {
            f.push('}, ' + o.delay + '));');
        }

        if(o.buffer) {
            f.push('}, ' + o.buffer + ');');
        }

        var gen = new Function('e', 'o', 'fn', 'scope', 'ename', 'dom', 'wrap', f.join("\n"));

        return function(e) {
            gen.call(dom, e, o, fn, scope, ename, dom, arguments.callee);
        };
    },

    getEventListenerCache : function(element, eventName) {
        var eventCache = this.getElementEventCache(element);
        return eventCache[eventName] || (eventCache[eventName] = []);
    },

    getElementEventCache : function(element) {
        var elementCache = Ext.cache[this.getId(element)];
        return elementCache.events || (elementCache.events = {});
    },

    /**
    * Adds a listener to be notified when the document is ready (before onload and before images are loaded). Can be
    * accessed shorthanded as Ext.onReady().
    * @param {Function} fn The method the event invokes.
    * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
    * @param {boolean} options (optional) Options object as passed to {@link Ext.Element#addListener}. It is recommended that the options
    * <code>{single: true}</code> be used so that the handler is removed on first invocation.
    */
    onDocumentReady : function(fn, scope, options){
        var me = this,
            readyEvent = me.readyEvent,
            intervalId;

        if(Ext.isReady){ // if it already fired
            readyEvent || (readyEvent = new Ext.util.Event());
            readyEvent.addListener(fn, scope, options);
            readyEvent.fire();
            readyEvent.listeners = []; // clearListeners no longer compatible.  Force single: true?
        }
        else {
            if(!readyEvent) {
                readyEvent = me.readyEvent = new Ext.util.Event();

                // the method that will actually fire the event and clean up any listeners and intervals
                var fireReady = function() {
                    Ext.isReady = true;

                    // remove listeners
                    document.removeEventListener('DOMContentLoaded', arguments.callee, false);
                    window.removeEventListener('load', arguments.callee, false);

                    // remove interval if there is one
                    if(intervalId) {
                        clearInterval(intervalId);
                    }
                    
                    // Put this in a timeout to give the browser a chance to hide address
                    // bars or do other things that would screw up viewport measurements
                    setTimeout(function() {
                        var w = Ext.Element.getViewportWidth(),
                            h = Ext.Element.getViewportHeight();
                        Ext.orientation = Ext.Element.getOrientation();

                        Ext.TouchEventManager.init();

                        // fire the ready event!!
                        readyEvent.fire({
                            orientation: Ext.orientation,
                            width: w,
                            height: h
                        });
                        readyEvent.listeners = [];                        
                    }, 300);
                };

                // for browsers that support DOMContentLoaded
                document.addEventListener('DOMContentLoaded', fireReady, false);

                // even though newer versions support DOMContentLoaded, we have to be sure
                if(Ext.platform.isWebKit) {
                    intervalId = setInterval(function(){
                        if(/loaded|complete/.test(document.readyState)) {
                            clearInterval(intervalId);
                            intervalId = null;
                            fireReady();
                        }
                    }, 10);
                }

                // final fallback method
                window.addEventListener('load', fireReady, false);
            }

            options = options || {};
            options.delay = options.delay || 1;
            readyEvent.addListener(fn, scope, options);
        }
    },

    /**
     * Adds a listener to be notified when the browser window is resized and provides resize event buffering (50 milliseconds),
     * passes new viewport width and height to handlers.
     * @param {Function} fn      The handler function the window resize event invokes.
     * @param {Object}   scope   The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
     * @param {boolean}  options Options object as passed to {@link Ext.Element#addListener}
     */
    onWindowResize : function(fn, scope, options) {
        var me = this,
            resizeEvent = me.resizeEvent;

        if(!resizeEvent){
            me.resizeEvent = resizeEvent = new Ext.util.Event();
            var onResize = function() {
                resizeEvent.fire(Ext.Element.getViewportWidth(), Ext.Element.getViewportHeight());
            };
            this.addListener(window, 'resize', onResize, this);
        }

        resizeEvent.addListener(fn, scope, options);
    },

    onOrientationChange : function(fn, scope, options) {
        var me = this,
            orientationEvent = me.orientationEvent;

        if (!orientationEvent) {
            me.orientationEvent = orientationEvent = new Ext.util.Event();
            var onOrientationChange = function(e) {
                var w = Ext.Element.getViewportWidth(),
                    h = Ext.Element.getViewportHeight(),
                    orientation = Ext.Element.getOrientation();
                //console.log(window.innerWidth + ' ' + window.innerHeight + ' ' + orientation + ' ' + Ext.orientation);
                
                if (orientation != Ext.orientation) {
                    Ext.orientation = orientation;                    
                    orientationEvent.fire(orientation, w, h);
                }
                return orientation;
            };

            if (Ext.platform.hasOrientationChange && !Ext.platform.isAndroidOS) {
                this.addListener(window, 'orientationchange', onOrientationChange, this, {delay: 50});
            }
            else {
                 this.addListener(window, 'resize', onOrientationChange, this, {buffer: 10});
            }
        }

        orientationEvent.addListener(fn, scope, options);
    }
};

/**
* Appends an event handler to an element.  Shorthand for {@link #addListener}.
* @param {String/HTMLElement} el The html element or id to assign the event handler to
* @param {String} eventName The name of the event to listen for.
* @param {Function} handler The handler function the event invokes.
* @param {Object} scope (optional) (<code>this</code> reference) in which the handler function executes. <b>Defaults to the Element</b>.
* @param {Object} options (optional) An object containing standard {@link #addListener} options
* @member Ext.EventManager
* @method on
*/
Ext.EventManager.on = Ext.EventManager.addListener;

/**
 * Removes an event handler from an element.  Shorthand for {@link #removeListener}.
 * @param {String/HTMLElement} el The id or html element from which to remove the listener.
 * @param {String} eventName The name of the event.
 * @param {Function} fn The handler function to remove. <b>This must be a reference to the function passed into the {@link #on} call.</b>
 * @param {Object} scope If a scope (<b><code>this</code></b> reference) was specified when the listener was added,
 * then this must refer to the same object.
 * @member Ext.EventManager
 * @method un
 */
Ext.EventManager.un = Ext.EventManager.removeListener;

/**
  * Adds a listener to be notified when the document is ready (before onload and before images are loaded). Shorthand of {@link Ext.EventManager#onDocumentReady}.
  * @param {Function} fn The method the event invokes.
  * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
  * @param {boolean} options (optional) Options object as passed to {@link Ext.Element#addListener}. It is recommended that the options
  * <code>{single: true}</code> be used so that the handler is removed on first invocation.
  * @member Ext
  * @method onReady
 */
Ext.onReady = Ext.EventManager.onDocumentReady;

Ext.EventObjectImpl = Ext.extend(Object, {
    constructor : function(e) {
        if (e) {
            this.setEvent(e.browserEvent || e);
        }
    },

    /** @private */
    setEvent : function(e){
        var me = this;
        if (e == me || (e && e.browserEvent)){ // already wrapped
            return e;
        }
        me.browserEvent = e;
        if(e) {
            me.type = e.type;

            // cache the target for the delayed and or buffered events
            var node = e.target;
            me.target = node && node.nodeType == 3 ? node.parentNode : node;

            // same for XY
            me.xy = [e.pageX, e.pageY];
            me.timestamp = e.timeStamp;
        } else {
            me.target = null;
            me.xy = [0, 0];
        }
        return me;
    },

    /**
     * Stop the event (preventDefault and stopPropagation)
     */
    stopEvent : function(){
        this.stopPropagation();
        this.preventDefault();
    },

    /**
     * Prevents the browsers default handling of the event.
     */
    preventDefault : function(){
        if(this.browserEvent) {
            this.browserEvent.preventDefault();
        }
    },

    /**
     * Cancels bubbling of the event.
     */
    stopPropagation : function() {
        if(this.browserEvent) {
            this.browserEvent.stopPropagation();
        }
    },

    /**
     * Gets the x coordinate of the event.
     * @return {Number}
     */
    getPageX : function(){
        return this.xy[0];
    },

    /**
     * Gets the y coordinate of the event.
     * @return {Number}
     */
    getPageY : function(){
        return this.xy[1];
    },

    /**
     * Gets the page coordinates of the event.
     * @return {Array} The xy values like [x, y]
     */
    getXY : function(){
        return this.xy;
    },

    /**
     * Gets the target for the event.
     * @param {String} selector (optional) A simple selector to filter the target or look for an ancestor of the target
     * @param {Number/Mixed} maxDepth (optional) The max depth to
            search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLelement}
     */
    getTarget : function(selector, maxDepth, returnEl) {
        return selector ? Ext.fly(this.target).findParent(selector, maxDepth, returnEl) : (returnEl ? Ext.get(this.target) : this.target);
    },

    getTime : function() {
        return this.timestamp;
    }
});

/**
 * @class Ext.EventObject
 * Just as {@link Ext.Element} wraps around a native DOM node, Ext.EventObject
 * wraps the browser's native event-object normalizing cross-browser differences,
 * such as which mouse button is clicked, keys pressed, mechanisms to stop
 * event-propagation along with a method to prevent default actions from taking place.
 * <p>For example:</p>
 * <pre><code>
function handleClick(e, t){ // e is not a standard event object, it is a Ext.EventObject
    e.preventDefault();
    var target = e.getTarget(); // same as t (the target HTMLElement)
    ...
}
var myDiv = {@link Ext#get Ext.get}("myDiv");  // get reference to an {@link Ext.Element}
myDiv.on(         // 'on' is shorthand for addListener
    "click",      // perform an action on click of myDiv
    handleClick   // reference to the action handler
);
// other methods to do the same:
Ext.EventManager.on("myDiv", 'click', handleClick);
Ext.EventManager.addListener("myDiv", 'click', handleClick);
 </code></pre>
 * @singleton
 */
Ext.EventObject = new Ext.EventObjectImpl();

//Initialize doc classes and feature detections
(function(){

    var initExt = function(){
        // find the body element
        var bd = Ext.getBody(),
            cls = [];
        if (!bd) {
            return false;
        }
        var P = Ext.platform; 
        if (P.isPhone) {
            cls.push('x-phone');
        }
        if (P.isTablet) {
            cls.push('x-tablet');
        }
        if (P.isTablet && P.isIPhoneOS) {
            cls.push('x-ipad');
        }
        if (P.isIPhoneOS) {
            cls.push('x-iphone-os');
        }
        if (P.isAndroidOS) {
            cls.push('x-android-os');
        }
        if (cls.length) {
            bd.addClass(cls);
        }

	    var div = document.createElement('div'),
	        doc = document,
	        view,
	        last;
	        
	    div.innerHTML = '<div style="height:30px;width:50px;"><div style="height:20px;width:20px;"></div></div><div style="float:left;background-color:transparent;">';
	    bd.dom.appendChild(div);
	    last = div.lastChild;
        
        P.correctRightMargin = true;
        P.correctTransparentColor = true;
	    
	    if((view = doc.defaultView)){
	        if(view.getComputedStyle(div.firstChild.firstChild, null).marginRight != '0px'){
                P.correctRightMargin = false;
            }
            if(view.getComputedStyle(last, null).backgroundColor != 'transparent'){
                P.correctTransparentColor = false;
            }
	    }
	    P.cssFloat = !!last.style.cssFloat;
	    bd.dom.removeChild(div);

        return true;
    };

    if (!initExt()) {
        Ext.onReady(initExt);
    }
})();

Ext.TouchEventManager = Ext.apply({}, {
    swipeThreshold: 35,
    scrollThreshold: 5,
    touchEndThreshold: 35,
    tapThreshold: 5,
    tapHoldInterval: 250,
    swipeTime: 1000,
    doubleTapThreshold: 800,
    multiTouchendThreshold: 50,

    init : function() {
        this.targets = {
            all: [],
            touchstart: [],
            touchmove: [],
            touchend: [],
            tap: [],
            tapstart: [],
            taphold: [],
            tapcancel: [],
            doubletap: [],
            swipe: [],
            scrollstart: [],
            scroll: [],
            scrollend: [],
            pinch: [],
            pinchstart: []
        };

        this.listeners = {};
        this.tracks = {};
        this.doubleTapTargets = {};
        this.pinchTargets = {};

        this.useTouch = Ext.platform.hasTouch && !Ext.platform.isChrome;

        if (this.useTouch) {
            document.addEventListener('touchstart', this.onTouchStart, false);
            document.addEventListener('touchmove', this.onTouchMove, false);
            document.addEventListener('touchend', this.onTouchEnd, false);
        }
        else {
            document.addEventListener('mousedown', this.onTouchStart, false);
            document.addEventListener('mousemove', this.onTouchMove, false);
            document.addEventListener('mouseup', this.onTouchEnd, false);
        }
    },
    
    onTouchStart : function(e) {
        var me = Ext.TouchEventManager,
            touches = me.useTouch ? (e.touches || e.touch && [e.touch] || null) : [e],
            ln = touches.length,
            i;
        
        for (i = 0; i < ln; i++) {
            me.startTrack(touches[i], e);
        }
        me.multiTouch = ln > 1;
    },

    startTrack : function(touch, e) {
        var me = this,
            target = (touch.target.nodeType == 3) ? touch.target.parentNode : touch.target,
            parent = target,
            targets = me.targets,
            touchId = touch.identifier != undefined ? touch.identifier : 'mouse',
            listeners, ename, id, track;

        track = me.tracks[touchId] = {
            browserEvent: e,
            startTime: e.timeStamp,
            previousTime: e.timeStamp,
            startX: touch.pageX,
            startY: touch.pageY,
            previousX: touch.pageX,
            previousY: touch.pageY,
            touch: touch,
            target: target,
            scrolling: false,
            end: false,
            move: false,
            targets: {},
            // We want to decide the scrollBounds so we can do bound checking
            scrollBounds: {
                right : window.innerWidth,
                bottom : window.innerHeight
            }
        };
        
        if (Ext.platform.isAndroidOS) {      
            if (!['input', 'select', 'textarea'].contains(target.tagName.toLowerCase())) {
                e.preventDefault();
                e.stopPropagation();                
            }
        }
        
        // We are going to bubble up and see if anyone is listening for touch events
        while (parent) {
            // Check if there are any touch events bound to this parent
            if (me.targets.all.indexOf(parent) !== -1) {
                id = parent.id;

                // Get all the listeners for this parent
                listeners = me.listeners[id];

                // Create an event collection cache
                track.events = track.events || {};

                for (ename in listeners) {
                    track.events[ename] = track.events[ename] || {};
                    track.events[ename][id] = listeners[ename];
                    track.events[ename][id].dom = parent;
                    
                    track.targets[id] = listeners[ename];
                }
            }
            parent = parent.parentNode;
        }
        
        me.lastTouchId = touchId;
        if (track.events) {
            e = {
                time: e.timeStamp,
                pageX: touch.pageX,
                pageY: touch.pageY,
                touch: touch,
                touches: e.touches ? e.touches : [e.touch],
                browserEvent: e
            };
            
            if (track.events.touchstart && me.fireListeners('touchstart', track, e) === false) {
                track.end = true;
                return;
            }
                     
            if (track.events.tapstart && me.fireListeners('tapstart', track, e) === false) {
                track.end = true;
                track.tap = true;
                return;
            }

            if (track.events.taphold) {
                track.tapHoldIntervalId = setInterval(me.tapHoldHandler.createDelegate(track), me.tapHoldInterval);
                track.tap = true;
            }
            
            if (track.events.tap || track.events.tapcancel || track.events.doubletap) {
                track.tap = true;
            }

            track.move = track.end = true;
        }
    },

    onTouchMove : function(e) {        
        var me = Ext.TouchEventManager,
            touches = me.useTouch ? e.changedTouches : [e],
            ln = touches.length,
            i, touch, track, id;        
 
        e.preventDefault();
        e.stopPropagation();

        for (i = 0; i < ln; i++) {
            touch = touches[i];
            track = me.tracks[touch.identifier != undefined ? touch.identifier : 'mouse'];

            if (!track || !track.move) {
                continue;
            }
            
            var startX = track.startX,
                startY = track.startY,
                pageX = touch.pageX,
                pageY = touch.pageY,
                previousX = track.previousX,
                previousY = track.previousY,
                deltaX = pageX - startX,
                deltaY = pageY - startY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY),
                previousDeltaX = pageX - previousX,
                previousDeltaY = pageY - previousY,
                time = e.timeStamp,
                startTime = track.startTime,
                previousTime = track.previousTime,
                deltaTime = time - startTime,
                previousDeltaTime = time - previousTime,
                browserEvent = e;

            if (track.tap && absDeltaX >= me.tapThreshold || absDeltaY >= me.tapThreshold) {
                if (track.events.taphold) {
                    clearInterval(track.tapHoldIntervalId);
                    track.tapHoldIntervalId = null;
                    delete track.events.taphold;
                }

                if (track.events.tapcancel) {
                    me.fireListeners('tapcancel', track, {originalEvent: e});
                    // tap cancel will only fire once
                    delete track.events.tapcancel;
                }

                if (track.events.doubletap) {
                    delete track.events.doubletap;
                }

                // If we have moved, a tap is not possible anymore
                delete track.events.tap;
                track.tap = false;
            }

            e = {
                pageX: pageX,
                pageY: pageY,
                touches: browserEvent.touches,
                startX: startX,
                startY: startY,
                previousX: track.previousX,
                previousY: track.previousY,
                deltaX: deltaX,
                deltaY: deltaY,
                previousDeltaX: previousDeltaX,
                previousDeltaY: previousDeltaY,
                time: time,
                startTime: startTime,
                previousTime: previousTime,
                deltaTime: deltaTime,
                previousDeltaTime: previousDeltaTime,
                browserEvent: browserEvent
            };

            if (track.events.touchmove && me.fireListeners('touchmove', track, e) === false) {
                // We want to reset the start values because of the scrollThreshold
                track.previousTime = time;
                track.previousX = pageX;
                track.previousY = pageY;
                track.previousDeltaX = previousDeltaX;
                track.previousDeltaY = previousDeltaY;
                continue;
            }
            
            // If we are not tracking a scrolling motion, we have to check if this is a swipe
            if (!track.scrolling && track.events.swipe) {
                // If the swipeTime is over, we are not gonna check for it again
                if (absDeltaY - absDeltaX > 2 || deltaTime > me.swipeTime) {
                    delete track.events.swipe;
                }
                else if (absDeltaX > me.swipeThreshold && absDeltaX > absDeltaY) {
                    // If this is a swipe, a scroll is not possible anymore
                    delete track.events.scroll;
                    delete track.events.scrollstart;
                    delete track.events.scrollend;

                    // End all this madness
                    me.fireListeners('swipe', track, {
                        browserEvent: browserEvent,
                        direction: (deltaX < 0) ? 'left' : 'right',
                        distance: absDeltaX,
                        time: time,
                        deltaTime: deltaTime
                    });

                    delete track.events.swipe;
                }
                continue;
            }

            if (me.multiTouch && !track.scrolling && track.events.pinch) {
                var anchor, distance, scale,
                    pinch = me.pinch;

                if (!track.pinching && !pinch) {
                    for (id in track.events.pinch) {
                        anchor = me.pinchTargets[id];

                        if (anchor && anchor != track) {
                            delete track.events.scroll;
                            delete track.events.scrollstart;
                            delete track.events.scrollend;
                            delete track.events.swipe;
                            delete anchor.events.scroll;
                            delete anchor.events.scrollstart;
                            delete anchor.events.scrollend;
                            delete anchor.events.swipe;

                            e = pinch = me.pinch = {
                                browserEvent: browserEvent,
                                touches: [track.touch, anchor.touch],
                                distance: Math.sqrt(
                                    Math.pow(Math.abs(track.touch.pageX - anchor.touch.pageX), 2) +
                                    Math.pow(Math.abs(track.touch.pageY - anchor.touch.pageY), 2)
                                )
                            };
                            track.pinching = anchor.pinching = true;

                            me.fireListeners('pinchstart', track, e);

                            pinch.previousDistance = pinch.distance;
                            pinch.previousScale = 1;
                            return;
                        }
                        else {
                            me.pinchTargets[id] = track;
                        }
                    }
                }

                if (track.pinching && pinch) {
                    distance = Math.sqrt(
                        Math.pow(Math.abs(pinch.touches[0].pageX - pinch.touches[1].pageX), 2) +
                        Math.pow(Math.abs(pinch.touches[0].pageY - pinch.touches[1].pageY), 2)
                    );
                    scale = distance / pinch.distance;

                    e = {
                        browserEvent: track.browserEvent,
                        time: time,
                        touches: pinch.touches,
                        scale: scale,
                        deltaScale: scale - 1,
                        previousScale: pinch.previousScale,
                        previousDeltaScale: scale - pinch.previousScale,
                        distance: distance,
                        deltaDistance: distance - pinch.distance,
                        startDistance: pinch.distance,
                        previousDistance: pinch.previousDistance,
                        previousDeltaDistance: distance - pinch.previousDistance
                    };

                    me.fireListeners('pinch', track, e);

                    pinch.previousScale = scale;
                    pinch.previousDistance = distance;

                    return;
                }
            }

            // If this wasnt a swipe, and we arent scrolling yet
            if (track.events.scroll || track.events.scrollstart || track.events.scrollend) {
                if (!track.scrolling && (absDeltaX >= me.scrollThreshold || absDeltaY >= me.scrollThreshold)) {
                    // Set the proper flags
                    track.scrolling = true;

                    // No more swipeing after scrolling!
                    delete track.events.swipe;

                    // The following code manages the fact that if a target is only interested in
                    // one direction scrolls, and there are multiple targets listening for scroll events
                    // we will cancel listening for the events till the end of this scroll if the
                    // direction is different from the intial scroll direction.
                    var targets = track.targets,
                        options, ename, x, xln;

                    xln = 0;
                    for (id in targets) {
                        xln++;
                    }

                    if (xln > 1) {
                        for (id in targets) {
                            for (x = 0, xln = targets[id].length; x < xln; x++) {
                                options = targets[id][x].options;
                                if (!options) {
                                    continue;
                                }
                                if (options &&
                                    (options.vertical === true && options.horizontal === false && absDeltaX >= absDeltaY) ||
                                    (options.vertical === false && options.horizontal === true && absDeltaX <= absDeltaY)
                                ) {
                                    for (ename in track.events) {
                                        delete track.events[ename][id];
                                    }
                                }
                            }
                        }
                    }

                    if (track.events.scrollstart) {
                        // Create the scroll event
                        me.fireListeners('scrollstart', track, {
                            browserEvent: track.browserEvent,
                            time: time,
                            pageX: pageX,
                            pageY: pageY
                        });
                    }
                }
                else if (track.scrolling) {
                    me.fireListeners('scroll', track, e);
                }
            }
            
            if (!track.tap) {
                // We want to do bounds checking to make sure
                if (absDeltaX > absDeltaY) {
                    if (deltaX > 0) {
                        // If we are scrolling down we want to check how close we are to the bottom
                        if (track.scrollBounds.right - pageX < me.touchEndThreshold) {
                            me.onTouchEnd(browserEvent);
                            return;
                        }
                    }
                    else if (pageX < me.touchEndThreshold) {
                        me.onTouchEnd(browserEvent);
                        return;
                    }
                }
                else {
                    // We want to do bounds checking to make sure
                    if (deltaY > 0) {
                        // If we are scrolling down we want to check how close we are to the bottom
                        if (track.scrollBounds.bottom - pageY < me.touchEndThreshold) {
                            me.onTouchEnd(browserEvent);
                            return;
                        }
                    }
                    else if (pageY < me.touchEndThreshold) {
                        me.onTouchEnd(browserEvent);
                        return;
                    }
                }
            }
            
            // We want to reset the start values because of the scrollThreshold
            track.previousTime = time;
            track.previousX = pageX;
            track.previousY = pageY;
            track.previousDeltaX = previousDeltaX;
            track.previousDeltaY = previousDeltaY;
        }
    },

    onTouchEnd : function(e) {
        var me = Ext.TouchEventManager,
            tracks = me.tracks,
            touches = me.useTouch ? e.changedTouches : [e],
            ln = touches.length,
            touch, track, i,
            targetId, touchEvent;
            
        for (i = 0; i < ln; i++) {
            touch = touches[i];
            track = tracks[touch.identifier != undefined ? touch.identifier : 'mouse'];
            
            if (!track || !track.end) {
                continue;
            }
            
            touchEvent = {
                browserEvent: e,
                pageX: track.previousX,
                pageY: track.previousY,
                deltaX: track.previousX - track.startX,
                deltaY: track.previousY - track.startY,
                previousDeltaX: track.previousDeltaX,
                previousDeltaY: track.previousDeltaY,
                deltaTime: e.timeStamp - track.startTime,
                previousDeltaTime: e.timeStamp - track.previousTime,
                time: e.timeStamp
            };

            if (track.events.touchend && me.fireListeners('touchend', track, touchEvent) === false) {
                break;
            }
            
            if (track.events.taphold) {
                clearInterval(track.tapHoldIntervalId);
                me.tapHoldIntervalId = null;
            }

            if (track.scrolling && track.events.scrollend) {
                me.fireListeners('scrollend', track, touchEvent);
            }
            else if (track.events.tap) {
                me.fireListeners('tap', track, {
                    browserEvent: e,
                    time: e.timeStamp,
                    pageX: track.startX,
                    pageY: track.startY,
                    touch: track.touch
                });
            }

            if (track.events.doubletap && !me.multiTouch) {
                targetId = track.target.id;

                if (!me.doubleTapTargets[targetId]) {
                    me.doubleTapTargets[targetId] = e.timeStamp;
                }
                else {
                    if (e.timeStamp - me.doubleTapTargets[targetId] <= me.doubleTapThreshold) {
                        me.fireListeners('doubletap', track, {
                            browserEvent: e,
                            time: e.timeStamp,
                            pageX: track.startX,
                            pageY: track.startY,
                            touch: track.touch
                        });
                        delete me.doubleTapTargets[targetId];
                    }
                    else {
                        me.doubleTapTargets[targetId] = e.timeStamp;
                    }
                }
            }

            delete tracks[touch.identifier];
        }

        me.tracks = {};

        me.pinchTargets = {};
        me.pinch = null;
    },

    tapHoldHandler : function() {
        var me = Ext.TouchEventManager,
            track = this,
            time = (new Date()).getTime();

        me.fireListeners('taphold', track, {
            time: time,
            startTime: track.startTime,
            deltaTime: time - track.startTime,
            pageX: track.startX,
            pageY: track.startY,
            touch: track.touch
        });
    },

    addEventListener : function(dom, ename, fn, o) {
        if(!this.targets[ename]) {
            return;
        }

        if(!this.targets.all.contains(dom)) {
            this.targets.all.push(dom);
        }

        if(!this.targets[ename].contains(dom)) {
            this.targets[ename].push(dom);
        }

        var id = Ext.id(dom),
            track;

        fn.options = o;
        fn.ename = ename;

        this.listeners[id] = this.listeners[id] || {};
        this.listeners[id][ename] = this.listeners[id][ename] || [];
        this.listeners[id][ename].push(fn);

        for (id in this.tracks) {
            track = this.tracks[id];

            if (track && (dom == document || dom === track.target || Ext.get(dom).contains(track.target))) {
                track.events[ename] = track.events[ename] || {};
                track.events[ename][id] = track.events[ename][id] || [];
                track.events[ename][id].push(fn);

                if (/touchmove|scroll|swipe|tap|doubletap/i.test(ename)) {
                    track.move = true;
                }

                if (/touchend|scrollend|tapcancel|tap|doubletap|/i.test(ename)) {
                    track.end = true;
                }
            }
        }
    },

    removeEventListener : function(dom, ename, fn) {
        if (!this.targets[ename]) {
            return;
        }

        this.targets[ename].remove(dom);

        var id = Ext.id(dom),
            listeners = this.listeners[id],
            ev, hasListeners = false;

        if (listeners && listeners[ename]) {
            listeners[ename].remove(fn);

            for (ev in listeners) {
                hasListeners = true;
                break;
            }

            if (!listeners[ename].length) {
                delete listeners[ename];
            }

            if (!hasListeners) {
                this.targets.all.remove(dom);
                delete listeners[id];
            }
        }
    },

    fireListeners : function(ename, track, e) {
        var me = Ext.TouchEventManager;

        e.type = ename;
        e.target = track.target;
        e.touch = track.touch;
        e.identifier = track.touch.identifier;

        var targets = track.events[ename],
            target, listeners, listener,
            id, i, ln;

        if (targets) {
            for (id in targets) {
                listeners = targets[id];
                for (i = 0, ln = listeners.length; i < ln; i++) {
                    listener = listeners[i];
                    if (listener.call(listeners.dom, e) === false || e.cancel === true) {
                        if (e.browserEvent) {
                            e.browserEvent.stopPropagation();
                            e.browserEvent.preventDefault();
                        }
                        return false;
                    }
                }
            }
        }
        return true;
    },

    // private
    createListenerWrap : Ext.EventManager.createListenerWrap
});

Ext.TouchEventObjectImpl = Ext.extend(Object, {
    constructor : function(e) {
        if (e) {
            this.setEvent(e);
        }
    },

    setEvent : function(e) {
        this.event = e;
        Ext.apply(this, e);
        return this;
    },

    stopEvent : function() {
        this.stopPropagation();
        this.preventDefault();
    },

    stopPropagation : function() {
        this.event.cancel = true;
    },

    preventDefault : function() {
        this.event.prevent = true;
    },

    getTarget : function(selector, maxDepth, returnEl) {
        if (selector) {
            return Ext.fly(this.target).findParent(selector, maxDepth, returnEl);
        }
        else {
            return returnEl ? Ext.get(this.target) : this.target;
        }
    }
});

Ext.TouchEventObject = new Ext.TouchEventObjectImpl();
/**
 * @class Ext.util.MixedCollection
 * @extends Ext.util.Observable
 * A Collection class that maintains both numeric indexes and keys and exposes events.
 * @constructor
 * @param {Boolean} allowFunctions Specify <tt>true</tt> if the {@link #addAll}
 * function should add function references to the collection. Defaults to
 * <tt>false</tt>.
 * @param {Function} keyFn A function that can accept an item of the type(s) stored in this MixedCollection
 * and return the key value for that item.  This is used when available to look up the key on items that
 * were passed without an explicit key parameter to a MixedCollection method.  Passing this parameter is
 * equivalent to providing an implementation for the {@link #getKey} method.
 */
Ext.util.MixedCollection = function(allowFunctions, keyFn) {
    this.items = [];
    this.map = {};
    this.keys = [];
    this.length = 0;
    this.addEvents(
        /**
         * @event clear
         * Fires when the collection is cleared.
         */
        'clear',
        /**
         * @event add
         * Fires when an item is added to the collection.
         * @param {Number} index The index at which the item was added.
         * @param {Object} o The item added.
         * @param {String} key The key associated with the added item.
         */
        'add',
        /**
         * @event replace
         * Fires when an item is replaced in the collection.
         * @param {String} key he key associated with the new added.
         * @param {Object} old The item being replaced.
         * @param {Object} new The new item.
         */
        'replace',
        /**
         * @event remove
         * Fires when an item is removed from the collection.
         * @param {Object} o The item being removed.
         * @param {String} key (optional) The key associated with the removed item.
         */
        'remove',
        'sort'
    );
    this.allowFunctions = allowFunctions === true;
    if(keyFn){
        this.getKey = keyFn;
    }
    Ext.util.MixedCollection.superclass.constructor.call(this);
};

Ext.extend(Ext.util.MixedCollection, Ext.util.Observable, {

    /**
     * @cfg {Boolean} allowFunctions Specify <tt>true</tt> if the {@link #addAll}
     * function should add function references to the collection. Defaults to
     * <tt>false</tt>.
     */
    allowFunctions : false,

    /**
     * Adds an item to the collection. Fires the {@link #add} event when complete.
     * @param {String} key <p>The key to associate with the item, or the new item.</p>
     * <p>If a {@link #getKey} implementation was specified for this MixedCollection,
     * or if the key of the stored items is in a property called <tt><b>id</b></tt>,
     * the MixedCollection will be able to <i>derive</i> the key for the new item.
     * In this case just pass the new item in this parameter.</p>
     * @param {Object} o The item to add.
     * @return {Object} The item added.
     */
    add : function(key, o){
        if(arguments.length == 1){
            o = arguments[0];
            key = this.getKey(o);
        }
        if(typeof key != 'undefined' && key !== null){
            var old = this.map[key];
            if(typeof old != 'undefined'){
                return this.replace(key, o);
            }
            this.map[key] = o;
        }
        this.length++;
        this.items.push(o);
        this.keys.push(key);
        this.fireEvent('add', this.length-1, o, key);
        return o;
    },

    /**
      * MixedCollection has a generic way to fetch keys if you implement getKey.  The default implementation
      * simply returns <b><code>item.id</code></b> but you can provide your own implementation
      * to return a different value as in the following examples:<pre><code>
// normal way
var mc = new Ext.util.MixedCollection();
mc.add(someEl.dom.id, someEl);
mc.add(otherEl.dom.id, otherEl);
//and so on

// using getKey
var mc = new Ext.util.MixedCollection();
mc.getKey = function(el){
   return el.dom.id;
};
mc.add(someEl);
mc.add(otherEl);

// or via the constructor
var mc = new Ext.util.MixedCollection(false, function(el){
   return el.dom.id;
});
mc.add(someEl);
mc.add(otherEl);
     * </code></pre>
     * @param {Object} item The item for which to find the key.
     * @return {Object} The key for the passed item.
     */
    getKey : function(o){
         return o.id;
    },

    /**
     * Adds all elements of an Array or an Object to the collection.
     * @param {Object/Array} objs An Object containing properties which will be added
     * to the collection, or an Array of values, each of which are added to the collection.
     * Functions references will be added to the collection if <code>{@link #allowFunctions}</code>
     * has been set to <tt>true</tt>.
     */
    addAll : function(objs){
        if(arguments.length > 1 || Ext.isArray(objs)){
            var args = arguments.length > 1 ? arguments : objs;
            for(var i = 0, len = args.length; i < len; i++){
                this.add(args[i]);
            }
        }else{
            for(var key in objs){
                if(this.allowFunctions || typeof objs[key] != 'function'){
                    this.add(key, objs[key]);
                }
            }
        }
    },

    /**
     * Executes the specified function once for every item in the collection, passing the following arguments:
     * <div class="mdetail-params"><ul>
     * <li><b>item</b> : Mixed<p class="sub-desc">The collection item</p></li>
     * <li><b>index</b> : Number<p class="sub-desc">The item's index</p></li>
     * <li><b>length</b> : Number<p class="sub-desc">The total number of items in the collection</p></li>
     * </ul></div>
     * The function should return a boolean value. Returning false from the function will stop the iteration.
     * @param {Function} fn The function to execute for each item.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current item in the iteration.
     */
    each : function(fn, scope){
        var items = [].concat(this.items); // each safe for removal
        for(var i = 0, len = items.length; i < len; i++){
            if(fn.call(scope || items[i], items[i], i, len) === false){
                break;
            }
        }
    },

    /**
     * Executes the specified function once for every key in the collection, passing each
     * key, and its associated item as the first two parameters.
     * @param {Function} fn The function to execute for each item.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
     */
    eachKey : function(fn, scope){
        for(var i = 0, len = this.keys.length; i < len; i++){
            fn.call(scope || window, this.keys[i], this.items[i], i, len);
        }
    },

    /**
     * Replaces an item in the collection. Fires the {@link #replace} event when complete.
     * @param {String} key <p>The key associated with the item to replace, or the replacement item.</p>
     * <p>If you supplied a {@link #getKey} implementation for this MixedCollection, or if the key
     * of your stored items is in a property called <tt><b>id</b></tt>, then the MixedCollection
     * will be able to <i>derive</i> the key of the replacement item. If you want to replace an item
     * with one having the same key value, then just pass the replacement item in this parameter.</p>
     * @param o {Object} o (optional) If the first parameter passed was a key, the item to associate
     * with that key.
     * @return {Object}  The new item.
     */
    replace : function(key, o){
        if(arguments.length == 1){
            o = arguments[0];
            key = this.getKey(o);
        }
        var old = this.map[key];
        if(typeof key == 'undefined' || key === null || typeof old == 'undefined'){
             return this.add(key, o);
        }
        var index = this.indexOfKey(key);
        this.items[index] = o;
        this.map[key] = o;
        this.fireEvent('replace', key, old, o);
        return o;
    },

    /**
     * Returns the first item in the collection which elicits a true return value from the
     * passed selection function.
     * @param {Function} fn The selection function to execute for each item.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
     * @return {Object} The first item in the collection which returned true from the selection function.
     */
    find : function(fn, scope){
        for(var i = 0, len = this.items.length; i < len; i++){
            if(fn.call(scope || window, this.items[i], this.keys[i])){
                return this.items[i];
            }
        }
        return null;
    },

    /**
     * Inserts an item at the specified index in the collection. Fires the {@link #add} event when complete.
     * @param {Number} index The index to insert the item at.
     * @param {String} key The key to associate with the new item, or the item itself.
     * @param {Object} o (optional) If the second parameter was a key, the new item.
     * @return {Object} The item inserted.
     */
    insert : function(index, key, o){
        if(arguments.length == 2){
            o = arguments[1];
            key = this.getKey(o);
        }
        if(this.containsKey(key)){
            this.suspendEvents();
            this.removeKey(key);
            this.resumeEvents();
        }
        if(index >= this.length){
            return this.add(key, o);
        }
        this.length++;
        this.items.splice(index, 0, o);
        if(typeof key != 'undefined' && key !== null){
            this.map[key] = o;
        }
        this.keys.splice(index, 0, key);
        this.fireEvent('add', index, o, key);
        return o;
    },

    /**
     * Remove an item from the collection.
     * @param {Object} o The item to remove.
     * @return {Object} The item removed or false if no item was removed.
     */
    remove : function(o){
        return this.removeAt(this.indexOf(o));
    },

    /**
     * Remove an item from a specified index in the collection. Fires the {@link #remove} event when complete.
     * @param {Number} index The index within the collection of the item to remove.
     * @return {Object} The item removed or false if no item was removed.
     */
    removeAt : function(index){
        if(index < this.length && index >= 0){
            this.length--;
            var o = this.items[index];
            this.items.splice(index, 1);
            var key = this.keys[index];
            if(typeof key != 'undefined'){
                delete this.map[key];
            }
            this.keys.splice(index, 1);
            this.fireEvent('remove', o, key);
            return o;
        }
        return false;
    },

    /**
     * Removed an item associated with the passed key fom the collection.
     * @param {String} key The key of the item to remove.
     * @return {Object} The item removed or false if no item was removed.
     */
    removeKey : function(key){
        return this.removeAt(this.indexOfKey(key));
    },

    /**
     * Returns the number of items in the collection.
     * @return {Number} the number of items in the collection.
     */
    getCount : function(){
        return this.length;
    },

    /**
     * Returns index within the collection of the passed Object.
     * @param {Object} o The item to find the index of.
     * @return {Number} index of the item. Returns -1 if not found.
     */
    indexOf : function(o){
        return this.items.indexOf(o);
    },

    /**
     * Returns index within the collection of the passed key.
     * @param {String} key The key to find the index of.
     * @return {Number} index of the key.
     */
    indexOfKey : function(key){
        return this.keys.indexOf(key);
    },

    /**
     * Returns the item associated with the passed key OR index.
     * Key has priority over index.  This is the equivalent
     * of calling {@link #key} first, then if nothing matched calling {@link #itemAt}.
     * @param {String/Number} key The key or index of the item.
     * @return {Object} If the item is found, returns the item.  If the item was not found, returns <tt>undefined</tt>.
     * If an item was found, but is a Class, returns <tt>null</tt>.
     */
    item : function(key){
        var mk = this.map[key],
            item = mk !== undefined ? mk : (typeof key == 'number') ? this.items[key] : undefined;
        return !Ext.isFunction(item) || this.allowFunctions ? item : null; // for prototype!
    },

    /**
     * Returns the item at the specified index.
     * @param {Number} index The index of the item.
     * @return {Object} The item at the specified index.
     */
    itemAt : function(index){
        return this.items[index];
    },

    /**
     * Returns the item associated with the passed key.
     * @param {String/Number} key The key of the item.
     * @return {Object} The item associated with the passed key.
     */
    key : function(key){
        return this.map[key];
    },

    /**
     * Returns true if the collection contains the passed Object as an item.
     * @param {Object} o  The Object to look for in the collection.
     * @return {Boolean} True if the collection contains the Object as an item.
     */
    contains : function(o){
        return this.indexOf(o) != -1;
    },

    /**
     * Returns true if the collection contains the passed Object as a key.
     * @param {String} key The key to look for in the collection.
     * @return {Boolean} True if the collection contains the Object as a key.
     */
    containsKey : function(key){
        return typeof this.map[key] != 'undefined';
    },

    /**
     * Removes all items from the collection.  Fires the {@link #clear} event when complete.
     */
    clear : function(){
        this.length = 0;
        this.items = [];
        this.keys = [];
        this.map = {};
        this.fireEvent('clear');
    },

    /**
     * Returns the first item in the collection.
     * @return {Object} the first item in the collection..
     */
    first : function(){
        return this.items[0];
    },

    /**
     * Returns the last item in the collection.
     * @return {Object} the last item in the collection..
     */
    last : function(){
        return this.items[this.length-1];
    },

    /**
     * @private
     * Performs the actual sorting based on a direction and a sorting function. Internally,
     * this creates a temporary array of all items in the MixedCollection, sorts it and then writes
     * the sorted array data back into this.items and this.keys
     * @param {String} property Property to sort by ('key', 'value', or 'index')
     * @param {String} dir (optional) Direction to sort 'ASC' or 'DESC'. Defaults to 'ASC'.
     * @param {Function} fn (optional) Comparison function that defines the sort order.
     * Defaults to sorting by numeric value.
     */
    _sort : function(property, dir, fn){
        var i, len,
            dsc = String(dir).toUpperCase() == 'DESC' ? -1 : 1,

            //this is a temporary array used to apply the sorting function
            c     = [],
            keys  = this.keys,
            items = this.items;

        //default to a simple sorter function if one is not provided
        fn = fn || function(a, b) {
            return a - b;
        };

        //copy all the items into a temporary array, which we will sort
        for (i = 0, len = items.length; i < len; i++) {
            c[c.length] = {
                key  : keys[i],
                value: items[i],
                index: i
            };
        }

        //sort the temporary array
        c.sort(function(a, b) {
            var v = fn(a[property], b[property]) * dsc;
            if (v === 0) {
                v = (a.index < b.index ? -1 : 1);
            }
            return v;
        });

        //copy the temporary array back into the main this.items and this.keys objects
        for (i = 0, len = c.length; i < len; i++) {
            items[i] = c[i].value;
            keys[i]  = c[i].key;
        }

        this.fireEvent('sort', this);
    },

    /**
     * Sorts this collection by <b>item</b> value with the passed comparison function.
     * @param {String} direction (optional) 'ASC' or 'DESC'. Defaults to 'ASC'.
     * @param {Function} fn (optional) Comparison function that defines the sort order.
     * Defaults to sorting by numeric value.
     */
    sort : function(dir, fn) {
        this._sort('value', dir, fn);
    },

    /**
     * Returns a range of items in this collection
     * @param {Number} startIndex (optional) The starting index. Defaults to 0.
     * @param {Number} endIndex (optional) The ending index. Defaults to the last item.
     * @return {Array} An array of items
     */
    getRange : function(start, end){
        var items = this.items;
        if(items.length < 1){
            return [];
        }
        start = start || 0;
        end = Math.min(typeof end == 'undefined' ? this.length-1 : end, this.length-1);
        var i, r = [];
        if(start <= end){
            for(i = start; i <= end; i++) {
                r[r.length] = items[i];
            }
        }else{
            for(i = start; i >= end; i--) {
                r[r.length] = items[i];
            }
        }
        return r;
    },

    /**
     * Filter the <i>objects</i> in this collection by a specific property.
     * Returns a new collection that has been filtered.
     * @param {String} property A property on your objects
     * @param {String/RegExp} value Either string that the property values
     * should start with or a RegExp to test against the property
     * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning
     * @param {Boolean} caseSensitive (optional) True for case sensitive comparison (defaults to False).
     * @return {MixedCollection} The new filtered collection
     */
    filter : function(property, value, anyMatch, caseSensitive, exactMatch) {
        //we can accept an array of filter objects, or a single filter object - normalize them here
        if (Ext.isObject(property)) {
            property = [property];
        }

        if (Ext.isArray(property)) {
            var filters = [];

            //normalize the filters passed into an array of filter functions
            for (var i=0, j = property.length; i < j; i++) {
                var filter = property[i],
                    func   = filter.fn,
                    scope  = filter.scope || this;

                //if we weren't given a filter function, construct one now
                if (typeof func != 'function') {
                    func = this.createFilterFn(filter.property, filter.value, filter.anyMatch, filter.caseSensitive, filter.exactMatch);
                }

                filters.push({fn: func, scope: scope});
            }

            var fn = this.createMultipleFilterFn(filters);
        } else {
            //classic single property filter
            var fn = this.createFilterFn(property, value, anyMatch, caseSensitive, exactMatch);
        }

        return (fn === false ? this : this.filterBy(fn));
    },

    /**
     * Filter by a function. Returns a <i>new</i> collection that has been filtered.
     * The passed function will be called with each object in the collection.
     * If the function returns true, the value is included otherwise it is filtered.
     * @param {Function} fn The function to be called, it will receive the args o (the object), k (the key)
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this MixedCollection.
     * @return {MixedCollection} The new filtered collection
     */
    filterBy : function(fn, scope){
        var r = new Ext.util.MixedCollection();
        r.getKey = this.getKey;
        var k = this.keys, it = this.items;
        for(var i = 0, len = it.length; i < len; i++){
            if(fn.call(scope||this, it[i], k[i])){
                r.add(k[i], it[i]);
            }
        }
        return r;
    },

    /**
     * Finds the index of the first matching object in this collection by a specific property/value.
     * @param {String} property The name of a property on your objects.
     * @param {String/RegExp} value A string that the property values
     * should start with or a RegExp to test against the property.
     * @param {Number} start (optional) The index to start searching at (defaults to 0).
     * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning.
     * @param {Boolean} caseSensitive (optional) True for case sensitive comparison.
     * @return {Number} The matched index or -1
     */
    findIndex : function(property, value, start, anyMatch, caseSensitive){
        if(Ext.isEmpty(value, false)){
            return -1;
        }
        value = this.createValueMatcher(value, anyMatch, caseSensitive);
        return this.findIndexBy(function(o){
            return o && value.test(o[property]);
        }, null, start);
    },

    /**
     * Find the index of the first matching object in this collection by a function.
     * If the function returns <i>true</i> it is considered a match.
     * @param {Function} fn The function to be called, it will receive the args o (the object), k (the key).
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this MixedCollection.
     * @param {Number} start (optional) The index to start searching at (defaults to 0).
     * @return {Number} The matched index or -1
     */
    findIndexBy : function(fn, scope, start){
        var k = this.keys, it = this.items;
        for(var i = (start||0), len = it.length; i < len; i++){
            if(fn.call(scope||this, it[i], k[i])){
                return i;
            }
        }
        return -1;
    },

    /**
     * @private
     * Returns a filter function used to test a the given property's value. Defers most of the work to createValueMatcher
     * @param {String} property The property to create the filter function for
     * @param {String/RegExp} value The string/regex to compare the property value to
     * @param {Boolean} anyMatch True if we don't care if the filter value is not the full value (defaults to false)
     * @param {Boolean} caseSensitive True to create a case-sensitive regex (defaults to false)
     * @param {Boolean} exactMatch True to force exact match (^ and $ characters added to the regex). Defaults to false. Ignored if anyMatch is true.
     */
    createFilterFn : function(property, value, anyMatch, caseSensitive, exactMatch) {
        if (Ext.isEmpty(value, false)) {
            return false;
        }
        value = this.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r[property]);
        };
    },

    /**
     * @private
     * Given an array of filter functions (each with optional scope), constructs and returns a single function that returns
     * the result of all of the filters ANDed together
     * @param {Array} filters The array of filter objects (each object should contain an 'fn' and optional scope)
     * @return {Function} The multiple filter function
     */
    createMultipleFilterFn: function(filters) {
        return function(record) {
            var isMatch = true;

            for (var i=0, j = filters.length; i < j; i++) {
                var filter = filters[i],
                    fn     = filter.fn,
                    scope  = filter.scope;

                isMatch = isMatch && fn.call(scope, record);

                //break here to avoid unnecessary calculations - if not true here the record is already rejected
                if (isMatch !== true) {
                    break;
                }
            }

            return isMatch;
        };
    },

    /**
     * Returns a regular expression based on the given value and matching options. This is used internally for finding and filtering,
     * and by Ext.data.Store#filter
     * @private
     * @param {String} value The value to create the regex for. This is escaped using Ext.escapeRe
     * @param {Boolean} anyMatch True to allow any match - no regex start/end line anchors will be added. Defaults to false
     * @param {Boolean} caseSensitive True to make the regex case sensitive (adds 'i' switch to regex). Defaults to false.
     * @param {Boolean} exactMatch True to force exact match (^ and $ characters added to the regex). Defaults to false. Ignored if anyMatch is true.
     */
    createValueMatcher : function(value, anyMatch, caseSensitive, exactMatch) {
        if (!value.exec) { // not a regex
            var er = Ext.escapeRe;
            value = String(value);

            if (anyMatch === true) {
                value = er(value);
            } else {
                value = '^' + er(value);
                if (exactMatch === true) {
                    value += '$';
                }
            }
            value = new RegExp(value, caseSensitive ? '' : 'i');
         }
         return value;
    },

    /**
     * Creates a shallow copy of this collection
     * @return {MixedCollection}
     */
    clone : function(){
        var r = new Ext.util.MixedCollection();
        var k = this.keys, it = this.items;
        for (var i = 0, len = it.length; i < len; i++) {
            r.add(k[i], it[i]);
        }
        r.getKey = this.getKey;
        return r;
    }
});
/**
 * This method calls {@link #item item()}.
 * Returns the item associated with the passed key OR index. Key has priority
 * over index.  This is the equivalent of calling {@link #key} first, then if
 * nothing matched calling {@link #itemAt}.
 * @param {String/Number} key The key or index of the item.
 * @return {Object} If the item is found, returns the item.  If the item was
 * not found, returns <tt>undefined</tt>. If an item was found, but is a Class,
 * returns <tt>null</tt>.
 */
Ext.util.MixedCollection.prototype.get = Ext.util.MixedCollection.prototype.item;
/*
    http://www.JSON.org/json2.js
    2010-03-20

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/**
 * @class Ext.util.JSON
 * Modified version of Douglas Crockford"s json.js that doesn"t
 * mess with the Object prototype
 * http://www.json.org/js.html
 * @singleton
 */
Ext.util.JSON = {
    encode : function(o) {
        return JSON.stringify(o);
    },

    decode : function(s) {
        return JSON.parse(s);
    }
};

/**
 * Shorthand for {@link Ext.util.JSON#encode}
 * @param {Mixed} o The variable to encode
 * @return {String} The JSON string
 * @member Ext
 * @method encode
 */
Ext.encode = Ext.util.JSON.encode;
/**
 * Shorthand for {@link Ext.util.JSON#decode}
 * @param {String} json The JSON string
 * @param {Boolean} safe (optional) Whether to return null or throw an exception if the JSON is invalid.
 * @return {Object} The resulting object
 * @member Ext
 * @method decode
 */
Ext.decode = Ext.util.JSON.decode;
/**
 * @class Ext.util.JSONP
 *
 * Provides functionality to make cross-domain requests with JSONP (JSON with Padding).
 * http://en.wikipedia.org/wiki/JSON#JSONP
 * <p>
 * <b>Note that if you are retrieving data from a page that is in a domain that is NOT the same as the originating domain
 * of the running page, you must use this class, because of the same origin policy.</b><br>
 * <p>
 * The content passed back from a server resource requested by a JSONP request<b>must</b> be executable JavaScript
 * source code because it is used as the source inside a &lt;script> tag.<br>
 * <p>
 * In order for the browser to process the returned data, the server must wrap the data object
 * with a call to a callback function, the name of which is passed as a parameter callbackKey
 * Below is a Java example for a servlet which returns data for either a ScriptTagProxy, or an HttpProxy
 * depending on whether the callback name was passed:
 * <p>
 * <pre><code>
boolean scriptTag = false;
String cb = request.getParameter("callback");
if (cb != null) {
    scriptTag = true;
    response.setContentType("text/javascript");
} else {
    response.setContentType("application/x-json");
}
Writer out = response.getWriter();
if (scriptTag) {
    out.write(cb + "(");
}
out.print(dataBlock.toJsonString());
if (scriptTag) {
    out.write(");");
}
</code></pre>
 * <p>Below is a PHP example to do the same thing:</p><pre><code>
$callback = $_REQUEST['callback'];

// Create the output object.
$output = array('a' => 'Apple', 'b' => 'Banana');

//start output
if ($callback) {
    header('Content-Type: text/javascript');
    echo $callback . '(' . json_encode($output) . ');';
} else {
    header('Content-Type: application/x-json');
    echo json_encode($output);
}
</code></pre>
 * <p>Below is the ASP.Net code to do the same thing:</p><pre><code>
String jsonString = "{success: true}";
String cb = Request.Params.Get("callback");
String responseString = "";
if (!String.IsNullOrEmpty(cb)) {
    responseString = cb + "(" + jsonString + ")";
} else {
    responseString = jsonString;
}
Response.Write(responseString);
</code></pre>
 * @singleton
 */
Ext.util.JSONP = {

    /**
     * Read-only queue
     * @type Array
     */
    queue: [],

    /**
     * Read-only current executing request
     * @type Object
     */
    current: null,

    /**
     * Make a cross-domain request using JSONP.
     * @param {Object} config
     * Valid configurations are:
     * <ul>
     *  <li>url - {String} - Url to request data from. (required) </li>
     *  <li>params - {Object} - A set of key/value pairs to be url encoded and passed as GET parameters in the request.</li>
     *  <li>callbackKey - {String} - Key specified by the server-side provider.</li>
     *  <li>callback - {Function} - Will be passed a single argument of the result of the request.</li>
     *  <li>scope - {Scope} - Scope to execute your callback in.</li>
     * </ul>
     */
    request : function(o) {
        o = o || {};
        if (!o.url) {
            return;
        }

        var me = this;
        o.params = o.params || {};
        if (o.callbackKey) {
            o.params[o.callbackKey] = 'Ext.util.JSONP.callback';
        }
        var params = Ext.urlEncode(o.params);

        var script = document.createElement('script');
        script.type = 'text/javascript';

        this.queue.push({
            url: o.url,
            script: script,
            callback: o.callback || function(){},
            scope: o.scope || window,
            params: params || null
        });

        if (!this.current) {
            this.next();
        }
    },

    // private
    next : function() {
        this.current = null;
        if (this.queue.length) {
            this.current = this.queue.shift();
            this.current.script.src = this.current.url + (this.current.params ? ('?' + this.current.params) : '');
            document.getElementsByTagName('head')[0].appendChild(this.current.script);
        }
    },

    // @private
    callback: function(json) {
        this.current.callback.call(this.current.scope, json);
        document.getElementsByTagName('head')[0].removeChild(this.current.script);
        this.next();
    }
};

/**
 * @class Ext.util.Format
 * Reusable data formatting functions
 * @singleton
 */
Ext.util.Format = function() {
    return {
        
        defaultDateFormat: 'm/d/Y',
        
        /**
         * Truncate a string and add an ellipsis ('...') to the end if it exceeds the specified length
         * @param {String} value The string to truncate
         * @param {Number} length The maximum length to allow before truncating
         * @param {Boolean} word True to try to find a common work break
         * @return {String} The converted text
         */
        ellipsis: function(value, len, word) {
            if (value && value.length > len) {
                if (word) {
                    var vs = value.substr(0, len - 2),
                    index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                    if (index == -1 || index < (len - 15)) {
                        return value.substr(0, len - 3) + "...";
                    } else {
                        return vs.substr(0, index) + "...";
                    }
                } else {
                    return value.substr(0, len - 3) + "...";
                }
            }
            return value;
        },

        /**
         * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
         * @param {String} value The string to encode
         * @return {String} The encoded text
         */
        htmlEncode: function(value) {
            return ! value ? value: String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        },

        /**
         * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
         * @param {String} value The string to decode
         * @return {String} The decoded text
         */
        htmlDecode: function(value) {
            return ! value ? value: String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        },

        /**
         * Parse a value into a formatted date using the specified format pattern.
         * @param {String/Date} value The value to format (Strings must conform to the format expected by the javascript Date object's <a href="http://www.w3schools.com/jsref/jsref_parse.asp">parse()</a> method)
         * @param {String} format (optional) Any valid date format string (defaults to 'm/d/Y')
         * @return {String} The formatted date string
         */
        date: function(v, format) {
            if (!v) {
                return "";
            }
            if (!Ext.isDate(v)) {
                v = new Date(Date.parse(v));
            }
            return v.dateFormat(format || Ext.util.Format.defaultDateFormat);
        }
    };
}();

/**
 * @class Date
 *
 * The date parsing and formatting syntax contains a subset of
 * <a href="http://www.php.net/date">PHP's date() function</a>, and the formats that are
 * supported will provide results equivalent to their PHP versions.
 *
 * The following is a list of all currently supported formats:
 * <pre>
Format  Description                                                               Example returned values
------  -----------------------------------------------------------------------   -----------------------
  d     Day of the month, 2 digits with leading zeros                             01 to 31
  D     A short textual representation of the day of the week                     Mon to Sun
  j     Day of the month without leading zeros                                    1 to 31
  l     A full textual representation of the day of the week                      Sunday to Saturday
  N     ISO-8601 numeric representation of the day of the week                    1 (for Monday) through 7 (for Sunday)
  S     English ordinal suffix for the day of the month, 2 characters             st, nd, rd or th. Works well with j
  w     Numeric representation of the day of the week                             0 (for Sunday) to 6 (for Saturday)
  z     The day of the year (starting from 0)                                     0 to 364 (365 in leap years)
  W     ISO-8601 week number of year, weeks starting on Monday                    01 to 53
  F     A full textual representation of a month, such as January or March        January to December
  m     Numeric representation of a month, with leading zeros                     01 to 12
  M     A short textual representation of a month                                 Jan to Dec
  n     Numeric representation of a month, without leading zeros                  1 to 12
  t     Number of days in the given month                                         28 to 31
  L     Whether it's a leap year                                                  1 if it is a leap year, 0 otherwise.
  o     ISO-8601 year number (identical to (Y), but if the ISO week number (W)    Examples: 1998 or 2004
        belongs to the previous or next year, that year is used instead)
  Y     A full numeric representation of a year, 4 digits                         Examples: 1999 or 2003
  y     A two digit representation of a year                                      Examples: 99 or 03
  a     Lowercase Ante meridiem and Post meridiem                                 am or pm
  A     Uppercase Ante meridiem and Post meridiem                                 AM or PM
  g     12-hour format of an hour without leading zeros                           1 to 12
  G     24-hour format of an hour without leading zeros                           0 to 23
  h     12-hour format of an hour with leading zeros                              01 to 12
  H     24-hour format of an hour with leading zeros                              00 to 23
  i     Minutes, with leading zeros                                               00 to 59
  s     Seconds, with leading zeros                                               00 to 59
  u     Decimal fraction of a second                                              Examples:
        (minimum 1 digit, arbitrary number of digits allowed)                     001 (i.e. 0.001s) or
                                                                                  100 (i.e. 0.100s) or
                                                                                  999 (i.e. 0.999s) or
                                                                                  999876543210 (i.e. 0.999876543210s)
  O     Difference to Greenwich time (GMT) in hours and minutes                   Example: +1030
  P     Difference to Greenwich time (GMT) with colon between hours and minutes   Example: -08:00
  T     Timezone abbreviation of the machine running the code                     Examples: EST, MDT, PDT ...
  Z     Timezone offset in seconds (negative if west of UTC, positive if east)    -43200 to 50400
  c     ISO 8601 date
        Notes:                                                                    Examples:
        1) If unspecified, the month / day defaults to the current month / day,   1991 or
           the time defaults to midnight, while the timezone defaults to the      1992-10 or
           browser's timezone. If a time is specified, it must include both hours 1993-09-20 or
           and minutes. The "T" delimiter, seconds, milliseconds and timezone     1994-08-19T16:20+01:00 or
           are optional.                                                          1995-07-18T17:21:28-02:00 or
        2) The decimal fraction of a second, if specified, must contain at        1996-06-17T18:22:29.98765+03:00 or
           least 1 digit (there is no limit to the maximum number                 1997-05-16T19:23:30,12345-0400 or
           of digits allowed), and may be delimited by either a '.' or a ','      1998-04-15T20:24:31.2468Z or
        Refer to the examples on the right for the various levels of              1999-03-14T20:24:32Z or
        date-time granularity which are supported, or see                         2000-02-13T21:25:33
        http://www.w3.org/TR/NOTE-datetime for more info.                         2001-01-12 22:26:34
  U     Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)                1193432466 or -2138434463
  M$    Microsoft AJAX serialized dates                                           \/Date(1238606590509)\/ (i.e. UTC milliseconds since epoch) or
                                                                                  \/Date(1238606590509+0800)\/
</pre>
 *
 * Example usage (note that you must escape format specifiers with '\\' to render them as character literals):
 * <pre><code>
// Sample date:
// 'Wed Jan 10 2007 15:05:01 GMT-0600 (Central Standard Time)'

var dt = new Date('1/10/2007 03:05:01 PM GMT-0600');
document.write(dt.format('Y-m-d'));                           // 2007-01-10
document.write(dt.format('F j, Y, g:i a'));                   // January 10, 2007, 3:05 pm
document.write(dt.format('l, \\t\\he jS \\of F Y h:i:s A'));  // Wednesday, the 10th of January 2007 03:05:01 PM
</code></pre>
 *
 * Here are some standard date/time patterns that you might find helpful.  They
 * are not part of the source of Date.js, but to use them you can simply copy this
 * block of code into any script that is included after Date.js and they will also become
 * globally available on the Date object.  Feel free to add or remove patterns as needed in your code.
 * <pre><code>
Date.patterns = {
    ISO8601Long:"Y-m-d H:i:s",
    ISO8601Short:"Y-m-d",
    ShortDate: "n/j/Y",
    LongDate: "l, F d, Y",
    FullDateTime: "l, F d, Y g:i:s A",
    MonthDay: "F d",
    ShortTime: "g:i A",
    LongTime: "g:i:s A",
    SortableDateTime: "Y-m-d\\TH:i:s",
    UniversalSortableDateTime: "Y-m-d H:i:sO",
    YearMonth: "F, Y"
};
</code></pre>
 *
 * Example usage:
 * <pre><code>
var dt = new Date();
document.write(dt.format(Date.patterns.ShortDate));
</code></pre>
 * <p>Developer-written, custom formats may be used by supplying both a formatting and a parsing function
 * which perform to specialized requirements. The functions are stored in {@link #parseFunctions} and {@link #formatFunctions}.</p>
 */

/*
 * Most of the date-formatting functions below are the excellent work of Baron Schwartz.
 * (see http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/)
 * They generate precompiled functions from format patterns instead of parsing and
 * processing each pattern every time a date is formatted. These functions are available
 * on every Date object.
 */

 (function() {

    /**
 * Global flag which determines if strict date parsing should be used.
 * Strict date parsing will not roll-over invalid dates, which is the
 * default behaviour of javascript Date objects.
 * (see {@link #parseDate} for more information)
 * Defaults to <tt>false</tt>.
 * @static
 * @type Boolean
*/
    Date.useStrict = false;


    // create private copy of Ext's String.format() method
    // - to remove unnecessary dependency
    // - to resolve namespace conflict with M$-Ajax's implementation
    function xf(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/\{(\d+)\}/g,
        function(m, i) {
            return args[i];
        });
    }


    // private
    Date.formatCodeToRegex = function(character, currentGroup) {
        // Note: currentGroup - position in regex result array (see notes for Date.parseCodes below)
        var p = Date.parseCodes[character];

        if (p) {
            p = typeof p == 'function' ? p() : p;
            Date.parseCodes[character] = p;
            // reassign function result to prevent repeated execution
        }

        return p ? Ext.applyIf({
            c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
        },
        p) : {
            g: 0,
            c: null,
            s: Ext.escapeRe(character)
            // treat unrecognised characters as literals
        };
    };

    // private shorthand for Date.formatCodeToRegex since we'll be using it fairly often
    var $f = Date.formatCodeToRegex;

    Ext.apply(Date, {
        /**
     * <p>An object hash in which each property is a date parsing function. The property name is the
     * format string which that function parses.</p>
     * <p>This object is automatically populated with date parsing functions as
     * date formats are requested for Ext standard formatting strings.</p>
     * <p>Custom parsing functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #parseDate}.<p>
     * <p>Example:</p><pre><code>
Date.parseFunctions['x-date-format'] = myDateParser;
</code></pre>
     * <p>A parsing function should return a Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : String<div class="sub-desc">The date string to parse.</div></li>
     * <li><code>strict</code> : Boolean<div class="sub-desc">True to validate date strings while parsing
     * (i.e. prevent javascript Date "rollover") (The default must be false).
     * Invalid date strings should return null when parsed.</div></li>
     * </ul></div></p>
     * <p>To enable Dates to also be <i>formatted</i> according to that format, a corresponding
     * formatting function must be placed into the {@link #formatFunctions} property.
     * @property parseFunctions
     * @static
     * @type Object
     */
        parseFunctions: {
            "M$": function(input, strict) {
                // note: the timezone offset is ignored since the M$ Ajax server sends
                // a UTC milliseconds-since-Unix-epoch value (negative values are allowed)
                var re = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/');
                var r = (input || '').match(re);
                return r ? new Date(((r[1] || '') + r[2]) * 1) : null;
            }
        },
        parseRegexes: [],

        /**
     * <p>An object hash in which each property is a date formatting function. The property name is the
     * format string which corresponds to the produced formatted date string.</p>
     * <p>This object is automatically populated with date formatting functions as
     * date formats are requested for Ext standard formatting strings.</p>
     * <p>Custom formatting functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #format}. Example:</p><pre><code>
Date.formatFunctions['x-date-format'] = myDateFormatter;
</code></pre>
     * <p>A formatting function should return a string representation of the passed Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : Date<div class="sub-desc">The Date to format.</div></li>
     * </ul></div></p>
     * <p>To enable date strings to also be <i>parsed</i> according to that format, a corresponding
     * parsing function must be placed into the {@link #parseFunctions} property.
     * @property formatFunctions
     * @static
     * @type Object
     */
        formatFunctions: {
            "M$": function() {
                // UTC milliseconds since Unix epoch (M$-AJAX serialized date format (MRSF))
                return '\\/Date(' + this.getTime() + ')\\/';
            }
        },

        y2kYear: 50,

        /**
     * Date interval constant
     * @static
     * @type String
     */
        MILLI: "ms",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        SECOND: "s",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        MINUTE: "mi",

        /** Date interval constant
     * @static
     * @type String
     */
        HOUR: "h",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        DAY: "d",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        MONTH: "mo",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        YEAR: "y",

        /**
     * <p>An object hash containing default date values used during date parsing.</p>
     * <p>The following properties are available:<div class="mdetail-params"><ul>
     * <li><code>y</code> : Number<div class="sub-desc">The default year value. (defaults to undefined)</div></li>
     * <li><code>m</code> : Number<div class="sub-desc">The default 1-based month value. (defaults to undefined)</div></li>
     * <li><code>d</code> : Number<div class="sub-desc">The default day value. (defaults to undefined)</div></li>
     * <li><code>h</code> : Number<div class="sub-desc">The default hour value. (defaults to undefined)</div></li>
     * <li><code>i</code> : Number<div class="sub-desc">The default minute value. (defaults to undefined)</div></li>
     * <li><code>s</code> : Number<div class="sub-desc">The default second value. (defaults to undefined)</div></li>
     * <li><code>ms</code> : Number<div class="sub-desc">The default millisecond value. (defaults to undefined)</div></li>
     * </ul></div></p>
     * <p>Override these properties to customize the default date values used by the {@link #parseDate} method.</p>
     * <p><b>Note: In countries which experience Daylight Saving Time (i.e. DST), the <tt>h</tt>, <tt>i</tt>, <tt>s</tt>
     * and <tt>ms</tt> properties may coincide with the exact time in which DST takes effect.
     * It is the responsiblity of the developer to account for this.</b></p>
     * Example Usage:
     * <pre><code>
// set default day value to the first day of the month
Date.defaults.d = 1;

// parse a February date string containing only year and month values.
// setting the default day value to 1 prevents weird date rollover issues
// when attempting to parse the following date string on, for example, March 31st 2009.
Date.parseDate('2009-02', 'Y-m'); // returns a Date object representing February 1st 2009
</code></pre>
     * @property defaults
     * @static
     * @type Object
     */
        defaults: {},

        /**
     * An array of textual day names.
     * Override these values for international dates.
     * Example:
     * <pre><code>
Date.dayNames = [
    'SundayInYourLang',
    'MondayInYourLang',
    ...
];
</code></pre>
     * @type Array
     * @static
     */
        dayNames: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
        ],

        /**
     * An array of textual month names.
     * Override these values for international dates.
     * Example:
     * <pre><code>
Date.monthNames = [
    'JanInYourLang',
    'FebInYourLang',
    ...
];
</code></pre>
     * @type Array
     * @static
     */
        monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
        ],

        /**
     * An object hash of zero-based javascript month numbers (with short month names as keys. note: keys are case-sensitive).
     * Override these values for international dates.
     * Example:
     * <pre><code>
Date.monthNumbers = {
    'ShortJanNameInYourLang':0,
    'ShortFebNameInYourLang':1,
    ...
};
</code></pre>
     * @type Object
     * @static
     */
        monthNumbers: {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11
        },

        /**
     * Get the short month name for the given month number.
     * Override this function for international dates.
     * @param {Number} month A zero-based javascript month number.
     * @return {String} The short month name.
     * @static
     */
        getShortMonthName: function(month) {
            return Date.monthNames[month].substring(0, 3);
        },

        /**
     * Get the short day name for the given day number.
     * Override this function for international dates.
     * @param {Number} day A zero-based javascript day number.
     * @return {String} The short day name.
     * @static
     */
        getShortDayName: function(day) {
            return Date.dayNames[day].substring(0, 3);
        },

        /**
     * Get the zero-based javascript month number for the given short/full month name.
     * Override this function for international dates.
     * @param {String} name The short/full month name.
     * @return {Number} The zero-based javascript month number.
     * @static
     */
        getMonthNumber: function(name) {
            // handle camel casing for english month names (since the keys for the Date.monthNumbers hash are case sensitive)
            return Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        },

        /**
     * The base format-code to formatting-function hashmap used by the {@link #format} method.
     * Formatting functions are strings (or functions which return strings) which
     * will return the appropriate value when evaluated in the context of the Date object
     * from which the {@link #format} method is called.
     * Add to / override these mappings for custom date formatting.
     * Note: Date.format() treats characters as literals if an appropriate mapping cannot be found.
     * Example:
     * <pre><code>
Date.formatCodes.x = "String.leftPad(this.getDate(), 2, '0')";
(new Date()).format("X"); // returns the current day of the month
</code></pre>
     * @type Object
     * @static
     */
        formatCodes: {
            d: "String.leftPad(this.getDate(), 2, '0')",
            D: "Date.getShortDayName(this.getDay())",
            // get localised short day name
            j: "this.getDate()",
            l: "Date.dayNames[this.getDay()]",
            N: "(this.getDay() ? this.getDay() : 7)",
            S: "this.getSuffix()",
            w: "this.getDay()",
            z: "this.getDayOfYear()",
            W: "String.leftPad(this.getWeekOfYear(), 2, '0')",
            F: "Date.monthNames[this.getMonth()]",
            m: "String.leftPad(this.getMonth() + 1, 2, '0')",
            M: "Date.getShortMonthName(this.getMonth())",
            // get localised short month name
            n: "(this.getMonth() + 1)",
            t: "this.getDaysInMonth()",
            L: "(this.isLeapYear() ? 1 : 0)",
            o: "(this.getFullYear() + (this.getWeekOfYear() == 1 && this.getMonth() > 0 ? +1 : (this.getWeekOfYear() >= 52 && this.getMonth() < 11 ? -1 : 0)))",
            Y: "this.getFullYear()",
            y: "('' + this.getFullYear()).substring(2, 4)",
            a: "(this.getHours() < 12 ? 'am' : 'pm')",
            A: "(this.getHours() < 12 ? 'AM' : 'PM')",
            g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
            G: "this.getHours()",
            h: "String.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
            H: "String.leftPad(this.getHours(), 2, '0')",
            i: "String.leftPad(this.getMinutes(), 2, '0')",
            s: "String.leftPad(this.getSeconds(), 2, '0')",
            u: "String.leftPad(this.getMilliseconds(), 3, '0')",
            O: "this.getGMTOffset()",
            P: "this.getGMTOffset(true)",
            T: "this.getTimezone()",
            Z: "(this.getTimezoneOffset() * -60)",

            c: function() {
                // ISO-8601 -- GMT format
                for (var c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
                    var e = c.charAt(i);
                    code.push(e == "T" ? "'T'": Date.getFormatCode(e));
                    // treat T as a character literal
                }
                return code.join(" + ");
            },
            /*
        c: function() { // ISO-8601 -- UTC format
            return [
              "this.getUTCFullYear()", "'-'",
              "String.leftPad(this.getUTCMonth() + 1, 2, '0')", "'-'",
              "String.leftPad(this.getUTCDate(), 2, '0')",
              "'T'",
              "String.leftPad(this.getUTCHours(), 2, '0')", "':'",
              "String.leftPad(this.getUTCMinutes(), 2, '0')", "':'",
              "String.leftPad(this.getUTCSeconds(), 2, '0')",
              "'Z'"
            ].join(" + ");
        },
        */

            U: "Math.round(this.getTime() / 1000)"
        },

        /**
     * Checks if the passed Date parameters will cause a javascript Date "rollover".
     * @param {Number} year 4-digit year
     * @param {Number} month 1-based month-of-year
     * @param {Number} day Day of month
     * @param {Number} hour (optional) Hour
     * @param {Number} minute (optional) Minute
     * @param {Number} second (optional) Second
     * @param {Number} millisecond (optional) Millisecond
     * @return {Boolean} true if the passed parameters do not cause a Date "rollover", false otherwise.
     * @static
     */
        isValid: function(y, m, d, h, i, s, ms) {
            // setup defaults
            h = h || 0;
            i = i || 0;
            s = s || 0;
            ms = ms || 0;

            var dt = new Date(y, m - 1, d, h, i, s, ms);

            return y == dt.getFullYear() &&
            m == dt.getMonth() + 1 &&
            d == dt.getDate() &&
            h == dt.getHours() &&
            i == dt.getMinutes() &&
            s == dt.getSeconds() &&
            ms == dt.getMilliseconds();
        },

        /**
     * Parses the passed string using the specified date format.
     * Note that this function expects normal calendar dates, meaning that months are 1-based (i.e. 1 = January).
     * The {@link #defaults} hash will be used for any date value (i.e. year, month, day, hour, minute, second or millisecond)
     * which cannot be found in the passed string. If a corresponding default date value has not been specified in the {@link #defaults} hash,
     * the current date's year, month, day or DST-adjusted zero-hour time value will be used instead.
     * Keep in mind that the input date string must precisely match the specified format string
     * in order for the parse operation to be successful (failed parse operations return a null value).
     * <p>Example:</p><pre><code>
//dt = Fri May 25 2007 (current date)
var dt = new Date();

//dt = Thu May 25 2006 (today&#39;s month/day in 2006)
dt = Date.parseDate("2006", "Y");

//dt = Sun Jan 15 2006 (all date parts specified)
dt = Date.parseDate("2006-01-15", "Y-m-d");

//dt = Sun Jan 15 2006 15:20:01
dt = Date.parseDate("2006-01-15 3:20:01 PM", "Y-m-d g:i:s A");

// attempt to parse Sun Feb 29 2006 03:20:01 in strict mode
dt = Date.parseDate("2006-02-29 03:20:01", "Y-m-d H:i:s", true); // returns null
</code></pre>
     * @param {String} input The raw date string.
     * @param {String} format The expected date string format.
     * @param {Boolean} strict (optional) True to validate date strings while parsing (i.e. prevents javascript Date "rollover")
                        (defaults to false). Invalid date strings will return null when parsed.
     * @return {Date} The parsed Date.
     * @static
     */
        parseDate: function(input, format, strict) {
            var p = Date.parseFunctions;
            if (p[format] == null) {
                Date.createParser(format);
            }
            return p[format](input, Ext.isDefined(strict) ? strict: Date.useStrict);
        },

        // private
        getFormatCode: function(character) {
            var f = Date.formatCodes[character];

            if (f) {
                f = typeof f == 'function' ? f() : f;
                Date.formatCodes[character] = f;
                // reassign function result to prevent repeated execution
            }

            // note: unknown characters are treated as literals
            return f || ("'" + String.escape(character) + "'");
        },

        // private
        createFormat: function(format) {
            var code = [],
            special = false,
            ch = '';

            for (var i = 0; i < format.length; ++i) {
                ch = format.charAt(i);
                if (!special && ch == "\\") {
                    special = true;
                } else if (special) {
                    special = false;
                    code.push("'" + String.escape(ch) + "'");
                } else {
                    code.push(Date.getFormatCode(ch));
                }
            }
            Date.formatFunctions[format] = new Function("return " + code.join('+'));
        },

        // private
        createParser: function() {
            var code = [
            "var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,",
            "def = Date.defaults,",
            "results = String(input).match(Date.parseRegexes[{0}]);",
            // either null, or an array of matched strings
            "if(results){",
            "{1}",

            "if(u != null){",
            // i.e. unix time is defined
            "v = new Date(u * 1000);",
            // give top priority to UNIX time
            "}else{",
            // create Date object representing midnight of the current day;
            // this will provide us with our date defaults
            // (note: clearTime() handles Daylight Saving Time automatically)
            "dt = (new Date()).clearTime();",

            // date calculations (note: these calculations create a dependency on Ext.num())
            "y = Ext.num(y, Ext.num(def.y, dt.getFullYear()));",
            "m = Ext.num(m, Ext.num(def.m - 1, dt.getMonth()));",
            "d = Ext.num(d, Ext.num(def.d, dt.getDate()));",

            // time calculations (note: these calculations create a dependency on Ext.num())
            "h  = Ext.num(h, Ext.num(def.h, dt.getHours()));",
            "i  = Ext.num(i, Ext.num(def.i, dt.getMinutes()));",
            "s  = Ext.num(s, Ext.num(def.s, dt.getSeconds()));",
            "ms = Ext.num(ms, Ext.num(def.ms, dt.getMilliseconds()));",

            "if(z >= 0 && y >= 0){",
            // both the year and zero-based day of year are defined and >= 0.
            // these 2 values alone provide sufficient info to create a full date object
            // create Date object representing January 1st for the given year
            "v = new Date(y, 0, 1, h, i, s, ms);",

            // then add day of year, checking for Date "rollover" if necessary
            "v = !strict? v : (strict === true && (z <= 364 || (v.isLeapYear() && z <= 365))? v.add(Date.DAY, z) : null);",
            "}else if(strict === true && !Date.isValid(y, m + 1, d, h, i, s, ms)){",
            // check for Date "rollover"
            "v = null;",
            // invalid date, so return null
            "}else{",
            // plain old Date object
            "v = new Date(y, m, d, h, i, s, ms);",
            "}",
            "}",
            "}",

            "if(v){",
            // favour UTC offset over GMT offset
            "if(zz != null){",
            // reset to UTC, then add offset
            "v = v.add(Date.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
            // reset to GMT, then add offset
            "v = v.add(Date.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
            "}",

            "return v;"
            ].join('\n');

            return function(format) {
                var regexNum = Date.parseRegexes.length,
                currentGroup = 1,
                calc = [],
                regex = [],
                special = false,
                ch = "";

                for (var i = 0; i < format.length; ++i) {
                    ch = format.charAt(i);
                    if (!special && ch == "\\") {
                        special = true;
                    } else if (special) {
                        special = false;
                        regex.push(String.escape(ch));
                    } else {
                        var obj = $f(ch, currentGroup);
                        currentGroup += obj.g;
                        regex.push(obj.s);
                        if (obj.g && obj.c) {
                            calc.push(obj.c);
                        }
                    }
                }

                Date.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$");
                Date.parseFunctions[format] = new Function("input", "strict", xf(code, regexNum, calc.join('')));
            };
        }(),

        // private
        parseCodes: {
            /*
         * Notes:
         * g = {Number} calculation group (0 or 1. only group 1 contributes to date calculations.)
         * c = {String} calculation method (required for group 1. null for group 0. {0} = currentGroup - position in regex result array)
         * s = {String} regex pattern. all matches are stored in results[], and are accessible by the calculation mapped to 'c'
         */
            d: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                // day of month with leading zeroes (01 - 31)
            },
            j: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,2})"
                // day of month without leading zeroes (1 - 31)
            },
            D: function() {
                for (var a = [], i = 0; i < 7; a.push(Date.getShortDayName(i)), ++i);
                // get localised short day names
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + a.join("|") + ")"
                };
            },
            l: function() {
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + Date.dayNames.join("|") + ")"
                };
            },
            N: {
                g: 0,
                c: null,
                s: "[1-7]"
                // ISO-8601 day number (1 (monday) - 7 (sunday))
            },
            S: {
                g: 0,
                c: null,
                s: "(?:st|nd|rd|th)"
            },
            w: {
                g: 0,
                c: null,
                s: "[0-6]"
                // javascript day number (0 (sunday) - 6 (saturday))
            },
            z: {
                g: 1,
                c: "z = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,3})"
                // day of the year (0 - 364 (365 in leap years))
            },
            W: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
                // ISO-8601 week number (with leading zero)
            },
            F: function() {
                return {
                    g: 1,
                    c: "m = parseInt(Date.getMonthNumber(results[{0}]), 10);\n",
                    // get localised month number
                    s: "(" + Date.monthNames.join("|") + ")"
                };
            },
            M: function() {
                for (var a = [], i = 0; i < 12; a.push(Date.getShortMonthName(i)), ++i);
                // get localised short month names
                return Ext.applyIf({
                    s: "(" + a.join("|") + ")"
                },
                $f("F"));
            },
            m: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{2})"
                // month number with leading zeros (01 - 12)
            },
            n: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{1,2})"
                // month number without leading zeros (1 - 12)
            },
            t: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
                // no. of days in the month (28 - 31)
            },
            L: {
                g: 0,
                c: null,
                s: "(?:1|0)"
            },
            o: function() {
                return $f("Y");
            },
            Y: {
                g: 1,
                c: "y = parseInt(results[{0}], 10);\n",
                s: "(\\d{4})"
                // 4-digit year
            },
            y: {
                g: 1,
                c: "var ty = parseInt(results[{0}], 10);\n"
                + "y = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
                // 2-digit year
                s: "(\\d{1,2})"
            },
            a: {
                g: 1,
                c: "if (results[{0}] == 'am') {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(am|pm)"
            },
            A: {
                g: 1,
                c: "if (results[{0}] == 'AM') {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(AM|PM)"
            },
            g: function() {
                return $f("G");
            },
            G: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,2})"
                // 24-hr format of an hour without leading zeroes (0 - 23)
            },
            h: function() {
                return $f("H");
            },
            H: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                //  24-hr format of an hour with leading zeroes (00 - 23)
            },
            i: {
                g: 1,
                c: "i = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                // minutes with leading zeros (00 - 59)
            },
            s: {
                g: 1,
                c: "s = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                // seconds with leading zeros (00 - 59)
            },
            u: {
                g: 1,
                c: "ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
                s: "(\\d+)"
                // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
            },
            O: {
                g: 1,
                c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),",
                // get + / - sign
                "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),",
                // get hours (performs minutes-to-hour conversion also, just in case)
                "mn = o.substring(3,5) % 60;",
                // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + String.leftPad(hr, 2, '0') + String.leftPad(mn, 2, '0')) : null;\n"
                // -12hrs <= GMT offset <= 14hrs
                ].join("\n"),
                s: "([+\-]\\d{4})"
                // GMT offset in hrs and mins
            },
            P: {
                g: 1,
                c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),",
                // get + / - sign
                "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),",
                // get hours (performs minutes-to-hour conversion also, just in case)
                "mn = o.substring(4,6) % 60;",
                // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + String.leftPad(hr, 2, '0') + String.leftPad(mn, 2, '0')) : null;\n"
                // -12hrs <= GMT offset <= 14hrs
                ].join("\n"),
                s: "([+\-]\\d{2}:\\d{2})"
                // GMT offset in hrs and mins (with colon separator)
            },
            T: {
                g: 0,
                c: null,
                s: "[A-Z]{1,4}"
                // timezone abbrev. may be between 1 - 4 chars
            },
            Z: {
                g: 1,
                c: "zz = results[{0}] * 1;\n"
                // -43200 <= UTC offset <= 50400
                + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
                s: "([+\-]?\\d{1,5})"
                // leading '+' sign is optional for UTC offset
            },
            c: function() {
                var calc = [],
                arr = [
                $f("Y", 1),
                // year
                $f("m", 2),
                // month
                $f("d", 3),
                // day
                $f("h", 4),
                // hour
                $f("i", 5),
                // minute
                $f("s", 6),
                // second
                {
                    c: "ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"
                },
                // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
                {
                    c: [
                    // allow either "Z" (i.e. UTC) or "-0530" or "+08:00" (i.e. UTC offset) timezone delimiters. assumes local timezone if no timezone is specified
                    "if(results[8]) {",
                    // timezone specified
                    "if(results[8] == 'Z'){",
                    "zz = 0;",
                    // UTC
                    "}else if (results[8].indexOf(':') > -1){",
                    $f("P", 8).c,
                    // timezone offset with colon separator
                    "}else{",
                    $f("O", 8).c,
                    // timezone offset without colon separator
                    "}",
                    "}"
                    ].join('\n')
                }
                ];

                for (var i = 0, l = arr.length; i < l; ++i) {
                    calc.push(arr[i].c);
                }

                return {
                    g: 1,
                    c: calc.join(""),
                    s: [
                    arr[0].s,
                    // year (required)
                    "(?:", "-", arr[1].s,
                    // month (optional)
                    "(?:", "-", arr[2].s,
                    // day (optional)
                    "(?:",
                    "(?:T| )?",
                    // time delimiter -- either a "T" or a single blank space
                    arr[3].s, ":", arr[4].s,
                    // hour AND minute, delimited by a single colon (optional). MUST be preceded by either a "T" or a single blank space
                    "(?::", arr[5].s, ")?",
                    // seconds (optional)
                    "(?:(?:\\.|,)(\\d+))?",
                    // decimal fraction of a second (e.g. ",12345" or ".98765") (optional)
                    "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?",
                    // "Z" (UTC) or "-0530" (UTC offset without colon delimiter) or "+08:00" (UTC offset with colon delimiter) (optional)
                    ")?",
                    ")?",
                    ")?"
                    ].join("")
                };
            },
            U: {
                g: 1,
                c: "u = parseInt(results[{0}], 10);\n",
                s: "(-?\\d+)"
                // leading minus sign indicates seconds before UNIX epoch
            }
        }
    });

} ());

Ext.apply(Date.prototype, {
    // private
    dateFormat: function(format) {
        if (Date.formatFunctions[format] == null) {
            Date.createFormat(format);
        }
        return Date.formatFunctions[format].call(this);
    },

    /**
     * Get the timezone abbreviation of the current date (equivalent to the format specifier 'T').
     *
     * Note: The date string returned by the javascript Date object's toString() method varies
     * between browsers (e.g. FF vs IE) and system region settings (e.g. IE in Asia vs IE in America).
     * For a given date string e.g. "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)",
     * getTimezone() first tries to get the timezone abbreviation from between a pair of parentheses
     * (which may or may not be present), failing which it proceeds to get the timezone abbreviation
     * from the GMT offset portion of the date string.
     * @return {String} The abbreviated timezone name (e.g. 'CST', 'PDT', 'EDT', 'MPST' ...).
     */
    getTimezone: function() {
        // the following list shows the differences between date strings from different browsers on a WinXP SP2 machine from an Asian locale:
        //
        // Opera  : "Thu, 25 Oct 2007 22:53:45 GMT+0800" -- shortest (weirdest) date string of the lot
        // Safari : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone (same as FF)
        // FF     : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone
        // IE     : "Thu Oct 25 22:54:35 UTC+0800 2007" -- (Asian system setting) look for 3-4 letter timezone abbrev
        // IE     : "Thu Oct 25 17:06:37 PDT 2007" -- (American system setting) look for 3-4 letter timezone abbrev
        //
        // this crazy regex attempts to guess the correct timezone abbreviation despite these differences.
        // step 1: (?:\((.*)\) -- find timezone in parentheses
        // step 2: ([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?) -- if nothing was found in step 1, find timezone from timezone offset portion of date string
        // step 3: remove all non uppercase characters found in step 1 and 2
        return this.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
    },

    /**
     * Get the offset from GMT of the current date (equivalent to the format specifier 'O').
     * @param {Boolean} colon (optional) true to separate the hours and minutes with a colon (defaults to false).
     * @return {String} The 4-character offset string prefixed with + or - (e.g. '-0600').
     */
    getGMTOffset: function(colon) {
        return (this.getTimezoneOffset() > 0 ? "-": "+")
        + String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset()) / 60), 2, "0")
        + (colon ? ":": "")
        + String.leftPad(Math.abs(this.getTimezoneOffset() % 60), 2, "0");
    },

    /**
     * Get the numeric day number of the year, adjusted for leap year.
     * @return {Number} 0 to 364 (365 in leap years).
     */
    getDayOfYear: function() {
        var num = 0,
        d = this.clone(),
        m = this.getMonth(),
        i;

        for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
            num += d.getDaysInMonth();
        }
        return num + this.getDate() - 1;
    },

    /**
     * Get the numeric ISO-8601 week number of the year.
     * (equivalent to the format specifier 'W', but without a leading zero).
     * @return {Number} 1 to 53
     */
    getWeekOfYear: function() {
        // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
        var ms1d = 864e5,
        // milliseconds in a day
        ms7d = 7 * ms1d;
        // milliseconds in a week
        return function() {
            // return a closure so constants get calculated only once
            var DC3 = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate() + 3) / ms1d,
            // an Absolute Day Number
            AWN = Math.floor(DC3 / 7),
            // an Absolute Week Number
            Wyr = new Date(AWN * ms7d).getUTCFullYear();

            return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
        };
    }(),

    /**
     * Checks if the current date falls within a leap year.
     * @return {Boolean} True if the current date falls within a leap year, false otherwise.
     */
    isLeapYear: function() {
        var year = this.getFullYear();
        return !! ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    },

    /**
     * Get the first day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     * Example:
     * <pre><code>
var dt = new Date('1/10/2007');
document.write(Date.dayNames[dt.getFirstDayOfMonth()]); //output: 'Monday'
</code></pre>
     * @return {Number} The day number (0-6).
     */
    getFirstDayOfMonth: function() {
        var day = (this.getDay() - (this.getDate() - 1)) % 7;
        return (day < 0) ? (day + 7) : day;
    },

    /**
     * Get the last day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     * Example:
     * <pre><code>
var dt = new Date('1/10/2007');
document.write(Date.dayNames[dt.getLastDayOfMonth()]); //output: 'Wednesday'
</code></pre>
     * @return {Number} The day number (0-6).
     */
    getLastDayOfMonth: function() {
        return this.getLastDateOfMonth().getDay();
    },


    /**
     * Get the date of the first day of the month in which this date resides.
     * @return {Date}
     */
    getFirstDateOfMonth: function() {
        return new Date(this.getFullYear(), this.getMonth(), 1);
    },

    /**
     * Get the date of the last day of the month in which this date resides.
     * @return {Date}
     */
    getLastDateOfMonth: function() {
        return new Date(this.getFullYear(), this.getMonth(), this.getDaysInMonth());
    },

    /**
     * Get the number of days in the current month, adjusted for leap year.
     * @return {Number} The number of days in the month.
     */
    getDaysInMonth: function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function() {
            // return a closure for efficiency
            var m = this.getMonth();

            return m == 1 && this.isLeapYear() ? 29: daysInMonth[m];
        };
    }(),

    /**
     * Get the English ordinal suffix of the current day (equivalent to the format specifier 'S').
     * @return {String} 'st, 'nd', 'rd' or 'th'.
     */
    getSuffix: function() {
        switch (this.getDate()) {
        case 1:
        case 21:
        case 31:
            return "st";
        case 2:
        case 22:
            return "nd";
        case 3:
        case 23:
            return "rd";
        default:
            return "th";
        }
    },

    /**
     * Creates and returns a new Date instance with the exact same date value as the called instance.
     * Dates are copied and passed by reference, so if a copied date variable is modified later, the original
     * variable will also be changed.  When the intention is to create a new variable that will not
     * modify the original instance, you should create a clone.
     *
     * Example of correctly cloning a date:
     * <pre><code>
//wrong way:
var orig = new Date('10/1/2006');
var copy = orig;
copy.setDate(5);
document.write(orig);  //returns 'Thu Oct 05 2006'!

//correct way:
var orig = new Date('10/1/2006');
var copy = orig.clone();
copy.setDate(5);
document.write(orig);  //returns 'Thu Oct 01 2006'
</code></pre>
     * @return {Date} The new Date instance.
     */
    clone: function() {
        return new Date(this.getTime());
    },

    /**
     * Checks if the current date is affected by Daylight Saving Time (DST).
     * @return {Boolean} True if the current date is affected by DST.
     */
    isDST: function() {
        // adapted from http://extjs.com/forum/showthread.php?p=247172#post247172
        // courtesy of @geoffrey.mcgill
        return new Date(this.getFullYear(), 0, 1).getTimezoneOffset() != this.getTimezoneOffset();
    },

    /**
     * Attempts to clear all time information from this Date by setting the time to midnight of the same day,
     * automatically adjusting for Daylight Saving Time (DST) where applicable.
     * (note: DST timezone information for the browser's host operating system is assumed to be up-to-date)
     * @param {Boolean} clone true to create a clone of this date, clear the time and return it (defaults to false).
     * @return {Date} this or the clone.
     */
    clearTime: function(clone) {
        if (clone) {
            return this.clone().clearTime();
        }

        // get current date before clearing time
        var d = this.getDate();

        // clear time
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);

        if (this.getDate() != d) {
            // account for DST (i.e. day of month changed when setting hour = 0)
            // note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
            // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule
            // increment hour until cloned date == current date
            for (var hr = 1, c = this.add(Date.HOUR, hr); c.getDate() != d; hr++, c = this.add(Date.HOUR, hr));

            this.setDate(d);
            this.setHours(c.getHours());
        }

        return this;
    },

    /**
     * Provides a convenient method for performing basic date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     *
     * Examples:
     * <pre><code>
// Basic usage:
var dt = new Date('10/29/2006').add(Date.DAY, 5);
document.write(dt); //returns 'Fri Nov 03 2006 00:00:00'

// Negative values will be subtracted:
var dt2 = new Date('10/1/2006').add(Date.DAY, -5);
document.write(dt2); //returns 'Tue Sep 26 2006 00:00:00'

// You can even chain several calls together in one line:
var dt3 = new Date('10/1/2006').add(Date.DAY, 5).add(Date.HOUR, 8).add(Date.MINUTE, -30);
document.write(dt3); //returns 'Fri Oct 06 2006 07:30:00'
</code></pre>
     *
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to add to the current date.
     * @return {Date} The new Date instance.
     */
    add: function(interval, value) {
        var d = this.clone();
        if (!interval || value === 0) return d;

        switch (interval.toLowerCase()) {
        case Date.MILLI:
            d.setMilliseconds(this.getMilliseconds() + value);
            break;
        case Date.SECOND:
            d.setSeconds(this.getSeconds() + value);
            break;
        case Date.MINUTE:
            d.setMinutes(this.getMinutes() + value);
            break;
        case Date.HOUR:
            d.setHours(this.getHours() + value);
            break;
        case Date.DAY:
            d.setDate(this.getDate() + value);
            break;
        case Date.MONTH:
            var day = this.getDate();
            if (day > 28) {
                day = Math.min(day, this.getFirstDateOfMonth().add('mo', value).getLastDateOfMonth().getDate());
            }
            d.setDate(day);
            d.setMonth(this.getMonth() + value);
            break;
        case Date.YEAR:
            d.setFullYear(this.getFullYear() + value);
            break;
        }
        return d;
    },

    /**
     * Checks if this date falls on or between the given start and end dates.
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} true if this date falls on or between the given start and end dates.
     */
    between: function(start, end) {
        var t = this.getTime();
        return start.getTime() <= t && t <= end.getTime();
    }
});


/**
 * Formats a date given the supplied format string.
 * @param {String} format The format string.
 * @return {String} The formatted date.
 * @method format
 */
Date.prototype.format = Date.prototype.dateFormat;


// private
if (Ext.isSafari && (navigator.userAgent.match(/WebKit\/(\d+)/)[1] || NaN) < 420) {
    Ext.apply(Date.prototype, {
        _xMonth: Date.prototype.setMonth,
        _xDate: Date.prototype.setDate,

        // Bug in Safari 1.3, 2.0 (WebKit build < 420)
        // Date.setMonth does not work consistently if iMonth is not 0-11
        setMonth: function(num) {
            if (num <= -1) {
                var n = Math.ceil( - num),
                back_year = Math.ceil(n / 12),
                month = (n % 12) ? 12 - n % 12: 0;

                this.setFullYear(this.getFullYear() - back_year);

                return this._xMonth(month);
            } else {
                return this._xMonth(num);
            }
        },

        // Bug in setDate() method (resolved in WebKit build 419.3, so to be safe we target Webkit builds < 420)
        // The parameter for Date.setDate() is converted to a signed byte integer in Safari
        // http://brianary.blogspot.com/2006/03/safari-date-bug.html
        setDate: function(d) {
            // use setTime() to workaround setDate() bug
            // subtract current day of month in milliseconds, then add desired day of month in milliseconds
            return this.setTime(this.getTime() - (this.getDate() - d) * 864e5);
        }
    });
}



/* Some basic Date tests... (requires Firebug)

Date.parseDate('', 'c'); // call Date.parseDate() once to force computation of regex string so we can console.log() it
console.log('Insane Regex for "c" format: %o', Date.parseCodes.c.s); // view the insane regex for the "c" format specifier

// standard tests
console.group('Standard Date.parseDate() Tests');
    console.log('Date.parseDate("2009-01-05T11:38:56", "c")               = %o', Date.parseDate("2009-01-05T11:38:56", "c")); // assumes browser's timezone setting
    console.log('Date.parseDate("2009-02-04T12:37:55.001000", "c")        = %o', Date.parseDate("2009-02-04T12:37:55.001000", "c")); // assumes browser's timezone setting
    console.log('Date.parseDate("2009-03-03T13:36:54,101000Z", "c")       = %o', Date.parseDate("2009-03-03T13:36:54,101000Z", "c")); // UTC
    console.log('Date.parseDate("2009-04-02T14:35:53.901000-0530", "c")   = %o', Date.parseDate("2009-04-02T14:35:53.901000-0530", "c")); // GMT-0530
    console.log('Date.parseDate("2009-05-01T15:34:52,9876000+08:00", "c") = %o', Date.parseDate("2009-05-01T15:34:52,987600+08:00", "c")); // GMT+08:00
console.groupEnd();

// ISO-8601 format as specified in http://www.w3.org/TR/NOTE-datetime
// -- accepts ALL 6 levels of date-time granularity
console.group('ISO-8601 Granularity Test (see http://www.w3.org/TR/NOTE-datetime)');
    console.log('Date.parseDate("1997", "c")                              = %o', Date.parseDate("1997", "c")); // YYYY (e.g. 1997)
    console.log('Date.parseDate("1997-07", "c")                           = %o', Date.parseDate("1997-07", "c")); // YYYY-MM (e.g. 1997-07)
    console.log('Date.parseDate("1997-07-16", "c")                        = %o', Date.parseDate("1997-07-16", "c")); // YYYY-MM-DD (e.g. 1997-07-16)
    console.log('Date.parseDate("1997-07-16T19:20+01:00", "c")            = %o', Date.parseDate("1997-07-16T19:20+01:00", "c")); // YYYY-MM-DDThh:mmTZD (e.g. 1997-07-16T19:20+01:00)
    console.log('Date.parseDate("1997-07-16T19:20:30+01:00", "c")         = %o', Date.parseDate("1997-07-16T19:20:30+01:00", "c")); // YYYY-MM-DDThh:mm:ssTZD (e.g. 1997-07-16T19:20:30+01:00)
    console.log('Date.parseDate("1997-07-16T19:20:30.45+01:00", "c")      = %o', Date.parseDate("1997-07-16T19:20:30.45+01:00", "c")); // YYYY-MM-DDThh:mm:ss.sTZD (e.g. 1997-07-16T19:20:30.45+01:00)
    console.log('Date.parseDate("1997-07-16 19:20:30.45+01:00", "c")      = %o', Date.parseDate("1997-07-16 19:20:30.45+01:00", "c")); // YYYY-MM-DD hh:mm:ss.sTZD (e.g. 1997-07-16T19:20:30.45+01:00)
    console.log('Date.parseDate("1997-13-16T19:20:30.45+01:00", "c", true)= %o', Date.parseDate("1997-13-16T19:20:30.45+01:00", "c", true)); // strict date parsing with invalid month value
console.groupEnd();

*/

/**
 * @class Ext.util.DelayedTask
 * <p> The DelayedTask class provides a convenient way to "buffer" the execution of a method,
 * performing setTimeout where a new timeout cancels the old timeout. When called, the
 * task will wait the specified time period before executing. If durng that time period,
 * the task is called again, the original call will be cancelled. This continues so that
 * the function is only called a single time for each iteration.</p>
 * <p>This method is especially useful for things like detecting whether a user has finished
 * typing in a text field. An example would be performing validation on a keypress. You can
 * use this class to buffer the keypress events for a certain number of milliseconds, and
 * perform only if they stop for that amount of time.  Usage:</p><pre><code>
var task = new Ext.util.DelayedTask(function(){
    alert(Ext.getDom('myInputField').value.length);
});
// Wait 500ms before calling our function. If the user presses another key
// during that 500ms, it will be cancelled and we'll wait another 500ms.
Ext.get('myInputField').on('keypress', function(){
    task.{@link #delay}(500);
});
 * </code></pre>
 * <p>Note that we are using a DelayedTask here to illustrate a point. The configuration
 * option <tt>buffer</tt> for {@link Ext.util.Observable#addListener addListener/on} will
 * also setup a delayed task for you to buffer events.</p>
 * @constructor The parameters to this constructor serve as defaults and are not required.
 * @param {Function} fn (optional) The default function to call.
 * @param {Object} scope The default scope (The <code><b>this</b></code> reference) in which the
 * function is called. If not specified, <code>this</code> will refer to the browser window.
 * @param {Array} args (optional) The default Array of arguments.
 */
Ext.util.DelayedTask = function(fn, scope, args) {
    var me = this,
        id,
        call = function() {
            clearInterval(id);
            id = null;
            fn.apply(scope, args || []);
        };

    /**
     * Cancels any pending timeout and queues a new one
     * @param {Number} delay The milliseconds to delay
     * @param {Function} newFn (optional) Overrides function passed to constructor
     * @param {Object} newScope (optional) Overrides scope passed to constructor. Remember that if no scope
     * is specified, <code>this</code> will refer to the browser window.
     * @param {Array} newArgs (optional) Overrides args passed to constructor
     */
    this.delay = function(delay, newFn, newScope, newArgs) {
        me.cancel();
        fn = newFn || fn;
        scope = newScope || scope;
        args = newArgs || args;
        id = setInterval(call, delay);
    };

    /**
     * Cancel the last queued timeout
     */
    this.cancel = function(){
        if (id) {
            clearInterval(id);
            id = null;
        }
    };
};
/**
 * @class Ext.data.Connection
 * @extends Ext.util.Observable
 */
Ext.data.Connection = Ext.extend(Ext.util.Observable, {
    method: 'post',
    url: null,

    /**
     * @cfg {Boolean} disableCaching (Optional) True to add a unique cache-buster param to GET requests. (defaults to true)
     * @type Boolean
     */
    disableCaching: true,

    /**
     * @cfg {String} disableCachingParam (Optional) Change the parameter which is sent went disabling caching
     * through a cache buster. Defaults to '_dc'
     * @type String
     */
    disableCachingParam: '_dc',

    /**
     * @cfg {Number} timeout (Optional) The timeout in milliseconds to be used for requests. (defaults to 30000)
     */
    timeout : 30000,

    useDefaultHeader : true,
    defaultPostHeader : 'application/x-www-form-urlencoded; charset=UTF-8',
    useDefaultXhrHeader : true,
    defaultXhrHeader : 'XMLHttpRequest',

    requests: {},

    constructor : function(config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event beforerequest
             * Fires before a network request is made to retrieve a data object.
             * @param {Connection} conn This Connection object.
             * @param {Object} options The options config object passed to the {@link #request} method.
             */
            'beforerequest',
            /**
             * @event requestcomplete
             * Fires if the request was successfully completed.
             * @param {Connection} conn This Connection object.
             * @param {Object} response The XHR object containing the response data.
             * See <a href="http://www.w3.org/TR/XMLHttpRequest/">The XMLHttpRequest Object</a>
             * for details.
             * @param {Object} options The options config object passed to the {@link #request} method.
             */
            'requestcomplete',
            /**
             * @event requestexception
             * Fires if an error HTTP status was returned from the server.
             * See <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html">HTTP Status Code Definitions</a>
             * for details of HTTP status codes.
             * @param {Connection} conn This Connection object.
             * @param {Object} response The XHR object containing the response data.
             * See <a href="http://www.w3.org/TR/XMLHttpRequest/">The XMLHttpRequest Object</a>
             * for details.
             * @param {Object} options The options config object passed to the {@link #request} method.
             */
            'requestexception'
        );

        Ext.data.Connection.superclass.constructor.call(this);
    },

    /**
     * <p>Sends an HTTP request to a remote server.</p>
     * <p><b>Important:</b> Ajax server requests are asynchronous, and this call will
     * return before the response has been received. Process any returned data
     * in a callback function.</p>
     * <pre><code>
Ext.Ajax.request({
url: 'ajax_demo/sample.json',
success: function(response, opts) {
  var obj = Ext.decode(response.responseText);
  console.dir(obj);
},
failure: function(response, opts) {
  console.log('server-side failure with status code ' + response.status);
}
});
     * </code></pre>
     * <p>To execute a callback function in the correct scope, use the <tt>scope</tt> option.</p>
     * @param {Object} options An object which may contain the following properties:<ul>
     * <li><b>url</b> : String/Function (Optional)<div class="sub-desc">The URL to
     * which to send the request, or a function to call which returns a URL string. The scope of the
     * function is specified by the <tt>scope</tt> option. Defaults to the configured
     * <tt>{@link #url}</tt>.</div></li>
     * <li><b>params</b> : Object/String/Function (Optional)<div class="sub-desc">
     * An object containing properties which are used as parameters to the
     * request, a url encoded string or a function to call to get either. The scope of the function
     * is specified by the <tt>scope</tt> option.</div></li>
     * <li><b>method</b> : String (Optional)<div class="sub-desc">The HTTP method to use
     * for the request. Defaults to the configured method, or if no method was configured,
     * "GET" if no parameters are being sent, and "POST" if parameters are being sent.  Note that
     * the method name is case-sensitive and should be all caps.</div></li>
     * <li><b>callback</b> : Function (Optional)<div class="sub-desc">The
     * function to be called upon receipt of the HTTP response. The callback is
     * called regardless of success or failure and is passed the following
     * parameters:<ul>
     * <li><b>options</b> : Object<div class="sub-desc">The parameter to the request call.</div></li>
     * <li><b>success</b> : Boolean<div class="sub-desc">True if the request succeeded.</div></li>
     * <li><b>response</b> : Object<div class="sub-desc">The XMLHttpRequest object containing the response data.
     * See <a href="http://www.w3.org/TR/XMLHttpRequest/">http://www.w3.org/TR/XMLHttpRequest/</a> for details about
     * accessing elements of the response.</div></li>
     * </ul></div></li>
     * <li><a id="request-option-success"></a><b>success</b> : Function (Optional)<div class="sub-desc">The function
     * to be called upon success of the request. The callback is passed the following
     * parameters:<ul>
     * <li><b>response</b> : Object<div class="sub-desc">The XMLHttpRequest object containing the response data.</div></li>
     * <li><b>options</b> : Object<div class="sub-desc">The parameter to the request call.</div></li>
     * </ul></div></li>
     * <li><b>failure</b> : Function (Optional)<div class="sub-desc">The function
     * to be called upon failure of the request. The callback is passed the
     * following parameters:<ul>
     * <li><b>response</b> : Object<div class="sub-desc">The XMLHttpRequest object containing the response data.</div></li>
     * <li><b>options</b> : Object<div class="sub-desc">The parameter to the request call.</div></li>
     * </ul></div></li>
     * <li><b>scope</b> : Object (Optional)<div class="sub-desc">The scope in
     * which to execute the callbacks: The "this" object for the callback function. If the <tt>url</tt>, or <tt>params</tt> options were
     * specified as functions from which to draw values, then this also serves as the scope for those function calls.
     * Defaults to the browser window.</div></li>
     * <li><b>timeout</b> : Number (Optional)<div class="sub-desc">The timeout in milliseconds to be used for this request. Defaults to 30 seconds.</div></li>
     * <li><b>form</b> : Element/HTMLElement/String (Optional)<div class="sub-desc">The <tt>&lt;form&gt;</tt>
     * Element or the id of the <tt>&lt;form&gt;</tt> to pull parameters from.</div></li>
     * <li><a id="request-option-isUpload"></a><b>isUpload</b> : Boolean (Optional)<div class="sub-desc"><b>Only meaningful when used
     * with the <tt>form</tt> option</b>.
     * <p>True if the form object is a file upload (will be set automatically if the form was
     * configured with <b><tt>enctype</tt></b> "multipart/form-data").</p>
     * <p>File uploads are not performed using normal "Ajax" techniques, that is they are <b>not</b>
     * performed using XMLHttpRequests. Instead the form is submitted in the standard manner with the
     * DOM <tt>&lt;form></tt> element temporarily modified to have its
     * <a href="http://www.w3.org/TR/REC-html40/present/frames.html#adef-target">target</a> set to refer
     * to a dynamically generated, hidden <tt>&lt;iframe></tt> which is inserted into the document
     * but removed after the return data has been gathered.</p>
     * <p>The server response is parsed by the browser to create the document for the IFRAME. If the
     * server is using JSON to send the return object, then the
     * <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17">Content-Type</a> header
     * must be set to "text/html" in order to tell the browser to insert the text unchanged into the document body.</p>
     * <p>The response text is retrieved from the document, and a fake XMLHttpRequest object
     * is created containing a <tt>responseText</tt> property in order to conform to the
     * requirements of event handlers and callbacks.</p>
     * <p>Be aware that file upload packets are sent with the content type <a href="http://www.faqs.org/rfcs/rfc2388.html">multipart/form</a>
     * and some server technologies (notably JEE) may require some custom processing in order to
     * retrieve parameter names and parameter values from the packet content.</p>
     * </div></li>
     * <li><b>headers</b> : Object (Optional)<div class="sub-desc">Request
     * headers to set for the request.</div></li>
     * <li><b>xmlData</b> : Object (Optional)<div class="sub-desc">XML document
     * to use for the post. Note: This will be used instead of params for the post
     * data. Any params will be appended to the URL.</div></li>
     * <li><b>jsonData</b> : Object/String (Optional)<div class="sub-desc">JSON
     * data to use as the post. Note: This will be used instead of params for the post
     * data. Any params will be appended to the URL.</div></li>
     * <li><b>disableCaching</b> : Boolean (Optional)<div class="sub-desc">True
     * to add a unique cache-buster param to GET requests.</div></li>
     * </ul></p>
     * <p>The options object may also contain any other property which might be needed to perform
     * postprocessing in a callback because it is passed to callback functions.</p>
     * @return {Object} request The request object. This may be used
     * to cancel the request.
     */
    request : function(o) {
        var me = this;
        if (me.fireEvent('beforerequest', me, o) !== false) {
            var params = o.params,
                url = o.url || me.url,
                request, data, headers,
                urlParams = o.urlParams,
                method, key, xhr;

            // allow params to be a method that returns the params object
            if (Ext.isFunction(params)) {
                params = params.call(o.scope || window, o);
            }

            // allow url to be a method that returns the actual url
            if (Ext.isFunction(url)) {
                url = url.call(o.scope || window, o);
            }

            // check for xml or json data, and make sure json data is encoded
            data = o.rawData || o.xmlData || o.jsonData || null;
            if (o.jsonData && !Ext.isPrimitive(o.jsonData)) {
                data = Ext.encode(data);
            }

            // make sure params are a url encoded string
            params = Ext.isObject(params) ? Ext.urlEncode(params) : params;
            urlParams = Ext.isObject(urlParams) ? Ext.urlEncode(urlParams) : urlParams;

            // decide the proper method for this request
            method = (o.method || me.method || ((params || data) ? 'POST' : 'GET')).toUpperCase();

            // if the method is get append date to prevent caching
            if (method === 'GET' && o.disableCaching !== false && !me.disableCaching) {
                url = Ext.urlAppend(url, o.disableCachingParam || me.disableCachingParam + '=' + (new Date().getTime()));
            }

            // if the method is get or there is json/xml data append the params to the url
            if ((method == 'GET' || data) && params){
                url = Ext.urlAppend(url, params);
                params = null;
            }

            // allow params to be forced into the url
            if (urlParams) {
                url = Ext.urlAppend(url, urlParams);
            }

            // if autoabort is set, cancel the current transactions
            if(o.autoAbort === true || me.autoAbort) {
                me.abort();
            }

            // create a connection object
            xhr = new XMLHttpRequest();

            // open the request
            xhr.open(method.toUpperCase(), url, true);

            // create all the headers
            headers = Ext.apply({}, o.headers || {}, me.defaultHeaders || {});
            if (!headers['Content-Type'] && (data || params)) {
                headers['Content-Type'] = data ? (o.rawData ? 'text/plain' : (o.xmlData ? 'text/xml' : 'application/json')) : me.defaultPostHeader;
            }
            if (me.useDefaultXhrHeader && !headers['X-Requested-With']) {
                headers['X-Requested-With'] = me.defaultXhrHeader;
            }
            // set up all the request headers on the xhr object
            for (key in headers) {
                if(headers.hasOwnProperty(key)) {
	                try {
	                    xhr.setRequestHeader(key, headers[key]);
	                }
	                catch(e) {
	                    me.fireEvent('exception', key, headers[key]);
	                }
                }
            }

            // create the transaction object
            request = {
                id: ++Ext.data.Connection.requestId,
                xhr: xhr,
                headers: headers,
                options: o,
                timeout: setTimeout(function() {
                    request.timedout = true;
                    me.abort(request);
                }, o.timeout || me.timeout)
            };
            me.requests[request.id] = request;

            // bind our statechange listener
            xhr.onreadystatechange = me.onStateChange.createDelegate(me, [request]);

            // start the request!
            xhr.send(data || params || null);
            return request;
        } else {
            return o.callback ? o.callback.apply(o.scope, [o, undefined, undefined]) : null;
        }
    },

    /**
     * Determine whether this object has a request outstanding.
     * @param {Object} request (Optional) defaults to the last transaction
     * @return {Boolean} True if there is an outstanding request.
     */
    isLoading : function(r) {
        // if there is a connection and readyState is not 0 or 4
        return r && !{0:true, 4:true}[r.xhr.readyState];
    },

    /**
     * Aborts any outstanding request.
     * @param {Object} request (Optional) defaults to the last request
     */
    abort : function(r) {
        if (r && this.isLoading(r)) {
            r.xhr.abort();
            clearTimeout(r.timeout);
            delete(r.timeout);
            r.aborted = true;
            this.onComplete(r);
        }
        else if (!r) {
            var id;
            for(id in this.requests) {
                this.abort(this.requests[id]);
            }
        }
    },

    // private
    onStateChange : function(r) {
        if (r.xhr.readyState == 4) {
            clearTimeout(r.timeout);
            delete r.timeout;
            this.onComplete(r);
        }
    },

    // private
    onComplete : function(r) {
        var status = r.xhr.status,
            options = r.options,
            success = true,
            response;

        if ((status >= 200 && status < 300) || status == 304) {
            response = this.createResponse(r);
            this.fireEvent('requestcomplete', this, response, options);
            if (options.success) {
                if (!options.scope) {
                    options.success(response, options);
                }
                else {
                    options.success.call(options.scope, response, options);
                }
            }
        }
        else {
            success = false;
            switch (status) {
                case 12002:
                case 12029:
                case 12030:
                case 12031:
                case 12152:
                case 13030:
                    response = this.createException(r);
                default:
                    response = this.createResponse(r);
            }
            this.fireEvent('requestexception', this, response, options);
            if (options.failure) {
                if (!options.scope) {
                    options.failure(response, options);
                }
                else {
                    options.failure.call(options.scope, response, options);
                }
            }
        }

        if (options.callback) {
            if (!options.scope) {
                options.callback(options, success, response);
            }
            else {
                options.callback.call(options.scope, options, success, response);
            }
        }
        
        delete this.requests[r.id];
    },

    // private
    createResponse : function(r) {
        var xhr = r.xhr,
            headers = {},
            lines = xhr.getAllResponseHeaders().replace(/\r\n/g, '\n').split('\n'),
            count = lines.length,
            line, index, key, value;

        while (count--) {
            line = lines[count];
            index = line.indexOf(':');
            if(index >= 0) {
                key = line.substr(0, index).toLowerCase();
                if (line.charAt(index + 1) == ' ') {
                    ++index;
                }
                headers[key] = line.substr(index + 1);
            }
        }

        delete r.xhr;

        return {
            request: r,
            requestId : r.id,
            status : xhr.status,
            statusText : xhr.statusText,
            getResponseHeader : function(header){ return headers[header.toLowerCase()]; },
            getAllResponseHeaders : function(){ return headers; },
            responseText : xhr.responseText,
            responseXML : xhr.responseXML
        };
    },

    // private
    createException : function(r) {
        return {
            request : r,
            requestId : r.id,
            status : r.aborted ? -1 : 0,
            statusText : r.aborted ? 'transaction aborted' : 'communication failure',
            aborted: r.aborted,
            timedout: r.timedout
        };
    }
});

Ext.data.Connection.requestId = 0;

/**
 * @class Ext.Ajax
 * @extends Ext.data.Connection
 */
Ext.Ajax = new Ext.data.Connection({
    /**
     * @cfg {String} url @hide
     */
    /**
     * @cfg {Object} extraParams @hide
     */
    /**
     * @cfg {Object} defaultHeaders @hide
     */
    /**
     * @cfg {String} method (Optional) @hide
     */
    /**
     * @cfg {Number} timeout (Optional) @hide
     */
    /**
     * @cfg {Boolean} autoAbort (Optional) @hide
     */

    /**
     * @cfg {Boolean} disableCaching (Optional) @hide
     */

    /**
     * @property  disableCaching
     * True to add a unique cache-buster param to GET requests. (defaults to true)
     * @type Boolean
     */
    /**
     * @property  url
     * The default URL to be used for requests to the server. (defaults to undefined)
     * If the server receives all requests through one URL, setting this once is easier than
     * entering it on every request.
     * @type String
     */
    /**
     * @property  extraParams
     * An object containing properties which are used as extra parameters to each request made
     * by this object (defaults to undefined). Session information and other data that you need
     * to pass with each request are commonly put here.
     * @type Object
     */
    /**
     * @property  defaultHeaders
     * An object containing request headers which are added to each request made by this object
     * (defaults to undefined).
     * @type Object
     */
    /**
     * @property  method
     * The default HTTP method to be used for requests. Note that this is case-sensitive and
     * should be all caps (defaults to undefined; if not set but params are present will use
     * <tt>"POST"</tt>, otherwise will use <tt>"GET"</tt>.)
     * @type String
     */
    /**
     * @property  timeout
     * The timeout in milliseconds to be used for requests. (defaults to 30000)
     * @type Number
     */

    /**
     * @property  autoAbort
     * Whether a new request should abort any pending requests. (defaults to false)
     * @type Boolean
     */
    autoAbort : false
});

/**
 * @class Ext.AbstractManager
 * @extends Object
 * @ignore
 * Base Manager class - extended by ComponentMgr and PluginMgr
 */
Ext.AbstractManager = Ext.extend(Object, {
    typeName: 'type',

    constructor: function(config) {
        Ext.apply(this, config || {});

        /**
         * Contains all of the items currently managed
         * @property all
         * @type Ext.util.MixedCollection
         */
        this.all = new Ext.util.MixedCollection();

        this.types = {};
    },

    /**
     * Returns a component by {@link Ext.Component#id id}.
     * For additional details see {@link Ext.util.MixedCollection#get}.
     * @param {String} id The component {@link Ext.Component#id id}
     * @return Ext.Component The Component, <code>undefined</code> if not found, or <code>null</code> if a
     * Class was found.
     */
    get : function(id) {
        return this.all.get(id);
    },

    /**
     * Registers an item to be managed
     * @param {Mixed} item The item to register
     */
    register: function(item) {
        this.all.add(item);
    },

    /**
     * Unregisters a component by removing it from this manager
     * @param {Mixed} item The item to unregister
     */
    unregister: function(item) {
        this.all.remove(item);
    },

    /**
     * <p>Registers a new Component constructor, keyed by a new
     * {@link Ext.Component#xtype}.</p>
     * <p>Use this method (or its alias {@link Ext#reg Ext.reg}) to register new
     * subclasses of {@link Ext.Component} so that lazy instantiation may be used when specifying
     * child Components.
     * see {@link Ext.Container#items}</p>
     * @param {String} xtype The mnemonic string by which the Component class may be looked up.
     * @param {Constructor} cls The new Component class.
     */
    registerType : function(type, cls){
        this.types[type] = cls;
        cls[this.typeName] = type;
    },

    /**
     * Checks if a Component type is registered.
     * @param {Ext.Component} xtype The mnemonic string by which the Component class may be looked up
     * @return {Boolean} Whether the type is registered.
     */
    isRegistered : function(type){
        return this.types[type] !== undefined;
    },

    /**
     * Creates and returns an instance of whatever this manager manages, based on the supplied type and config object
     * @param {Object} config The config object
     * @param {String} defaultType If no type is discovered in the config object, we fall back to this type
     * @return {Mixed} The instance of whatever this manager is managing
     */
    create: function(config, defaultType) {
        var type        = config[this.typeName] || config.type || defaultType,
            Constructor = this.types[type];

        if (Constructor == undefined) {
            throw new Error(String.format("The '{0}' type has not been registered with this manager", type));
        }

        return new Constructor(config);
    },

    /**
     * Registers a function that will be called when a Component with the specified id is added to the manager. This will happen on instantiation.
     * @param {String} id The component {@link Ext.Component#id id}
     * @param {Function} fn The callback function
     * @param {Object} scope The scope (<code>this</code> reference) in which the callback is executed. Defaults to the Component.
     */
    onAvailable : function(id, fn, scope){
        var all = this.all;

        all.on("add", function(index, o){
            if (o.id == id) {
                fn.call(scope || o, o);
                all.un("add", fn, scope);
            }
        });
    }
});

/**
 * @class Ext.PluginMgr
 * <p>Provides a registry of available Plugin <i>classes</i> indexed by a mnemonic code known as the Plugin's ptype.
 * The <code>{@link Ext.Component#xtype xtype}</code> provides a way to avoid instantiating child Components
 * when creating a full, nested config object for a complete Ext page.</p>
 * <p>A child Component may be specified simply as a <i>config object</i>
 * as long as the correct <code>{@link Ext.Component#xtype xtype}</code> is specified so that if and when the Component
 * needs rendering, the correct type can be looked up for lazy instantiation.</p>
 * <p>For a list of all available <code>{@link Ext.Component#xtype xtypes}</code>, see {@link Ext.Component}.</p>
 * @singleton
 */
Ext.PluginMgr = new Ext.AbstractManager({
    typeName: 'ptype',

    /**
     * Creates a new Plugin from the specified config object using the
     * config object's {@link Ext.component#ptype ptype} to determine the class to instantiate.
     * @param {Object} config A configuration object for the Plugin you wish to create.
     * @param {Constructor} defaultType The constructor to provide the default Plugin type if
     * the config object does not contain a <code>ptype</code>. (Optional if the config contains a <code>ptype</code>).
     * @return {Ext.Component} The newly instantiated Plugin.
     */
    create : function(config, defaultType){
        var PluginCls = this.types[config.ptype || defaultType];
        if (PluginCls.init) {
            return PluginCls;
        } else {
            return new PluginCls(config);
        }
    },

    /**
     * Returns all plugins registered with the given type. Here, 'type' refers to the type of plugin, not its ptype.
     * @param {String} type The type to search for
     * @param {Boolean} defaultsOnly True to only return plugins of this type where the plugin's isDefault property is truthy
     * @return {Array} All matching plugins
     */
    findByType: function(type, defaultsOnly) {
        var matches = [],
            types   = this.types;

        for (var name in types) {
            var item = types[name];

            if (item.type == type && (defaultsOnly === true && item.isDefault)) {
                matches.push(item);
            }
        }

        return matches;
    }
});

/**
 * Shorthand for {@link Ext.PluginMgr#registerType}
 * @param {String} ptype The {@link Ext.component#ptype mnemonic string} by which the Plugin class
 * may be looked up.
 * @param {Constructor} cls The new Plugin class.
 * @member Ext
 * @method preg
 */
Ext.preg = function() {
    return Ext.PluginMgr.registerType.apply(Ext.PluginMgr, arguments);
};

/**
 * @class Ext.ComponentMgr
 * <p>Provides a registry of all Components (instances of {@link Ext.Component} or any subclass
 * thereof) on a page so that they can be easily accessed by {@link Ext.Component component}
 * {@link Ext.Component#id id} (see {@link #get}, or the convenience method {@link Ext#getCmp Ext.getCmp}).</p>
 * <p>This object also provides a registry of available Component <i>classes</i>
 * indexed by a mnemonic code known as the Component's {@link Ext.Component#xtype xtype}.
 * The <code>{@link Ext.Component#xtype xtype}</code> provides a way to avoid instantiating child Components
 * when creating a full, nested config object for a complete Ext page.</p>
 * <p>A child Component may be specified simply as a <i>config object</i>
 * as long as the correct <code>{@link Ext.Component#xtype xtype}</code> is specified so that if and when the Component
 * needs rendering, the correct type can be looked up for lazy instantiation.</p>
 * <p>For a list of all available <code>{@link Ext.Component#xtype xtypes}</code>, see {@link Ext.Component}.</p>
 * @singleton
 */
Ext.ComponentMgr = new Ext.AbstractManager({
    typeName: 'xtype',

    /**
     * Creates a new Component from the specified config object using the
     * config object's {@link Ext.component#xtype xtype} to determine the class to instantiate.
     * @param {Object} config A configuration object for the Component you wish to create.
     * @param {Constructor} defaultType The constructor to provide the default Component type if
     * the config object does not contain a <code>xtype</code>. (Optional if the config contains a <code>xtype</code>).
     * @return {Ext.Component} The newly instantiated Component.
     */
    create : function(config, defaultType){
        return config.render ? config : new this.types[config.xtype || defaultType](config);
    }
});

/**
 * Shorthand for {@link Ext.ComponentMgr#registerType}
 * @param {String} xtype The {@link Ext.component#xtype mnemonic string} by which the Component class
 * may be looked up.
 * @param {Constructor} cls The new Component class.
 * @member Ext
 * @method reg
 */
Ext.reg = function() {
    return Ext.ComponentMgr.registerType.apply(Ext.ComponentMgr, arguments);
}; // this will be called a lot internally, shorthand to keep the bytes down

/**
 * Shorthand for {@link Ext.ComponentMgr#create}
 * Creates a new Component from the specified config object using the
 * config object's {@link Ext.component#xtype xtype} to determine the class to instantiate.
 * @param {Object} config A configuration object for the Component you wish to create.
 * @param {Constructor} defaultType The constructor to provide the default Component type if
 * the config object does not contain a <code>xtype</code>. (Optional if the config contains a <code>xtype</code>).
 * @return {Ext.Component} The newly instantiated Component.
 * @member Ext
 * @method create
 */
Ext.create = function() {
    return Ext.ComponentMgr.create.apply(Ext.ComponentMgr, arguments);
};

/**
 * @class Ext.data.Batch
 * @extends Ext.util.Observable
 * <p>Provides a mechanism to run one or more {@link Ext.data.Operation operations} in a given order. Fires the 'operation-complete' event
 * after the completion of each Operation, and the 'complete' event when all Operations have been successfully executed. Fires an 'exception'
 * event if any of the Operations encounter an exception.</p>
 * <p>Usually these are only used internally by {@link Ext.data.Proxy} classes</p>
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Batch = Ext.extend(Ext.util.Observable, {
    /**
     * True to immediately start processing the batch as soon as it is constructed (defaults to false)
     * @property autoStart
     * @type Boolean
     */
    autoStart: false,
    
    /**
     * The index of the current operation being executed
     * @property current
     * @type Number
     */
    current: -1,
    
    /**
     * The total number of operations in this batch. Read only
     * @property total
     * @type Number
     */
    total: 0,
    
    /**
     * True if the batch is currently running
     * @property running
     * @type Boolean
     */
    running: false,
    
    /**
     * True if this batch has been executed completely
     * @property complete
     * @type Boolean
     */
    complete: false,
    
    /**
     * True if this batch has encountered an exception. This is cleared at the start of each operation
     * @property exception
     * @type Boolean
     */
    exception: false,
    
    /**
     * True to automatically pause the execution of the batch if any operation encounters an exception (defaults to true)
     * @property pauseOnException
     * @type Boolean
     */
    pauseOnException: true,
    
    constructor: function(config) {
        Ext.apply(this, config || {});
        
        /**
         * Ordered array of operations that will be executed by this batch
         * @property operations
         * @type Array
         */
        this.operations = [];
        
        this.addEvents(
          /**
           * @event complete
           * Fired when all operations of this batch have been completed
           * @param {Ext.data.Batch} batch The batch object
           * @param {Object} operation The last operation that was executed
           */
          'complete',
          
          /**
           * @event exception
           * Fired when a operation encountered an exception
           * @param {Ext.data.Batch} batch The batch object
           * @param {Object} operation The operation that encountered the exception
           */
          'exception',
          
          /**
           * @event operation-complete
           * Fired when each operation of the batch completes
           * @param {Ext.data.Batch} batch The batch object
           * @param {Object} operation The operation that just completed
           */
          'operation-complete'
        );
        
        Ext.data.Batch.superclass.constructor.call(this, config);
    },
    
    /**
     * Adds a new operation to this batch
     * @param {Object} operation The {@link Ext.data.Operation Operation} object
     */
    add: function(operation) {
        this.total++;
        
        operation.setBatch(this);
        
        this.operations.push(operation);
    },
    
    /**
     * Kicks off the execution of the batch, continuing from the next operation if the previous
     * operation encountered an exception, or if execution was paused
     */
    start: function() {
        this.exception = false;
        this.running = true;
        
        this.runNextOperation();
    },
    
    /**
     * @private
     * Runs the next operation, relative to this.current.
     */
    runNextOperation: function() {
        this.runOperation(this.current + 1);
    },
    
    /**
     * Pauses execution of the batch, but does not cancel the current operation
     */
    pause: function() {
        this.running = false;
    },
    
    /**
     * Executes a operation by its numeric index
     * @param {Number} index The operation index to run
     */
    runOperation: function(index) {
        var operations = this.operations,
            operation  = operations[index];
        
        if (operation == undefined) {
            this.running  = false;
            this.complete = true;
            this.fireEvent('complete', this, operations[operations.length - 1]);
        } else {
            this.current = index;
            
            var onProxyReturn = function(operation) {
                var hasException = operation.hasException();
                
                if (hasException) {
                    this.fireEvent('exception', this, operation);
                } else {
                    this.fireEvent('operation-complete', this, operation);
                }

                if (hasException && this.pauseOnException) {
                    this.pause();
                } else {
                    operation.markCompleted();
                    
                    this.runNextOperation();
                }
            };
            
            operation.markStarted();
            
            this.proxy[operation.action](operation, onProxyReturn, this);
        }
    }
});
/**
 * @class Ext.data.Model
 * @extends Ext.util.Observable
 * <p>A Model represents some object that your application manages. For example, one might define a Model for Users, Products,
 * Cars, or any other real-world object that we want to model in the system. Models are registered via the {@link Ext.ModelMgr model manager},
 * and are used by {@link Ext.data.Store stores}, which are in turn used by many of the data-bound components in Ext.</p>
 * <p>Models are defined as a set of fields and any arbitrary methods and properties relevant to the model. For example:</p>
<pre><code>
Ext.regModel('User', {
    fields: [
        {name: 'name',  type: 'string'},
        {name: 'age',   type: 'int'},
        {name: 'phone', type: 'string'},
        {name: 'alive', type: 'boolean', defaultValue: true}
    ],

    changeName: function() {
        var oldName = this.get('name'),
            newName = oldName + " The Barbarian";

        this.set('name', newName);
    }
});
</code></pre>
* <p>The fields array is turned into a {@link Ext.util.MixedCollection MixedCollection} automatically by the {@link Ext.ModelMgr ModelMgr}, and all
* other functions and properties are copied to the new Model's prototype.</p>
* <p>Now we can create instances of our User model and call any model logic we defined:</p>
<pre><code>
var user = Ext.ModelMgr.create({
    name : 'Conan',
    age  : 24,
    phone: '555-555-5555'
}, 'User');

user.changeName();
user.get('name'); //returns "Conan The Barbarian"
</code></pre>
 * @constructor
 * @param {Object} data An object containing keys corresponding to this model's fields, and their associated values
 * @param {Number} id Optional unique ID to assign to this model instance
 */
Ext.data.Model = Ext.extend(Ext.util.Observable, {
    evented: false,
    isModel: true,
    
    /**
     * Readonly flag - true if this Record has been modified.
     * @type Boolean
     */
    dirty : false,
    
    /**
     * <tt>true</tt> when the record does not yet exist in a server-side database (see
     * {@link #markDirty}).  Any record which has a real database pk set as its id property
     * is NOT a phantom -- it's real.
     * @property phantom
     * @type {Boolean}
     */
    phantom : false,
    
    /**
     * Internal flag used to track whether or not the model instance is currently being edited. Read-only
     * @property editing
     * @type Boolean
     */
    editing : false,
    
    /**
     * The name of the field treated as this Model's unique id (defaults to 'id').
     * @property idProperty
     * @type String
     */
    idProperty: 'id',
    
    constructor: function(data, id) {
        data = data || {};
        
        if (this.evented) {
            this.addEvents(
                
            );
        }
        
        //add default field values if present
        var fields = this.fields.items,
            length = fields.length,
            field, name, i;
        
        for (i = 0; i < length; i++) {
            field = fields[i];
            name  = field.name;
            
            if (data[name] == undefined) {
                data[name] = field.defaultValue;
            }
        }
        
        /**
         * An internal unique ID for each Model instance, used to identify Models that don't have an ID yet
         * @property internalId
         * @type String
         * @private
         */
        this.internalId = (id || id === 0) ? id : Ext.data.Model.id(this);
        
        this.data = data;
        
        /**
         * Key: value pairs of all fields whose values have changed
         * @property modified
         * @type Object
         */
        this.modified = {};
        
        Ext.data.Model.superclass.constructor.apply(this);
    },
    
    /**
     * <p>Marks this <b>Record</b> as <code>{@link #dirty}</code>.  This method
     * is used interally when adding <code>{@link #phantom}</code> records to a
     * {@link Ext.data.Store#writer writer enabled store}.</p>
     * <br><p>Marking a record <code>{@link #dirty}</code> causes the phantom to
     * be returned by {@link Ext.data.Store#getModifiedRecords} where it will
     * have a create action composed for it during {@link Ext.data.Store#save store save}
     * operations.</p>
     */
    markDirty : function() {
        this.dirty = true;
        
        if (!this.modified) {
            this.modified = {};
        }
        
        this.fields.each(function(field) {
            this.modified[field.name] = this.data[field.name];
        }, this);
    },
    
    /**
     * Returns the unique ID allocated to this model instance as defined by {@link #idProperty}
     * @return {Number} The id
     */
    getId: function() {
        return this.get(this.idProperty);
    },
    
    /**
     * Sets the model instance's id field to the given id
     * @param {Number} id The new id
     */
    setId: function(id) {
        this.set(this.idProperty, id);
    },
    
    /**
     * Returns the value of the given field
     * @param {String} field The field to fetch the value for
     * @return {Mixed} The value
     */
    get: function(field) {
        return this.data[field];
    },
    
    /**
     * Sets the given field to the given value, marks the instance as dirty
     * @param {String} field The field to set
     * @param {Mixed} value The value to set
     */
    set: function(field, value) {
        this.data[field] = value;
        
        this.dirty = true;
        
        if (!this.editing) {
            this.afterEdit();
        }
    },
    
    /**
     * Gets a hash of only the fields that have been modified since this Model was created or commited.
     * @return Object
     */
    getChanges : function(){
        var modified = this.modified,
            changes  = {},
            field;
            
        for (field in modified) {
            if (modified.hasOwnProperty(field)){
                changes[field] = this.data[field];
            }
        }
        
        return changes;
    },
    
    /**
     * Returns <tt>true</tt> if the passed field name has been <code>{@link #modified}</code>
     * since the load or last commit.
     * @param {String} fieldName {@link Ext.data.Field#name}
     * @return {Boolean}
     */
    isModified : function(fieldName) {
        return !!(this.modified && this.modified.hasOwnProperty(fieldName));
    },
    
    /**
     * Creates a copy (clone) of this Model instance.
     * @param {String} id (optional) A new id, defaults to the id
     * of the instance being copied. See <code>{@link #id}</code>. 
     * To generate a phantom instance with a new id use:<pre><code>
var rec = record.copy(); // clone the record
Ext.data.Model.id(rec); // automatically generate a unique sequential id
     * </code></pre>
     * @return {Record}
     */
    copy : function(newId) {
        return new this.constructor(Ext.apply({}, this.data), newId || this.internalId);
    },
    
    /**
     * Usually called by the {@link Ext.data.Store} to which this model instance has been {@link #join joined}.
     * Rejects all changes made to the model instance since either creation, or the last commit operation.
     * Modified fields are reverted to their original values.
     * <p>Developers should subscribe to the {@link Ext.data.Store#update} event
     * to have their code notified of reject operations.</p>
     * @param {Boolean} silent (optional) True to skip notification of the owning
     * store of the change (defaults to false)
     */
    reject : function(silent) {
        var modified = this.modified,
            field;
            
        for (field in modified) {
            if (typeof modified[field] != "function") {
                this.data[field] = modified[field];
            }
        }
        
        this.dirty = false;
        this.editing = false;
        delete this.modified;
        
        if (silent !== true) {
            this.afterReject();
        }
    },
    
    /**
     * Usually called by the {@link Ext.data.Store} which owns the model instance.
     * Commits all changes made to the instance since either creation or the last commit operation.
     * <p>Developers should subscribe to the {@link Ext.data.Store#update} event
     * to have their code notified of commit operations.</p>
     * @param {Boolean} silent (optional) True to skip notification of the owning
     * store of the change (defaults to false)
     */
    commit : function(silent) {
        this.dirty = false;
        this.editing = false;
        
        delete this.modified;
        
        if (silent !== true) {
            this.afterCommit();
        }
    },
    
    /**
     * Tells this model instance that it has been added to a store
     * @param {Ext.data.Store} store The store that the model has been added to
     */
    join : function(store){
        /**
         * The {@link Ext.data.Store} to which this Record belongs.
         * @property store
         * @type {Ext.data.Store}
         */
        this.store = store;
    },
    
    /**
     * Tells this model instance that it has been removed from the store
     * @param {Ext.data.Store} store The store to unjoin
     */
    unjoin: function(store) {
        delete this.store;
    },
    
    /**
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * afterEdit method is called
     */
    afterEdit : function() {
        this.callStore('afterEdit');
    },
    
    /**
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * afterReject method is called
     */
    afterReject : function(){
        this.callStore("afterReject");
    },
    
    /**
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * afterCommit method is called
     */
    afterCommit: function() {
        this.callStore('afterCommit');
    },
    
    /**
     * @private
     * Helper function used by afterEdit, afterReject and afterCommit. Calls the given method on the 
     * {@link Ext.data.Store store} that this instance has {@link #join joined}, if any. The store function
     * will always be called with the model instance as its single argument.
     * @param {String} fn The function to call on the store
     */
    callStore: function(fn) {
        var store = this.store;
        
        if (store != undefined && typeof store[fn] == "function") {
            store[fn](this);
        }
    }
});


/**
 * Generates a sequential id. This method is typically called when a record is {@link #create}d
 * and {@link #Record no id has been specified}. The returned id takes the form:
 * <tt>&#123;PREFIX}-&#123;AUTO_ID}</tt>.<div class="mdetail-params"><ul>
 * <li><b><tt>PREFIX</tt></b> : String<p class="sub-desc"><tt>Ext.data.Model.PREFIX</tt>
 * (defaults to <tt>'ext-record'</tt>)</p></li>
 * <li><b><tt>AUTO_ID</tt></b> : String<p class="sub-desc"><tt>Ext.data.Model.AUTO_ID</tt>
 * (defaults to <tt>1</tt> initially)</p></li>
 * </ul></div>
 * @param {Record} rec The record being created.  The record does not exist, it's a {@link #phantom}.
 * @return {String} auto-generated string id, <tt>"ext-record-i++'</tt>;
 */
Ext.data.Model.id = function(rec) {
    rec.phantom = true;
    return [Ext.data.Model.PREFIX, '-', Ext.data.Model.AUTO_ID++].join('');
};


//[deprecated 5.0]
Ext.ns('Ext.data.Record');

//Backwards compat
Ext.data.Record.id = Ext.data.Model.id;
//[end]

Ext.data.Model.PREFIX = 'ext-record';
Ext.data.Model.AUTO_ID = 1;
Ext.data.Model.EDIT = 'edit';
Ext.data.Model.REJECT = 'reject';
Ext.data.Model.COMMIT = 'commit';

/**
 * @class Ext.data.Field
 * <p>This class encapsulates the field definition information specified in the field definition objects
 * passed to {@link Ext.regModel}.</p>
 * <p>Developers do not need to instantiate this class. Instances are created by {@link Ext.regModel}
 * and cached in the {@link Ext.data.Model#fields fields} property of the created Model constructor's <b>prototype.</b></p>
 */
Ext.data.Field = Ext.extend(Object, {
    
    constructor : function(config) {
        if (Ext.isString(config)) {
            config = {name: config};
        }
        Ext.apply(this, config);
        
        var types = Ext.data.Types,
            st = this.sortType,
            t;

        if (this.type) {
            if (Ext.isString(this.type)) {
                this.type = Ext.data.Types[this.type.toUpperCase()] || types.AUTO;
            }
        } else {
            this.type = types.AUTO;
        }

        // named sortTypes are supported, here we look them up
        if (Ext.isString(st)) {
            this.sortType = Ext.data.SortTypes[st];
        } else if(Ext.isEmpty(st)) {
            this.sortType = this.type.sortType;
        }

        if (!this.convert) {
            this.convert = this.type.convert;
        }
    },
    
    /**
     * @cfg {String} name
     * The name by which the field is referenced within the Record. This is referenced by, for example,
     * the <code>dataIndex</code> property in column definition objects passed to {@link Ext.grid.ColumnModel}.
     * <p>Note: In the simplest case, if no properties other than <code>name</code> are required, a field
     * definition may consist of just a String for the field name.</p>
     */
    /**
     * @cfg {Mixed} type
     * (Optional) The data type for automatic conversion from received data to the <i>stored</i> value if <code>{@link Ext.data.Field#convert convert}</code>
     * has not been specified. This may be specified as a string value. Possible values are
     * <div class="mdetail-params"><ul>
     * <li>auto (Default, implies no conversion)</li>
     * <li>string</li>
     * <li>int</li>
     * <li>float</li>
     * <li>boolean</li>
     * <li>date</li></ul></div>
     * <p>This may also be specified by referencing a member of the {@link Ext.data.Types} class.</p>
     * <p>Developers may create their own application-specific data types by defining new members of the
     * {@link Ext.data.Types} class.</p>
     */
    /**
     * @cfg {Function} convert
     * (Optional) A function which converts the value provided by the Reader into an object that will be stored
     * in the Record. It is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><b>v</b> : Mixed<div class="sub-desc">The data value as read by the Reader, if undefined will use
     * the configured <code>{@link Ext.data.Field#defaultValue defaultValue}</code>.</div></li>
     * <li><b>rec</b> : Mixed<div class="sub-desc">The data object containing the row as read by the Reader.
     * Depending on the Reader type, this could be an Array ({@link Ext.data.ArrayReader ArrayReader}), an object
     *  ({@link Ext.data.JsonReader JsonReader}), or an XML element ({@link Ext.data.XMLReader XMLReader}).</div></li>
     * </ul></div>
     * <pre><code>
// example of convert function
function fullName(v, record){
    return record.name.last + ', ' + record.name.first;
}

function location(v, record){
    return !record.city ? '' : (record.city + ', ' + record.state);
}

var Dude = Ext.data.Record.create([
    {name: 'fullname',  convert: fullName},
    {name: 'firstname', mapping: 'name.first'},
    {name: 'lastname',  mapping: 'name.last'},
    {name: 'city', defaultValue: 'homeless'},
    'state',
    {name: 'location',  convert: location}
]);

// create the data store
var store = new Ext.data.Store({
    reader: new Ext.data.JsonReader(
        {
            idProperty: 'key',
            root: 'daRoot',
            totalProperty: 'total'
        },
        Dude  // recordType
    )
});

var myData = [
    { key: 1,
      name: { first: 'Fat',    last:  'Albert' }
      // notice no city, state provided in data object
    },
    { key: 2,
      name: { first: 'Barney', last:  'Rubble' },
      city: 'Bedrock', state: 'Stoneridge'
    },
    { key: 3,
      name: { first: 'Cliff',  last:  'Claven' },
      city: 'Boston',  state: 'MA'
    }
];
     * </code></pre>
     */
    /**
     * @cfg {String} dateFormat
     * <p>(Optional) Used when converting received data into a Date when the {@link #type} is specified as <code>"date"</code>.</p>
     * <p>A format string for the {@link Date#parseDate Date.parseDate} function, or "timestamp" if the
     * value provided by the Reader is a UNIX timestamp, or "time" if the value provided by the Reader is a
     * javascript millisecond timestamp. See {@link Date}</p>
     */
    dateFormat: null,
    /**
     * @cfg {Mixed} defaultValue
     * (Optional) The default value used <b>when a Record is being created by a {@link Ext.data.Reader Reader}</b>
     * when the item referenced by the <code>{@link Ext.data.Field#mapping mapping}</code> does not exist in the data
     * object (i.e. undefined). (defaults to "")
     */
    defaultValue: "",
    /**
     * @cfg {String/Number} mapping
     * <p>(Optional) A path expression for use by the {@link Ext.data.DataReader} implementation
     * that is creating the {@link Ext.data.Record Record} to extract the Field value from the data object.
     * If the path expression is the same as the field name, the mapping may be omitted.</p>
     * <p>The form of the mapping expression depends on the Reader being used.</p>
     * <div class="mdetail-params"><ul>
     * <li>{@link Ext.data.JsonReader}<div class="sub-desc">The mapping is a string containing the javascript
     * expression to reference the data from an element of the data item's {@link Ext.data.JsonReader#root root} Array. Defaults to the field name.</div></li>
     * <li>{@link Ext.data.XmlReader}<div class="sub-desc">The mapping is an {@link Ext.DomQuery} path to the data
     * item relative to the DOM element that represents the {@link Ext.data.XmlReader#record record}. Defaults to the field name.</div></li>
     * <li>{@link Ext.data.ArrayReader}<div class="sub-desc">The mapping is a number indicating the Array index
     * of the field's value. Defaults to the field specification's Array position.</div></li>
     * </ul></div>
     * <p>If a more complex value extraction strategy is required, then configure the Field with a {@link #convert}
     * function. This is passed the whole row object, and may interrogate it in whatever way is necessary in order to
     * return the desired data.</p>
     */
    mapping: null,
    /**
     * @cfg {Function} sortType
     * (Optional) A function which converts a Field's value to a comparable value in order to ensure
     * correct sort ordering. Predefined functions are provided in {@link Ext.data.SortTypes}. A custom
     * sort example:<pre><code>
// current sort     after sort we want
// +-+------+          +-+------+
// |1|First |          |1|First |
// |2|Last  |          |3|Second|
// |3|Second|          |2|Last  |
// +-+------+          +-+------+

sortType: function(value) {
   switch (value.toLowerCase()) // native toLowerCase():
   {
      case 'first': return 1;
      case 'second': return 2;
      default: return 3;
   }
}
     * </code></pre>
     */
    sortType : null,
    /**
     * @cfg {String} sortDir
     * (Optional) Initial direction to sort (<code>"ASC"</code> or  <code>"DESC"</code>).  Defaults to
     * <code>"ASC"</code>.
     */
    sortDir : "ASC",
    /**
     * @cfg {Boolean} allowBlank
     * (Optional) Used for validating a {@link Ext.data.Record record}, defaults to <code>true</code>.
     * An empty value here will cause {@link Ext.data.Record}.{@link Ext.data.Record#isValid isValid}
     * to evaluate to <code>false</code>.
     */
    allowBlank : true
});

/**
 * @class Ext.data.SortTypes
 * @ignore
 * @singleton
 * Defines the default sorting (casting?) comparison functions used when sorting data.
 */
Ext.data.SortTypes = {
    /**
     * Default sort that does nothing
     * @param {Mixed} s The value being converted
     * @return {Mixed} The comparison value
     */
    none : function(s){
        return s;
    },
    
    /**
     * The regular expression used to strip tags
     * @type {RegExp}
     * @property
     */
    stripTagsRE : /<\/?[^>]+>/gi,
    
    /**
     * Strips all HTML tags to sort on text only
     * @param {Mixed} s The value being converted
     * @return {String} The comparison value
     */
    asText : function(s){
        return String(s).replace(this.stripTagsRE, "");
    },
    
    /**
     * Strips all HTML tags to sort on text only - Case insensitive
     * @param {Mixed} s The value being converted
     * @return {String} The comparison value
     */
    asUCText : function(s){
        return String(s).toUpperCase().replace(this.stripTagsRE, "");
    },
    
    /**
     * Case insensitive string
     * @param {Mixed} s The value being converted
     * @return {String} The comparison value
     */
    asUCString : function(s) {
    	return String(s).toUpperCase();
    },
    
    /**
     * Date sorting
     * @param {Mixed} s The value being converted
     * @return {Number} The comparison value
     */
    asDate : function(s) {
        if(!s){
            return 0;
        }
        if(Ext.isDate(s)){
            return s.getTime();
        }
    	return Date.parse(String(s));
    },
    
    /**
     * Float sorting
     * @param {Mixed} s The value being converted
     * @return {Float} The comparison value
     */
    asFloat : function(s) {
    	var val = parseFloat(String(s).replace(/,/g, ""));
    	return isNaN(val) ? 0 : val;
    },
    
    /**
     * Integer sorting
     * @param {Mixed} s The value being converted
     * @return {Number} The comparison value
     */
    asInt : function(s) {
        var val = parseInt(String(s).replace(/,/g, ""), 10);
        return isNaN(val) ? 0 : val;
    }
};
/**
 * @class Ext.data.Types
 * @ignore
 * <p>This is s static class containing the system-supplied data types which may be given to a {@link Ext.data.Field Field}.<p/>
 * <p>The properties in this class are used as type indicators in the {@link Ext.data.Field Field} class, so to
 * test whether a Field is of a certain type, compare the {@link Ext.data.Field#type type} property against properties
 * of this class.</p>
 * <p>Developers may add their own application-specific data types to this class. Definition names must be UPPERCASE.
 * each type definition must contain three properties:</p>
 * <div class="mdetail-params"><ul>
 * <li><code>convert</code> : <i>Function</i><div class="sub-desc">A function to convert raw data values from a data block into the data
 * to be stored in the Field. The function is passed the collowing parameters:
 * <div class="mdetail-params"><ul>
 * <li><b>v</b> : Mixed<div class="sub-desc">The data value as read by the Reader, if undefined will use
 * the configured <tt>{@link Ext.data.Field#defaultValue defaultValue}</tt>.</div></li>
 * <li><b>rec</b> : Mixed<div class="sub-desc">The data object containing the row as read by the Reader.
 * Depending on the Reader type, this could be an Array ({@link Ext.data.ArrayReader ArrayReader}), an object
 * ({@link Ext.data.JsonReader JsonReader}), or an XML element ({@link Ext.data.XMLReader XMLReader}).</div></li>
 * </ul></div></div></li>
 * <li><code>sortType</code> : <i>Function</i> <div class="sub-desc">A function to convert the stored data into comparable form, as defined by {@link Ext.data.SortTypes}.</div></li>
 * <li><code>type</code> : <i>String</i> <div class="sub-desc">A textual data type name.</div></li>
 * </ul></div>
 * <p>For example, to create a VELatLong field (See the Microsoft Bing Mapping API) containing the latitude/longitude value of a datapoint on a map from a JsonReader data block
 * which contained the properties <code>lat</code> and <code>long</code>, you would define a new data type like this:</p>
 *<pre><code>
// Add a new Field data type which stores a VELatLong object in the Record.
Ext.data.Types.VELATLONG = {
    convert: function(v, data) {
        return new VELatLong(data.lat, data.long);
    },
    sortType: function(v) {
        return v.Latitude;  // When sorting, order by latitude
    },
    type: 'VELatLong'
};
</code></pre>
 * <p>Then, when declaring a Record, use <pre><code>
var types = Ext.data.Types; // allow shorthand type access
UnitRecord = Ext.data.Record.create([
    { name: 'unitName', mapping: 'UnitName' },
    { name: 'curSpeed', mapping: 'CurSpeed', type: types.INT },
    { name: 'latitude', mapping: 'lat', type: types.FLOAT },
    { name: 'latitude', mapping: 'lat', type: types.FLOAT },
    { name: 'position', type: types.VELATLONG }
]);
</code></pre>
 * @singleton
 */
Ext.data.Types = new function(){
    var st = Ext.data.SortTypes;
    Ext.apply(this, {
        /**
         * @type Regexp
         * @property stripRe
         * A regular expression for stripping non-numeric characters from a numeric value. Defaults to <tt>/[\$,%]/g</tt>.
         * This should be overridden for localization.
         */
        stripRe: /[\$,%]/g,
        
        /**
         * @type Object.
         * @property AUTO
         * This data type means that no conversion is applied to the raw data before it is placed into a Record.
         */
        AUTO: {
            convert: function(v){ return v; },
            sortType: st.none,
            type: 'auto'
        },

        /**
         * @type Object.
         * @property STRING
         * This data type means that the raw data is converted into a String before it is placed into a Record.
         */
        STRING: {
            convert: function(v){ return (v === undefined || v === null) ? '' : String(v); },
            sortType: st.asUCString,
            type: 'string'
        },

        /**
         * @type Object.
         * @property INT
         * This data type means that the raw data is converted into an integer before it is placed into a Record.
         * <p>The synonym <code>INTEGER</code> is equivalent.</p>
         */
        INT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : 0;
            },
            sortType: st.none,
            type: 'int'
        },
        
        /**
         * @type Object.
         * @property FLOAT
         * This data type means that the raw data is converted into a number before it is placed into a Record.
         * <p>The synonym <code>NUMBER</code> is equivalent.</p>
         */
        FLOAT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : 0;
            },
            sortType: st.none,
            type: 'float'
        },
        
        /**
         * @type Object.
         * @property BOOL
         * <p>This data type means that the raw data is converted into a boolean before it is placed into
         * a Record. The string "true" and the number 1 are converted to boolean <code>true</code>.</p>
         * <p>The synonym <code>BOOLEAN</code> is equivalent.</p>
         */
        BOOL: {
            convert: function(v){ return v === true || v === 'true' || v == 1; },
            sortType: st.none,
            type: 'bool'
        },
        
        /**
         * @type Object.
         * @property DATE
         * This data type means that the raw data is converted into a Date before it is placed into a Record.
         * The date format is specified in the constructor of the {@link Ext.data.Field} to which this type is
         * being applied.
         */
        DATE: {
            convert: function(v){
                var df = this.dateFormat;
                if(!v){
                    return null;
                }
                if(Ext.isDate(v)){
                    return v;
                }
                if(df){
                    if(df == 'timestamp'){
                        return new Date(v*1000);
                    }
                    if(df == 'time'){
                        return new Date(parseInt(v, 10));
                    }
                    return Date.parseDate(v, df);
                }
                var parsed = Date.parse(v);
                return parsed ? new Date(parsed) : null;
            },
            sortType: st.asDate,
            type: 'date'
        }
    });
    
    Ext.apply(this, {
        /**
         * @type Object.
         * @property BOOLEAN
         * <p>This data type means that the raw data is converted into a boolean before it is placed into
         * a Record. The string "true" and the number 1 are converted to boolean <code>true</code>.</p>
         * <p>The synonym <code>BOOL</code> is equivalent.</p>
         */
        BOOLEAN: this.BOOL,
        /**
         * @type Object.
         * @property INTEGER
         * This data type means that the raw data is converted into an integer before it is placed into a Record.
         * <p>The synonym <code>INT</code> is equivalent.</p>
         */
        INTEGER: this.INT,
        /**
         * @type Object.
         * @property NUMBER
         * This data type means that the raw data is converted into a number before it is placed into a Record.
         * <p>The synonym <code>FLOAT</code> is equivalent.</p>
         */
        NUMBER: this.FLOAT    
    });
};
/**
 * @class Ext.ModelMgr
 * @extends Ext.AbstractManager
 * Creates and manages the current set of models
 */
Ext.ModelMgr = new Ext.AbstractManager({
    typeName: 'mtype',
    
    /**
     * Registers a model definition. All model plugins marked with isDefault: true are bootstrapped
     * immediately, as are any addition plugins defined in the model config.
     */
    registerType: function(name, config) {
        var PluginMgr = Ext.PluginMgr,
            plugins   = PluginMgr.findByType('model', true),
            fields    = config.fields || [],
            model     = Ext.extend(Ext.data.Model, config);
        
        var modelPlugins = config.plugins || [];
        
        for (var index = 0, length = modelPlugins.length; index < length; index++) {
            plugins.push(PluginMgr.create(modelPlugins[index]));
        }
        
        var fieldsMC = new Ext.util.MixedCollection(false, function(field) {
            return field.name;
        });
        
        for (var index = 0, length = fields.length; index < length; index++) {
            fieldsMC.add(new Ext.data.Field(fields[index]));
        }
        
        Ext.override(model, {
            fields : fieldsMC,
            plugins: plugins
        });
        
        for (var index = 0, length = plugins.length; index < length; index++) {
            plugins[index].bootstrap(model, config);
        }
        
        this.types[name] = model;
        
        return model;
    },
    
    /**
     * 
     * @param {String/Object} id The id of the model or the model instance.
     */
    getModel: function(id){
        var model = id;
        if(typeof model == 'string'){
            model = this.types[model];
        }
        return model;
    },
    
    create: function(config, name) {
        var con = typeof name == 'function' ? name : this.types[name || config.name];
        
        return new con(config);
    }
});

Ext.regModel = function() {
    return Ext.ModelMgr.registerType.apply(Ext.ModelMgr, arguments);
};
/**
 * @class Ext.data.Operation
 * @extends Object
 * <p>Represents a single read or write operation performed by a {@link Ext.data.Proxy Proxy}.
 * Operation objects are used to enable communication between Stores and Proxies. Application
 * developers should rarely need to interact with Operation objects directly.</p>
 * <p>Several Operations can be batched together in a {@link Ext.data.Batch batch}.</p>
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Operation = Ext.extend(Object, {
    /**
     * @cfg {Boolean} synchronous True if this Operation is to be executed synchronously (defaults to true). This
     * property is inspected by a {@link Ext.data.Batch Batch} to see if a series of Operations can be executed in
     * parallel or not.
     */
    synchronous: true,
    
    /**
     * @cfg {String} action The action being performed by this Operation. Should be one of 'create', 'read', 'update' or 'destroy'
     */
    action: undefined,
    
    /**
     * @cfg {Array} filters Optional array of filter objects. Only applies to 'read' actions.
     */
    filters: undefined,
    
    /**
     * @cfg {Array} sorters Optional array of sorter objects. Only applies to 'read' actions.
     */
    sorters: undefined,
    
    /**
     * @cfg {Object} group Optional grouping configuration. Only applies to 'read' actions where grouping is desired.
     */
    group: undefined,
    
    /**
     * @cfg {Number} start The start index (offset), used in paging when running a 'read' action.
     */
    start: undefined,
    
    /**
     * @cfg {Number} limit The number of records to load. Used on 'read' actions when paging is being used.
     */
    limit: undefined,
    
    /**
     * @cfg {Ext.data.Batch} batch The batch that this Operation is a part of (optional)
     */
    batch: undefined,
    
        
    /**
     * Read-only property tracking the start status of this Operation. Use {@link #isStarted}.
     * @property started
     * @type Boolean
     * @private
     */
    started: false,
    
    /**
     * Read-only property tracking the run status of this Operation. Use {@link #isRunning}.
     * @property running
     * @type Boolean
     * @private
     */
    running: false,
    
    /**
     * Read-only property tracking the completion status of this Operation. Use {@link #isComplete}.
     * @property complete
     * @type Boolean
     * @private
     */
    complete: false,
    
    /**
     * Read-only property tracking whether the Operation was successful or not. This starts as undefined and is set to true
     * or false by the Proxy that is executing the Operation. It is also set to false by {@link #markException}. Use
     * {@link #wasSuccessful} to query success status.
     * @property success
     * @type Boolean
     */
    success: undefined,
    
    /**
     * Read-only property tracking the exception status of this Operation. Use {@link #hasException} and see {@link #getError}.
     * @property exception
     * @type Boolean
     * @private
     */
    exception: false,
    
    /**
     * The error object passed when {@link #markException} was called. This could be any object or primitive.
     * @property error
     * @type Mixed
     * @private
     */
    error: undefined,
    
    constructor: function(config) {
        Ext.apply(this, config || {});
    },
    
    /**
     * Marks the Operation as started
     */
    markStarted: function() {
        this.started = true;
        this.running = true;
    },
    
    /**
     * Marks the Operation as completed
     */
    markCompleted: function() {
        this.complete = true;
        this.running  = false;
    },
    
    /**
     * Marks the Operation as having experienced an exception. Can be supplied with an option error message/object.
     * @param {Mixed} error Optional error string/object
     */
    markException: function(error) {
        this.exception = true;
        this.success = false;
        this.running = false;
        this.error = error;
    },
    
    /**
     * Returns true if this Operation encountered an exception (see also {@link #getError})
     * @return {Boolean} True if there was an exception
     */
    hasException: function() {
        return this.exception === true;
    },
    
    /**
     * Returns the error string or object that was set using {@link #markException}
     * @return {Mixed} The error object
     */
    getError: function() {
        return this.error;
    },
    
    /**
     * Returns an array of Ext.data.Model instances as set by the Proxy.
     * @return {Array} Any loaded Records
     */
    getRecords: function() {
        var resultSet = this.getResultSet();
        
        return (resultSet == undefined ? [] : resultSet.records);
    },
    
    /**
     * Returns the ResultSet object (if set by the Proxy). This object will contain the {@link Ext.data.Model model} instances
     * as well as meta data such as number of instances fetched, number available etc
     * @return {Ext.data.ResultSet} The ResultSet object
     */
    getResultSet: function() {
        return this.resultSet;
    },
    
    /**
     * Returns true if the Operation has been started. Note that the Operation may have started AND completed,
     * see {@link #isRunning} to test if the Operation is currently running.
     * @return {Boolean} True if the Operation has started
     */
    isStarted: function() {
        return this.started === true;
    },
    
    /**
     * Returns true if the Operation has been started but has not yet completed.
     * @return {Boolean} True if the Operation is currently running
     */
    isRunning: function() {
        return this.running === true;
    },
    
    /**
     * Returns true if the Operation has been completed
     * @return {Boolean} True if the Operation is complete
     */
    isComplete: function() {
        return this.complete === true;
    },
    
    /**
     * Returns true if the Operation has completed and was successful
     * @return {Boolean} True if successful
     */
    wasSuccessful: function() {
        return this.isComplete() && this.success === true;
    },
    
    /**
     * @private
     * Associates this Operation with a Batch
     * @param {Ext.data.Batch} batch The batch
     */
    setBatch: function(batch) {
        this.batch = batch;
    },
    
    /**
     * Checks whether this operation should cause writing to occur.
     * @return {Boolean} Whether the operation should cause a write to occur.
     */
    allowWrite: function(){
        return this.action != 'read';
    }
});
Ext.data.ProxyMgr = new Ext.AbstractManager({
    
});
/**
 * @class Ext.data.ReaderMgr
 */
Ext.data.ReaderMgr = new Ext.AbstractManager({
    typeName: 'rtype'
});
/**
 * @class Ext.data.Request
 * @extends Object
 * Simple class that represents a Request that will be made by any {@link Ext.data.ServerProxy}
subclass.
 * All this class does is standardize the representation of a Request as used by any ServerProxy subclass,
 * it does not contain any actual logic or perform the request itself.
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Request = Ext.extend(Object, {
    /**
     * @cfg {String} action The name of the action this Request represents. Usually one of 'create', 'read', 'update' or 'destroy'
     */
    action: undefined,
    
    /**
     * @cfg {Object} params HTTP request params. The Proxy and its Writer have access to and can modify this object.
     */
    params: undefined,
    
    /**
     * @cfg {String} method The HTTP method to use on this Request (defaults to 'GET'). Should be one of 'GET', 'POST', 'PUT' or 'DELETE'
     */
    method: 'GET',
    
    /**
     * @cfg {String} url The url to access on this Request
     */
    url: undefined,

    constructor: function(config) {
        Ext.apply(this, config || {});
    }
});
/**
 * @class Ext.data.ResultSet
 * @extends Object
 * Simple wrapper class that represents a set of records returned by a Proxy.
 * @constructor
 * Creates the new ResultSet
 */
Ext.data.ResultSet = Ext.extend(Object, {
    /**
     * @cfg {Boolean} loaded
     * True if the records have already been loaded. This is only meaningful when dealing with
     * SQL-backed proxies
     */
    loaded: true,
    
    /**
     * @cfg {Number} count
     * The number of records in this ResultSet. Note that total may differ from this number
     */
    count: 0,
    
    /**
     * @cfg {Number} total
     * The total number of records reported by the data source. This ResultSet may form a subset of
     * those records (see count)
     */
    total: 0,
    
    /**
     * @cfg {Boolean} success
     * True if the ResultSet loaded successfully, false if any errors were encountered
     */
    success: false,
    
    /**
     * @cfg {Array} records The array of record instances. Required
     */

    constructor: function(config) {
        Ext.apply(this, config || {});
        
        if (config.count == undefined) {
            this.count = this.records.length;
        }
    }
});
/**
 * @class Ext.data.Store
 * @extends Ext.util.Observable
 * 
 * <p>The Store class encapsulates a client side cache of {@link Ext.data.Model Model} objects. Stores load
 * data via a {@link Ext.data.Proxy Proxy}, and also provide functions for {@link #sort sorting}, 
 * {@link #filter filtering} and querying the {@link Ext.data.Model model} instances contained within it.</p>
 * <p>Creating a Store is easy - we just tell it the Model and the Proxy to use to load and save its data:</p>
<pre><code>
// Set up a {@link Ext.data.Model model} to use in our Store
Ext.regModel('User', {
    fields: [
        {name: 'firstName', type: 'string'},
        {name: 'lastName',  type: 'string'}
    ]
});

var myStore = new Ext.data.Store({
    model: 'User',
    proxy: {
        type: 'ajax',
        url : '/users.json',
        reader: {
            type: 'json',
            root: 'users'
        }
    },
    autoLoad: true
});
</code></pre>
 * <p>In the example above we configured an AJAX proxy to load data from the url '/users.json'. We told our Proxy
 * to use a {@link Ext.data.JsonReader JsonReader} to parse the response from the server into Model object - 
 * {@link Ext.data.JsonReader see the docs on JsonReader} for details.</p>
 * <p><u>Inline data</u></p>
 * <p>Stores can also load data inline. Internally, Store converts each of the objects we pass in as {@link #data} 
 * into Model instances:</p>
<pre><code>
new Ext.data.Store({
    model: 'User',
    data : [
        {firstName: 'Ed',    lastName: 'Spencer'},
        {firstName: 'Tommy', lastName: 'Maintz'},
        {firstName: 'Aaron', lastName: 'Conran'},
        {firstName: 'Jamie', lastName: 'Avins'}
    ]
});
</code></pre>
 * <p>Additional data can also be loaded locally using {@link #loadData}.</p>
 * <p><u>Further Reading</u></p>
 * <p>Stores are backed up by an ecosystem of classes that enables their operation. To gain a full understanding of these
 * pieces and how they fit together, see:</p>
 * <ul style="list-style-type: disc; padding-left: 25px">
 * <li>{@link Ext.data.Proxy Proxy} - overview of what Proxies are and how they are used</li>
 * <li>{@link Ext.data.Model Model} - the core class in the data package</li>
 * <li>{@link Ext.data.Reader Reader} - used by any subclass of {@link Ext.data.ServerProxy ServerProxy} to read a response</li>
 * </ul>
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Store = Ext.extend(Ext.util.Observable, {
    remoteSort  : false,
    remoteFilter: false,
    
    /**
     * @cfg {String/Ext.data.Proxy/Object} proxy The Proxy to use for this Store. This can be either a string, a config
     * object or a Proxy instance - see {@link #setProxy} for details.
     */
    
    /**
     * @cfg {Array} data Optional array of Model instances or data objects to load locally. See "Inline data" above for details.
     */
    
    /**
     * @cfg {Boolean/Object} autoLoad If data is not specified, and if autoLoad is true or an Object, this store's load method 
     * is automatically called after creation. If the value of autoLoad is an Object, this Object will be passed to the store's 
     * load method. Defaults to false.
     */
    autoLoad: false,
    
    /**
     * @cfg {Boolean} autoSave True to automatically sync the Store with its Proxy after every edit to one of its Records.
     * Defaults to false.
     */
    autoSave: false,
    
    /**
     * The (optional) field by which to group data in the store. Internally, grouping is very similar to sorting - the
     * groupField and {@link #groupDir} are injected as the first sorter (see {@link #sort}). Stores support a single 
     * level of grouping, and groups can be fetched via the {@link #getGroups} method.
     * @property groupField
     * @type String
     */
    groupField: undefined,
    
    /**
     * The direction in which sorting should be applied when grouping. Defaults to "ASC" - the other supported value is "DESC"
     * @property groupDir
     * @type String
     */
    groupDir: "ASC",
    
    /**
     * The number of records considered to form a 'page'. This is used to power the built-in
     * paging using the nextPage and previousPage functions. Defaults to 25.
     * @property pageSize
     * @type Number
     */
    pageSize: 25,
    
    /**
     * Sets the updating behavior based on batch synchronization. 'operation' (the default) will update the Store's
     * internal representation of the data after each operation of the batch has completed, 'complete' will wait until
     * the entire batch has been completed before updating the Store's data. 'complete' is a good choice for local
     * storage proxies, 'operation' is better for remote proxies, where there is a comparatively high latency.
     * @property batchUpdateMode
     * @type String
     */
    batchUpdateMode: 'operation',
    
    /**
     * If true, any filters attached to this Store will be run after loading data, before the datachanged event is fired.
     * Defaults to true.
     * @property filterOnLoad
     * @type Boolean
     */
    filterOnLoad: true,
    
    /**
     * If true, any sorters attached to this Store will be run after loading data, before the datachanged event is fired.
     * Defaults to true.
     * @property sortOnLoad
     * @type Boolean
     */
    sortOnLoad: true,
    
    /**
     * The number of the page of data currently loaded
     * @property currentPage
     * @type Number
     */
    currentPage: 1,
    
    /**
     * True if a model was created implicitly for this Store. This happens if a fields array is passed to the Store's constructor
     * instead of a model constructor or name.
     * @property implicitModel
     * @type Boolean
     * @private
     */
    implicitModel: true,
    
    /**
     * The string type of the Proxy to create if none is specified. This defaults to creating a {@link Ext.data.MemoryProxy memory proxy}.
     * @property defaultProxyType
     * @type String
     */
    defaultProxyType: 'memory',
    
    //documented above
    constructor: function(config) {
        this.addEvents(
            /**
             * @event add
             * Fired when a Model instance has been added to this Store
             * @param {Ext.data.Store} store The store
             * @param {Array} records The Model instances that were added
             * @param {Number} index The index at which the instances were inserted
             */
            'add',
            
            /**
             * @event remove
             * Fired when a Model instance has been removed from this Store
             * @param {Ext.data.Model} record The record that was removed
             */
            'remove',
            
            /**
             * @event update
             * Fires when a Record has been updated
             * @param {Store} this
             * @param {Ext.data.Model} record The Model instance that was updated
             * @param {String} operation The update operation being performed. Value may be one of:
             * <pre><code>
               Ext.data.Model.EDIT
               Ext.data.Model.REJECT
               Ext.data.Model.COMMIT
             * </code></pre>
             */
            'update',
            
            /**
             * @event datachanged
             * Fires whenever the records in the Store have changed in some way - this could include adding or removing records,
             * or updating the data in existing records
             * @param {Ext.data.Store} this The data store
             */
            'datachanged'
        );
        
        /**
         * Temporary cache in which removed model instances are kept until successfully synchronised with a Proxy,
         * at which point this is cleared.
         * @private
         * @property removed
         * @type Array
         */
        this.removed = [];
        
        /**
         * Stores the current sort direction ('ASC' or 'DESC') for each field. Used internally to manage the toggling
         * of sort direction per field. Read only
         * @property sortToggle
         * @type Object
         */
        this.sortToggle = {};
        
        /**
         * The MixedCollection that holds this store's local cache of records
         * @property data
         * @type Ext.util.MixedCollection
         */
        this.data = new Ext.util.MixedCollection(false, function(record) {
            return record.id;
        });
        
        if (config.data) {
            this.inlineData = config.data;
            delete config.data;
        }
        
        Ext.data.Store.superclass.constructor.apply(this, arguments);
        
        this.model = Ext.ModelMgr.getModel(config.model);
        
        //Supports the 3.x style of simply passing an array of fields to the store, implicitly creating a model
        if (!this.model && config.fields) {
            this.model = Ext.regModel('ImplicitModel-' + this.storeId || Ext.id(), {
                fields: config.fields
            });
            
            delete this.fields;
            
            this.implicitModel = true;
        }
        
        //ensures that the Proxy is instantiated correctly
        this.setProxy(config.proxy);
        
        if (this.inlineData) {
            this.loadData(this.inlineData);
            delete this.inlineData;
        } else if (this.autoLoad) {
            this.load.defer(10, this, [typeof this.autoLoad == 'object' ? this.autoLoad : undefined]);
        }
        
        if (this.id) {
            this.storeId = this.id;
            delete this.id;
            
            Ext.StoreMgr.register(this);
        }
    },
    
    /**
     * Sets the Store's Proxy by string, config object or Proxy instance
     * @param {String|Object|Ext.data.Proxy} proxy The new Proxy, which can be either a type string, a configuration object
     * or an Ext.data.Proxy instance
     * @return {Ext.data.Proxy} The attached Proxy object
     */
    setProxy: function(proxy) {
        if (proxy == undefined || typeof proxy == 'string') {
            proxy = {
                type: proxy
            };
        }

        if (!(proxy instanceof Ext.data.Proxy)) {
            Ext.applyIf(proxy, {
                type : this.defaultProxyType,
                model: this.model
            });

            this.proxy = Ext.data.ProxyMgr.create(proxy);
        }else{
            this.proxy.setModel(this.model);
        }
        return this.proxy;
    },

    /**
     * Returns the proxy currently attached to this proxy instance
     * @return {Ext.data.Proxy} The Proxy instance
     */
    getProxy: function() {
        return this.proxy;
    },
    
    /**
     * Returns an object containing the result of applying grouping to the records in this store. See {@link #groupField}, 
     * {@link #groupDir} and {@link #getGroupString}. Example for a store containing records with a color field:
<pre><code>
var myStore = new Ext.data.Store({
    groupField: 'color',
    groupDir  : 'DESC'
});

myStore.getGroups(); //returns:
[
    {
        name: 'yellow',
        children: [
            //all records where the color field is 'yellow'
        ]
    },
    {
        name: 'red',
        children: [
            //all records where the color field is 'red'
        ]
    }
]
</code></pre>
     * @return {Array} The grouped data
     */
    getGroups: function() {
        var records  = this.data.items,
            length   = records.length,
            groups   = [],
            pointers = {},
            record, groupStr, group, i;
        
        for (i = 0; i < length; i++) {
            record = records[i];
            groupStr = this.getGroupString(record);
            group = pointers[groupStr];
            
            if (group == undefined) {
                group = {
                    name: groupStr,
                    children: []
                };
                
                groups.push(group);
                pointers[groupStr] = group;
            }
            
            group.children.push(record);
        }
        
        return groups;
    },
    
    /**
     * Returns the string to group on for a given model instance. The default implementation of this method returns the model's
     * {@link #groupField}, but this can be overridden to group by an arbitrary string. For example, to group by the first letter
     * of a model's 'name' field, use the following code:
<pre><code>
new Ext.data.Store({
    groupDir: 'ASC',
    getGroupString: function(instance) {
        return instance.get('name')[0];
    }
});
</code></pre>
     * @param {Ext.data.Model} instance The model instance
     * @return {String} The string to compare when forming groups
     */
    getGroupString: function(instance) {
        return instance.get(this.groupField);
    },
    
    /**
     * Inserts Model instances into the Store at the given index and fires the {@link #add} event.
     * See also <code>{@link #add}</code> and <code>{@link #addSorted}</code>.
     * @param {Number} index The start index at which to insert the passed Records.
     * @param {Ext.data.Model[]} records An Array of Ext.data.Model objects to add to the cache.
     */
    insert : function(index, records) {
        records = [].concat(records);
        for (var i = 0, len = records.length; i < len; i++) {
            this.data.insert(index, records[i]);
            records[i].join(this);
        }
        if (this.snapshot) {
            this.snapshot.addAll(records);
        }
        this.fireEvent('add', this, records, index);
    },
    
    /**
     * Adds Model instances to the Store by instantiating them based on a JavaScript object. When adding already-
     * instantiated Models, use {@link #insert} instead. The instances will be added at the end of the existing collection.
     * Sample usage:
<pre><code>
myStore.add({some: 'data'}, {some: 'other data'});
</code></pre>
     * @param {Object} data The data for each model
     * @return {Array} The array of newly created model instances
     */
    add: function() {
        var records = Array.prototype.slice.apply(arguments),
            length  = records.length,
            i;
        
        for (i = 0; i < length; i++) {
            if (!(records[i] instanceof Ext.data.Model)) {
                records[i] = Ext.ModelMgr.create(records[i], this.model);
            }
        }
        
        this.insert(this.data.length, records);
        
        return records;
    },
    
    //saves any phantom records
    create: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'create',
            records: this.getNewRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.create(operation, this.onProxyWrite, this);
    },

    /**
     * Calls the specified function for each of the {@link Ext.data.Record Records} in the cache.
     * @param {Function} fn The function to call. The {@link Ext.data.Record Record} is passed as the first parameter.
     * Returning <tt>false</tt> aborts and exits the iteration.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed.
     * Defaults to the current {@link Ext.data.Record Record} in the iteration.
     */
    each : function(fn, scope){
        this.data.each(fn, scope);
    },

    /**
     * Removes the given record from the Store, firing the 'remove' event for each instance that is removed, plus a single
     * 'datachanged' event after removal.
     * @param {Ext.data.Model/Array} records The Ext.data.Model instance or array of instances to remove
     */
    remove: function(records) {
        if (!Ext.isArray(records)) {
            records = [records];
        }
        
        var length = records.length,
            i, index, record;
        
        for (i = 0; i < length; i++) {
            record = records[i];
            
            this.removed.push(record);

            index = this.data.indexOf(record);

            if (this.snapshot) {
                this.snapshot.remove(record);
            }

            if (index > -1) {
                record.unjoin(this);
                this.data.removeAt(index);

                this.fireEvent('remove', this, record, index);
            }
        }
        
        this.fireEvent('datachanged', this);
    },
    
    /**
     * Removes the model instance at the given index
     * @param {Number} index The record index
     */
    removeAt: function(index) {
        var record = this.getAt(index);
        
        if (record) {
            this.remove(record);
        }
    },
    
    //tells the attached proxy to destroy the given records
    destroy: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'destroy',
            records: this.getRemovedRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.destroy(operation, this.onProxyWrite, this);
    },
    
    update: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'update',
            records: this.getUpdatedRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.update(operation, this.onProxyWrite, this);
    },
    
    read: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'read',
            filters: this.filters,
            sorters: this.sorters,
            group  : {field: this.groupField, direction: this.groupDir},
            start  : 0,
            limit  : this.pageSize,
            
            addRecords: false
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.read(operation, this.onProxyRead, this);
    },
    
    
    onProxyRead: function(operation) {
        var records = operation.getRecords();
        this.loadRecords(records, operation.addRecords);
        
        //this is a callback that would have been passed to the 'read' function and is optional
        var callback = operation.callback;
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },
    
    onProxyWrite: function(operation) {
        var data    = this.data,
            action  = operation.action,
            records = operation.getRecords(),
            length  = records.length,
            record, i;
        
        if (action == 'create' || action == 'update') {
            for (i = 0; i < length; i++) {
                record = records[i];
                
                record.phantom = false;
                record.join(this);
                data.replace(record);
            }
        }
        
        else if (action == 'destroy') {
            for (i = 0; i < length; i++) {
                record = records[i];
                
                record.unjoin(this);
                data.remove(record);
            }
            
            this.removed = [];
        }
        
        this.fireEvent('datachanged');
        
        //this is a callback that would have been passed to the 'create', 'update' or 'destroy' function and is optional
        var callback = operation.callback;
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },
    
    onBatchOperationComplete: function(batch, operation) {
        
    },
    
    /**
     * @private
     * Attached as the 'complete' event listener to a proxy's Batch object. Iterates over the batch operations
     * and updates the Store's internal data MixedCollection.
     */
    onBatchComplete: function(batch, operation) {
        var operations = batch.operations,
            length = operations.length,
            i;
        
        this.suspendEvents();
        
        for (i = 0; i < length; i++) {
            this.onProxyWrite(operations[i]);
        }
        
        this.resumeEvents();
        
        this.fireEvent('datachanged', this);
    },
    
    onBatchException: function(batch, operation) {
        // //decide what to do... could continue with the next operation
        // batch.start();
        // 
        // //or retry the last operation
        // batch.retry();
    },
    
    
    //returns any records that have not yet been realized
    getNewRecords: function() {
        return this.data.filterBy(this.filterNew).items;
    },
    
    /**
     * @private
     * Filter function for new records.
     */
    filterNew: function(item){
        return item.phantom == true;
    },
    
    //returns any records that have been updated in the store but not yet updated on the proxy
    getUpdatedRecords: function() {
        return this.data.filterBy(this.filterDirty).items;
    },
    
    /**
     * @private
     * Filter function for dirty records.
     */
    filterDirty: function(item){
        return item.dirty == true;    
    },
    
    //returns any records that have been removed from the store but not yet destroyed on the proxy
    getRemovedRecords: function() {
        return this.removed;
    },
    
    /**
     * The default sort direction to use if one is not specified (defaults to "ASC")
     * @property defaultSortDirection
     * @type String
     */
    defaultSortDirection: "ASC",
    
    /**
     * Sorts the data in the Store by one or more of its properties. Example usage:
<pre><code>
//sort by a single field
myStore.sort('myField', 'DESC');

//sorting by multiple fields
myStore.sort([
    {
        field    : 'age',
        direction: 'ASC'
    },
    {
        field    : 'name',
        direction: 'DESC'
    }
]);
</code></pre>
     * @param {String|Array} sorters Either a string name of one of the fields in this Store's configured {@link Ext.data.Model Model},
     * or an Array of sorter configurations.
     * @param {String} direction The overall direction to sort the data by. Defaults to "ASC".
     * @param {Boolean} suppressEvent If true, the 'datachanged' event is not fired. Defaults to false
     */
    sort: function(sorters, direction, suppressEvent) {
        sorters = sorters || this.sorters;
        direction = (this.sortToggle[name] || this.defaultSortDirection).toggle('ASC', 'DESC');
        
        this.sortToggle[name] = direction;
        
        //first we need to normalize the arguments. This is to support the previous 2-argument
        //single sort function signature
        if (typeof sorters == 'string') {
            sorters = [{
                field    : sorters,
                direction: direction
            }];
        }
        
        this.sortInfo = {
            sorters: sorters,
            direction: direction
        };
        
        if (this.remoteSort) {
            //the read function will pick up the new sorters and request the sorted data from the proxy
            this.read();
        } else {
            if (sorters == undefined || sorters.length == 0) {
                return;
            }
            
            var sortFns = [],
                length  = sorters.length,
                i;
            
            //create a sorter function for each sorter field/direction combo
            for (i = 0; i < length; i++) {
                sortFns.push(this.createSortFunction(sorters[i].field, sorters[i].direction));
            }

            //the direction modifier is multiplied with the result of the sorting functions to provide overall sort direction
            //(as opposed to direction per field)
            var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

            //create a function which ORs each sorter together to enable multi-sort
            var fn = function(r1, r2) {
                var result = sortFns[0].call(this, r1, r2);
               
                //if we have more than one sorter, OR any additional sorter functions together
                if (sortFns.length > 1) {
                    for (var i=1, j = sortFns.length; i < j; i++) {
                        result = result || sortFns[i].call(this, r1, r2);
                    }
                }
               
                return directionModifier * result;
            };

            //sort the data
            this.data.sort(direction, fn);
            
            if (!suppressEvent) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    /**
     * @private
     * Creates and returns a function which sorts an array by the given field and direction
     * @param {String} field The field to create the sorter for
     * @param {String} direction The direction to sort by (defaults to "ASC")
     * @return {Function} A function which sorts by the field/direction combination provided
     */
    createSortFunction: function(field, direction) {
        direction = direction || "ASC";
        var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

        var fields   = this.model.prototype.fields,
            sortType = fields.get(field).sortType;

        //create a comparison function. Takes 2 records, returns 1 if record 1 is greater,
        //-1 if record 2 is greater or 0 if they are equal
        return function(r1, r2) {
            var v1 = sortType(r1.data[field]),
                v2 = sortType(r2.data[field]);

            return directionModifier * (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
        };
    },
    
    /**
     * Filters the loaded set of records by a given set of filters. Optionally fires the 'datachanged' event.
     * @param {Mixed} filters The set of filters to apply to the data. These are stored internally on the store,
     * but the filtering itself is done on the Store's {@link Ext.util.MixedCollection MixedCollection}. See
     * MixedCollection's {@link Ext.util.MixedCollection#filter filter} method for filter syntax.
     * @param {Boolean} suppressEvent If true, the 'datachanged' event is not fired. Defaults to false
     */
    filter: function(filters, suppressEvent) {
        this.filters = filters || this.filters;
        
        if (this.remoteFilter) {
            //the read function will pick up the new filters and request the filtered data from the proxy
            this.read();
        } else {
            /**
             * A pristine (unfiltered) collection of the records in this store. This is used to reinstate
             * records when a filter is removed or changed
             * @property snapshot
             * @type Ext.util.MixedCollection
             */
            this.snapshot = this.snapshot || this.data.clone();
            
            this.data = this.data.filter(this.filters);
            
            if (!suppressEvent) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    /**
     * Revert to a view of the Record cache with no filtering applied.
     * @param {Boolean} suppressEvent If <tt>true</tt> the filter is cleared silently without firing the
     * {@link #datachanged} event.
     */
    clearFilter : function(suppressEvent){
        if (this.isFiltered()) {
            this.data = this.snapshot.clone();
            delete this.snapshot;
            
            if (suppressEvent !== true) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    /**
     * Returns true if this store is currently filtered
     * @return {Boolean}
     */
    isFiltered : function(){
        return !!this.snapshot && this.snapshot != this.data;
    },
    
    /**
     * Synchronizes the Store with its Proxy. This asks the Proxy to batch together any new, updated
     * and deleted records in the store, updating the Store's internal representation of the records
     * as each operation completes.
     */
    sync: function() {
        this.proxy.batch({
            create : this.getNewRecords(),
            update : this.getUpdatedRecords(),
            destroy: this.getRemovedRecords()
        }, this.getBatchListeners());
    },
    
    /**
     * @private
     * Returns an object which is passed in as the listeners argument to proxy.batch inside this.sync.
     * This is broken out into a separate function to allow for customisation of the listeners
     * @return {Object} The listeners object
     */
    getBatchListeners: function() {
        var listeners = {
            scope: this,
            exception: this.onBatchException
        };
        
        if (this.batchUpdateMode == 'operation') {
            listeners['operationComplete'] = this.onBatchOperationComplete;
        } else {
            listeners['complete'] = this.onBatchComplete;            
        }
        
        return listeners;
    },
    
    //deprecated, will be removed in 5.0
    save: function() {
        return this.sync.apply(this, arguments);
    },
    
    //pass straight through to this.read - could deprecate in 5.0
    load: function() {
        return this.read.apply(this, arguments);
    },
    
    /**
     * Loads an array of {@Ext.data.Model model} instances into the store, fires the datachanged event.
     * @param {Array} records The array of records to load
     * @param {Boolean} add True to add these records to the existing records, false to remove the Store's existing records first
     */
    loadRecords: function(records, add) {
        if (!add) {
            this.data.clear();
        }
        
        for (var i = 0, length = records.length; i < length; i++) {
            records[i].join(this);
        }
        
        this.data.addAll(records);
        
        if (this.filterOnLoad) {
            this.filter();
        }
        
        if (this.sortOnLoad) {
            this.sort();
        }
        
        this.fireEvent('datachanged', this);
    },
    
    /**
     * @private
     * A model instance should call this method on the Store it has been {@link Ext.data.Model#join joined} to.
     * @param {Ext.data.Model} record The model instance that was edited
     */
    afterEdit : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.EDIT);
    },
    
    /**
     * @private
     * A model instance should call this method on the Store it has been {@link Ext.data.Model#join joined} to..
     * @param {Ext.data.Model} record The model instance that was edited
     */
    afterReject : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.REJECT);
    },

    /**
     * @private
     * A model instance should call this method on the Store it has been {@link Ext.data.Model#join joined} to.
     * @param {Ext.data.Model} record The model instance that was edited
     */
    afterCommit : function(record) {
        if (this.autoSave) {
            this.sync();
        }
        
        this.fireEvent('update', this, record, Ext.data.Model.COMMIT);
    },
    
    /**
     * Loads an array of data straight into the Store
     * @param {Array} data Array of data to load. Any non-model instances will be cast into model instances first
     * @param {Boolean} append True to add the records to the existing records in the store, false to remove the old ones first
     */
    loadData: function(data, append) {
        var model = this.model,
            i, length, record;
        
        //make sure each data element is an Ext.data.Model instance
        for (i = 0, length = data.length; i < length; i++) {
            record = data[i];
            
            if (!(record instanceof Ext.data.Model)) {
                data[i] = Ext.ModelMgr.create(record, model);
            }
        }
        
        this.loadRecords(data, append);
    },
    
    
    // PAGING METHODS
    
    /**
     * Loads a given 'page' of data by setting the start and limit values appropriately
     * @param {Number} page The number of the page to load
     */
    loadPage: function(page) {
        this.currentPage = page;
        
        this.read({
            start: (page - 1) * this.pageSize,
            limit: this.pageSize
        });
    },
    
    /**
     * Loads the next 'page' in the current data set
     */
    nextPage: function() {
        this.loadPage(this.currentPage + 1);
    },
    
    /**
     * Loads the previous 'page' in the current data set
     */
    previousPage: function() {
        this.loadPage(this.currentPage - 1);
    },
    
    
    // UTILITY METHODS
    
    destroyStore: function() {
        if (!this.isDestroyed) {
            if (this.storeId) {
                Ext.StoreMgr.unregister(this);
            }
            this.clearData();
            this.data = null;
            Ext.destroy(this.proxy);
            this.reader = this.writer = null;
            this.purgeListeners();
            this.isDestroyed = true;
            
            if (this.implicitModel) {
                Ext.destroy(this.model);
            }
        }
    },
    
    // private
    clearData: function(){
        this.data.each(function(record) {
            record.unjoin();
        });
        
        this.data.clear();
    },
    
    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     * @param {String} fieldName The name of the Record field to test.
     * @param {String/RegExp} value Either a string that the field value
     * should begin with, or a RegExp to test against the field.
     * @param {Number} startIndex (optional) The index to start searching at
     * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning
     * @param {Boolean} caseSensitive (optional) True for case sensitive comparison
     * @return {Number} The matched index or -1
     */
    find : function(property, value, start, anyMatch, caseSensitive) {
        var fn = this.createFilterFn(property, value, anyMatch, caseSensitive);
        return fn ? this.data.findIndexBy(fn, null, start) : -1;
    },
    
    /**
     * @private
     * Returns a filter function used to test a the given property's value. Defers most of the work to
     * Ext.util.MixedCollection's createValueMatcher function
     * @param {String} property The property to create the filter function for
     * @param {String/RegExp} value The string/regex to compare the property value to
     * @param {Boolean} anyMatch True if we don't care if the filter value is not the full value (defaults to false)
     * @param {Boolean} caseSensitive True to create a case-sensitive regex (defaults to false)
     * @param {Boolean} exactMatch True to force exact match (^ and $ characters added to the regex). Defaults to false. Ignored if anyMatch is true.
     */
    createFilterFn : function(property, value, anyMatch, caseSensitive, exactMatch){
        if(Ext.isEmpty(value, false)){
            return false;
        }
        value = this.data.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r.data[property]);
        };
    },

    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     * @param {String} fieldName The name of the Record field to test.
     * @param {Mixed} value The value to match the field against.
     * @param {Number} startIndex (optional) The index to start searching at
     * @return {Number} The matched index or -1
     */
    findExact: function(property, value, start){
        return this.data.findIndexBy(function(rec){
            return rec.get(property) === value;
        }, this, start);
    },

    /**
     * Find the index of the first matching Record in this Store by a function.
     * If the function returns <tt>true</tt> it is considered a match.
     * @param {Function} fn The function to be called. It will be passed the following parameters:<ul>
     * <li><b>record</b> : Ext.data.Record<p class="sub-desc">The {@link Ext.data.Record record}
     * to test for filtering. Access field values using {@link Ext.data.Record#get}.</p></li>
     * <li><b>id</b> : Object<p class="sub-desc">The ID of the Record passed.</p></li>
     * </ul>
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Store.
     * @param {Number} startIndex (optional) The index to start searching at
     * @return {Number} The matched index or -1
     */
    findBy : function(fn, scope, start){
        return this.data.findIndexBy(fn, scope, start);
    },
    
    /**
     * Gets the number of cached records.
     * <p>If using paging, this may not be the total size of the dataset. If the data object
     * used by the Reader contains the dataset size, then the {@link #getTotalCount} function returns
     * the dataset size.  <b>Note</b>: see the Important note in {@link #load}.</p>
     * @return {Number} The number of Records in the Store's cache.
     */
    getCount : function() {
        return this.data.length || 0;
    },
    
    /**
     * Get the Record at the specified index.
     * @param {Number} index The index of the Record to find.
     * @return {Ext.data.Model} The Record at the passed index. Returns undefined if not found.
     */
    getAt : function(index) {
        return this.data.itemAt(index);
    },

    /**
     * Returns a range of Records between specified indices.
     * @param {Number} startIndex (optional) The starting index (defaults to 0)
     * @param {Number} endIndex (optional) The ending index (defaults to the last Record in the Store)
     * @return {Ext.data.Model[]} An array of Records
     */
    getRange : function(start, end) {
        return this.data.getRange(start, end);
    },
    
    /**
     * Get the Record with the specified id.
     * @param {String} id The id of the Record to find.
     * @return {Ext.data.Record} The Record with the passed id. Returns undefined if not found.
     */
    getById : function(id) {
        return (this.snapshot || this.data).find(function(record) {
            return record.getId() === id;
        });
    },
    
    /**
     * Get the index within the cache of the passed Record.
     * @param {Ext.data.Model} record The Ext.data.Model object to find.
     * @return {Number} The index of the passed Record. Returns -1 if not found.
     */
    indexOf : function(record) {
        return this.data.indexOf(record);
    },

    /**
     * Get the index within the cache of the Record with the passed id.
     * @param {String} id The id of the Record to find.
     * @return {Number} The index of the Record. Returns -1 if not found.
     */
    indexOfId : function(id) {
        return this.data.indexOfKey(id);
    },
    
    /**
     * Returns an object describing the current sort state of this Store.
     * @return {Object} The sort state of the Store. An object with two properties:<ul>
     * <li><b>field : String<p class="sub-desc">The name of the field by which the Records are sorted.</p></li>
     * <li><b>direction : String<p class="sub-desc">The sort order, 'ASC' or 'DESC' (case-sensitive).</p></li>
     * </ul>
     * See <tt>{@link #sortInfo}</tt> for additional details.
     */
    getSortState : function() {
        return this.sortInfo;
    }
});
/**
 * @class Ext.StoreMgr
 * @extends Ext.util.MixedCollection
 * The default global group of stores.
 * @singleton
 * TODO: Make this an AbstractMgr
 */
Ext.StoreMgr = Ext.apply(new Ext.util.MixedCollection(), {
    /**
     * @cfg {Object} listeners @hide
     */

    /**
     * Registers one or more Stores with the StoreMgr. You do not normally need to register stores
     * manually.  Any store initialized with a {@link Ext.data.Store#storeId} will be auto-registered. 
     * @param {Ext.data.Store} store1 A Store instance
     * @param {Ext.data.Store} store2 (optional)
     * @param {Ext.data.Store} etc... (optional)
     */
    register : function() {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.add(s);
        }
    },

    /**
     * Unregisters one or more Stores with the StoreMgr
     * @param {String/Object} id1 The id of the Store, or a Store instance
     * @param {String/Object} id2 (optional)
     * @param {String/Object} etc... (optional)
     */
    unregister : function() {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.remove(this.lookup(s));
        }
    },

    /**
     * Gets a registered Store by id
     * @param {String/Object} id The id of the Store, or a Store instance
     * @return {Ext.data.Store}
     */
    lookup : function(id) {
        if (Ext.isArray(id)) {
            var fields = ['field1'], expand = !Ext.isArray(id[0]);
            if(!expand){
                for(var i = 2, len = id[0].length; i <= len; ++i){
                    fields.push('field' + i);
                }
            }
            return new Ext.data.ArrayStore({
                data  : id,
                fields: fields,
                expandData : expand,
                autoDestroy: true,
                autoCreated: true
            });
        }
        return Ext.isObject(id) ? (id.events ? id : Ext.create(id, 'store')) : this.get(id);
    },

    // getKey implementation for MixedCollection
    getKey : function(o) {
         return o.storeId;
    }
});
Ext.data.WriterMgr = new Ext.AbstractManager({
    
});
/**
 * @class Ext.data.Tree
 * @extends Ext.util.Observable
 * Represents a tree data structure and bubbles all the events for its nodes. The nodes
 * in the tree have most standard DOM functionality.
 * @constructor
 * @param {Node} root (optional) The root node
 */
Ext.data.Tree = Ext.extend(Ext.util.Observable, {
    
    constructor: function(root){
        this.nodeHash = {};
        /**
         * The root node for this tree
         * @type Node
         */
        this.root = null;
        if(root){
            this.setRootNode(root);
        }
        this.addEvents(
            /**
             * @event append
             * Fires when a new child node is appended to a node in this tree.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The newly appended node
             * @param {Number} index The index of the newly appended node
             */
            "append",
            /**
             * @event remove
             * Fires when a child node is removed from a node in this tree.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node removed
             */
            "remove",
            /**
             * @event move
             * Fires when a node is moved to a new location in the tree
             * @param {Tree} tree The owner tree
             * @param {Node} node The node moved
             * @param {Node} oldParent The old parent of this node
             * @param {Node} newParent The new parent of this node
             * @param {Number} index The index it was moved to
             */
            "move",
            /**
             * @event insert
             * Fires when a new child node is inserted in a node in this tree.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node inserted
             * @param {Node} refNode The child node the node was inserted before
             */
            "insert",
            /**
             * @event beforeappend
             * Fires before a new child is appended to a node in this tree, return false to cancel the append.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node to be appended
             */
            "beforeappend",
            /**
             * @event beforeremove
             * Fires before a child is removed from a node in this tree, return false to cancel the remove.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node to be removed
             */
            "beforeremove",
            /**
             * @event beforemove
             * Fires before a node is moved to a new location in the tree. Return false to cancel the move.
             * @param {Tree} tree The owner tree
             * @param {Node} node The node being moved
             * @param {Node} oldParent The parent of the node
             * @param {Node} newParent The new parent the node is moving to
             * @param {Number} index The index it is being moved to
             */
            "beforemove",
            /**
             * @event beforeinsert
             * Fires before a new child is inserted in a node in this tree, return false to cancel the insert.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node to be inserted
             * @param {Node} refNode The child node the node is being inserted before
             */
            "beforeinsert"
        );
        Ext.data.Tree.superclass.constructor.call(this);        
    },
    
    /**
     * @cfg {String} pathSeparator
     * The token used to separate paths in node ids (defaults to '/').
     */
    pathSeparator: "/",

    // private
    proxyNodeEvent : function(){
        return this.fireEvent.apply(this, arguments);
    },

    /**
     * Returns the root node for this tree.
     * @return {Node}
     */
    getRootNode : function(){
        return this.root;
    },

    /**
     * Sets the root node for this tree.
     * @param {Node} node
     * @return {Node}
     */
    setRootNode : function(node){
        this.root = node;
        node.ownerTree = this;
        node.isRoot = true;
        this.registerNode(node);
        return node;
    },

    /**
     * Gets a node in this tree by its id.
     * @param {String} id
     * @return {Node}
     */
    getNodeById : function(id){
        return this.nodeHash[id];
    },

    // private
    registerNode : function(node){
        this.nodeHash[node.id] = node;
    },

    // private
    unregisterNode : function(node){
        delete this.nodeHash[node.id];
    },

    toString : function(){
        return "[Tree"+(this.id?" "+this.id:"")+"]";
    }
});

/**
 * @class Ext.data.Node
 * @extends Ext.util.Observable
 * @cfg {Boolean} leaf true if this node is a leaf and does not have children
 * @cfg {String} id The id for this node. If one is not specified, one is generated.
 * @constructor
 * @param {Object} attributes The attributes/config for the node
 */
Ext.data.Node = Ext.extend(Ext.util.Observable, {
    
    constructor: function(attributes){
        /**
         * The attributes supplied for the node. You can use this property to access any custom attributes you supplied.
         * @type {Object}
         */
        this.attributes = attributes || {};
        this.leaf = this.attributes.leaf;
        /**
         * The node id. @type String
         */
        this.id = this.attributes.id;
        if(!this.id){
            this.id = Ext.id(null, "xnode-");
            this.attributes.id = this.id;
        }
        /**
         * All child nodes of this node. @type Array
         */
        this.childNodes = [];
        /**
         * The parent node for this node. @type Node
         */
        this.parentNode = null;
        /**
         * The first direct child node of this node, or null if this node has no child nodes. @type Node
         */
        this.firstChild = null;
        /**
         * The last direct child node of this node, or null if this node has no child nodes. @type Node
         */
        this.lastChild = null;
        /**
         * The node immediately preceding this node in the tree, or null if there is no sibling node. @type Node
         */
        this.previousSibling = null;
        /**
         * The node immediately following this node in the tree, or null if there is no sibling node. @type Node
         */
        this.nextSibling = null;

        this.addEvents({
            /**
             * @event append
             * Fires when a new child node is appended
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The newly appended node
             * @param {Number} index The index of the newly appended node
             */
            "append" : true,
            /**
             * @event remove
             * Fires when a child node is removed
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The removed node
             */
            "remove" : true,
            /**
             * @event move
             * Fires when this node is moved to a new location in the tree
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} oldParent The old parent of this node
             * @param {Node} newParent The new parent of this node
             * @param {Number} index The index it was moved to
             */
            "move" : true,
            /**
             * @event insert
             * Fires when a new child node is inserted.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The child node inserted
             * @param {Node} refNode The child node the node was inserted before
             */
            "insert" : true,
            /**
             * @event beforeappend
             * Fires before a new child is appended, return false to cancel the append.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The child node to be appended
             */
            "beforeappend" : true,
            /**
             * @event beforeremove
             * Fires before a child is removed, return false to cancel the remove.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The child node to be removed
             */
            "beforeremove" : true,
            /**
             * @event beforemove
             * Fires before this node is moved to a new location in the tree. Return false to cancel the move.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} oldParent The parent of this node
             * @param {Node} newParent The new parent this node is moving to
             * @param {Number} index The index it is being moved to
             */
            "beforemove" : true,
             /**
              * @event beforeinsert
              * Fires before a new child is inserted, return false to cancel the insert.
              * @param {Tree} tree The owner tree
              * @param {Node} this This node
              * @param {Node} node The child node to be inserted
              * @param {Node} refNode The child node the node is being inserted before
              */
            "beforeinsert" : true
        });
        this.listeners = this.attributes.listeners;
        Ext.data.Node.superclass.constructor.call(this);    
    },
    
    // private
    fireEvent : function(evtName){
        // first do standard event for this node
        if(Ext.data.Node.superclass.fireEvent.apply(this, arguments) === false){
            return false;
        }
        // then bubble it up to the tree if the event wasn't cancelled
        var ot = this.getOwnerTree();
        if(ot){
            if(ot.proxyNodeEvent.apply(ot, arguments) === false){
                return false;
            }
        }
        return true;
    },

    /**
     * Returns true if this node is a leaf
     * @return {Boolean}
     */
    isLeaf : function(){
        return this.leaf === true;
    },

    // private
    setFirstChild : function(node){
        this.firstChild = node;
    },

    //private
    setLastChild : function(node){
        this.lastChild = node;
    },


    /**
     * Returns true if this node is the last child of its parent
     * @return {Boolean}
     */
    isLast : function(){
       return (!this.parentNode ? true : this.parentNode.lastChild == this);
    },

    /**
     * Returns true if this node is the first child of its parent
     * @return {Boolean}
     */
    isFirst : function(){
       return (!this.parentNode ? true : this.parentNode.firstChild == this);
    },

    /**
     * Returns true if this node has one or more child nodes, else false.
     * @return {Boolean}
     */
    hasChildNodes : function(){
        return !this.isLeaf() && this.childNodes.length > 0;
    },

    /**
     * Returns true if this node has one or more child nodes, or if the <tt>expandable</tt>
     * node attribute is explicitly specified as true (see {@link #attributes}), otherwise returns false.
     * @return {Boolean}
     */
    isExpandable : function(){
        return this.attributes.expandable || this.hasChildNodes();
    },

    /**
     * Insert node(s) as the last child node of this node.
     * @param {Node/Array} node The node or Array of nodes to append
     * @return {Node} The appended node if single append, or null if an array was passed
     */
    appendChild : function(node){
        var multi = false;
        if(Ext.isArray(node)){
            multi = node;
        }else if(arguments.length > 1){
            multi = arguments;
        }
        // if passed an array or multiple args do them one by one
        if(multi){
            for(var i = 0, len = multi.length; i < len; i++) {
                this.appendChild(multi[i]);
            }
        }else{
            if(this.fireEvent("beforeappend", this.ownerTree, this, node) === false){
                return false;
            }
            var index = this.childNodes.length;
            var oldParent = node.parentNode;
            // it's a move, make sure we move it cleanly
            if(oldParent){
                if(node.fireEvent("beforemove", node.getOwnerTree(), node, oldParent, this, index) === false){
                    return false;
                }
                oldParent.removeChild(node);
            }
            index = this.childNodes.length;
            if(index === 0){
                this.setFirstChild(node);
            }
            this.childNodes.push(node);
            node.parentNode = this;
            var ps = this.childNodes[index-1];
            if(ps){
                node.previousSibling = ps;
                ps.nextSibling = node;
            }else{
                node.previousSibling = null;
            }
            node.nextSibling = null;
            this.setLastChild(node);
            node.setOwnerTree(this.getOwnerTree());
            this.fireEvent("append", this.ownerTree, this, node, index);
            if(oldParent){
                node.fireEvent("move", this.ownerTree, node, oldParent, this, index);
            }
            return node;
        }
    },

    /**
     * Removes a child node from this node.
     * @param {Node} node The node to remove
     * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
     * @return {Node} The removed node
     */
    removeChild : function(node, destroy){
        var index = this.childNodes.indexOf(node);
        if(index == -1){
            return false;
        }
        if(this.fireEvent("beforeremove", this.ownerTree, this, node) === false){
            return false;
        }

        // remove it from childNodes collection
        this.childNodes.splice(index, 1);

        // update siblings
        if(node.previousSibling){
            node.previousSibling.nextSibling = node.nextSibling;
        }
        if(node.nextSibling){
            node.nextSibling.previousSibling = node.previousSibling;
        }

        // update child refs
        if(this.firstChild == node){
            this.setFirstChild(node.nextSibling);
        }
        if(this.lastChild == node){
            this.setLastChild(node.previousSibling);
        }

        this.fireEvent("remove", this.ownerTree, this, node);
        if(destroy){
            node.destroy(true);
        }else{
            node.clear();
        }
        return node;
    },

    // private
    clear : function(destroy){
        // clear any references from the node
        this.setOwnerTree(null, destroy);
        this.parentNode = this.previousSibling = this.nextSibling = null;
        if(destroy){
            this.firstChild = this.lastChild = null;
        }
    },

    /**
     * Destroys the node.
     */
    destroy : function(/* private */ silent){
        /*
         * Silent is to be used in a number of cases
         * 1) When setRootNode is called.
         * 2) When destroy on the tree is called
         * 3) For destroying child nodes on a node
         */
        if(silent === true){
            this.purgeListeners();
            this.clear(true);
            Ext.each(this.childNodes, function(n){
                n.destroy(true);
            });
            this.childNodes = null;
        }else{
            this.remove(true);
        }
    },

    /**
     * Inserts the first node before the second node in this nodes childNodes collection.
     * @param {Node} node The node to insert
     * @param {Node} refNode The node to insert before (if null the node is appended)
     * @return {Node} The inserted node
     */
    insertBefore : function(node, refNode){
        if(!refNode){ // like standard Dom, refNode can be null for append
            return this.appendChild(node);
        }
        // nothing to do
        if(node == refNode){
            return false;
        }

        if(this.fireEvent("beforeinsert", this.ownerTree, this, node, refNode) === false){
            return false;
        }
        var index = this.childNodes.indexOf(refNode);
        var oldParent = node.parentNode;
        var refIndex = index;

        // when moving internally, indexes will change after remove
        if(oldParent == this && this.childNodes.indexOf(node) < index){
            refIndex--;
        }

        // it's a move, make sure we move it cleanly
        if(oldParent){
            if(node.fireEvent("beforemove", node.getOwnerTree(), node, oldParent, this, index, refNode) === false){
                return false;
            }
            oldParent.removeChild(node);
        }
        if(refIndex === 0){
            this.setFirstChild(node);
        }
        this.childNodes.splice(refIndex, 0, node);
        node.parentNode = this;
        var ps = this.childNodes[refIndex-1];
        if(ps){
            node.previousSibling = ps;
            ps.nextSibling = node;
        }else{
            node.previousSibling = null;
        }
        node.nextSibling = refNode;
        refNode.previousSibling = node;
        node.setOwnerTree(this.getOwnerTree());
        this.fireEvent("insert", this.ownerTree, this, node, refNode);
        if(oldParent){
            node.fireEvent("move", this.ownerTree, node, oldParent, this, refIndex, refNode);
        }
        return node;
    },

    /**
     * Removes this node from its parent
     * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
     * @return {Node} this
     */
    remove : function(destroy){
        if (this.parentNode) {
            this.parentNode.removeChild(this, destroy);
        }
        return this;
    },

    /**
     * Removes all child nodes from this node.
     * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
     * @return {Node} this
     */
    removeAll : function(destroy){
        var cn = this.childNodes,
            n;
        while((n = cn[0])){
            this.removeChild(n, destroy);
        }
        return this;
    },

    /**
     * Returns the child node at the specified index.
     * @param {Number} index
     * @return {Node}
     */
    item : function(index){
        return this.childNodes[index];
    },

    /**
     * Replaces one child node in this node with another.
     * @param {Node} newChild The replacement node
     * @param {Node} oldChild The node to replace
     * @return {Node} The replaced node
     */
    replaceChild : function(newChild, oldChild){
        var s = oldChild ? oldChild.nextSibling : null;
        this.removeChild(oldChild);
        this.insertBefore(newChild, s);
        return oldChild;
    },

    /**
     * Returns the index of a child node
     * @param {Node} node
     * @return {Number} The index of the node or -1 if it was not found
     */
    indexOf : function(child){
        return this.childNodes.indexOf(child);
    },

    /**
     * Returns the tree this node is in.
     * @return {Tree}
     */
    getOwnerTree : function(){
        // if it doesn't have one, look for one
        if(!this.ownerTree){
            var p = this;
            while(p){
                if(p.ownerTree){
                    this.ownerTree = p.ownerTree;
                    break;
                }
                p = p.parentNode;
            }
        }
        return this.ownerTree;
    },

    /**
     * Returns depth of this node (the root node has a depth of 0)
     * @return {Number}
     */
    getDepth : function(){
        var depth = 0;
        var p = this;
        while(p.parentNode){
            ++depth;
            p = p.parentNode;
        }
        return depth;
    },

    // private
    setOwnerTree : function(tree, destroy){
        // if it is a move, we need to update everyone
        if(tree != this.ownerTree){
            if(this.ownerTree){
                this.ownerTree.unregisterNode(this);
            }
            this.ownerTree = tree;
            // If we're destroying, we don't need to recurse since it will be called on each child node
            if(destroy !== true){
                Ext.each(this.childNodes, function(n){
                    n.setOwnerTree(tree);
                });
            }
            if(tree){
                tree.registerNode(this);
            }
        }
    },

    /**
     * Changes the id of this node.
     * @param {String} id The new id for the node.
     */
    setId: function(id){
        if(id !== this.id){
            var t = this.ownerTree;
            if(t){
                t.unregisterNode(this);
            }
            this.id = this.attributes.id = id;
            if(t){
                t.registerNode(this);
            }
            this.onIdChange(id);
        }
    },

    // private
    onIdChange: Ext.emptyFn,

    /**
     * Returns the path for this node. The path can be used to expand or select this node programmatically.
     * @param {String} attr (optional) The attr to use for the path (defaults to the node's id)
     * @return {String} The path
     */
    getPath : function(attr){
        attr = attr || "id";
        var p = this.parentNode;
        var b = [this.attributes[attr]];
        while(p){
            b.unshift(p.attributes[attr]);
            p = p.parentNode;
        }
        var sep = this.getOwnerTree().pathSeparator;
        return sep + b.join(sep);
    },

    /**
     * Bubbles up the tree from this node, calling the specified function with each node. The arguments to the function
     * will be the args provided or the current node. If the function returns false at any point,
     * the bubble is stopped.
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node.
     * @param {Array} args (optional) The args to call the function with (default to passing the current Node)
     */
    bubble : function(fn, scope, args){
        var p = this;
        while(p){
            if(fn.apply(scope || p, args || [p]) === false){
                break;
            }
            p = p.parentNode;
        }
    },

    /**
     * Cascades down the tree from this node, calling the specified function with each node. The arguments to the function
     * will be the args provided or the current node. If the function returns false at any point,
     * the cascade is stopped on that branch.
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node.
     * @param {Array} args (optional) The args to call the function with (default to passing the current Node)
     */
    cascade : function(fn, scope, args){
        if(fn.apply(scope || this, args || [this]) !== false){
            var cs = this.childNodes;
            for(var i = 0, len = cs.length; i < len; i++) {
                cs[i].cascade(fn, scope, args);
            }
        }
    },

    /**
     * Interates the child nodes of this node, calling the specified function with each node. The arguments to the function
     * will be the args provided or the current node. If the function returns false at any point,
     * the iteration stops.
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node in the iteration.
     * @param {Array} args (optional) The args to call the function with (default to passing the current Node)
     */
    eachChild : function(fn, scope, args){
        var cs = this.childNodes;
        for(var i = 0, len = cs.length; i < len; i++) {
            if(fn.apply(scope || this, args || [cs[i]]) === false){
                break;
            }
        }
    },

    /**
     * Finds the first child that has the attribute with the specified value.
     * @param {String} attribute The attribute name
     * @param {Mixed} value The value to search for
     * @param {Boolean} deep (Optional) True to search through nodes deeper than the immediate children
     * @return {Node} The found child or null if none was found
     */
    findChild : function(attribute, value, deep){
        return this.findChildBy(function(){
            return this.attributes[attribute] == value;
        }, null, deep);
    },

    /**
     * Finds the first child by a custom function. The child matches if the function passed returns <code>true</code>.
     * @param {Function} fn A function which must return <code>true</code> if the passed Node is the required Node.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the Node being tested.
     * @param {Boolean} deep (Optional) True to search through nodes deeper than the immediate children
     * @return {Node} The found child or null if none was found
     */
    findChildBy : function(fn, scope, deep){
        var cs = this.childNodes,
            len = cs.length,
            i = 0,
            n,
            res;
        for(; i < len; i++){
            n = cs[i];
            if(fn.call(scope || n, n) === true){
                return n;
            }else if (deep){
                res = n.findChildBy(fn, scope, deep);
                if(res != null){
                    return res;
                }
            }
            
        }
        return null;
    },

    /**
     * Sorts this nodes children using the supplied sort function.
     * @param {Function} fn A function which, when passed two Nodes, returns -1, 0 or 1 depending upon required sort order.
     * @param {Object} scope (optional)The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
     */
    sort : function(fn, scope){
        var cs = this.childNodes;
        var len = cs.length;
        if(len > 0){
            var sortFn = scope ? function(){fn.apply(scope, arguments);} : fn;
            cs.sort(sortFn);
            for(var i = 0; i < len; i++){
                var n = cs[i];
                n.previousSibling = cs[i-1];
                n.nextSibling = cs[i+1];
                if(i === 0){
                    this.setFirstChild(n);
                }
                if(i == len-1){
                    this.setLastChild(n);
                }
            }
        }
    },

    /**
     * Returns true if this node is an ancestor (at any point) of the passed node.
     * @param {Node} node
     * @return {Boolean}
     */
    contains : function(node){
        return node.isAncestor(this);
    },

    /**
     * Returns true if the passed node is an ancestor (at any point) of this node.
     * @param {Node} node
     * @return {Boolean}
     */
    isAncestor : function(node){
        var p = this.parentNode;
        while(p){
            if(p == node){
                return true;
            }
            p = p.parentNode;
        }
        return false;
    },

    toString : function(){
        return "[Node"+(this.id?" "+this.id:"")+"]";
    }
});
/**
 * @class Ext.data.Proxy
 * @extends Ext.util.Observable
 * 
 * <p>Proxies are used by {@link Ext.data.Store Stores} to handle the loading and saving of {@link Ext.data.Model Model} data.
 * Usually developers will not need to create or interact with proxies directly.</p>
 * <p><u>Types of Proxy</u></p>
 * <p>There are two main types of Proxy - {@link Ext.data.ClientProxy Client} and {@link Ext.data.ServerProxy Server}. The Client proxies
 * save their data locally and include the following subclasses:</p>
 * <ul style="list-style-type: disc; padding-left: 25px">
 * <li>{@link Ext.data.LocalStorageProxy LocalStorageProxy} - saves its data to localStorage if the browser supports it</li>
 * <li>{@link Ext.data.SessionStorageProxy SessionStorageProxy} - saves its data to sessionStorage if the browsers supports it</li>
 * <li>{@link Ext.data.MemoryProxy MemoryProxy} - holds data in memory only, any data is lost when the page is refreshed</li>
 * </ul>
 * <p>The Server proxies save their data by sending requests to some remote server. These proxies include:</p>
 * <ul style="list-style-type: disc; padding-left: 25px">
 * <li>{@link Ext.data.AjaxProxy AjaxProxy} - sends requests to a server on the same domain</li>
 * <li>{@link Ext.data.ScriptTagProxy ScriptTagProxy} - uses JSON-P to send requests to a server on a different domain</li>
 * </ul>
 * <p>Proxies operate on the principle that all operations performed are either Create, Read, Update or Delete. These four operations 
 * are mapped to the methods {@link #create}, {@link #read}, {@link #update} and {@link #destroy} respectively. Each Proxy subclass 
 * implements these functions.</p>
 * <p>The CRUD methods each expect an {@link Ext.data.Operation operation} object as the sole argument. The Operation encapsulates 
 * information about the action the Store wishes to perform, the {@link Ext.data.Model model} instances that are to be modified, etc.
 * See the {@link Ext.data.Operation Operation} documentation for more details. Each CRUD method also accepts a callback function to be 
 * called asynchronously on completion.</p>
 * <p>Proxies also support batching of Operations via a {@link Ext.data.Batch batch} object, invoked by the {@link #batch} method.</p>
 * @constructor
 * Creates the Proxy
 * @param {Object} config Optional config object
 */
Ext.data.Proxy = Ext.extend(Ext.util.Observable, {
    /**
     * @cfg {String} batchOrder
     * Comma-separated ordering 'create', 'update' and 'destroy' actions when batching. Override this
     * to set a different order for the batched CRUD actions to be executed in. Defaults to 'create,update,destroy'
     */
    batchOrder: 'create,update,destroy',
    
    /**
     * @ignore
     */
    constructor: function(config) {
        Ext.data.Proxy.superclass.constructor.call(this, config);
        
        Ext.apply(this, config || {});
    },
    
    /**
     * Sets the model associated with this proxy. This will only usually be called by a Store
     * @param {String|Ext.data.Model} model The new model. Can be either the model name string,
     * or a reference to the model's constructor
     */
    setModel: function(model) {
        this.model = Ext.ModelMgr.getModel(model);
    },
    
    /**
     * Returns the model attached to this Proxy
     * @return {Ext.data.Model} The model
     */
    getModel: function() {
        return this.model;
    },
    
    /**
     * Performs the given create operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     */
    create: Ext.emptyFn,
    
    /**
     * Performs the given read operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     */
    read: Ext.emptyFn,
    
    /**
     * Performs the given update operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     */
    update: Ext.emptyFn,
    
    /**
     * Performs the given destroy operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     */
    destroy: Ext.emptyFn,
    
    /**
     * Performs a batch of {@link Ext.data.Operation Operations}, in the order specified by {@link #batchOrder}. Used internally by
     * {@link Ext.data.Store}'s {@link Ext.data.Store#sync sync} method. Example usage:
     * <pre><code>
     * myProxy.batch({
     *     create : [myModel1, myModel2],
     *     update : [myModel3],
     *     destroy: [myModel4, myModel5]
     * });
     * </code></pre>
     * Where the myModel* above are {@link Ext.data.Model Model} instances - in this case 1 and 2 are new instances and have not been 
     * saved before, 3 has been saved previously but needs to be updated, and 4 and 5 have already been saved but should now be destroyed.
     * @param {Object} operations Object containing the Model instances to act upon, keyed by action name
     * @param {Object} listeners Optional listeners object passed straight through to the Batch - see {@link Ext.data.Batch}
     * @return {Ext.data.Batch} The newly created Ext.data.Batch object
     */
    batch: function(operations, listeners) {
        var batch = new Ext.data.Batch({
            proxy: this,
            listeners: listeners || {}
        });
        
        Ext.each(this.batchOrder.split(','), function(action) {
            batch.add(new Ext.data.Operation({
                action : action, 
                records: operations[action]
            }));
        }, this);
        
        batch.start();
        
        return batch;
    }
});

//backwards compatibility
Ext.data.DataProxy = Ext.data.Proxy;

Ext.data.ProxyMgr.registerType('proxy', Ext.data.Proxy);
/**
 * @class Ext.data.ServerProxy
 * @extends Ext.data.Proxy
 * <p>ServerProxy is a superclass of {@link Ext.data.ScriptTagProxy ScriptTagProxy} and {@link Ext.data.AjaxProxy AjaxProxy},
 * and would not usually be used directly.</p>
 * 
 * <p>ServerProxy should ideally be named HttpProxy as it is a superclass for all HTTP proxies - for Ext JS 4.x it has been 
 * called ServerProxy to enable any 3.x applications that reference the HttpProxy to continue to work (HttpProxy is now an 
 * alias of AjaxProxy).</p>
 */
Ext.data.ServerProxy = Ext.extend(Ext.data.Proxy, {
    /**
     * @cfg {String} url The URL from which to request the data object.
     */
    
    /**
     * @cfg {Boolean} noCache (optional) Defaults to true. Disable caching by adding a unique parameter
     * name to the request.
     */
    noCache : true,
    
    /**
     * @cfg {String} cacheString
     * The name of the cache param added to the url when using noCache (defaults to "_dc")
     */
    cacheString: "_dc",
    
    /**
     * @cfg {String} defaultReaderType
     * The default registered reader type. Defaults to 'json'
     */
    defaultReaderType: 'json',
    
    /**
     * @cfg {String} defaultWriterType
     * The default registered writer type. Defaults to 'json'
     */
    defaultWriterType: 'json',
    
    /**
     * @ignore
     */
    constructor: function(config) {
        Ext.data.ServerProxy.superclass.constructor.call(this, config);
        
        /**
         * @cfg {Object} extraParams Extra parameters that will be included on every request. Individual requests with params
         * of the same name will override these params when they are in conflict.
         */
        this.extraParams = config.extraParams || {};
        
        //backwards compatibility, will be deprecated in 5.0
        this.nocache = this.noCache;
        
        //ensures that the reader and writer have been instantiated properly
        this.setReader(this.reader);
        this.setWriter(this.writer);
    },
    
    /**
     * Sets the Proxy's Reader by string, config object or Reader instance
     * @param {String|Object|Ext.data.Reader} reader The new Reader, which can be either a type string, a configuration object
     * or an Ext.data.Reader instance
     * @return {Ext.data.Reader} The attached Reader object
     */
    setReader: function(reader) {
        if (reader == undefined || typeof reader == 'string') {
            reader = {
                type: reader
            };
        }

        if (!(reader instanceof Ext.data.Reader)) {
            Ext.applyIf(reader, {
                model: this.model,
                type : this.defaultReaderType
            });

            this.reader = Ext.data.ReaderMgr.create(reader);
        }
        
        return this.reader;
    },
    
    /**
     * Returns the reader currently attached to this proxy instance
     * @return {Ext.data.Reader} The Reader instance
     */
    getReader: function() {
        return this.reader;
    },
    
    /**
     * Sets the Proxy's Writer by string, config object or Writer instance
     * @param {String|Object|Ext.data.Writer} writer The new Writer, which can be either a type string, a configuration object
     * or an Ext.data.Writer instance
     * @return {Ext.data.Writer} The attached Writer object
     */
    setWriter: function(writer) {
        if (writer == undefined || typeof writer == 'string') {
            writer = {
                type: writer
            };
        }

        if (!(writer instanceof Ext.data.Writer)) {
            Ext.applyIf(writer, {
                model: this.model,
                type : this.defaultWriterType
            });

            this.writer = Ext.data.WriterMgr.create(writer);
        }
        
        return this.writer;
    },
    
    /**
     * Returns the writer currently attached to this proxy instance
     * @return {Ext.data.Writer} The Writer instance
     */
    getWriter: function() {
        return this.writer;
    },
    
    // inherit docs
    setModel: function(model){
        Ext.data.ServerProxy.superclass.setModel.call(this, model);
        model = this.model;
        /*
         * Handle the case where an instance of reader/write is passed in.
         */
        var reader = this.reader;
        if(reader && !reader.model){
            this.reader.setModel(model);
        }
        if(this.writer){
            this.writer.model = model;
        }
    },
    
    //in a ServerProxy all four CRUD operations are executed in the same manner, so we delegate to doRequest in each case
    create: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    read: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    update: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    destroy: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    /**
     * Creates and returns an Ext.data.Request object based on the options passed by the {@link Ext.data.Store Store}
     * that this Proxy is attached to.
     * @param {Ext.data.Operation} operation The {@link Ext.data.Operation Operation} object to execute
     * @return {Ext.data.Request} The request object
     */
    buildRequest: function(operation) {
        var params = Ext.applyIf(operation.params || {}, this.extraParams || {});
        
        //copy any sorters, filters etc into the params so they can be sent over the wire
        params = Ext.applyIf(params, {
            start   : operation.start,
            limit   : operation.limit,
            group   : operation.group,
            filters : operation.filters,
            sorters : operation.sorters
        });
        
        var request = new Ext.data.Request({
            params  : params,
            action  : operation.action,
            records : operation.records,
            
            operation : operation
        });
        
        request.url = this.buildUrl(request);
        
        /*
         * Save the request on the Operation. Operations don't usually care about Request and Response data, but in the
         * ServerProxy and any of its subclasses we add both request and response as they may be useful for further processing
         */
        operation.request = request;
        
        return request;
    },
    
    /**
     * Generates a url based on a given Ext.data.Request object. By default, ServerProxy's buildUrl will
     * add the cache-buster param to the end of the url. Subclasses may need to perform additional modifications
     * to the url.
     * @param {Ext.data.Request} request The request object
     * @return {String} The url
     */
    buildUrl: function(request) {
        var url = request.url || this.url;
        
        if (this.noCache) {
            url = Ext.urlAppend(url, String.format("{0}={1}", this.cacheString, (new Date().getTime())));
        }
        
        return url;
    },
    
    /**
     * In ServerProxy subclasses, the {@link #create}, {@link #read}, {@link #update} and {@link #destroy} methods all pass
     * through to doRequest. Each ServerProxy subclass must implement the doRequest method - see {@link Ext.data.ScriptTagProxy}
     * and {@link Ext.data.AjaxProxy} for examples. This method carries the same signature as each of the methods that delegate to it.
     * @param {Ext.data.Operation} operation The Ext.data.Operation object
     * @param {Function} callback The callback function to call when the Operation has completed
     * @param {Object} scope The scope in which to execute the callback
     */
    doRequest: function(operation, callback, scope) {
        throw new Error("The doRequest function has not been implemented on your Ext.data.ServerProxy subclass. See src/data/ServerProxy.js for details");
    },
    
    /**
     * Optional callback function which can be used to clean up after a request has been completed.
     * @param {Ext.data.Request} request The Request object
     * @param {Boolean} success True if the request was successful
     */
    afterRequest: Ext.emptyFn,
    
    onDestroy: function() {
        Ext.destroy(this.reader, this.writer);
        
        Ext.data.ServerProxy.superclass.destroy.apply(this, arguments);
    }
});
/**
 * @class Ext.data.AjaxProxy
 * @extends Ext.data.ServerProxy
 * <p>An implementation of {@link Ext.data.Proxy} that processes data requests within the same
 * domain of the originating page.</p>
 * <p><b>Note</b>: this class cannot be used to retrieve data from a domain other
 * than the domain from which the running page was served. For cross-domain requests, use a
 * {@link Ext.data.ScriptTagProxy ScriptTagProxy}.</p>
 * <p>Be aware that to enable the browser to parse an XML document, the server must set
 * the Content-Type header in the HTTP response to "<tt>text/xml</tt>".</p>
 * @constructor
 * @param {Object} conn
 * An {@link Ext.data.Connection} object, or options parameter to {@link Ext.Ajax#request}.
 * <p>Note that if this HttpProxy is being used by a {@link Ext.data.Store Store}, then the
 * Store's call to {@link #load} will override any specified <tt>callback</tt> and <tt>params</tt>
 * options. In this case, use the Store's {@link Ext.data.Store#events events} to modify parameters,
 * or react to loading events. The Store's {@link Ext.data.Store#baseParams baseParams} may also be
 * used to pass parameters known at instantiation time.</p>
 * <p>If an options parameter is passed, the singleton {@link Ext.Ajax} object will be used to make
 * the request.</p>
 */
Ext.data.AjaxProxy = Ext.extend(Ext.data.ServerProxy, {
    /**
     * @property actionMethods
     * Mapping of action name to HTTP request method. In the basic AjaxProxy these are set to 'GET' for 'read' actions and 'POST' 
     * for 'create', 'update' and 'destroy' actions. The {@link Ext.data.RestProxy} maps these to the correct RESTful methods.
     */
    actionMethods: {
        create : 'POST',
        read   : 'GET',
        update : 'POST',
        destroy: 'POST'
    },
    
    /**
     * @ignore
     */
    doRequest: function(operation, callback, scope) {
        var writer  = this.getWriter(),
            request = this.buildRequest(operation, callback, scope);
            
        if(operation.allowWrite()){
            request = writer.write(request);
        }
        
        Ext.apply(request, {
            scope   : this,
            callback: this.createRequestCallback(request, operation, callback, scope),
            method  : this.getMethod(request)
        });
        
        Ext.Ajax.request(request);
        
        return request;
    },
    
    /**
     * Returns the HTTP method name for a given request. By default this returns based on a lookup on {@link #actionMethods}.
     * @param {Ext.data.Request} request The request object
     * @return {String} The HTTP method to use (should be one of 'GET', 'POST', 'PUT' or 'DELETE')
     */
    getMethod: function(request) {
        return this.actionMethods[request.action];
    },
    
    /**
     * @private
     * TODO: This is currently identical to the ScriptTagProxy version except for the return function's signature. There is a lot
     * of code duplication inside the returned function so we need to find a way to DRY this up.
     * @param {Ext.data.Request} request The Request object
     * @param {Ext.data.Operation} operation The Operation being executed
     * @param {Function} callback The callback function to be called when the request completes. This is usually the callback
     * passed to doRequest
     * @param {Object} scope The scope in which to execute the callback function
     * @return {Function} The callback function
     */
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;
        
        return function(options, success, response) {
            if (success === true) {
                var reader = me.getReader(),
                    result = reader.read(response);

                //see comment in buildRequest for why we include the response object here
                Ext.apply(operation, {
                    response : response,
                    resultSet: result
                });

                operation.markCompleted();
            } else {
                this.fireEvent('exception', this, 'response', operation);
                
                //TODO: extract error message from reader
                operation.markException();                
            }
            
            //this callback is the one that was passed to the 'read' or 'write' function above
            if (typeof callback == 'function') {
                callback.call(scope || me, operation);
            }
            
            me.afterRequest(request, true);
        };
    }
});

Ext.data.ProxyMgr.registerType('ajax', Ext.data.AjaxProxy);

//backwards compatibility, remove in Ext JS 5.0
Ext.data.HttpProxy = Ext.data.AjaxProxy;
/**
 * @class Ext.data.RestProxy
 * @extends Ext.data.AjaxProxy
 * Specialization of the {@link Ext.data.AjaxProxy AjaxProxy} which simply maps the four actions (create, read, update and destroy)
 * to RESTful HTTP verbs
 */
Ext.data.RestProxy = Ext.extend(Ext.data.AjaxProxy, {
    /**
     * Mapping of action name to HTTP request method. These default to RESTful conventions for the 'create', 'read',
     * 'update' and 'destroy' actions (which map to 'POST', 'GET', 'PUT' and 'DELETE' respectively). This object should
     * not be changed except globally via {@link Ext.override} - the {@link #getMethod} function can be overridden instead.
     * @property actionMethods
     * @type Object
     */
    actionMethods: {
        create : 'POST',
        read   : 'GET',
        update : 'PUT',
        destroy: 'DELETE'
    },
    
    api: {
        create : 'create',
        read   : 'read',
        update : 'update',
        destroy: 'destroy'
    }
});

Ext.data.ProxyMgr.registerType('rest', Ext.data.RestProxy);
Ext.apply(Ext, {
    /**
     * Returns the current document body as an {@link Ext.Element}.
     * @ignore
     * @memberOf Ext
     * @return Ext.Element The document body
     */
    getHead : function() {
        var head;
        
        return function() {
            if (head == undefined) {
                head = Ext.get(document.getElementsByTagName("head")[0]);
            }
            
            return head;
        };
    }()
});

/**
 * @class Ext.data.ScriptTagProxy
 * @extends Ext.data.ServerProxy
  * An implementation of Ext.data.DataProxy that reads a data object from a URL which may be in a domain
  * other than the originating domain of the running page.<br>
  * <p>
  * <b>Note that if you are retrieving data from a page that is in a domain that is NOT the same as the originating domain
  * of the running page, you must use this class, rather than HttpProxy.</b><br>
  * <p>
  * The content passed back from a server resource requested by a ScriptTagProxy <b>must</b> be executable JavaScript
  * source code because it is used as the source inside a &lt;script> tag.<br>
  * <p>
  * In order for the browser to process the returned data, the server must wrap the data object
  * with a call to a callback function, the name of which is passed as a parameter by the ScriptTagProxy.
  * Below is a Java example for a servlet which returns data for either a ScriptTagProxy, or an HttpProxy
  * depending on whether the callback name was passed:
  * <p>
  * <pre><code>
boolean scriptTag = false;
String cb = request.getParameter("callback");
if (cb != null) {
    scriptTag = true;
    response.setContentType("text/javascript");
} else {
    response.setContentType("application/x-json");
}
Writer out = response.getWriter();
if (scriptTag) {
    out.write(cb + "(");
}
out.print(dataBlock.toJsonString());
if (scriptTag) {
    out.write(");");
}
</code></pre>
 * <p>Below is a PHP example to do the same thing:</p><pre><code>
$callback = $_REQUEST['callback'];

// Create the output object.
$output = array('a' => 'Apple', 'b' => 'Banana');

//start output
if ($callback) {
    header('Content-Type: text/javascript');
    echo $callback . '(' . json_encode($output) . ');';
} else {
    header('Content-Type: application/x-json');
    echo json_encode($output);
}
</code></pre>
 * <p>Below is the ASP.Net code to do the same thing:</p><pre><code>
String jsonString = "{success: true}";
String cb = Request.Params.Get("callback");
String responseString = "";
if (!String.IsNullOrEmpty(cb)) {
    responseString = cb + "(" + jsonString + ")";
} else {
    responseString = jsonString;
}
Response.Write(responseString);
</code></pre>
 *
 */
Ext.data.ScriptTagProxy = Ext.extend(Ext.data.ServerProxy, {
    defaultWriterType: 'base',
    
    /**
     * @cfg {Number} timeout (optional) The number of milliseconds to wait for a response. Defaults to 30 seconds.
     */
    timeout : 30000,
    
    /**
     * @cfg {String} callbackParam (Optional) The name of the parameter to pass to the server which tells
     * the server the name of the callback function set up by the load call to process the returned data object.
     * Defaults to "callback".<p>The server-side processing must read this parameter value, and generate
     * javascript output which calls this named function passing the data object as its only parameter.
     */
    callbackParam : "callback",
    
    /**
     * @cfg {String} scriptIdPrefix
     * The prefix string that is used to create a unique ID for the injected script tag element (defaults to 'stcScript')
     */
    scriptIdPrefix: 'stcScript',
    
    /**
     * @cfg {String} callbackPrefix
     * The prefix string that is used to create a unique callback function name in the global scope. This can optionally
     * be modified to give control over how the callback string passed to the remote server is generated. Defaults to 'stcCallback'
     */
    callbackPrefix: 'stcCallback',
    
    /**
     * @cfg {String} recordParam
     * The param name to use when passing records to the server (e.g. 'records=someEncodedRecordString').
     * Defaults to 'records'
     */
    recordParam: 'records',
    
    /**
     * Reference to the most recent request made through this Proxy. Used internally to clean up when the Proxy is destroyed
     * @property lastRequest 
     * @type Ext.data.Request
     */
    lastRequest: undefined,

    /**
     * @private
     * Performs the read request to the remote domain. ScriptTagProxy does not actually create an Ajax request,
     * instead we write out a <script> tag based on the configuration of the internal Ext.data.Request object
     * @param {Ext.data.Operation} operation The {@link Ext.data.Operation Operation} object to execute
     * @param {Function} callback A callback function to execute when the Operation has been completed
     * @param {Object} scope The scope to execute the callback in
     */
    doRequest: function(operation, callback, scope) {
        //generate the unique IDs for this request
        var format     = String.format,
            transId    = ++Ext.data.ScriptTagProxy.TRANS_ID,
            scriptId   = format("{0}{1}", this.scriptIdPrefix, transId),
            stCallback = format("{0}{1}", this.callbackPrefix, transId);
        
        var writer  = this.getWriter(),
            request = this.buildRequest(operation),
            //FIXME: ideally this would be in buildUrl, but we don't know the stCallback name at that point
            url     = Ext.urlAppend(request.url, format("{0}={1}", this.callbackParam, stCallback));
            
        if(operation.allowWrite()){
            request = writer.write(request);
        }
        
        //apply ScriptTagProxy-specific attributes to the Request
        Ext.apply(request, {
            url       : url,
            transId   : transId,
            scriptId  : scriptId,
            stCallback: stCallback
        });
        
        //if the request takes too long this timeout function will cancel it
        request.timeoutId = this.createTimeoutHandler.defer(this.timeout, this, [request]);
        
        //this is the callback that will be called when the request is completed
        window[stCallback] = this.createRequestCallback(request, operation, callback, scope);
        
        //create the script tag and inject it into the document
        var script = document.createElement("script");
        script.setAttribute("src", url);
        script.setAttribute("type", "text/javascript");
        script.setAttribute("id", scriptId);
        
        Ext.getHead().appendChild(script);
        operation.markStarted();
        
        this.lastRequest = request;
        
        return request;
    },
    
    /**
     * @private
     * Creates and returns the function that is called when the request has completed. The returned function
     * should accept a Response object, which contains the response to be read by the configured Reader.
     * The third argument is the callback that should be called after the request has been completed and the Reader has decoded
     * the response. This callback will typically be the callback passed by a store, e.g. in proxy.read(operation, theCallback, scope)
     * theCallback refers to the callback argument received by this function.
     * See {@link #doRequest} for details.
     * @param {Ext.data.Request} request The Request object
     * @param {Ext.data.Operation} operation The Operation being executed
     * @param {Function} callback The callback function to be called when the request completes. This is usually the callback
     * passed to doRequest
     * @param {Object} scope The scope in which to execute the callback function
     * @return {Function} The callback function
     */
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;
        
        return function(response) {
            var reader = me.getReader(),
                result = reader.read(response);
            
            //see comment in buildRequest for why we include the response object here
            Ext.apply(operation, {
                response : response,
                resultSet: result
            });
            
            operation.markCompleted();
            
            //this callback is the one that was passed to the 'read' or 'write' function above
            if (typeof callback == 'function') {
                callback.call(scope || me, operation);
            }
            
            me.afterRequest(request, true);
        };
    },
    
    /**
     * Cleans up after a completed request by removing the now unnecessary script tag from the DOM. Also removes the 
     * global JSON-P callback function.
     * @param {Ext.data.Request} request The request object
     * @param {Boolean} isLoaded True if the request completed successfully
     */
    afterRequest: function() {
        var cleanup = function(functionName) {
            return function() {
                window[functionName] = undefined;
                
                try {
                    delete window[functionName];
                } catch(e) {}
            };
        };
        
        return function(request, isLoaded) {
            Ext.get(request.scriptId).remove();
            clearTimeout(request.timeoutId);
            
            var callbackName = request.stCallback;
            
            if (isLoaded) {
                cleanup(callbackName)();
                this.lastRequest.completed = true;
            } else {
                // if we haven't loaded yet, the callback might still be called in the future so don't unset it immediately
                window[callbackName] = cleanup(callbackName);
            }
        };
    }(),
    
    /**
     * Generates a url based on a given Ext.data.Request object. Adds the params and callback function name to the url
     * @param {Ext.data.Request} request The request object
     * @return {String} The url
     */
    buildUrl: function(request) {
        var url = Ext.data.ScriptTagProxy.superclass.buildUrl.call(this, request);
        
        url = Ext.urlAppend(url, Ext.urlEncode(request.params));
        
        //if there are any records present, append them to the url also
        var records = request.records;
        
        if (Ext.isArray(records) && records.length > 0) {
            url = Ext.urlAppend(url, String.format("{0}={1}", this.recordParam, this.encodeRecords(records)));
        }
        
        return url;
    },
    
    //inherit docs
    destroy: function() {
        this.abort();
        
        Ext.data.ScriptTagProxy.superclass.destroy.apply(this, arguments);
    },
        
    /**
     * @private
     * @return {Boolean} True if there is a current request that hasn't completed yet
     */
    isLoading : function(){
        var lastRequest = this.lastRequest;
        
        return (lastRequest != undefined && !lastRequest.completed);
    },
    
    /**
     * Aborts the current server request if one is currently running
     */
    abort: function() {
        if (this.isLoading()) {
            this.afterRequest(this.lastRequest);
        }
    },
        
    /**
     * Encodes an array of records into a string suitable to be appended to the script src url. This is broken
     * out into its own function so that it can be easily overridden.
     * @param {Array} records The records array
     * @return {String} The encoded records string
     */
    encodeRecords: function(records) {
        var encoded = "";
        
        for (var i = 0, length = records.length; i < length; i++) {
            encoded += Ext.urlEncode(records[i].data);
        }
        
        return encoded;
    },
    
    /**
     * @private
     * Starts a timer with the value of this.timeout - if this fires it means the request took too long so we
     * cancel the request. If the request was successful this timer is cancelled by this.afterRequest
     * @param {Ext.data.Request} request The Request to handle
     */
    createTimeoutHandler: function(request) {
        this.afterRequest(request, false);

        this.fireEvent('exception', this, 'response', request.action, {
            response: null,
            options : request.options
        });
        
        if (typeof request.callback == 'function') {
            request.callback.call(request.scope || window, null, request.options, false);
        }        
    }
});

Ext.data.ScriptTagProxy.TRANS_ID = 1000;

Ext.data.ProxyMgr.registerType('scripttag', Ext.data.ScriptTagProxy);
/**
 * @class Ext.data.ClientProxy
 * @extends Ext.data.Proxy
 * <p>Base class for any client-side storage. Used as a superclass for {@link Ext.data.MemoryProxy Memory} and 
 * {@link Ext.data.WebStorageProxy Web Storage} proxies. Do not use directly, use one of the subclasses instead.</p>
 */
Ext.data.ClientProxy = Ext.extend(Ext.data.Proxy, {
    /**
     * Abstract function that must be implemented by each ClientProxy subclass. This should purge all record data
     * from the client side storage, as well as removing any supporting data (such as lists of record IDs)
     */
    clear: function() {
        throw new Error("The Ext.data.ClientProxy subclass that you are using has not defined a 'clear' function. See src/data/ClientProxy.js for details.");
    }
});
/**
 * @class Ext.data.MemoryProxy
 * @extends Ext.data.ClientProxy
 * <p>In-memory proxy. This proxy simply uses a local variable for data storage/retrieval, so its contents are
 * lost on every page refresh.</p>
 */
Ext.data.MemoryProxy = Ext.extend(Ext.data.ClientProxy, {
    constructor: function(config) {
        Ext.data.MemoryProxy.superclass.constructor.call(this, config);
        
        this.data = {};
    }
});

Ext.data.ProxyMgr.registerType('memory', Ext.data.MemoryProxy);
/**
 * @class Ext.data.WebStorageProxy
 * @extends Ext.data.ClientProxy
 * <p>Abstract base class for {@link Ext.data.LocalStorageProxy} and {@link Ext.data.SessionStorageProxy}, simply
 * provides common functionality between those classes as the browser APIs for them are essentially identical.
 * Don't use this proxy directly, use one of those subclasses instead.</p>
 * @constructor
 * Creates the proxy, throws an error if local storage is not supported in the current browser
 * @param {Object} config Optional config object
 */
Ext.data.WebStorageProxy = Ext.extend(Ext.data.ClientProxy, {
    /**
     * @cfg {String} id The unique ID used as the key in which all record data are stored in the local storage object
     */
    id: undefined,
    
    /**
     * @ignore
     */
    constructor: function(config) {
        Ext.data.WebStorageProxy.superclass.constructor.call(this, config);
        
        if (this.getStorageObject() == undefined) {
            throw new Error("Local Storage is not supported in this browser, please use another type of data proxy");
        }
        
        //if an id is not given, try to use the store's id instead
        this.id = this.id || (this.store ? this.store.storeId : undefined);
        
        if (this.id == undefined) {
            throw new Error("No unique id was provided to the local storage proxy. See Ext.data.LocalStorageProxy documentation for details");
        }
        
        this.initialize();
    },
    
    //inherit docs
    create: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),
            i, record;
        
        for (i = 0; i < length; i++) {
            record = records[i];
            
            if (record.phantom) {
                record.phantom = false;
                
                var id = this.getNextId();
                this.setRecord(record, id);

                ids.push(id);
            }
        }
        
        this.setIds(ids);
        
        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    
    //inherit docs
    read: function(operation, callback, scope) {
        //TODO: respect sorters, filters, start and limit options on the Operation
        
        var records = [],
            ids     = this.getIds(),
            length  = ids.length,
            i, recordData, record;
            
        for (i = 0; i < length; i++) {
            records.push(this.getRecord(ids[i]));
        }
        
        operation.resultSet = new Ext.data.ResultSet({
            records: records,
            total  : records.length,
            loaded : true
        });
        
        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    
    //inherit docs
    update: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            i;
        
        for (i = 0; i < length; i++) {
            this.setRecord(records[i]);
        }
        
        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    
    //inherit
    destroy: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),
            
            //newIds is a copy of ids, from which we remove the destroyed records
            newIds  = [].concat(ids),
            i;

        for (i = 0; i < length; i++) {
            newIds.remove(ids[i]);
            this.removeRecord(ids[i], false);
        }
        
        this.setIds(newIds);
        
        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    
    /**
     * @private
     * Fetches a model instance from the Proxy by ID. Runs each field's decode function (if present) to decode the data
     * @param {String} id The record's unique ID
     * @return {Ext.data.Model} The model instance
     */
    getRecord: function(id) {
        var rawData = Ext.decode(this.getStorageObject().getItem(this.getRecordKey(id))),
            data    = {},
            model   = this.model,
            fields  = model.prototype.fields.items,
            length  = fields.length,
            i, field, name;
            
        for (i = 0; i < length; i++) {
            field = fields[i];
            name  = field.name;
            
            if (typeof field.decode == 'function') {
                data[name] = field.decode(rawData[name]);
            } else {
                data[name] = rawData[name];
            }
        }
        
        var record = new model(data);
        record.phantom = false;
        
        return record;
    },
    
    /**
     * Saves the given record in the Proxy. Runs each field's encode function (if present) to encode the data
     * @param {Ext.data.Model} record The model instance
     * @param {String} id The id to save the record under (defaults to the value of the record's getId() function)
     */
    setRecord: function(record, id) {
        if (id) {
            record.setId(id);
        } else {
            id = record.getId();
        }
        
        var rawData = record.data,
            data    = {},
            model   = this.model,
            fields  = model.prototype.fields.items,
            length  = fields.length,
            i, field, name;
        
        for (i = 0; i < length; i++) {
            field = fields[i];
            name  = field.name;
            
            if (typeof field.encode == 'function') {
                data[name] = field.encode(rawData[name], record);
            } else {
                data[name] = rawData[name];
            }
        }
        
        var obj = this.getStorageObject(),
            key = this.getRecordKey(id);
        
        //iPad bug requires that we remove the item before setting it
        obj.removeItem(key);
        obj.setItem(key, Ext.encode(data));
    },
    
    /**
     * @private
     * Physically removes a given record from the local storage. Used internally by {@link #destroy}, which you should
     * use instead because it updates the list of currently-stored record ids
     * @param {String|Number|Ext.data.Model} id The id of the record to remove, or an Ext.data.Model instance
     */
    removeRecord: function(id, updateIds) {
        if (id instanceof Ext.data.Model) {
            id = id.getId();
        }
        
        if (updateIds !== false) {
            var ids = this.getIds();
            ids.remove(id);
            this.setIds(ids);
        }
        
        this.getStorageObject().removeItem(this.getRecordKey(id));
    },
    
    /**
     * @private
     * Given the id of a record, returns a unique string based on that id and the id of this proxy. This is used when
     * storing data in the local storage object and should prevent naming collisions.
     * @param {String|Number|Ext.data.Model} id The record id, or a Model instance
     * @return {String} The unique key for this record
     */
    getRecordKey: function(id) {
        if (id instanceof Ext.data.Model) {
            id = id.getId();
        }
        
        return String.format("{0}-{1}", this.id, id);
    },
    
    /**
     * @private
     * Returns the unique key used to store the current record counter for this proxy. This is used internally when
     * realizing models (creating them when they used to be phantoms), in order to give each model instance a unique id.
     * @return {String} The counter key
     */
    getRecordCounterKey: function() {
        return String.format("{0}-counter", this.id);
    },
    
    /**
     * @private
     * Returns the array of record IDs stored in this Proxy
     * @return {Array} The record IDs
     */
    getIds: function() {
        var ids = (this.getStorageObject().getItem(this.id) || "").split(",");
        
        if (ids.length == 1 && ids[0] == "") {
            ids = [];
        }
        
        return ids;
    },
    
    /**
     * @private
     * Saves the array of ids representing the set of all records in the Proxy
     * @param {Array} ids The ids to set
     */
    setIds: function(ids) {
        var obj = this.getStorageObject(),
            str = ids.join(",");
        
        if (Ext.isEmpty(str)) {
            obj.removeItem(this.id);
        } else {
            obj.setItem(this.id,  str);
        }
    },
    
    /**
     * @private
     * Returns the next numerical ID that can be used when realizing a model instance (see getRecordCounterKey). Increments
     * the counter.
     * @return {Number} The id
     */
    getNextId: function() {
        var obj  = this.getStorageObject(),
            key  = this.getRecordCounterKey(),
            last = +obj[key],
            id   = last ? last + 1 : 1;
        
        obj.setItem(key, id);
        
        return parseInt(id, 10);
    },
    
    /**
     * @private
     * Sets up the Proxy by claiming the key in the storage object that corresponds to the unique id of this Proxy. Called
     * automatically by the constructor, this should not need to be called again unless {@link #clear} has been called.
     */
    initialize: function() {
        var storageObject = this.getStorageObject();
        storageObject.setItem(this.id, storageObject.getItem(this.id) || "");
    },
    
    /**
     * Destroys all records stored in the proxy and removes all keys and values used to support the proxy from the storage object
     */
    clear: function() {
        var obj = this.getStorageObject(),
            ids = this.getIds(),
            len = ids.length,
            i;
        
        //remove all the records
        for (i = 0; i < len; i++) {
            this.removeRecord(ids[i]);
        }
        
        //remove the supporting objects
        obj.removeItem(this.getRecordCounterKey());
        obj.removeItem(this.id);
    },
    
    /**
     * @private
     * Abstract function which should return the storage object that data will be saved to. This must be implemented
     * in each subclass.
     * @return {Object} The storage object
     */
    getStorageObject: function() {
        throw new Error("The getStorageObject function has not been defined in your Ext.data.WebStorageProxy subclass");
    }
});
/**
 * @class Ext.data.LocalStorageProxy
 * @extends Ext.data.WebStorageProxy
 * <p>Proxy which uses HTML5 local storage as its data storage/retrieval mechanism.
 * If this proxy is used in a browser where local storage is not supported, the constructor will throw an error. 
 * A local storage proxy requires a unique ID which is used as a key in which all record data are stored in the
 * local storage object.</p>
 * <p>It's important to supply this unique ID as it cannot be reliably determined otherwise. If no id is provided
 * but the attached store has a storeId, the storeId will be used. If neither option is presented the proxy will
 * throw an error.</p>
 * <p>Proxies are almost always used with a {@link Ext.data.Store store}:<p>
<pre><code>
new Ext.data.Store({
    proxy: {
        type: 'localstorage',
        id  : 'myProxyKey'
    }
});
</code></pre>
 * <p>Alternatively you can instantiate the Proxy directly:</p>
<pre><code>
new Ext.data.LocalStorageProxy({
    id  : 'myOtherProxyKey'
});
</code></pre>
 */
Ext.data.LocalStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    //inherit docs
    getStorageObject: function() {
        return localStorage;
    }
});

Ext.data.ProxyMgr.registerType('localstorage', Ext.data.LocalStorageProxy);
/**
 * @class Ext.data.SessionStorageProxy
 * @extends Ext.data.WebStorageProxy
 * <p>Proxy which uses HTML5 session storage as its data storage/retrieval mechanism.
 * If this proxy is used in a browser where session storage is not supported, the constructor will throw an error. 
 * A session storage proxy requires a unique ID which is used as a key in which all record data are stored in the
 * session storage object.</p>
 * <p>It's important to supply this unique ID as it cannot be reliably determined otherwise. If no id is provided
 * but the attached store has a storeId, the storeId will be used. If neither option is presented the proxy will
 * throw an error.</p>
 * <p>Proxies are almost always used with a {@link Ext.data.Store store}:<p>
<pre><code>
new Ext.data.Store({
    proxy: {
        type: 'sessionstorage',
        id  : 'myProxyKey'
    }
});
</code></pre>
 * <p>Alternatively you can instantiate the Proxy directly:</p>
<pre><code>
new Ext.data.SessionStorageProxy({
    id  : 'myOtherProxyKey'
});
 </code></pre>
 * <p>Note that session storage is different to local storage (see {@link Ext.data.LocalStorageProxy}) - if a browser
 * session is ended (e.g. by closing the browser) then all data in a SessionStorageProxy are lost. Browser restarts
 * don't affect the {@link Ext.data.LocalStorageProxy} - the data are preserved.</p>
 */
Ext.data.SessionStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    //inherit docs
    getStorageObject: function() {
        return sessionStorage;
    }
});

Ext.data.ProxyMgr.registerType('sessionstorage', Ext.data.SessionStorageProxy);
/**
 * @class Ext.data.Reader
 * @extends Object
 * <p>Base Reader class used by most subclasses of {@link Ext.data.ServerProxy}. Readers
 * are used to parse the (string) response of some server request, returning a set of 
 * {@link Ext.data.Model} instances.</p>
 * <p>These classes are not usually instantiated directly, instead the {@link Ext.data.Proxy}
 * will create a Reader as needed.</p>
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Reader = Ext.extend(Object, {
    /**
     * @cfg {String} idProperty Name of the property within a row object
     * that contains a record identifier value.
     */
    
    /**
     * @cfg {String} totalProperty Name of the property from which to
     * retrieve the total number of records in the dataset. This is only needed
     * if the whole dataset is not passed in one go, but is being paged from
     * the remote server.
     */
    
    /**
     * @cfg {String} successProperty Name of the property from which to
     * retrieve the success attribute. See
     * {@link Ext.data.DataProxy}.{@link Ext.data.DataProxy#exception exception}
     * for additional information.
     */
    
    /**
     * @cfg {String} root <b>Required</b>.  The name of the property
     * which contains the Array of row objects.  Defaults to <tt>undefined</tt>.
     * An exception will be thrown if the root property is undefined. The data
     * packet value for this property should be an empty array to clear the data
     * or show no data.
     */
    root: '',
    
    constructor: function(config) {
        Ext.apply(this, config || {});
        
        this.model = Ext.ModelMgr.getModel(config.model);
        if (this.model) {
            this.buildExtractors();
        }
    },
    
    /**
     * Sets a new model for the reader.
     * @private
     * @param {Object} model The model to set.
     */
    setModel: function(model){
        this.model = Ext.ModelMgr.getModel(model);
        delete this.extractorFunctions;
        this.buildExtractors();
    },
    
    /**
     * Reads the given response object. This method normalizes the different types of response object that may be passed
     * to it, before handing off the reading of records to the {@link readRecords} function.
     * @param {Object} response The response object. This may be either an XMLHttpRequest object or a plain JS object
     * @return {Ext.data.ResultSet} The parsed ResultSet object
     */
    read: function(response) {
        var data = response;
        
        if (response.responseText) {
            data = this.getResponseData(response);
        }
        
        return this.readRecords(data);
    },
    
    /**
     * Abstracts common functionality used by all Reader subclasses. Each subclass is expected to call
     * this function before running its own logic and returning the Ext.data.ResultSet instance. For most
     * Readers additional processing should not be needed.
     * @param {Mixed} data The raw data object
     * @return {Ext.data.ResultSet} A ResultSet object
     */
    readRecords: function(data) {
        /**
         * The raw data object that was last passed to readRecords. Stored for further processing if needed
         * @property rawData
         * @type Mixed
         */
        this.rawData = data;
        
        var data    = this.getData(data),
            root    = this.getRoot(data),
            total   = root.length,
            success = true;
        
        if (this.totalProperty) {
            var value = parseInt(this.getTotal(data), 10);
            
            if (!isNaN(value)) {
                total = value;
            }
        }
        
        if (this.successProperty) {
            var value = this.getSuccess(data);
            
            if (value === false || value === 'false') {
                success = false;
            }
        }
        
        var records = this.extractData(root, true);
        
        return new Ext.data.ResultSet({
            total  : total || records.length,
            count  : records.length,
            records: records,
            success: success
        });
    },
    
    /**
     * Returns extracted, type-cast rows of data.  Iterates to call #extractValues for each row
     * @param {Object[]/Object} data-root from server response
     * @param {Boolean} returnRecords [false] Set true to return instances of Ext.data.Record
     * @private
     */
    extractData : function(root, returnRecords) {
        var values  = [],
            records = [],
            model   = this.model,
            length  = root.length,
            idProp  = this.idProperty;
        
        for (var i = 0; i < length; i++) {
            var node   = root[i],
                values = this.extractValues(node),
                id     = this.getId(node);
            
            if (returnRecords === true) {
                var record = new model(values, id);
                record.raw = node;
                records.push(record);
            } else {
                values[idProperty] = id;
                records.push(values);
            }
        }
        
        return records;
    },
    
    /**
     * @private
     * Given an object representing a single model instance's data, iterates over the model's fields and 
     * builds an object with the value for each field, running the field's convert function first if present
     * @param {Object} data The data object to convert
     * @return {Object} Data object suitable for use with a model constructor
     */
    extractValues: function(data) {
        var fields = this.model.prototype.fields.items,
            length = fields.length,
            output = {};
        
        for (var i = 0; i < length; i++) {
            var field = fields[i],
                value = this.extractorFunctions[i](data) || field.defaultValue;
            
            output[field.name] = field.convert(value, data);
        }
        
        return output;
    },
    
    /**
     * @private
     * By default this function just returns what is passed to it. It can be overridden in a subclass
     * to return something else. See XmlReader for an example.
     * @param {Object} data The data object
     * @return {Object} The normalized data object
     */
    getData: function(data) {
        return data;
    },
    
    /**
     * @private
     * This will usually need to be implemented in a subclass. Given a generic data object (the type depends on the type
     * of data we are reading), this function should return the object as configured by the Reader's 'root' meta data config.
     * See XmlReader's getRoot implementation for an example. By default the same data object will simply be returned.
     * @param {Mixed} data The data object
     * @return {Mixed} The same data object
     */
    getRoot: function(data) {
        return data;
    },
    
    /**
     * Takes a raw response object (as passed to this.read) and returns the useful data segment of it. This must be implemented by each subclass
     * @param {Object} response The responce object
     * @return {Object} The useful data from the response
     */
    getResponseData: function(response) {
        throw new Error("getResponseData must be implemented in the Ext.data.Reader subclass");
    },
    
    /**
     * @private
     * Reconfigures the meta data tied to this Reader
     */
    onMetaChange : function(meta) {
        Ext.apply(this, meta || {});
        
        delete this.extractorFunctions;
        this.buildExtractors();
    },
    
    /**
     * @private
     * This builds optimized functions for retrieving record data and meta data from an object.
     * Subclasses may need to implement their own getRoot function.
     */
    buildExtractors: function() {
        if (this.extractorFunctions) {
            return;
        }
        
        var idProp      = this.id || this.idProperty,
            totalProp   = this.totalProperty,
            successProp = this.successProperty,
            messageProp = this.messageProperty;
        
        //build the extractors for all the meta data
        if (totalProp) {
            this.getTotal = this.createAccessor(totalProp);
        }
        
        if (successProp) {
            this.getSuccess = this.createAccessor(successProp);
        }
        
        if (messageProp) {
            this.getMessage = this.createAccessor(messageProp);
        }
        
        if (idProp) {
            var accessor = this.createAccessor(idProp);
            
            this.getId = function(record) {
                var id = accessor(record);
                
                return (id == undefined || id == '') ? null : id;
            };
        } else {
            this.getId = function() {
                return null;
            };
        }
        
        //now build the extractors for all the fields
        var fields = this.model.prototype.fields.items,
            extractorFunctions = [];
        
        for (var i = 0, length = fields.length; i < length; i++) {
            var field = fields[i],
                map   = (field.mapping !== undefined && field.mapping !== null) ? field.mapping : field.name;
            
            extractorFunctions.push(this.createAccessor(map));
        }
        
        this.extractorFunctions = extractorFunctions;
    }
});
/**
 * @class Ext.data.Writer
 * @extends Object
 * <p>Base Writer class used by most subclasses of {@link Ext.data.ServerProxy}. This class is
 * responsible for taking a set of {@link Ext.data.Operation} objects and a {@link Ext.data.Request}
 * object and modifying that request based on the Operations.</p>
 * <p>For example a {@link Ext.data.JsonWriter}
 * would format the Operations and their {@link Ext.data.Model} instances based on the config options
 * passed to the {@link Ext.data.JsonWriter JsonWriter's} constructor.</p>
 * <p>Writers are not needed for any kind of local storage - whether via a 
 * {@link Ext.data.WebStorageProxy Web Storage proxy} (see {@link Ext.data.LocalStorageProxy localStorage}
 * and {@link Ext.data.SessionStorageProxy sessionStorage}) or just in memory via a 
 * {@link Ext.data.MemoryProxy MemoryProxy}.</p>
 * @param {Object} config Optional config object
 */
Ext.data.Writer = Ext.extend(Object, {
    
    constructor: function(config) {
        Ext.apply(this, config);
    },
    
    /**
     * Prepares a Proxy's Ext.data.Request object 
     * @param {Ext.data.Request} request The request object
     * @return {Ext.data.Request} The modified request object
     */
    write: function(request) {
        var operation = request.operation,
            records   = operation.records || [],
            data      = [];
        
        for (var i = 0, length = records.length; i < length; i++) {
            data.push(this.getRecordData(records[i]));
        }
        return this.writeRecords(request, data);
    },
    
    /**
     * Formats the data for each record before sending it to the server. This
     * method should be overridden to format the data in a way that differs from the default.
     * @param {Object} record The record that we are writing to the server.
     * @return {Object} An object literal of name/value keys to be written to the server.
     * By default this method returns the data property on the record.
     */
    getRecordData: function(record){
        return record.data;
    }
});

Ext.data.WriterMgr.registerType('base', Ext.data.Writer);
/**
 * @class Ext.data.JsonWriter
 * @extends Ext.data.Writer
 * Writer that outputs model data in JSON format
 */
Ext.data.JsonWriter = Ext.extend(Ext.data.Writer, {
    /**
     * @cfg {String} root The key under which the records in this Writer will be placed. Defaults to 'records'.
     * Example generated request:
<pre><code>
{'records': [{name: 'my record'}, {name: 'another record'}]}
</code></pre>
     */
    root: 'records',
    
    /**
     * @cfg {Boolean} encode True to use Ext.encode() on the data before sending. Defaults to <tt>false</tt>.
     */
    encode: false,
    
    //inherit docs
    writeRecords: function(request, data) {
        if (this.encode === true) {
            data = Ext.encode(data);
        }
        
        request.jsonData = request.jsonData || {};
        request.jsonData[this.root] = data;
        
        return request;
    }
});

Ext.data.WriterMgr.registerType('json', Ext.data.JsonWriter);

/**
 * @class Ext.data.JsonReader
 * @extends Ext.data.Reader
 * <p>Data reader class to create an Array of {@link Ext.data.Model} objects from a 
 * JSON packet based on mappings in a provided Ext.data.Model constructor.</p>
 * <p>Example code:</p>
<pre><code>
var myReader = new Ext.data.Store({
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            // metadata configuration options:
            idProperty: 'id'
            root: 'rows',
            totalProperty: 'results'
        }
    },
    
    // the fields config option will internally create an Ext.data.Model
    // constructor that provides mapping for reading the record data objects
    fields: [
        // map Record's 'firstname' field to data object's key of same name
        {name: 'name'},
        // map Record's 'job' field to data object's 'occupation' key
        {name: 'job', mapping: 'occupation'}
    ],
});
</code></pre>
 * <p>This would consume a JSON data object of the form:</p>
<pre><code>
{
    results: 2000, // Reader's configured totalProperty
    rows: [        // Reader's configured root
        // record data objects:
        { id: 1, firstname: 'Bill', occupation: 'Gardener' },
        { id: 2, firstname: 'Ben' , occupation: 'Horticulturalist' },
        ...
    ]
}
</code></pre>
 */
Ext.data.JsonReader = Ext.extend(Ext.data.Reader, {

    /**
     * Reads a JSON object and returns a ResultSet. Uses the internal getTotal and getSuccess extractors to
     * retrieve meta data from the response, and extractData to turn the JSON data into model instances.
     * @param {Object} data The raw JSON data
     * @return {Ext.data.ResultSet} A ResultSet containing model instances and meta data about the results
     */
    readRecords: function(data) {
        //this has to be before the call to super because we use the meta data in the superclass readRecords
        if (data.metaData) {
            this.onMetaChange(data.metaData);
        }
        
        /**
         * DEPRECATED - will be removed in Ext JS 5.0. This is just a copy of this.rawData - use that instead
         * @property jsonData
         * @type Mixed
         */
        this.jsonData = data;
        
        return Ext.data.JsonReader.superclass.readRecords.call(this, data);
    },
    
    //inherit docs
    getResponseData: function(response) {
        var data = Ext.decode(response.responseText);
        
        if (!data) {
            throw {message: 'Ext.data.JsonReader.read: Json object not found'};
        }
        
        return data;
    },
    
    //inherit docs
    buildExtractors : function() {
        Ext.data.JsonReader.superclass.buildExtractors.apply(this, arguments);
        
        if (this.root) {
            this.getRoot = this.createAccessor(this.root);
        } else {
            this.getRoot = function(root) {
                return root;
            };
        }
    },
    
    /**
     * @private
     * Returns an accessor function for the given property string. Gives support for properties such as the following:
     * 'someProperty'
     * 'some.property'
     * 'some["property"]'
     * This is used by buildExtractors to create optimized extractor functions when casting raw data into model instances.
     */
    createAccessor : function() {
        var re = /[\[\.]/;
        
        return function(expr) {
            if (Ext.isEmpty(expr)) {
                return Ext.emptyFn;
            }
            if (Ext.isFunction(expr)) {
                return expr;
            }
            var i = String(expr).search(re);
            if (i >= 0) {
                return new Function('obj', 'return obj' + (i > 0 ? '.' : '') + expr);
            }
            return function(obj) {
                return obj[expr];
            };
        };
    }()
});

Ext.data.ReaderMgr.registerType('json', Ext.data.JsonReader);
/**
 * @class Ext.data.ArrayReader
 * @extends Ext.data.JsonReader
 * <p>Data reader class to create an Array of {@link Ext.data.Record} objects from an Array.
 * Each element of that Array represents a row of data fields. The
 * fields are pulled into a Record object using as a subscript, the <code>mapping</code> property
 * of the field definition if it exists, or the field's ordinal position in the definition.</p>
 * <p>Example code:</p>
 * <pre><code>
var Employee = Ext.data.Record.create([
    {name: 'name', mapping: 1},         // "mapping" only needed if an "id" field is present which
    {name: 'occupation', mapping: 2}    // precludes using the ordinal position as the index.
]);
var myReader = new Ext.data.ArrayReader({
    {@link #idIndex}: 0
}, Employee);
</code></pre>
 * <p>This would consume an Array like this:</p>
 * <pre><code>
[ [1, 'Bill', 'Gardener'], [2, 'Ben', 'Horticulturalist'] ]
 * </code></pre>
 * @constructor
 * Create a new ArrayReader
 * @param {Object} meta Metadata configuration options.
 * @param {Array/Object} recordType
 * <p>Either an Array of {@link Ext.data.Field Field} definition objects (which
 * will be passed to {@link Ext.data.Record#create}, or a {@link Ext.data.Record Record}
 * constructor created from {@link Ext.data.Record#create}.</p>
 */
Ext.data.ArrayReader = Ext.extend(Ext.data.JsonReader, {

    /**
     * @private
     * Most of the work is done for us by JsonReader, but we need to overwrite the field accessors to just
     * reference the correct position in the array.
     */
    buildExtractors: function() {
        Ext.data.ArrayReader.superclass.buildExtractors.apply(this, arguments);
        
        var fields = this.model.prototype.fields.items,
            length = fields.length,
            extractorFunctions = [],
            i;
        
        for (i = 0; i < length; i++) {
            extractorFunctions.push(function(index) {
                return function(data) {
                    return data[index];
                };
            }(fields[i].mapping || i));
        }
        
        this.extractorFunctions = extractorFunctions;
    }
});

Ext.data.ReaderMgr.registerType('array', Ext.data.ArrayReader);

/**
 * @class Ext.data.ArrayStore
 * @extends Ext.data.Store
 * <p>Small helper class to make creating {@link Ext.data.Store}s from Array data easier.
 * An ArrayStore will be automatically configured with a {@link Ext.data.ArrayReader}.</p>
 * <p>A store configuration would be something like:<pre><code>
var store = new Ext.data.ArrayStore({
    // store configs
    autoDestroy: true,
    storeId: 'myStore',
    // reader configs
    idIndex: 0,  
    fields: [
       'company',
       {name: 'price', type: 'float'},
       {name: 'change', type: 'float'},
       {name: 'pctChange', type: 'float'},
       {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'}
    ]
});
 * </code></pre></p>
 * <p>This store is configured to consume a returned object of the form:<pre><code>
var myData = [
    ['3m Co',71.72,0.02,0.03,'9/1 12:00am'],
    ['Alcoa Inc',29.01,0.42,1.47,'9/1 12:00am'],
    ['Boeing Co.',75.43,0.53,0.71,'9/1 12:00am'],
    ['Hewlett-Packard Co.',36.53,-0.03,-0.08,'9/1 12:00am'],
    ['Wal-Mart Stores, Inc.',45.45,0.73,1.63,'9/1 12:00am']
];
 * </code></pre>
 * An object literal of this form could also be used as the {@link #data} config option.</p>
 * <p><b>*Note:</b> Although not listed here, this class accepts all of the configuration options of 
 * <b>{@link Ext.data.ArrayReader ArrayReader}</b>.</p>
 * @constructor
 * @param {Object} config
 * @xtype arraystore
 */
Ext.data.ArrayStore = Ext.extend(Ext.data.Store, {
    /**
     * @cfg {Ext.data.DataReader} reader @hide
     */
    constructor: function(config) {
        config = config || {};
              
        Ext.applyIf(config, {
            proxy: {
                type: 'memory',
                reader: 'array'
            }
        });
        
        Ext.data.ArrayStore.superclass.constructor.call(this, config);
    },

    loadData : function(data, append){
        if (this.expandData === true) {
            var r = [],
                i, len;
                
            for(i = 0, len = data.length; i < len; i++){
                r[r.length] = [data[i]];
            }
            
            data = r;
        }
        
        Ext.data.ArrayStore.superclass.loadData.call(this, data, append);
    }
});
Ext.reg('arraystore', Ext.data.ArrayStore);

// backwards compat
Ext.data.SimpleStore = Ext.data.ArrayStore;
Ext.reg('simplestore', Ext.data.SimpleStore);
/**
 * @class Ext.data.JsonStore
 * @extends Ext.data.Store
 * <p>Small helper class to make creating {@link Ext.data.Store}s from JSON data easier.
 * A JsonStore will be automatically configured with a {@link Ext.data.JsonReader}.</p>
 * <p>A store configuration would be something like:</p>
<pre><code>
var store = new Ext.data.JsonStore({
    // store configs
    autoDestroy: true,
    storeId: 'myStore'
    
    proxy: {
        type: 'ajax',
        url: 'get-images.php',
        reader: {
            type: 'json',
            root: 'images',
            idProperty: 'name'
        }
    },
    
    //alternatively, a {@link Ext.data.Model} name can be given (see {@link Ext.data.Store} for an example)
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date'}]
});
 * </code></pre></p>
 * <p>This store is configured to consume a returned object of the form:<pre><code>
{
    images: [
        {name: 'Image one', url:'/GetImage.php?id=1', size:46.5, lastmod: new Date(2007, 10, 29)},
        {name: 'Image Two', url:'/GetImage.php?id=2', size:43.2, lastmod: new Date(2007, 10, 30)}
    ]
}
</code></pre>
 * <p>An object literal of this form could also be used as the {@link #data} config option.</p>
 * @constructor
 * @param {Object} config
 * @xtype jsonstore
 */
Ext.data.JsonStore = Ext.extend(Ext.data.Store, {
    /**
     * @cfg {Ext.data.DataReader} reader @hide
     */
    constructor: function(config) {
        config = config || {};
              
        Ext.applyIf(config, {
            proxy: {
                type  : 'ajax',
                reader: 'json',
                writer: 'json'
            }
        });
        
        Ext.data.JsonStore.superclass.constructor.call(this, config);
    }
});

Ext.reg('jsonstore', Ext.data.JsonStore);
/**
 * @class Ext.data.JsonPStore
 * @extends Ext.data.Store
 * @ignore
 * @private
 * <p><b>NOTE:</b> This class is in need of migration to the new API.</p>
 * <p>Small helper class to make creating {@link Ext.data.Store}s from different domain JSON data easier.
 * A JsonPStore will be automatically configured with a {@link Ext.data.JsonReader} and a {@link Ext.data.ScriptTagProxy ScriptTagProxy}.</p>
 * <p>A store configuration would be something like:<pre><code>
var store = new Ext.data.JsonPStore({
    // store configs
    autoDestroy: true,
    storeId: 'myStore',
    
    // proxy configs
    url: 'get-images.php',
    
    // reader configs
    root: 'images',
    idProperty: 'name',
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date'}]
});
 * </code></pre></p>
 * <p>This store is configured to consume a returned object of the form:<pre><code>
stcCallback({
    images: [
        {name: 'Image one', url:'/GetImage.php?id=1', size:46.5, lastmod: new Date(2007, 10, 29)},
        {name: 'Image Two', url:'/GetImage.php?id=2', size:43.2, lastmod: new Date(2007, 10, 30)}
    ]
})
 * </code></pre>
 * <p>Where stcCallback is the callback name passed in the request to the remote domain. See {@link Ext.data.ScriptTagProxy ScriptTagProxy}
 * for details of how this works.</p>
 * An object literal of this form could also be used as the {@link #data} config option.</p>
 * <p><b>*Note:</b> Although not listed here, this class accepts all of the configuration options of
 * <b>{@link Ext.data.JsonReader JsonReader}</b> and <b>{@link Ext.data.ScriptTagProxy ScriptTagProxy}</b>.</p>
 * @constructor
 * @param {Object} config
 * @xtype jsonpstore
 */
Ext.data.JsonPStore = Ext.extend(Ext.data.Store, {
    /**
     * @cfg {Ext.data.DataReader} reader @hide
     */
    constructor: function(config){
        Ext.data.JsonPStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new Ext.data.JsonReader(config),
            proxy : new Ext.data.ScriptTagProxy(config)
        }));
    }
});

Ext.reg('jsonpstore', Ext.data.JsonPStore);
