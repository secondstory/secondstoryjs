/*
    Copyright(c) 2010 Sencha Inc.
    licensing@sencha.com
    http://www.sencha.com/touchlicense
*/



Ext = {
    
    version : '0.9.3',
    versionDetail : {
        major : 0,
        minor : 9,
        patch : 3
    }
};


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


Ext.apply = function(object, config, defaults) {
    
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

    
    emptyFn : function(){},

    
    isSecure : /^https/i.test(window.location.protocol),
    
    isReady : false,

    
    enableGarbageCollector : true,

    
    enableListenerCollection : true,

    
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

    
    repaint : function() {
        var mask = Ext.getBody().createChild({
            cls: 'x-mask x-mask-transparent'
        });        
        setTimeout(function() {
            mask.remove();
        }, 0);
    },

    
    id : function(el, prefix) {
        return (el = Ext.getDom(el) || {}).id = el.id || (prefix || "ext-gen") + (++Ext.idSeed);
    },

    
    extend : function() {
        
        var inlineOverrides = function(o){
            for(var m in o){
                this[m] = o[m];
            }
        };

        var objectConstructor = Object.prototype.constructor;

        return function(subclass, superclass, overrides){
            
            if(Ext.isObject(superclass)){
                overrides = superclass;
                superclass = subclass;
                subclass = overrides.constructor != objectConstructor
                    ? overrides.constructor
                    : function(){ superclass.apply(this, arguments); };
            }

            
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

    
    override : function(origclass, overrides) {
        if (overrides) {
            Ext.apply(origclass.prototype, overrides);
        }
    },


    
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

    
    htmlEncode : function(value){
        return Ext.util.Format.htmlEncode(value);
    },

    
    htmlDecode : function(value){
         return Ext.util.Format.htmlDecode(value);
    },

    
    urlAppend : function(url, s){
        if(!Ext.isEmpty(s)){
            return url + (url.indexOf('?') === -1 ? '?' : '&') + s;
        }
        return url;
    },

    
     toArray : function(array, start, end){
        return Array.prototype.slice.call(array, start || 0, end || array.length);
     },

     
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
     
     
     pluck : function(arr, prop){
            var ret = [];
            Ext.each(arr, function(v) {
                ret.push( v[prop] );
            });
            return ret;
      },

     
    getDom : function(el) {
        if (!el || !document) {
            return null;
        }
        return el.dom ? el.dom : (typeof el == 'string' ? document.getElementById(el) : el);
    },

    
    getBody : function(){
        return Ext.get(document.body || false);
    },

    
    getDoc : function(){
        return Ext.get(document);
    },

    
    getCmp : function(id){
        return Ext.ComponentMgr.get(id);
    },

    
    getOrientation: function() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    },

    
    removeNode : function(n){
        if (n && n.parentNode && n.tagName != 'BODY') {
            Ext.EventManager.removeAll(n);
            n.parentNode.removeChild(n);
            delete Ext.cache[n.id];
        }
    },

    
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
        
        if(Ext.isArray(v) || v.callee){
            return true;
        }
        
        if(/NodeList|HTMLCollection/.test(Object.prototype.toString.call(v))){
            return true;
        }
        
        
        return ((typeof v.nextNode != 'undefined' || v.item) && Ext.isNumber(v.length));
    },

    
    num : function(v, defaultValue){
        v = Number(Ext.isEmpty(v) || Ext.isArray(v) || typeof v == 'boolean' || (typeof v == 'string' && v.trim().length == 0) ? NaN : v);
        return isNaN(v) ? defaultValue : v;
    },

    
    isEmpty : function(v, allowBlank) {
        return v == null || ((Ext.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
    },

    
    isArray : function(v) {
        return Object.prototype.toString.apply(v) === '[object Array]';
    },

    
    isDate : function(v) {
        return Object.prototype.toString.apply(v) === '[object Date]';
    },

    
    isObject : function(v) {
        return !!v && Object.prototype.toString.call(v) === '[object Object]';
    },

    
    isPrimitive : function(v) {
        return Ext.isString(v) || Ext.isNumber(v) || Ext.isBoolean(v);
    },

    
    isFunction : function(v) {
        return Object.prototype.toString.apply(v) === '[object Function]';
    },

    
    isNumber : function(v) {
        return Object.prototype.toString.apply(v) === '[object Number]' && isFinite(v);
    },

    
    isString : function(v) {
        return Object.prototype.toString.apply(v) === '[object String]';
    },

    
    isBoolean : function(v) {
        return Object.prototype.toString.apply(v) === '[object Boolean]';
    },

    
    isElement : function(v) {
        return !!v && v.tagName;
    },

    
    isDefined : function(v){
        return typeof v !== 'undefined';
    },

    
    escapeRe : function(s) {
        return s.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
    }
});


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


Ext.apply(Function.prototype, {
     
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

    
    createDelegate : function(obj, args, appendArgs) {
        var method = this;
        return function() {
            var callArgs = args || arguments;
            if (appendArgs === true) {
                callArgs = Array.prototype.slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }
            else if (Ext.isNumber(appendArgs)) {
                callArgs = Array.prototype.slice.call(arguments, 0); 
                var applyArgs = [appendArgs, 0].concat(args); 
                Array.prototype.splice.apply(callArgs, applyArgs); 
            }
            return method.apply(obj || window, callArgs);
        };
    },

    
    defer : function(millis, obj, args, appendArgs) {
        var fn = this.createDelegate(obj, args, appendArgs);
        if (millis > 0) {
            return setTimeout(fn, millis);
        }
        fn();
        return 0;
    }
});


Ext.applyIf(String.prototype, {
    
    escape : function(string) {
        return string.replace(/('|\\)/g, "\\$1");
    },

    
    toggle : function(value, other){
        return this == value ? other : value;
    },

    
    trim : function() {
        var re = /^\s+|\s+$/g;
        return function() {
            return this.replace(re, "");
        };
    }()
});


Ext.applyIf(String, {
    
    escape : function(string) {
        return string.replace(/('|\\)/g, "\\$1");
    },

    
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

    
    format : function(format){
        var args = Ext.toArray(arguments, 1);
        return format.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    }
});


Ext.applyIf(Date.prototype, {
    getElapsed: function(date) {
        return Math.abs((date || new Date()).getTime()-this.getTime());
    }
});


Ext.applyIf(Array.prototype, {
    
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


Ext.applyIf(Number.prototype, {
    
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



(function() {
var El = Ext.Element = Ext.extend(Object, {
    
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

        
        this.dom = dom;

        
        this.id = id || Ext.id(dom);
        
    },

    
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

    
    is : function(simpleSelector) {
        return Ext.DomQuery.is(this.dom, simpleSelector);
    },

    
    getValue : function(asNumber){
        var val = this.dom.value;
        return asNumber ? parseInt(val, 10) : val;
    },

    
    addListener : function(eventName, fn, scope, options){
        Ext.EventManager.on(this.dom,  eventName, fn, scope || this, options);
        return this;
    },

    
    removeListener : function(eventName, fn, scope) {
        Ext.EventManager.un(this.dom, eventName, fn, scope);
        return this;
    },

    
    removeAllListeners : function(){
        Ext.EventManager.removeAll(this.dom);
        return this;
    },

    
    purgeAllListeners : function() {
        Ext.EventManager.purgeElement(this, true);
        return this;
    },

    
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

    
    isDescendent : function(p) {
        return Ext.fly(p).isAncestorOf(this);
    },

    
    contains : function(el) {
        return !el ? false : this.isAncestor(el);
    },

    
    getAttribute : function(name, ns) {
        var d = this.dom;
        return d.getAttributeNS(ns, name) || d.getAttribute(ns + ":" + name) || d.getAttribute(name) || d[name];
    },

    
    setHTML : function(html) {
        if(this.dom) {
            this.dom.innerHTML = html;
        }
        return this;
    },

    
    getHTML : function() {
        return this.dom ? this.dom.innerHTML : '';
    },

    
    hide : function() {
        this.setVisible(false);
        return this;
    },

    
    show : function() {
        this.setVisible(true);
        return this;
    },

    
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


El.VISIBILITY = 1;

El.DISPLAY = 2;

El.OFFSETS = 3;


El.addMethods = function(o){
   Ext.apply(Elp, o);
};


Elp.on = Elp.addListener;
Elp.un = Elp.removeListener;


Elp.update = Elp.setHTML;


El.get = function(el){
    var extEl,
        dom,
        id;

    if(!el){
        return null;
    }

    if (typeof el == "string") { 
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
    } else if (el.tagName) { 
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
            
            
            el.dom = document.getElementById(el.id) || el.dom;
        }
        return el;
    } else if(el.isComposite) {
        return el;
    } else if(Ext.isArray(el)) {
        return El.select(el);
    } else if(el == document) {
        
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


El.addToCache = function(el, id){
    id = id || el.id;
    Ext.cache[id] = {
        el:  el,
        data: {},
        events: {}
    };
    return el;
};


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



El.Flyweight = function(dom) {
    this.dom = dom;
};

var F = function(){};
F.prototype = Elp;

El.Flyweight.prototype = new F;
El.Flyweight.prototype.isFlyweight = true;

El._flyweights = {};


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


Ext.get = El.get;


Ext.fly = El.fly;



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

    
    camelReplaceFn : function(m, a) {
        return a.charAt(1).toUpperCase();
    },

    
    normalize : function(prop) {
        return this.propertyCache[prop] || (this.propertyCache[prop] = prop == 'float' ? 'cssFloat' : prop.replace(this.camelRe, this.camelReplaceFn));
    },

    
    getDocumentHeight: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollHeight : document.documentElement.scrollHeight, this.getViewportHeight());
    },

    
    getDocumentWidth: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollWidth : document.documentElement.scrollWidth, this.getViewportWidth());
    },

    
    getViewportHeight: function(){
        return window.innerHeight;
    },

    
    getViewportWidth : function() {
        return window.innerWidth;
    },

    
    getViewSize : function() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },

    
    getOrientation : function() {
        return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
    },

    
    fromPoint: function(x, y) {
        return Ext.get(document.elementFromPoint(x, y));
    }
});


Ext.Element.addMethods({
    
    getY : function(el) {
        return this.getXY(el)[1];
    },

    
    getX : function(el) {
        return this.getXY(el)[0];
    },

    
    getXY : function() {
        
        var point = window.webkitConvertPointFromNodeToPage(this.dom, new WebKitPoint(0, 0));
        return [point.x, point.y];
    },

    
    getOffsetsTo : function(el){
        var o = this.getXY(),
            e = Ext.fly(el, '_internal').getXY();
        return [o[0]-e[0],o[1]-e[1]];
    },

    
    setXY : function(pos) {
        var me = this;

        if(arguments.length > 1) {
            pos = [pos, arguments[1]];
        }

        
        var pts = me.translatePoints(pos),
            style = me.dom.style;

        for (pos in pts) {
            if(!isNaN(pts[pos])) style[pos] = pts[pos] + "px";
        }
        return me;
    },

    
    setX : function(x){
        return this.setXY([x, this.getY()]);
    },

    
    setY : function(y) {
        return this.setXY([this.getX(), y]);
    },

    
    setLeft : function(left) {
        this.setStyle('left', Ext.Element.addUnits(left));
        return this;
    },

    
    setTop : function(top) {
        this.setStyle('top', Ext.Element.addUnits(top));
        return this;
    },

    
    setTopLeft: function(top, left) {
        var addUnits = Ext.Element.addUnits;

        this.setStyle('top', addUnits(top));
        this.setStyle('left', addUnits(left));

        return this;
    },

    
    setRight : function(right) {
        this.setStyle('right', Ext.Element.addUnits(right));
        return this;
    },

    
    setBottom : function(bottom) {
        this.setStyle('bottom', Ext.Element.addUnits(bottom));
        return this;
    },

    
    getLeft : function(local) {
        return parseInt(this.getStyle('left'), 10) || 0;
    },

    
    getRight : function(local) {
        return parseInt(this.getStyle('right'), 10) || 0;
    },

    
    getTop : function(local) {
        return parseInt(this.getStyle('top'), 10) || 0;
    },

    
    getBottom : function(local) {
        return parseInt(this.getStyle('bottom'), 10) || 0;
    },

    
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
	
	Ext.Element.classReCache = {};
	var El = Ext.Element,
        view = document.defaultView;
	
	El.addMethods({
	    marginRightRe: /marginRight/i,
	    trimRe: /^\s+|\s+$/g,
	    spacesRe: /\s+/,
	
	    
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
	
	    
	    toggleClass: function(className) {
	        return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	    },
	
	    
	    hasClass: function(className) {
	        return className && (' ' + this.dom.className + ' ').indexOf(' ' + className + ' ') != -1;
	    },
	
	    
	    replaceClass: function(oldClassName, newClassName) {
	        return this.removeClass(oldClassName).addClass(newClassName);
	    },
	
	    isStyle: function(style, val) {
	        return this.getStyle(style) == val;
	    },
	
	    
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
            
	        
	        if (!platform.correctTransparentColor && result == 'rgba(0, 0, 0, 0)') {
	            result = 'transparent';
	        }
	
	        return result;
	    },
	
	    
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
	
	    
	    getHeight: function(contentHeight) {
	        var dom = this.dom,
	            height = contentHeight ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight;
	        return height > 0 ? height: 0;
	    },
	
	    
	    getWidth: function(contentWidth) {
	        var dom = this.dom,
	            width = contentWidth ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth;
	        return width > 0 ? width: 0;
	    },
	
	    
	    setWidth: function(width) {
	        var me = this;
	            me.dom.style.width = El.addUnits(width);
	        return me;
	    },
	
	    
	    setHeight: function(height) {
	        var me = this;
	            me.dom.style.height = El.addUnits(height);
	        return me;
	    },
	
	    
	    setSize: function(width, height) {
	        var me = this;
	        if (Ext.isObject(width)) {
	            
	            height = width.height;
	            width = width.width;
	        }
	        me.dom.style.width = El.addUnits(width);
	        me.dom.style.height = El.addUnits(height);
	        return me;
	    },
	
	    
	    getBorderWidth: function(side) {
	        return this.sumStyles(side, El.borders);
	    },
	
	    
	    getPadding: function(side) {
	        return this.sumStyles(side, El.paddings);
	    },
	
	    
	    getMargin: function(side) {
	        return this.sumStyles(side, El.margins);
	    },
	
	    
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
	
	    
	    getSize: function(contentSize) {
            var dom = this.dom;
	        return {
	            width: Math.max(0, contentSize ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth),
	            height: Math.max(0, contentSize ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight)
	        };
	    },
	
	    
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
	
	    
	    getOuterWidth: function() {
	        return this.getWidth() + this.getMargin('lr');
	    },
	
	    
	    getOuterHeight: function() {
	        return this.getHeight() + this.getMargin('tb');
	    },
	
	    
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

Ext.Element.addMethods({
    
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

    
    findParentNode : function(simpleSelector, maxDepth, returnEl) {
        var p = Ext.fly(this.dom.parentNode, '_internal');
        return p ? p.findParent(simpleSelector, maxDepth, returnEl) : null;
    },

    
    up : function(simpleSelector, maxDepth) {
        return this.findParentNode(simpleSelector, maxDepth, true);
    },

    
    select : function(selector, composite) {
        return Ext.Element.select(selector, this.dom, composite);
    },

    
    query : function(selector) {
        return Ext.DomQuery.select(selector, this.dom);
    },

    
    down : function(selector, returnDom) {
        var n = Ext.DomQuery.selectNode(selector, this.dom);
        return returnDom ? n : Ext.get(n);
    },

    
    child : function(selector, returnDom) {
        var node,
            me = this,
            id;
        id = Ext.get(me).id;
        
        id = id.replace(/[\.:]/g, "\\$0");
        node = Ext.DomQuery.selectNode('#' + id + " > " + selector, me.dom);
        return returnDom ? node : Ext.get(node);
    },

     
    parent : function(selector, returnDom) {
        return this.matchNode('parentNode', 'parentNode', selector, returnDom);
    },

     
    next : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'nextSibling', selector, returnDom);
    },

    
    prev : function(selector, returnDom) {
        return this.matchNode('previousSibling', 'previousSibling', selector, returnDom);
    },


    
    first : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'firstChild', selector, returnDom);
    },

    
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


Ext.Element.addMethods({
    
    appendChild : function(el) {
        return Ext.get(el).appendTo(this);
    },

    
    appendTo : function(el) {
        Ext.getDom(el).appendChild(this.dom);
        return this;
    },

    
    insertBefore : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el);
        return this;
    },

    
    insertAfter : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el.nextSibling);
        return this;
    },

    
    insertFirst : function(el, returnDom) {
        el = el || {};
        if (el.nodeType || el.dom || typeof el == 'string') { 
            el = Ext.getDom(el);
            this.dom.insertBefore(el, this.dom.firstChild);
            return !returnDom ? Ext.get(el) : el;
        }
        else { 
            return this.createChild(el, this.dom.firstChild, returnDom);
        }
    },

    
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

    
    replace : function(el) {
        el = Ext.get(el);
        this.insertBefore(el);
        el.remove();
        return this;
    },

    
    createChild : function(config, insertBefore, returnDom) {
        config = config || {tag:'div'};
        if (insertBefore) {
            return Ext.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
        }
        else {
            return Ext.DomHelper[!this.dom.firstChild ? 'overwrite' : 'append'](this.dom, config,  returnDom !== true);
        }
    },

    
    wrap : function(config, returnDom) {
        var newEl = Ext.DomHelper.insertBefore(this.dom, config || {tag: "div"}, !returnDom);
        newEl.dom ? newEl.dom.appendChild(this.dom) : newEl.appendChild(this.dom);
        return newEl;
    },

    
    insertHtml : function(where, html, returnEl) {
        var el = Ext.DomHelper.insertHtml(where, this.dom, html);
        return returnEl ? Ext.get(el) : el;
    }
});


Ext.platform = {
    
    isWebkit: /webkit/i.test(Ext.userAgent),

    
    isPhone: /android|iphone/i.test(Ext.userAgent) && !(/ipad/i.test(Ext.userAgent)),

    
    isTablet: /ipad/i.test(Ext.userAgent),

    
    isChrome: /chrome/i.test(Ext.userAgent),

    
    isAndroidOS: /android/i.test(Ext.userAgent),

    
    isIPhoneOS: /iphone|ipad/i.test(Ext.userAgent),

    
    hasOrientationChange: ('onorientationchange' in window),

    
    hasTouch: ('ontouchstart' in window)
};




Ext.util.Observable = Ext.extend(Object, {
   
    
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

    
    filterOptRe : /^(?:scope|delay|buffer|single)$/,

    
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

    
    hasListener : function(ename){
        var e = this.events[ename];
        return e.isEvent === true && e.listeners.length > 0;
    },

    
    suspendEvents : function(queueSuspended) {
        this.eventsSuspended = true;
        if (queueSuspended && !this.eventQueue){
            this.eventQueue = [];
        }
    },

    
    resumeEvents : function(){
        var me = this,
            queued = me.eventQueue || [];

        me.eventsSuspended = false;
        delete me.eventQueue;

        Ext.each(queued, function(e) {
            me.fireEvent.apply(me, e);
        });
    },

    
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
    
    on: Ext.util.Observable.prototype.addListener,
    
    un: Ext.util.Observable.prototype.removeListener
});


Ext.util.Observable.releaseCapture = function(o){
    o.fireEvent = Ext.util.Observable.prototype.fireEvent;
};


Ext.util.Observable.capture = function(o, fn, scope) {
    o.fireEvent = o.fireEvent.createInterceptor(fn, scope);
};


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

                            
                if(listener.task) {
                    listener.task.cancel();
                    delete l.task;
                }

                            
                k = listener.tasks && listener.tasks.length;
                if(k) {
                    while(k--) {
                        listener.tasks[k].cancel();
                    }
                    delete listener.tasks;
                }

                            
                me.listeners.splice(index, 1);
                return true;
            }

                    return false;
        },

        
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


Ext.EventManager = {
    optionsRe: /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|horizontal|vertical)$/,
    touchRe: /^(?:pinch|pinchstart|tap|doubletap|swipe|swipeleft|swiperight|scroll|scrollstart|scrollend|touchstart|touchmove|touchend|taphold|tapstart|tapcancel)$/i,

    windowId: 'ext-window',
    documentId: 'ext-document',

    
    addListener : function(element, eventName, fn, scope, o){
        
        if (Ext.isObject(eventName)) {
            this.handleListenerConfig(element, eventName);
            return;
        }

        var dom = Ext.getDom(element);

        
        if (!dom){
            throw "Error listening for \"" + eventName + '\". Element "' + element + '" doesn\'t exist.';
        }

        if (!fn) {
            throw 'Error listening for "' + eventName + '". No handler function specified';
        }

        var touch = this.touchRe.test(eventName);

        
        var wrap = this.createListenerWrap(dom, eventName, fn, scope, o, touch);

        
        this.getEventListenerCache(dom, eventName).push({
            fn: fn,
            wrap: wrap,
            scope: scope
        });

        if (touch) {
            Ext.TouchEventManager.addEventListener(dom, eventName, wrap, o);
        }
        else {
            
            dom.addEventListener(eventName, wrap, false);
        }
    },

    
    removeListener : function(element, eventName, fn, scope) {
        
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

                
                if (wrap.task) {
                    clearTimeout(wrap.task);
                    delete wrap.task;
                }

                
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
                    
                    dom.removeEventListener(eventName, wrap, false);
                }

                
                cache.splice(i, 1);
            }
        }
    },

    
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

        
        for (key in config) {
            
            if (!this.optionsRe.test(key)) {
                value = config[key];
                
                
                if (Ext.isFunction(value)) {
                    
                    this[(remove ? 'remove' : 'add') + 'Listener'](element, key, value, config.scope, config);
                }
                
                else {
                    
                    this[(remove ? 'remove' : 'add') + 'Listener'](element, key, config.fn, config.scope, config);
                }
            }
        }
    },

    getId : function(element) {
        
        
        
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

    
    onDocumentReady : function(fn, scope, options){
        var me = this,
            readyEvent = me.readyEvent,
            intervalId;

        if(Ext.isReady){ 
            readyEvent || (readyEvent = new Ext.util.Event());
            readyEvent.addListener(fn, scope, options);
            readyEvent.fire();
            readyEvent.listeners = []; 
        }
        else {
            if(!readyEvent) {
                readyEvent = me.readyEvent = new Ext.util.Event();

                
                var fireReady = function() {
                    Ext.isReady = true;

                    
                    document.removeEventListener('DOMContentLoaded', arguments.callee, false);
                    window.removeEventListener('load', arguments.callee, false);

                    
                    if(intervalId) {
                        clearInterval(intervalId);
                    }
                    
                    
                    
                    setTimeout(function() {
                        var w = Ext.Element.getViewportWidth(),
                            h = Ext.Element.getViewportHeight();
                        Ext.orientation = Ext.Element.getOrientation();

                        Ext.TouchEventManager.init();

                        
                        readyEvent.fire({
                            orientation: Ext.orientation,
                            width: w,
                            height: h
                        });
                        readyEvent.listeners = [];                        
                    }, 300);
                };

                
                document.addEventListener('DOMContentLoaded', fireReady, false);

                
                if(Ext.platform.isWebKit) {
                    intervalId = setInterval(function(){
                        if(/loaded|complete/.test(document.readyState)) {
                            clearInterval(intervalId);
                            intervalId = null;
                            fireReady();
                        }
                    }, 10);
                }

                
                window.addEventListener('load', fireReady, false);
            }

            options = options || {};
            options.delay = options.delay || 1;
            readyEvent.addListener(fn, scope, options);
        }
    },

    
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


Ext.EventManager.on = Ext.EventManager.addListener;


Ext.EventManager.un = Ext.EventManager.removeListener;


Ext.onReady = Ext.EventManager.onDocumentReady;

Ext.EventObjectImpl = Ext.extend(Object, {
    constructor : function(e) {
        if (e) {
            this.setEvent(e.browserEvent || e);
        }
    },

    
    setEvent : function(e){
        var me = this;
        if (e == me || (e && e.browserEvent)){ 
            return e;
        }
        me.browserEvent = e;
        if(e) {
            me.type = e.type;

            
            var node = e.target;
            me.target = node && node.nodeType == 3 ? node.parentNode : node;

            
            me.xy = [e.pageX, e.pageY];
            me.timestamp = e.timeStamp;
        } else {
            me.target = null;
            me.xy = [0, 0];
        }
        return me;
    },

    
    stopEvent : function(){
        this.stopPropagation();
        this.preventDefault();
    },

    
    preventDefault : function(){
        if(this.browserEvent) {
            this.browserEvent.preventDefault();
        }
    },

    
    stopPropagation : function() {
        if(this.browserEvent) {
            this.browserEvent.stopPropagation();
        }
    },

    
    getPageX : function(){
        return this.xy[0];
    },

    
    getPageY : function(){
        return this.xy[1];
    },

    
    getXY : function(){
        return this.xy;
    },

    
    getTarget : function(selector, maxDepth, returnEl) {
        return selector ? Ext.fly(this.target).findParent(selector, maxDepth, returnEl) : (returnEl ? Ext.get(this.target) : this.target);
    },

    getTime : function() {
        return this.timestamp;
    }
});


Ext.EventObject = new Ext.EventObjectImpl();


(function(){

    var initExt = function(){
        
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
        
        
        while (parent) {
            
            if (me.targets.all.indexOf(parent) !== -1) {
                id = parent.id;

                
                listeners = me.listeners[id];

                
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
                    
                    delete track.events.tapcancel;
                }

                if (track.events.doubletap) {
                    delete track.events.doubletap;
                }

                
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
                
                track.previousTime = time;
                track.previousX = pageX;
                track.previousY = pageY;
                track.previousDeltaX = previousDeltaX;
                track.previousDeltaY = previousDeltaY;
                continue;
            }
            
            
            if (!track.scrolling && track.events.swipe) {
                
                if (absDeltaY - absDeltaX > 2 || deltaTime > me.swipeTime) {
                    delete track.events.swipe;
                }
                else if (absDeltaX > me.swipeThreshold && absDeltaX > absDeltaY) {
                    
                    delete track.events.scroll;
                    delete track.events.scrollstart;
                    delete track.events.scrollend;

                    
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

            
            if (track.events.scroll || track.events.scrollstart || track.events.scrollend) {
                if (!track.scrolling && (absDeltaX >= me.scrollThreshold || absDeltaY >= me.scrollThreshold)) {
                    
                    track.scrolling = true;

                    
                    delete track.events.swipe;

                    
                    
                    
                    
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
                
                if (absDeltaX > absDeltaY) {
                    if (deltaX > 0) {
                        
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
                    
                    if (deltaY > 0) {
                        
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

Ext.util.OfflineDebug = function() {
    var cacheStatuses = ['uncached', 'idle', 'checking', 'downloading', 'updateready', 'obsolete'],
        cacheEvents = ['cached', 'checking', 'downloading', 'error', 'noupdate', 'obsolete', 'progress', 'updateready'],
        appcache = window.applicationCache;

    var logEvent = function(e){
        var online = (navigator.onLine) ? 'yes' : 'no',
            status = cacheStatuses[appcache.status],
            type = e.type;

        var message = 'online: ' + online;
        message += ', event: ' + type;
        message += ', status: ' + status;

        if (type == 'error' && navigator.onLine) {
            message += ' There was an unknown error, check your Cache Manifest.';
        }
        if(console && console.log) {
            console.log(message);
        }
    };

    
    for (var i = cacheEvents.length - 1; i >= 0; i--) {
        appcache.addEventListener(cacheEvents[i], logEvent, false);
    }

    appcache.addEventListener('updateready', function(e) {
        
        if (cacheStatuses[cache.status] != 'idle') {
            cache.swapCache();
            console.log('Swapped/updated the Cache Manifest.');
        }
    }, false);

    return {
        checkForUpdates: function(){
            appcache.update();
        }
    };
};


Ext.util.GeoLocation = Ext.extend(Ext.util.Observable, {
    
    coords: null,

    
    hasGeoLocation: false,

    
    autoUpdate: true,

    
    constructor : function(config) {
        config = config || {};
        Ext.apply(this, config);

        this.hasGeoLocation = !!navigator.geolocation;

        
        this.addEvents('beforeupdate','update');

        Ext.util.GeoLocation.superclass.constructor.call(this);

        if (this.autoUpdate) {
            this.updateLocation();
        }
    },

    
    getLocation : function(callback, scope) {
        var me = this;
        if (me.hasGeoLocation && !me.coords) {
            me.updateLocation(callback, scope);
        }
        else if (me.hasGeoLocation && callback) {
            setTimeout(function() {
                callback.call(scope || me, me.coords, me);
            }, 0);
        }
        else if (callback) {
            setTimeout(function() {
                callback.call(scope || me, null, me);
            }, 0);
        }
    },

    
    updateLocation : function(callback, scope) {
        var me = this;
        if (me.hasGeoLocation) {
            me.fireEvent('beforeupdate', me);
            navigator.geolocation.getCurrentPosition(function(position) {
                me.coords = me.parseCoords(position);
                if (callback) {
                    callback.call(scope || me, me.coords, me);
                }
                me.fireEvent('update', me.coords, me);
            });
        }
        else {
            setTimeout(function() {
                if (callback) {
                    callback.call(scope || me, null, me);
                }
                me.fireEvent('update', false, me);
            }, 0);
        }
    },

    
    parseCoords : function(location) {
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            original: location
        };
    }
});


Ext.util.MixedCollection = function(allowFunctions, keyFn) {
    this.items = [];
    this.map = {};
    this.keys = [];
    this.length = 0;
    this.addEvents(
        
        'clear',
        
        'add',
        
        'replace',
        
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

    
    allowFunctions : false,

    
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

    
    getKey : function(o){
         return o.id;
    },

    
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

    
    each : function(fn, scope){
        var items = [].concat(this.items); 
        for(var i = 0, len = items.length; i < len; i++){
            if(fn.call(scope || items[i], items[i], i, len) === false){
                break;
            }
        }
    },

    
    eachKey : function(fn, scope){
        for(var i = 0, len = this.keys.length; i < len; i++){
            fn.call(scope || window, this.keys[i], this.items[i], i, len);
        }
    },

    
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

    
    find : function(fn, scope){
        for(var i = 0, len = this.items.length; i < len; i++){
            if(fn.call(scope || window, this.items[i], this.keys[i])){
                return this.items[i];
            }
        }
        return null;
    },

    
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

    
    remove : function(o){
        return this.removeAt(this.indexOf(o));
    },

    
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

    
    removeKey : function(key){
        return this.removeAt(this.indexOfKey(key));
    },

    
    getCount : function(){
        return this.length;
    },

    
    indexOf : function(o){
        return this.items.indexOf(o);
    },

    
    indexOfKey : function(key){
        return this.keys.indexOf(key);
    },

    
    item : function(key){
        var mk = this.map[key],
            item = mk !== undefined ? mk : (typeof key == 'number') ? this.items[key] : undefined;
        return !Ext.isFunction(item) || this.allowFunctions ? item : null; 
    },

    
    itemAt : function(index){
        return this.items[index];
    },

    
    key : function(key){
        return this.map[key];
    },

    
    contains : function(o){
        return this.indexOf(o) != -1;
    },

    
    containsKey : function(key){
        return typeof this.map[key] != 'undefined';
    },

    
    clear : function(){
        this.length = 0;
        this.items = [];
        this.keys = [];
        this.map = {};
        this.fireEvent('clear');
    },

    
    first : function(){
        return this.items[0];
    },

    
    last : function(){
        return this.items[this.length-1];
    },

    
    _sort : function(property, dir, fn){
        var i, len,
            dsc = String(dir).toUpperCase() == 'DESC' ? -1 : 1,

            
            c     = [],
            keys  = this.keys,
            items = this.items;

        
        fn = fn || function(a, b) {
            return a - b;
        };

        
        for (i = 0, len = items.length; i < len; i++) {
            c[c.length] = {
                key  : keys[i],
                value: items[i],
                index: i
            };
        }

        
        c.sort(function(a, b) {
            var v = fn(a[property], b[property]) * dsc;
            if (v === 0) {
                v = (a.index < b.index ? -1 : 1);
            }
            return v;
        });

        
        for (i = 0, len = c.length; i < len; i++) {
            items[i] = c[i].value;
            keys[i]  = c[i].key;
        }

        this.fireEvent('sort', this);
    },

    
    sort : function(dir, fn) {
        this._sort('value', dir, fn);
    },

    
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

    
    filter : function(property, value, anyMatch, caseSensitive, exactMatch) {
        
        if (Ext.isObject(property)) {
            property = [property];
        }

        if (Ext.isArray(property)) {
            var filters = [];

            
            for (var i=0, j = property.length; i < j; i++) {
                var filter = property[i],
                    func   = filter.fn,
                    scope  = filter.scope || this;

                
                if (typeof func != 'function') {
                    func = this.createFilterFn(filter.property, filter.value, filter.anyMatch, filter.caseSensitive, filter.exactMatch);
                }

                filters.push({fn: func, scope: scope});
            }

            var fn = this.createMultipleFilterFn(filters);
        } else {
            
            var fn = this.createFilterFn(property, value, anyMatch, caseSensitive, exactMatch);
        }

        return (fn === false ? this : this.filterBy(fn));
    },

    
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

    
    findIndex : function(property, value, start, anyMatch, caseSensitive){
        if(Ext.isEmpty(value, false)){
            return -1;
        }
        value = this.createValueMatcher(value, anyMatch, caseSensitive);
        return this.findIndexBy(function(o){
            return o && value.test(o[property]);
        }, null, start);
    },

    
    findIndexBy : function(fn, scope, start){
        var k = this.keys, it = this.items;
        for(var i = (start||0), len = it.length; i < len; i++){
            if(fn.call(scope||this, it[i], k[i])){
                return i;
            }
        }
        return -1;
    },

    
    createFilterFn : function(property, value, anyMatch, caseSensitive, exactMatch) {
        if (Ext.isEmpty(value, false)) {
            return false;
        }
        value = this.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r[property]);
        };
    },

    
    createMultipleFilterFn: function(filters) {
        return function(record) {
            var isMatch = true;

            for (var i=0, j = filters.length; i < j; i++) {
                var filter = filters[i],
                    fn     = filter.fn,
                    scope  = filter.scope;

                isMatch = isMatch && fn.call(scope, record);

                
                if (isMatch !== true) {
                    break;
                }
            }

            return isMatch;
        };
    },

    
    createValueMatcher : function(value, anyMatch, caseSensitive, exactMatch) {
        if (!value.exec) { 
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

Ext.util.MixedCollection.prototype.get = Ext.util.MixedCollection.prototype.item;

Ext.util.TapRepeater = Ext.extend(Ext.util.Observable, {

    constructor: function(el, config) {
        this.el = Ext.get(el);

        Ext.apply(this, config);

        this.addEvents(
        
        "touchstart",
        
        "tap",
        
        "touchend"
        );

        this.el.on({
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            scope: this
        });

        if (this.preventDefault || this.stopDefault) {
            this.el.on('tap', this.eventOptions, this);
        }

        Ext.util.TapRepeater.superclass.constructor.call(this);
    },

    interval: 10,
    delay: 250,
    preventDefault: true,
    stopDefault: false,
    timer: 0,

    
    eventOptions: function(e) {
        if (this.preventDefault) {
            e.preventDefault();
        }
        if (this.stopDefault) {
            e.stopEvent();
        }
    },

    
    destroy: function() {
        Ext.destroy(this.el);
        this.purgeListeners();
    },

    
    onTouchStart: function(e) {
        clearTimeout(this.timer);
        if (this.pressClass) {
            this.el.addClass(this.pressClass);
        }
        this.tapStartTime = new Date();

        this.fireEvent("touchstart", this, e);
        this.fireEvent("tap", this, e);

        
        if (this.accelerate) {
            this.delay = 400;
        }
        this.timer = this.tap.defer(this.delay || this.interval, this, [e]);
    },

    
    tap: function(e) {
        this.fireEvent("tap", this, e);
        this.timer = this.tap.defer(this.accelerate ? this.easeOutExpo(this.tapStartTime.getElapsed(),
            400,
            -390,
            12000) : this.interval, this, [e]);
    },

    
    
    easeOutExpo: function(t, b, c, d) {
        return (t == d) ? b + c : c * ( - Math.pow(2, -10 * t / d) + 1) + b;
    },

    
    onTouchEnd: function(e) {
        clearTimeout(this.timer);
        this.el.removeClass(this.pressClass);
        this.fireEvent("touchend", this, e);
    }
});


Ext.util.Region = Ext.extend(Object, {
    
    constructor : function(t, r, b, l) {
        var me = this;
        me.top = t;
        me[1] = t;
        me.right = r;
        me.bottom = b;
        me.left = l;
        me[0] = l;
    },

    
    contains : function(region) {
        var me = this;
        return (region.left >= me.left &&
                region.right <= me.right &&
                region.top >= me.top &&
                region.bottom <= me.bottom);

    },

    
    intersect : function(region) {
        var me = this,
            t = Math.max(me.top, region.top),
            r = Math.min(me.right, region.right),
            b = Math.min(me.bottom, region.bottom),
            l = Math.max(me.left, region.left);

        if (b >= t && r >= l) {
            return new Ext.util.Region(t, r, b, l);
        }
        else {
            return false;
        }
    },

    
    union : function(region) {
        var me = this,
            t = Math.min(me.top, region.top),
            r = Math.max(me.right, region.right),
            b = Math.max(me.bottom, region.bottom),
            l = Math.min(me.left, region.left);

        return new Ext.util.Region(t, r, b, l);
    },

    
    constrainTo : function(r) {
        var me = this;
        me.top = me.top.constrain(r.top, r.bottom);
        me.bottom = me.bottom.constrain(r.top, r.bottom);
        me.left = me.left.constrain(r.left, r.right);
        me.right = me.right.constrain(r.left, r.right);
        return me;
    },

    
    adjust : function(t, r, b, l) {
        var me = this;
        me.top += t;
        me.left += l;
        me.right += r;
        me.bottom += b;
        return me;
    }
});


Ext.util.Region.getRegion = function(el) {
    return Ext.fly(el).getPageBox(true);
};

Ext.CompositeElement = function(els, root) {
    
    this.elements = [];
    this.add(els, root);
    this.el = new Ext.Element.Flyweight();
};

Ext.CompositeElement.prototype = {
    isComposite: true,

    
    getElement : function(el) {
        
        var e = this.el;
        e.dom = el;
        e.id = el.id;
        return e;
    },

    
    transformElement : function(el) {
        return Ext.getDom(el);
    },

    
    getCount : function() {
        return this.elements.length;
    },

    
    add : function(els, root) {
        var me = this,
            elements = me.elements;
        if (!els) {
            return this;
        }
        if (typeof els == 'string') {
            els = Ext.Element.selectorFunction(els, root);
        }
        else if (els.isComposite) {
            els = els.elements;
        }
        else if (!Ext.isIterable(els)) {
            els = [els];
        }

        for (var i = 0, len = els.length; i < len; ++i) {
            elements.push(me.transformElement(els[i]));
        }

        return me;
    },

    invoke : function(fn, args) {
        var me = this,
            els = me.elements,
            len = els.length,
            e,
            i;

        for (i = 0; i < len; i++) {
            e = els[i];
            if (e) {
                Ext.Element.prototype[fn].apply(me.getElement(e), args);
            }
        }
        return me;
    },
    
    item : function(index) {
        var me = this,
            el = me.elements[index],
            out = null;

        if (el){
            out = me.getElement(el);
        }
        return out;
    },

    
    addListener : function(eventName, handler, scope, opt) {
        var els = this.elements,
            len = els.length,
            i, e;

        for (i = 0; i<len; i++) {
            e = els[i];
            if (e) {
                Ext.EventManager.on(e, eventName, handler, scope || e, opt);
            }
        }
        return this;
    },

    
    each : function(fn, scope) {
        var me = this,
            els = me.elements,
            len = els.length,
            i, e;

        for (i = 0; i<len; i++) {
            e = els[i];
            if (e) {
                e = this.getElement(e);
                if(fn.call(scope || e, e, me, i)){
                    break;
                }
            }
        }
        return me;
    },

    
    fill : function(els) {
        var me = this;
        me.elements = [];
        me.add(els);
        return me;
    },

    
    filter : function(selector) {
        var els = [],
            me = this,
            elements = me.elements,
            fn = Ext.isFunction(selector) ? selector
                : function(el){
                    return el.is(selector);
                };

        me.each(function(el, self, i){
            if(fn(el, i) !== false){
                els[els.length] = me.transformElement(el);
            }
        });
        me.elements = els;
        return me;
    },

    
    first : function() {
        return this.item(0);
    },

    
    last : function() {
        return this.item(this.getCount()-1);
    },

    
    contains : function(el) {
        return this.indexOf(el) != -1;
    },

    
    indexOf : function(el) {
        return this.elements.indexOf(this.transformElement(el));
    },

    
    clear : function() {
        this.elements = [];
    }
};

Ext.CompositeElement.prototype.on = Ext.CompositeElement.prototype.addListener;

(function(){
var fnName,
    ElProto = Ext.Element.prototype,
    CelProto = Ext.CompositeElement.prototype;

for (fnName in ElProto) {
    if (Ext.isFunction(ElProto[fnName])) {
        (function(fnName) {
            CelProto[fnName] = CelProto[fnName] || function(){
                return this.invoke(fnName, arguments);
            };
        }).call(CelProto, fnName);

    }
}
})();

if(Ext.DomQuery) {
    Ext.Element.selectorFunction = Ext.DomQuery.select;
}


Ext.Element.select = function(selector, root, composite) {
    var els;
    composite = (composite === false) ? false : true;
    if (typeof selector == "string") {
        els = Ext.Element.selectorFunction(selector, root);
    } else if (selector.length !== undefined) {
        els = selector;
    } else {
        throw "Invalid selector";
    }
    return composite ? new Ext.CompositeElement(els) : els;
};

Ext.select = Ext.Element.select;


Ext.CompositeElementLite = Ext.CompositeElement;


Ext.apply(Ext.CompositeElementLite.prototype, {
    addElements : function(els, root){
        if(!els){
            return this;
        }
        if(typeof els == "string"){
            els = Ext.Element.selectorFunction(els, root);
        }
        var yels = this.elements;
        Ext.each(els, function(e) {
            yels.push(Ext.get(e));
        });
        return this;
    },

    
    first : function(){
        return this.item(0);
    },

    
    last : function(){
        return this.item(this.getCount()-1);
    },

    
    contains : function(el){
        return this.indexOf(el) != -1;
    },

    
    removeElement : function(keys, removeDom){
        var me = this,
            els = this.elements,
            el;
        Ext.each(keys, function(val){
            if ((el = (els[val] || els[val = me.indexOf(val)]))) {
                if(removeDom){
                    if(el.dom){
                        el.remove();
                    }else{
                        Ext.removeNode(el);
                    }
                }
                els.splice(val, 1);
            }
        });
        return this;
    },

    
    replaceElement : function(el, replacement, domReplace){
        var index = !isNaN(el) ? el : this.indexOf(el),
            d;
        if(index > -1){
            replacement = Ext.getDom(replacement);
            if(domReplace){
                d = this.elements[index];
                d.parentNode.insertBefore(replacement, d);
                Ext.removeNode(d);
            }
            this.elements.splice(index, 1, replacement);
        }
        return this;
    }
});


Ext.DomHelper = {
    emptyTags : /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i,
    confRe : /tag|children|cn|html$/i,
    endRe : /end/i,

    
    markup : function(o) {
        var b = '',
            attr,
            val,
            key,
            keyVal,
            cn;

        if (typeof o == "string") {
            b = o;
        }
        else if (Ext.isArray(o)) {
            for (var i=0; i < o.length; i++) {
                if (o[i]) {
                    b += this.markup(o[i]);
                }
            };
        }
        else {
            b += '<' + (o.tag = o.tag || 'div');
            for (attr in o) {
                val = o[attr];
                if (!this.confRe.test(attr)) {
                    if (typeof val == "object") {
                        b += ' ' + attr + '="';
                        for (key in val) {
                            b += key + ':' + val[key] + ';';
                        };
                        b += '"';
                    }
                    else {
                        b += ' ' + ({cls : 'class', htmlFor : 'for'}[attr] || attr) + '="' + val + '"';
                    }
                }
            };

            
            if (this.emptyTags.test(o.tag)) {
                b += '/>';
            }
            else {
                b += '>';
                if ((cn = o.children || o.cn)) {
                    b += this.markup(cn);
                }
                else if (o.html) {
                    b += o.html;
                }
                b += '</' + o.tag + '>';
            }
        }
        return b;
    },

    
    applyStyles : function(el, styles) {
        if (styles) {
            var i = 0,
                len,
                style;

            el = Ext.fly(el);
            if (typeof styles == 'function') {
                styles = styles.call();
            }
            if (typeof styles == 'string'){
                styles = styles.trim().split(/\s*(?::|;)\s*/);
                for(len = styles.length; i < len;){
                    el.setStyle(styles[i++], styles[i++]);
                }
            } else if (Ext.isObject(styles)) {
                el.setStyle(styles);
            }
        }
    },

    
    insertHtml : function(where, el, html) {
        var hash = {},
            hashVal,
            setStart,
            range,
            frag,
            rangeEl,
            rs;

        where = where.toLowerCase();

        
        hash['beforebegin'] = ['BeforeBegin', 'previousSibling'];
        hash['afterend'] = ['AfterEnd', 'nextSibling'];

        range = el.ownerDocument.createRange();
        setStart = 'setStart' + (this.endRe.test(where) ? 'After' : 'Before');
        if (hash[where]) {
            range[setStart](el);
            frag = range.createContextualFragment(html);
            el.parentNode.insertBefore(frag, where == 'beforebegin' ? el : el.nextSibling);
            return el[(where == 'beforebegin' ? 'previous' : 'next') + 'Sibling'];
        }
        else {
            rangeEl = (where == 'afterbegin' ? 'first' : 'last') + 'Child';
            if (el.firstChild) {
                range[setStart](el[rangeEl]);
                frag = range.createContextualFragment(html);
                if (where == 'afterbegin') {
                    el.insertBefore(frag, el.firstChild);
                }
                else {
                    el.appendChild(frag);
                }
            }
            else {
                el.innerHTML = html;
            }
            return el[rangeEl];
        }

        throw 'Illegal insertion point -> "' + where + '"';
    },

    
    insertBefore : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforebegin');
    },

    
    insertAfter : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterend', 'nextSibling');
    },

    
    insertFirst : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterbegin', 'firstChild');
    },

    
    append : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforeend', '', true);
    },

    
    overwrite : function(el, o, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.markup(o);
        return returnElement ? Ext.get(el.firstChild) : el.firstChild;
    },

    doInsert : function(el, o, returnElement, pos, sibling, append) {
        var newNode = this.insertHtml(pos, Ext.getDom(el), this.markup(o));
        return returnElement ? Ext.get(newNode, true) : newNode;
    }
};


Ext.DomQuery = {
    
    select : function(q, root) {
        var results = [],
            nodes,
            i,
            j,
            qlen,
            nlen;

        root = root || document;
        if (typeof root == 'string') {
            root = document.getElementById(root);
        }

        q = q.split(",");
        for (i = 0, qlen = q.length; i < qlen; i++) {
            if (typeof q[i] == 'string') {
                nodes = root.querySelectorAll(q[i]);

                for (j = 0, nlen = nodes.length; j < nlen; j++) {
                    results.push(nodes[j]);
                }
            }
        }

        return results;
    },

    
    selectNode : function(q, root) {
        return Ext.DomQuery.select(q, root)[0];
    },

    
    is : function(el, q) {
        if (typeof el == "string") {
            el = document.getElementById(el);
        }
        return Ext.DomQuery.select(q).indexOf(el) !== -1;
    }
};

Ext.Element.selectorFunction = Ext.DomQuery.select;
Ext.query = Ext.DomQuery.select;


Ext.Anim = Ext.extend(Object, {
    isAnim: true,
    
    defaultConfig: {
        
        from: {},

        
        to: {},

        
        duration: 250,

        
        delay: 0,

        
        easing: 'ease-in-out',

        
        autoClear: true,

        
        autoReset: false,

        
        autoShow: true,

        
        out: true,

        
        direction: null,

        
        reverse: false
    },

    

    

    opposites: {
        'left': 'right',
        'right': 'left',
        'up': 'down',
        'down': 'up'
    },

    constructor: function(config) {
        config = Ext.apply({}, config || {}, this.defaultConfig);
        this.config = config;

        Ext.Anim.superclass.constructor.call(this);

        this.running = [];
    },

    initConfig : function(el, runConfig) {
        var me = this,
            runtime = {},
            config = Ext.apply({}, runConfig || {}, me.config);

        config.el = el = Ext.get(el);

        if (config.reverse && me.opposites[config.direction]) {
            config.direction = me.opposites[config.direction];
        }

        if (me.config.before) {
            me.config.before.call(config, el, config);
        }

        if (runConfig.before) {
            runConfig.before.call(config.scope || config, el, config);
        }

        return config;
    },

    run: function(el, config) {
        el = Ext.get(el);
        config = config || {};

        var me = this,
            style = el.dom.style,
            property,
            after = config.after;

        config = this.initConfig(el, config);

        if (me.running[el.id]) {
            el.un('webkitTransitionEnd', me.onTransitionEnd, me);
        }

        style.webkitTransitionDuration = '0ms';
        for (property in config.from) {
            style[property] = config.from[property];
        }

        setTimeout(function() {
            
            if (config.is3d === true) {
                el.parent().setStyle({
                    
                    '-webkit-perspective': '1200',
                    '-webkit-transform-style': 'preserve-3d'
                });
            }

            style.webkitTransitionDuration = config.duration + 'ms';
            style.webkitTransitionProperty = 'all';
            style.webkitTransitionTimingFunction = config.easing;

            
            el.on('webkitTransitionEnd', me.onTransitionEnd, me, {
                single: true,
                config: config,
                after: after
            });

            for (property in config.to) {
                style[property] = config.to[property];
            }
        }, config.delay || 5);

        me.running[el.id] = config;
        return me;
    },

    onTransitionEnd: function(ev, el, o) {
        el = Ext.get(el);

        var style = el.dom.style,
            config = o.config,
            property,
            me = this;

        if (config.autoClear) {
            for (property in config.to) {
                style[property] = '';
            }
        }

        style.webkitTransitionDuration = null;
        style.webkitTransitionProperty = null;
        style.webkitTransitionTimingFunction = null;

        if (config.is3d) {
            el.parent().setStyle({
                '-webkit-perspective': '',
                '-webkit-transform-style': ''
            });
        }

        if (me.config.after) {
            me.config.after.call(config, el, config);
        }

        if (o.after) {
            o.after.call(config.scope || me, el, config);
        }
        
        delete me.running[el.id];
    }
});

Ext.Anim.seed = 1000;

Ext.Anim.run = function(el, anim, config) {
    if (el.isComponent) {
        el = el.el;
    }
    
    if (anim.isAnim) {
        anim.run(el, config);
    }
    else {
        if (Ext.isObject(anim)) {
            config = Ext.apply({}, config || {}, anim);
            anim = anim.type;
        }
              
        if (!Ext.anims[anim]) {
            throw anim + ' is not a valid animation type.';
        }
        else {
            Ext.anims[anim].run(el, config);
        }
    }
};


Ext.anims = {
    
    fade: new Ext.Anim({
        before: function(el) {
            var fromOpacity = 1,
                toOpacity = 1,
                curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                zIndex = curZ;

            if (this.out) {
                toOpacity = 0;
            } else {
                zIndex = curZ + 1;
                fromOpacity = 0;
            }

            this.from = {
                'opacity': fromOpacity,
                'z-index': zIndex
            };
            this.to = {
                'opacity': toOpacity,
                'z-index': zIndex
            };
        }
    }),

    
    slide: new Ext.Anim({
        direction: 'left',
        cover: false,
        reveal: false,

        before: function(el) {
            var curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                zIndex = curZ + 1,
                toX = 0,
                toY = 0,
                fromX = 0,
                fromY = 0,
                elH = el.getHeight(),
                elW = el.getWidth();

            if (this.direction == 'left' || this.direction == 'right') {
                if (this.out == true) {
                    toX = -elW;
                }
                else {
                    fromX = elW;
                }
            }
            else if (this.direction == 'up' || this.direction == 'down') {
                if (this.out == true) {
                    toY = -elH;
                }
                else {
                    fromY = elH;
                }
            }

            if (this.direction == 'right' || this.direction == 'down') {
                toY *= -1;
                toX *= -1;
                fromY *= -1;
                fromX *= -1;
            }

            if (this.cover && this.out) {
                toX = 0;
                toY = 0;
                zIndex = curZ;
            }
            else if (this.reveal && !this.out) {
                fromX = 0;
                fromY = 0;
                zIndex = curZ;
            }

            this.from = {
                '-webkit-transform': 'translate3d(' + fromX + 'px, ' + fromY + 'px, 0)',
                'z-index': zIndex,
                'opacity': 0.99
            };
            this.to = {
                '-webkit-transform': 'translate3d(' + toX + 'px, ' + toY + 'px, 0)',
                'z-index': zIndex,
                'opacity': 1
            };
        }
    }),

    
    flip: new Ext.Anim({
        is3d: true,
        direction: 'left',
        before: function(el) {
            var rotateProp = 'Y',
                fromScale = 1,
                toScale = 1,
                fromRotate = 0,
                toRotate = 0;

            if (this.out) {
                toRotate = -180;
                toScale = 0.8;
            }
            else {
                fromRotate = 180;
                fromScale = 0.8;
            }

            if (this.direction == 'up' || this.direction == 'down') {
                rotateProp = 'X';
            }

            if (this.direction == 'right' || this.direction == 'down') {
                toRotate *= -1;
                fromRotate *= -1;
            }

            this.from = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + fromRotate + 'deg) scale(' + fromScale + ')',
                '-webkit-backface-visibility': 'hidden'
            };
            this.to = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + toRotate + 'deg) scale(' + toScale + ')',
                '-webkit-backface-visibility': 'hidden'
            };
        }
    }),

    
    cube: new Ext.Anim({
        is3d: true,
        direction: 'left',
        style: 'outer',
        before: function(el) {
            var origin = '0% 0%',
                fromRotate = 0,
                toRotate = 0,
                rotateProp = 'Y',
                fromZ = 0,
                toZ = 0,
                fromOpacity = 1,
                toOpacity = 1,
                zDepth,
                elW = el.getWidth(),
                elH = el.getHeight(),
                showTranslateZ = true,
                fromTranslate = ' translateX(0)',
                toTranslate = '';

            if (this.direction == 'left' || this.direction == 'right') {
                if (this.out) {
                    origin = '100% 100%';
                    toZ = elW;
                    toOpacity = 0.5;
                    toRotate = -90;
                } else {
                    origin = '0% 0%';
                    fromZ = elW;
                    fromOpacity = 0.5;
                    fromRotate = 90;
                }
            } else if (this.direction == 'up' || this.direction == 'down') {
                rotateProp = 'X';
                if (this.out) {
                    origin = '100% 100%';
                    toZ = elH;
                    toRotate = 90;
                } else {
                    origin = '0% 0%';
                    fromZ = elH;
                    fromRotate = -90;
                }
            }

            if (this.direction == 'down' || this.direction == 'right') {
                fromRotate *= -1;
                toRotate *= -1;
                origin = (origin == '0% 0%') ? '100% 100%': '0% 0%';
            }

            if (this.style == 'inner') {
                fromZ *= -1;
                toZ *= -1;
                fromRotate *= -1;
                toRotate *= -1;

                if (!this.out) {
                    toTranslate = ' translateX(0px)';
                    origin = '0% 50%';
                } else {
                    toTranslate = fromTranslate;
                    origin = '100% 50%';
                }
            }

            this.from = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + fromRotate + 'deg)' + (showTranslateZ ? ' translateZ(' + fromZ + 'px)': '') + fromTranslate,
                '-webkit-transform-origin': origin
            };
            this.to = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + toRotate + 'deg) translateZ(' + toZ + 'px)' + toTranslate,
                '-webkit-transform-origin': origin
            };
        },
        duration: 250
    }),

    
    pop: new Ext.Anim({
        scaleOnExit: false,
        before: function(el) {
            var fromScale = 1,
                toScale = 1,
                fromOpacity = 1,
                toOpacity = 1,
                curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                fromZ = curZ,
                toZ = curZ;

            if (!this.out) {
                fromScale = .01;
                fromZ = curZ + 1;
                toZ = curZ + 1;
                fromOpacity = 0;
            }
            else {
                if (this.scaleOnExit) {
                    toScale = .01
                    toOpacity = 0;
                } else {
                    toOpacity = 0.8;
                }
            }

            this.from = {
                '-webkit-transform': 'scale(' + fromScale + ')',
                '-webkit-transform-origin': '50% 50%',
                'opacity': fromOpacity,
                'z-index': fromZ
            };

            this.to = {
                '-webkit-transform': 'scale(' + toScale + ')',
                '-webkit-transform-origin': '50% 50%',
                'opacity': toOpacity,
                'z-index': toZ
            };
        }
    }),

    
    wipe: new Ext.Anim({
        before: function(el) {
            var curZ = el.getStyle('z-index'),
                mask = '',
                toSize = '100%',
                fromSize = '100%';

            if (!this.out) {
                zindex = curZ + 1;
                mask = '-webkit-gradient(linear, left bottom, right bottom, from(transparent), to(#000), color-stop(66%, #000), color-stop(33%, transparent))';
                toSize = el.getHeight() * 100 + 'px';
                fromSize = el.getHeight();

                this.from = {
                    '-webkit-mask-image': mask,
                    '-webkit-mask-size': el.getWidth() * 3 + 'px ' + el.getHeight() + 'px',
                    'z-index': zIndex,
                    '-webkit-mask-position-x': 0
                };
                this.to = {
                    '-webkit-mask-image': mask,
                    '-webkit-mask-size': el.getWidth() * 3 + 'px ' + el.getHeight() + 'px',
                    'z-index': zIndex,
                    '-webkit-mask-position-x': -el.getWidth() * 2 + 'px'
                };
            }
        },
        duration: 500
    })
};











if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        
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
        meta = {    
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



        var i,          
            k,          
            v,          
            length,
            mind = gap,
            partial,
            value = holder[key];



        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }




        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }



        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':



            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':





            return String(value);




        case 'object':




            if (!value) {
                return 'null';
            }



            gap += indent;
            partial = [];



            if (Object.prototype.toString.apply(value) === '[object Array]') {




                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }




                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }



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



                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }




            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }



    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {







            var i;
            gap = '';
            indent = '';




            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }



            } else if (typeof space === 'string') {
                indent = space;
            }




            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }




            return str('', {'': value});
        };
    }




    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {




            var j;

            function walk(holder, key) {




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






            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }














            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {






                j = eval('(' + text + ')');




                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }



            throw new SyntaxError('JSON.parse');
        };
    }
}());


Ext.util.JSON = {
    encode : function(o) {
        return JSON.stringify(o);
    },

    decode : function(s) {
        return JSON.parse(s);
    }
};


Ext.encode = Ext.util.JSON.encode;

Ext.decode = Ext.util.JSON.decode;

Ext.util.JSONP = {

    
    queue: [],

    
    current: null,

    
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

    
    next : function() {
        this.current = null;
        if (this.queue.length) {
            this.current = this.queue.shift();
            this.current.script.src = this.current.url + (this.current.params ? ('?' + this.current.params) : '');
            document.getElementsByTagName('head')[0].appendChild(this.current.script);
        }
    },

    
    callback: function(json) {
        this.current.callback.call(this.current.scope, json);
        document.getElementsByTagName('head')[0].removeChild(this.current.script);
        this.next();
    }
};


Ext.util.Scroller = Ext.extend(Ext.util.Observable, {
    
    bounces: true,

    momentumResetTime: 400,

    
    friction: 0.3,
    acceleration: 25,

    
    momentum: true,

    
    horizontal: false,

    
    vertical: true,

    
    snap: false,

    
    scrollbars: true,

    
    fps: 60,

    
    springTension: 0.2,

    
    ui: 'dark',

    
    scrollToEasing : 'cubic-bezier(0.4, .75, 0.5, .95)',
    
    scrollToDuration: 500,

    
    preventActualScroll: false,
    
    translateOpen: Ext.platform.isAndroidOS ? 'translate(' : 'translate3d(',
    translateClose: Ext.platform.isAndroidOS ? ')' : ', 0px)',
    
    
    constructor : function(el, config) {
        var me = this;
        
        config = config || {};
        Ext.apply(me, config);

        me.addEvents(
            
            'scrollstart',
            
            'scrollend',
            
            'scroll'
        );

        Ext.util.Scroller.superclass.constructor.call(me);

        var scroller = me.scroller = Ext.get(el);

        scroller.addClass('x-scroller');
        me.parent = scroller.parent();
        me.parent.addClass('x-scroller-parent');

        me.offset = {x: 0, y: 0};        
        me.omega = 1 - (me.friction / 10);
        
        
        
        me.parent.on({
            touchstart: me.onTouchStart,
            scrollstart: me.onScrollStart,
            scroll: me.onScroll,
            scrollend: me.onScrollEnd,
            horizontal: me.horizontal,
            vertical: me.vertical,
            scope: me
        });

        if (me.bounces !== false) {
            var both = me.bounces === 'both' || me.bounces === true,
                horizontal = both || me.bounces === 'horizontal',
                vertical = both || me.bounces === 'vertical';

            me.bounces = {
                horizontal: horizontal,
                vertical: vertical
            };
        }

        if (me.scrollbars) {
            if (me.horizontal) {
                me.scrollbarX = new Ext.util.Scroller.Scrollbar(me, 'horizontal');
            }

            if (me.vertical) {
                me.scrollbarY = new Ext.util.Scroller.Scrollbar(me, 'vertical');
            }
        }
     
        me.scroller.on({
            'webkitTransitionEnd': me.onTransitionEnd,
            scope: me
        });
    },

    
    onTouchStart : function(e) {
        var me = this,
            scroller = me.scroller,
            style = scroller.dom.style,
            transform;

        
        if (!e || e.touches.length > 1) {
            return;
        }
        
        me.updateBounds();
        me.followTouch = e.touch;

        if (me.animating) {
            clearInterval(me.scrollInterval);
            
            
            if (me.inTransition) {
                style.webkitTransitionDuration = '0ms';
                transform = new WebKitCSSMatrix(window.getComputedStyle(scroller.dom).webkitTransform);
                style.webkitTransform = me.translateOpen + transform.m41 + 'px, ' + transform.m42 + 'px' + me.translateClose;

                me.offset = {
                    x: transform.m41,
                    y: transform.m42
                };
                me.inTransition = false;
            }

            me.snapToBounds(false);

            if (me.scrollbarX) {
                me.scrollbarX.stop();
            }
            if (me.scrollbarY) {
                me.scrollbarY.stop();
            }

            me.animating = false;
            me.fireEvent('scrollend', me, me.offset);
        }

        if (me.momentum) {
            me.resetMomentum(e);
        }
    },

    
    onScrollStart : function(e, t) {
        var me = this;
        
        
        
        
        if (!e || e.touch != me.followTouch) {
            return;
        }

        if (me.momentum) {
            me.addMomentum(e);
        }

        me.fireEvent('scrollstart', e, me);
    },

    
    onScroll : function(e, t) {
        var me = this;
        
        if (!e || e.touch != me.followTouch) {
            return;
        }

        e.stopEvent();

        var previousDeltaX = e.previousDeltaX,
            previousDeltaY = e.previousDeltaY,
            newX = me.horizontal ? (me.offset.x + previousDeltaX) : 0,
            newY = me.vertical ? (me.offset.y + previousDeltaY) : 0,
            boundsPos = me.constrainToBounds({x: newX, y: newY}),
            pos;

        me.bouncing = false;
        
        
        if (me.bounces) {
            if (me.bounces.horizontal && boundsPos.x != newX) {
                newX = me.offset.x + (previousDeltaX / 2);
                me.bouncing = true;
            }
            else {
                newX = boundsPos.x;
            }
            
            if (me.bounces.vertical && boundsPos.y != newY) {
                newY = me.offset.y + (previousDeltaY / 2);
                me.bouncing = true;
            }
            else {
                newY = boundsPos.y;
            }

            pos = {x: newX, y: newY};
        }
        else {
            pos = boundsPos;
        }

        
        me._scrollTo(pos);

        if (me.momentum) {
            
            me.addMomentum(e);
        }
    },

    
    
    onScrollEnd : function(e, t) {
        var me = this;
        
        if (e.touch != me.followTouch) {
            return;
        }

        
        if (me.momentum) {
            me.validateMomentum(e);
            if (me.momentumPoints.length > 1) {
                var momentum = me.momentumPoints,

                    
                    oldestMomentum = momentum.shift(),
                    latestMomentum = momentum.pop(),

                    
                    distance = {
                        x: latestMomentum.offset.x - oldestMomentum.offset.x,
                        y: latestMomentum.offset.y - oldestMomentum.offset.y
                    },

                    
                    duration = (latestMomentum.time - oldestMomentum.time),

                    
                    velocity = {
                        x: distance.x / (duration / me.acceleration),
                        y: distance.y / (duration / me.acceleration)
                    };
                me.applyVelocity(velocity);
            }
        }

        
        if (!me.animating) {
            me.snapToBounds(true);
        }

        
        
        if (!me.animating) {
            me.fireEvent('scrollend', me, me.offset);
        }
    },

    
    onTransitionEnd : function() {
        var me = this;
        
        if (me.inTransition) {
            me.scroller.dom.style.webkitTransitionDuration = '0ms';
            me.inTransition = false;
            me.fireEvent('scrollend', me, me.offset);
        }
    },

    
    scrollTo : function(pos, animate, easing) {
        var me = this;
        
        
        pos = me.constrainToBounds({x: Math.round(-pos.x), y: Math.round(-pos.y)});

        clearInterval(me.scrollInterval);
        if (animate && !me.preventActualScroll) {
            me.animating = true;
            me.inTransition = true;

            
            
            var style = me.scroller.dom.style;
            style.webkitTransitionTimingFunction = easing || me.scrollToEasing;
            style.webkitTransitionDuration = (typeof animate == 'number') ? (animate + 'ms') : (me.scrollToDuration + 'ms');
            style.webkitTransform = me.translateOpen + pos.x + 'px, ' + pos.y + 'px' + me.translateClose;

            me.offset = pos;

            if (me.scrollbarX) {
                me.scrollbarX.scrollTo(pos, animate, easing || me.scrollToEasing);
            }

            if (me.scrollbarY) {
                me.scrollbarY.scrollTo(pos, animate, easing || me.scrollToEasing);
            }
        }
        else {
            me._scrollTo({x: pos.x, y: pos.y});
        }
    },

    
    _scrollTo : function(pos) {
        var me = this;
        me.offset = {x: Math.round(pos.x), y: Math.round(pos.y)};

        if (!me.preventActualScroll) {
            var style = me.scroller.dom.style;
            style.webkitTransitionDuration = '0ms';        
            style.webkitTransform = me.translateOpen + me.offset.x + 'px, ' + me.offset.y + 'px' + me.translateClose;

            if (me.scrollbarX) {
                me.scrollbarX.scrollTo(me.offset);
            }

            if (me.scrollbarY) {
                me.scrollbarY.scrollTo(me.offset);
            }            
        }

        me.fireEvent('scroll', me, me.getOffset());
    },
    
        
    getOffset : function() {
        return {x: -this.offset.x, y: -this.offset.y};
    },

    
    applyVelocity : function(velocity) {
        velocity = velocity || {x: 0, y: 0};

        var me = this,
            offset = me.offset,
            currentTime = (new Date()).getTime(),
            deceleration = me.deceleration = {
                startTime: currentTime,
                startOffset: {
                    x: offset.x,
                    y: offset.y
                },
                logFriction: Math.log(me.omega),
                velocity: velocity
            },
            
            pos = me.constrainToBounds(offset),
            bounce = me.bounce = {};

        
        me.decelerating = true;
        me.bouncing = false;
        
        if (me.bounces) {
            if (me.bounces.horizontal && pos.x != offset.x) {
                bounce.horizontal = {
                    startTime: currentTime - ((1 / me.springTension) * me.acceleration),
                    startOffset: pos.x,
                    velocity: (offset.x - pos.x) * me.springTension * Math.E
                };
                velocity.x = 0;                
            }
            if (me.bounces.vertical && pos.y != offset.y) {
                bounce.vertical = {
                    startTime: currentTime - ((1 / me.springTension) * me.acceleration),
                    startOffset: pos.y,
                    velocity: (offset.y - pos.y) * me.springTension * Math.E
                };
                velocity.y = 0;
            }
            me.bouncing = true;
        }

        me.animating = true;
        me.decelerating = true;
        
        me.scrollInterval = setInterval(function() {
            me.handleScrollFrame();
        }, 1000 / this.fps);
    },

    
    handleScrollFrame : function() {        
        
        var me = this,
            deceleration = me.deceleration,
            bounce = me.bounce = me.bounce || {},
            offset = me.offset,

            currentTime = (new Date()).getTime(),
            deltaTime = (currentTime - deceleration.startTime),
            powFriction = Math.pow(me.omega, deltaTime / me.acceleration),

            currentVelocity = {
                x: deceleration.velocity.x * powFriction,
                y: deceleration.velocity.y * powFriction
            },

            newPos = {x: offset.x, y: offset.y},
            deltaOffset = {},
            powTime, startOffset, boundsPos;

        if (Math.abs(currentVelocity.x) < 1 && Math.abs(currentVelocity.y) < 1) {
            me.decelerating = false;
        }

        if (!bounce.horizontal && Math.abs(currentVelocity.x) >= 1) {
            deltaOffset.x = (
                (deceleration.velocity.x / deceleration.logFriction) -
                (deceleration.velocity.x * (powFriction / deceleration.logFriction))
            );
            newPos.x = deceleration.startOffset.x - deltaOffset.x;
        }

        if (!bounce.vertical && Math.abs(currentVelocity.y) >= 1) {
            deltaOffset.y = (
                (deceleration.velocity.y / deceleration.logFriction) -
                (deceleration.velocity.y * (powFriction / deceleration.logFriction))
            );
            newPos.y = deceleration.startOffset.y - deltaOffset.y;
        }

        boundsPos = me.constrainToBounds(newPos);

        if (boundsPos.x != newPos.x) {
            if (me.bounces && me.bounces.horizontal) {
                if (!bounce.horizontal) {
                    bounce.horizontal = {
                        startTime: currentTime,
                        startOffset: boundsPos.x,
                        velocity: currentVelocity.x
                    };
                    me.bouncing = true;
                }
            }
            else {
                newPos.x = boundsPos.x;
            }
            deceleration.velocity.x = 0;
        }

        if (boundsPos.y != newPos.y) {
            if (me.bounces && me.bounces.vertical) {
                if (!bounce.vertical) {
                    bounce.vertical = {
                        startTime: currentTime,
                        startOffset: boundsPos.y,
                        velocity: currentVelocity.y
                    };
                    me.bouncing = true;
                }
            }
            else {
                newPos.y = boundsPos.y;
            }
            deceleration.velocity.y = 0;
        }

        if (bounce.horizontal && bounce.horizontal.startTime != currentTime) {
            deltaTime = (currentTime - bounce.horizontal.startTime);
            powTime = (deltaTime / me.acceleration) * Math.pow(Math.E, -me.springTension * (deltaTime / me.acceleration));
            deltaOffset.x = bounce.horizontal.velocity * powTime;
            startOffset = bounce.horizontal.startOffset;

            if (Math.abs(deltaOffset.x) <= 1) {
                deltaOffset.x = 0;
                delete bounce.horizontal;
            }
            newPos.x = startOffset + deltaOffset.x;
        }

        if (bounce.vertical && bounce.vertical.startTime != currentTime) {
            deltaTime = (currentTime - bounce.vertical.startTime);
            powTime = (deltaTime / me.acceleration) * Math.pow(Math.E, -me.springTension * (deltaTime / me.acceleration));
            deltaOffset.y = bounce.vertical.velocity * powTime;
            startOffset = bounce.vertical.startOffset;

            if (Math.abs(deltaOffset.y) <= 1) {
                deltaOffset.y = 0;
                delete bounce.vertical;
            }
            newPos.y = startOffset + deltaOffset.y;
        }

        if (!bounce.vertical && !bounce.horizontal) {
            me.bouncing = false;
        }

        me._scrollTo(newPos);
        
        if ((!me.bounces || !me.bouncing) && !me.decelerating) {
            clearInterval(me.scrollInterval);
            me.animating = false;
            me.snapToBounds(false);
            me.fireEvent('scrollend', me, me.offset);
            return;
        }        
    },

    
    snapToBounds : function(animate, easing) {
        var me = this,
            pos = me.constrainToBounds(me.offset);
            
        if (me.snap) {
            if (me.snap === true) {
                me.snap = {
                    x: 50,
                    y: 50
                };
            }
            else if (Ext.isNumber(me.snap)) {
                me.snap = {
                    x: me.snap,
                    y: me.snap
                };
            }
            if (me.snap.y) {
                pos.y = Math.round(pos.y / me.snap.y) * me.snap.y;
            }
            if (me.snap.x) {
                pos.x = Math.round(pos.x / me.snap.x) * me.snap.x;
            }
        }

        if (pos.x != me.offset.x || pos.y != me.offset.y) {
            if (me.snap) {
                me.scrollTo({x: -pos.x, y: -pos.y}, 150, 'ease-in-out');
            }
            else if (animate) {
                me.applyVelocity();
            }
            else {
                me._scrollTo(pos);
            }
        }
    },

    
    updateBounds : function() {
        var me = this;
        
        me.parentSize = {
            width: me.parent.getWidth(true),
            height: me.parent.getHeight(true)
        };

        me.contentSize = {
            width: me.scroller.dom.scrollWidth,
            height: me.scroller.dom.scrollHeight
        };

        
        me.size = {
            width: Math.max(me.contentSize.width, me.parentSize.width),
            height: Math.max(me.contentSize.height, me.parentSize.height)
        };

        
        me.bounds = {
            x: me.parentSize.width - me.size.width,
            y: me.parentSize.height - me.size.height
        };

        if (me.scrollbarX) {
            me.scrollbarX.update();
        }

        if (me.scrollbarY) {
            me.scrollbarY.update();
        }
    },

    
    constrainToBounds : function(pos) {
        if (!this.bounds) {
            this.updateBounds();
        }
        return {
            x: Math.min(Math.max(this.bounds.x, pos.x), 0),
            y: Math.min(Math.max(this.bounds.y, pos.y), 0)
        };
    },

    
    resetMomentum : function(e) {
        this.momentumPoints = [];
        if (e) {
            this.addMomentum(e);
        }
    },

    
    addMomentum : function(e) {
        var me = this;
        me.validateMomentum(e);
        me.momentumPoints.push({
            time: e.time,
            offset: {x: me.offset.x, y: me.offset.y}
        });  
    },

    
    validateMomentum : function(e) {
        var momentum = this.momentumPoints,
            time = e.time;

        while (momentum.length) {
            if (time - momentum[0].time <= this.momentumResetTime) {
                break;
            }
            momentum.shift();
        }
        
    },

    destroy : function() {
        var me = this;
        
        me.scroller.removeClass('x-scroller');
        me.parent.removeClass('x-scroller-parent');

        me.parent.un({
            touchstart: me.onTouchStart,
            scrollstart: me.onScrollStart,
            scrollend: me.onScrollEnd,
            scroll: me.onScroll,
            horizontal: me.horizontal,
            vertical: me.vertical,
            scope: me
        });

        clearInterval(me.scrollInterval);

        if (me.scrollbars) {
            if (me.horizontal) {
                me.scrollbarX.destroy();
            }

            if (me.vertical) {
                me.scrollbarY.destroy();
            }
        }

        me.scroller.un({
            'DOMSubtreeModified': me.updateBounds,
            'webkitTransitionEnd': me.onTransitionEnd,
            scope: me
        });
    }
});


Ext.util.Scroller.Scrollbar = Ext.extend(Object, {
    minSize: 4,
    size: 0,
    offset: 10,

    translateOpen: Ext.platform.isAndroidOS ? 'translate(' : 'translate3d(',
    translateClose: Ext.platform.isAndroidOS ? ')' : ', 0px)',
    
    
    constructor : function(scroller, direction) {
        var me = this;
        
        me.scroller = scroller;
        me.container = scroller.parent;
        me.direction = direction;
        me.bar = me.container.createChild({
            cls: 'x-scrollbar x-scrollbar-' + direction + ' x-scrollbar-' + scroller.ui
        });
        me.bar.on('webkitTransitionEnd', this.onTransitionEnd, this);
        me.hide();
    },

    destroy : function() {
        this.bar.un('webkitTransitionEnd', this.onTransitionEnd, this);
        this.bar.remove();
    },

    
    update : function() {
        var me = this,
            scroller = me.scroller,
            contentSize = scroller.contentSize,
            parentSize = scroller.parentSize,
            size = scroller.size,
            height, width;

        if (me.direction == 'vertical') {
            
            if (contentSize.height > parentSize.height) {
                me.size = Math.round((parentSize.height * parentSize.height) / size.height);
                me.autoShow = true;
            }
            else {
                me.autoShow = false;
            }
        }
        else {
            if (contentSize.width > parentSize.width) {
                me.size = Math.round((parentSize.width * parentSize.width) / size.width);
                me.autoShow = true;
            }
            else {
                me.autoShow = false;
            }
        }
    },
    
    
    scrollTo : function(pos, animate, easing) {
        var me = this,
            scroller = me.scroller,
            style = me.bar.dom.style,
            transformX = 0,
            transformY = 0,
            size = me.size,
            boundsPos;

        if (!me.autoShow) {
            return;
        }
        
        if (me.hidden) {
            me.show();
            me.hideTimeout = setTimeout(function() {
                me.hide();
            }, 1000);
        }

        if (me.direction == 'horizontal') {
            if (scroller.bouncing) {
                boundsPos = scroller.constrainToBounds(pos);
                size = Math.max(size - Math.abs(pos.x - boundsPos.x), me.minSize);
                if (pos.x > boundsPos.x) {
                    transformX = boundsPos.x + me.offset;
                }
                else if (pos.x < boundsPos.x) {
                    transformX = scroller.parentSize.width - size - me.offset;
                }
                style.width = size + 'px';
                me.resized = true;
            }
            else {
                transformX = ((scroller.parentSize.width - size - (me.offset * 2)) / scroller.bounds.x * scroller.offset.x) + me.offset;
                if (me.resized == undefined || me.resized) {
                    style.width = size + 'px';
                    me.resized = false;
                }
            }
        }
        else {
            if (scroller.bouncing) {
                boundsPos = scroller.constrainToBounds(pos);
                size = Math.max(size - Math.abs(pos.y - boundsPos.y), me.minSize);
                if (pos.y > boundsPos.y) {
                    transformY = boundsPos.y + me.offset;
                }
                else if (pos.y < boundsPos.y) {
                    transformY = scroller.parentSize.height - size - me.offset;
                }
                style.height = size + 'px';
                me.resized = true;
            }
            else {
                transformY = ((scroller.parentSize.height - size - (me.offset * 2)) / scroller.bounds.y * scroller.offset.y) + me.offset;
                if (me.resized == undefined || me.resized) {
                    style.height = size + 'px';
                    me.resized = false;
                }
            }
        }

        if (animate) {
            style.webkitTransitionDuration = (typeof animate == 'number' ? animate : scroller.scrollToDuration) + 'ms, 500ms';
            style.webkitTransitionTimingFunction = easing;
            me.inTransition = true;
        }
        else {
            style.webkitTransitionDuration = '0ms, 500ms';
            me.inTransition = false;
        }

        style.webkitTransform = me.translateOpen + transformX + 'px, ' + transformY + 'px' + this.translateClose;
    },

    
    hide : function() {
        this.bar.setStyle('opacity', '0');
        this.hidden = true;
    },

    
    show : function() {
        this.bar.setStyle('opacity', '1');
        this.hidden = false;
    },

    onTransitionEnd: function() {
        this.inTransition = false;
    },
    
    
    stop : function() {
        var me = this,
            style = me.bar.dom.style,
            transform;

        if (this.inTransition) {
            style.webkitTransitionDuration = '0ms';
            transform = new WebKitCSSMatrix(window.getComputedStyle(me.bar.dom).webkitTransform);
            style.webkitTransform = me.translateOpen + transform.m41 + 'px, ' + transform.m42 + 'px' + me.translateClose;
        }
    }
});


Ext.util.Draggable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-draggable',
    dragCls: 'x-dragging',
    proxyCls: 'x-draggable-proxy',

    
    direction: 'both',

    
    delay: 0,

    
    cancelSelector: null,

    
    disabled: false,

    
    revert: false,

    
    constrain: window,

    
    group: 'base',

    
    grid: null,
    snap: null,
    proxy: null,
    stack: false,


    
    
    constrainRegion: null,

    
    dragging: false,

    
    vertical: false,

    
    horizontal: false,

    
    threshold: 0,

    
    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            
            'dragstart',
            'beforedragend',
            
            'dragend',
            
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

    
    onDragStart : function(e) {
        this.prepareDrag(e);

        if (!this.dragging) {
            this.el.addClass(this.dragCls);
            this.dragging = true;
            this.fireEvent('dragstart', this, e);
        }
    },

    
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

    
    moveTo : function(x, y) {
        this.transformTo(x - this.initialRegion.left, y - this.initialRegion.top);
    },

    
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

    
    disable : function() {
        this.el.un(this.tapEvent, this.onTapEvent, this);
        this.disabled = true;
    },

    
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

    
    getProxyEl: function() {
        return this.proxy || this.el;
    }
});


Ext.util.Droppable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-droppable',
    
    activeCls: 'x-drop-active',
    
    invalidCls: 'x-drop-invalid',
    
    hoverCls: 'x-drop-hover',

    
    validDropMode: 'intersect',

    
    disabled: false,

    
    group: 'base',

    
    tolerance: null,


    
    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            
            'dropactivate',

            
            'dropdeactivate',

            
            'dropenter',

            
            'dropleave',

            
            'drop'
        );

        this.el = Ext.get(el);
        Ext.util.Droppable.superclass.constructor.call(this);

        if (!this.disabled) {
            this.enable();
        }

        this.el.addClass(this.baseCls);
    },

    
    onDragStart : function(draggable, e) {
        if (draggable.group === this.group) {
            this.monitoring = true;
            this.el.addClass(this.activeCls);
            this.region = this.el.getPageBox(true);

            draggable.on({
                drag: this.onDrag,
                beforedragend: this.onBeforeDragEnd,
                dragend: this.onDragEnd,
                scope: this
            });

            if (this.isDragOver(draggable)) {
                this.setCanDrop(true, draggable, e);
            }

            this.fireEvent('dropactivate', this, draggable, e);
        }
        else {
            draggable.on({
                dragend: function() {
                    this.el.removeClass(this.invalidCls);
                },
                scope: this,
                single: true
            });
            this.el.addClass(this.invalidCls);
        }
    },

    
    isDragOver : function(draggable, region) {
        return this.region[this.validDropMode](draggable.region);
    },

    
    onDrag : function(draggable, e) {
        this.setCanDrop(this.isDragOver(draggable), draggable, e);
    },

    
    setCanDrop : function(canDrop, draggable, e) {
        if (canDrop && !this.canDrop) {
            this.canDrop = true;
            this.el.addClass(this.hoverCls);
            this.fireEvent('dropenter', this, draggable, e);
        }
        else if (!canDrop && this.canDrop) {
            this.canDrop = false;
            this.el.removeClass(this.hoverCls);
            this.fireEvent('dropleave', this, draggable, e);
        }
    },

    
    onBeforeDragEnd: function(draggable, e) {
        draggable.cancelRevert = this.canDrop;
    },

    
    onDragEnd : function(draggable, e) {
        this.monitoring = false;
        this.el.removeClass(this.activeCls);

        draggable.un({
            drag: this.onDrag,
            beforedragend: this.onBeforeDragEnd,
            dragend: this.onDragEnd,
            scope: this
        });


        if (this.canDrop) {
            this.canDrop = false;
            this.el.removeClass(this.hoverCls);
            this.fireEvent('drop', this, draggable, e);
        }

        this.fireEvent('dropdeactivate', this, draggable, e);
    },

    
    enable : function() {
        if (!this.mgr) {
            this.mgr = Ext.util.Observable.observe(Ext.util.Draggable);
        }
        this.mgr.on({
            dragstart: this.onDragStart,
            scope: this
        });
        this.disabled = false;
    },

    
    disable : function() {
        this.mgr.un({
            dragstart: this.onDragStart,
            scope: this
        });
        this.disabled = true;
    }
});


Ext.util.Sortable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-sortable',

    
    direction: 'vertical',

    
    cancelSelector: null,

    
    
    
    

    
    constrain: window,
    
    group: 'base',

    
    revert: true,

    
    itemSelector: null,

    
    handleSelector: null,

    
    disabled: false,

    
    delay: 0,

    

    
    sorting: false,

    
    vertical: false,

    
    horizontal: false,

    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            
            'sortstart',
            
            'sortend',
            
            'sortchange'

            
            
            
            
            
            
            
            
        );

        this.el = Ext.get(el);
        Ext.util.Sortable.superclass.constructor.call(this);

        if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else if (this.direction == 'vertical') {
            this.vertical = true;
        }
        else {
            this.horizontal = this.vertical = true;
        }

        this.el.addClass(this.baseCls);
        this.tapEvent = (this.delay > 0) ? 'taphold' : 'tapstart';
        if (!this.disabled) {
            this.enable();
        }
    },

    
    onTapEvent : function(e, t) {
        if (this.cancelSelector && e.getTarget(this.cancelSelector)) {
            return;
        }

        if (this.handleSelector && !e.getTarget(this.handleSelector)) {
            return;
        }

        if (!this.sorting && (e.type === 'tapstart' || e.deltaTime >= this.delay)) {
            var item = e.getTarget(this.itemSelector);
            if ( item ) {
                this.onSortStart(e, item);
            }
        }
    },

    
    onSortStart : function(e, t) {
        this.sorting = true;
        var draggable = new Ext.util.Draggable(t, {
            delay: this.delay,
            revert: this.revert,
            direction: this.direction,
            constrain: this.constrain === true ? this.el : this.constrain
        });
        draggable.on({
            drag: this.onDrag,
            dragend: this.onDragEnd,
            scope: this
        });

        this.dragEl = t;
        this.calculateBoxes();
        draggable.canDrag = true;
        this.fireEvent('sortstart', this, e);
    },

    
    calculateBoxes : function() {
        this.items = [];
        var els = this.el.select(this.itemSelector, false),
            ln = els.length, i, item, el, box;

        for (i = 0; i < ln; i++) {
            el = els[i];
            if (el != this.dragEl) {
                item = Ext.fly(el).getPageBox(true);
                item.el = el;
                this.items.push(item);
            }
        }
    },

    
    onDrag : function(draggable, e) {
        var items = this.items,
            ln = items.length,
            region = draggable.region,
            sortChange = false,
            i, intersect, overlap, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            intersect = region.intersect(item);
            if (intersect) {
                if (this.vertical && Math.abs(intersect.top - intersect.bottom) > (region.bottom - region.top) / 2) {
                    if (region.bottom > item.top && item.top > region.top) {
                        draggable.el.insertAfter(item.el);
                    }
                    else {
                        draggable.el.insertBefore(item.el);
                    }
                    sortChange = true;
                }
                else if (this.horizontal && Math.abs(intersect.left - intersect.right) > (region.right - region.left) / 2) {
                    if (region.right > item.left && item.left > region.left) {
                        draggable.el.insertAfter(item.el);
                    }
                    else {
                        draggable.el.insertBefore(item.el);
                    }
                    sortChange = true;
                }

                if (sortChange) {
                    
                    draggable.reset();

                    
                    
                    draggable.moveTo(region.left, region.top);

                    
                    this.calculateBoxes();
                    this.fireEvent('sortchange', this, draggable.el, this.el.select(this.itemSelector, false).indexOf(draggable.el.dom));
                    return;
                }
            }
        }
    },

    
    onDragEnd : function(draggable, e) {
        draggable.destroy();
        this.sorting = false;
        this.fireEvent('sortend', this, draggable, e);
    },

    
    enable : function() {
        this.el.on(this.tapEvent, this.onTapEvent, this);
        this.disabled = false;
    },

    
    disable : function() {
        this.el.un(this.tapEvent, this.onTapEvent, this);
        this.disabled = true;
    }
});


Ext.util.Format = function() {
    return {
        
        defaultDateFormat: 'm/d/Y',
        
        
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

        
        htmlEncode: function(value) {
            return ! value ? value: String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        },

        
        htmlDecode: function(value) {
            return ! value ? value: String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        },

        
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





 (function() {

    
    Date.useStrict = false;


    
    
    
    function xf(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/\{(\d+)\}/g,
        function(m, i) {
            return args[i];
        });
    }


    
    Date.formatCodeToRegex = function(character, currentGroup) {
        
        var p = Date.parseCodes[character];

        if (p) {
            p = typeof p == 'function' ? p() : p;
            Date.parseCodes[character] = p;
            
        }

        return p ? Ext.applyIf({
            c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
        },
        p) : {
            g: 0,
            c: null,
            s: Ext.escapeRe(character)
            
        };
    };

    
    var $f = Date.formatCodeToRegex;

    Ext.apply(Date, {
        
        parseFunctions: {
            "M$": function(input, strict) {
                
                
                var re = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/');
                var r = (input || '').match(re);
                return r ? new Date(((r[1] || '') + r[2]) * 1) : null;
            }
        },
        parseRegexes: [],

        
        formatFunctions: {
            "M$": function() {
                
                return '\\/Date(' + this.getTime() + ')\\/';
            }
        },

        y2kYear: 50,

        
        MILLI: "ms",

        
        SECOND: "s",

        
        MINUTE: "mi",

        
        HOUR: "h",

        
        DAY: "d",

        
        MONTH: "mo",

        
        YEAR: "y",

        
        defaults: {},

        
        dayNames: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
        ],

        
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

        
        getShortMonthName: function(month) {
            return Date.monthNames[month].substring(0, 3);
        },

        
        getShortDayName: function(day) {
            return Date.dayNames[day].substring(0, 3);
        },

        
        getMonthNumber: function(name) {
            
            return Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        },

        
        formatCodes: {
            d: "String.leftPad(this.getDate(), 2, '0')",
            D: "Date.getShortDayName(this.getDay())",
            
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
                
                for (var c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
                    var e = c.charAt(i);
                    code.push(e == "T" ? "'T'": Date.getFormatCode(e));
                    
                }
                return code.join(" + ");
            },
            

            U: "Math.round(this.getTime() / 1000)"
        },

        
        isValid: function(y, m, d, h, i, s, ms) {
            
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

        
        parseDate: function(input, format, strict) {
            var p = Date.parseFunctions;
            if (p[format] == null) {
                Date.createParser(format);
            }
            return p[format](input, Ext.isDefined(strict) ? strict: Date.useStrict);
        },

        
        getFormatCode: function(character) {
            var f = Date.formatCodes[character];

            if (f) {
                f = typeof f == 'function' ? f() : f;
                Date.formatCodes[character] = f;
                
            }

            
            return f || ("'" + String.escape(character) + "'");
        },

        
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

        
        createParser: function() {
            var code = [
            "var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,",
            "def = Date.defaults,",
            "results = String(input).match(Date.parseRegexes[{0}]);",
            
            "if(results){",
            "{1}",

            "if(u != null){",
            
            "v = new Date(u * 1000);",
            
            "}else{",
            
            
            
            "dt = (new Date()).clearTime();",

            
            "y = Ext.num(y, Ext.num(def.y, dt.getFullYear()));",
            "m = Ext.num(m, Ext.num(def.m - 1, dt.getMonth()));",
            "d = Ext.num(d, Ext.num(def.d, dt.getDate()));",

            
            "h  = Ext.num(h, Ext.num(def.h, dt.getHours()));",
            "i  = Ext.num(i, Ext.num(def.i, dt.getMinutes()));",
            "s  = Ext.num(s, Ext.num(def.s, dt.getSeconds()));",
            "ms = Ext.num(ms, Ext.num(def.ms, dt.getMilliseconds()));",

            "if(z >= 0 && y >= 0){",
            
            
            
            "v = new Date(y, 0, 1, h, i, s, ms);",

            
            "v = !strict? v : (strict === true && (z <= 364 || (v.isLeapYear() && z <= 365))? v.add(Date.DAY, z) : null);",
            "}else if(strict === true && !Date.isValid(y, m + 1, d, h, i, s, ms)){",
            
            "v = null;",
            
            "}else{",
            
            "v = new Date(y, m, d, h, i, s, ms);",
            "}",
            "}",
            "}",

            "if(v){",
            
            "if(zz != null){",
            
            "v = v.add(Date.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
            
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

        
        parseCodes: {
            
            d: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                
            },
            j: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,2})"
                
            },
            D: function() {
                for (var a = [], i = 0; i < 7; a.push(Date.getShortDayName(i)), ++i);
                
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
                
            },
            z: {
                g: 1,
                c: "z = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,3})"
                
            },
            W: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
                
            },
            F: function() {
                return {
                    g: 1,
                    c: "m = parseInt(Date.getMonthNumber(results[{0}]), 10);\n",
                    
                    s: "(" + Date.monthNames.join("|") + ")"
                };
            },
            M: function() {
                for (var a = [], i = 0; i < 12; a.push(Date.getShortMonthName(i)), ++i);
                
                return Ext.applyIf({
                    s: "(" + a.join("|") + ")"
                },
                $f("F"));
            },
            m: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{2})"
                
            },
            n: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{1,2})"
                
            },
            t: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
                
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
                
            },
            y: {
                g: 1,
                c: "var ty = parseInt(results[{0}], 10);\n"
                + "y = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
                
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
                
            },
            h: function() {
                return $f("H");
            },
            H: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                
            },
            i: {
                g: 1,
                c: "i = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                
            },
            s: {
                g: 1,
                c: "s = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                
            },
            u: {
                g: 1,
                c: "ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
                s: "(\\d+)"
                
            },
            O: {
                g: 1,
                c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),",
                
                "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),",
                
                "mn = o.substring(3,5) % 60;",
                
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + String.leftPad(hr, 2, '0') + String.leftPad(mn, 2, '0')) : null;\n"
                
                ].join("\n"),
                s: "([+\-]\\d{4})"
                
            },
            P: {
                g: 1,
                c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),",
                
                "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),",
                
                "mn = o.substring(4,6) % 60;",
                
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + String.leftPad(hr, 2, '0') + String.leftPad(mn, 2, '0')) : null;\n"
                
                ].join("\n"),
                s: "([+\-]\\d{2}:\\d{2})"
                
            },
            T: {
                g: 0,
                c: null,
                s: "[A-Z]{1,4}"
                
            },
            Z: {
                g: 1,
                c: "zz = results[{0}] * 1;\n"
                
                + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
                s: "([+\-]?\\d{1,5})"
                
            },
            c: function() {
                var calc = [],
                arr = [
                $f("Y", 1),
                
                $f("m", 2),
                
                $f("d", 3),
                
                $f("h", 4),
                
                $f("i", 5),
                
                $f("s", 6),
                
                {
                    c: "ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"
                },
                
                {
                    c: [
                    
                    "if(results[8]) {",
                    
                    "if(results[8] == 'Z'){",
                    "zz = 0;",
                    
                    "}else if (results[8].indexOf(':') > -1){",
                    $f("P", 8).c,
                    
                    "}else{",
                    $f("O", 8).c,
                    
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
                    
                    "(?:", "-", arr[1].s,
                    
                    "(?:", "-", arr[2].s,
                    
                    "(?:",
                    "(?:T| )?",
                    
                    arr[3].s, ":", arr[4].s,
                    
                    "(?::", arr[5].s, ")?",
                    
                    "(?:(?:\\.|,)(\\d+))?",
                    
                    "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?",
                    
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
                
            }
        }
    });

} ());

Ext.apply(Date.prototype, {
    
    dateFormat: function(format) {
        if (Date.formatFunctions[format] == null) {
            Date.createFormat(format);
        }
        return Date.formatFunctions[format].call(this);
    },

    
    getTimezone: function() {
        
        
        
        
        
        
        
        
        
        
        
        
        return this.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
    },

    
    getGMTOffset: function(colon) {
        return (this.getTimezoneOffset() > 0 ? "-": "+")
        + String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset()) / 60), 2, "0")
        + (colon ? ":": "")
        + String.leftPad(Math.abs(this.getTimezoneOffset() % 60), 2, "0");
    },

    
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

    
    getWeekOfYear: function() {
        
        var ms1d = 864e5,
        
        ms7d = 7 * ms1d;
        
        return function() {
            
            var DC3 = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate() + 3) / ms1d,
            
            AWN = Math.floor(DC3 / 7),
            
            Wyr = new Date(AWN * ms7d).getUTCFullYear();

            return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
        };
    }(),

    
    isLeapYear: function() {
        var year = this.getFullYear();
        return !! ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    },

    
    getFirstDayOfMonth: function() {
        var day = (this.getDay() - (this.getDate() - 1)) % 7;
        return (day < 0) ? (day + 7) : day;
    },

    
    getLastDayOfMonth: function() {
        return this.getLastDateOfMonth().getDay();
    },


    
    getFirstDateOfMonth: function() {
        return new Date(this.getFullYear(), this.getMonth(), 1);
    },

    
    getLastDateOfMonth: function() {
        return new Date(this.getFullYear(), this.getMonth(), this.getDaysInMonth());
    },

    
    getDaysInMonth: function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function() {
            
            var m = this.getMonth();

            return m == 1 && this.isLeapYear() ? 29: daysInMonth[m];
        };
    }(),

    
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

    
    clone: function() {
        return new Date(this.getTime());
    },

    
    isDST: function() {
        
        
        return new Date(this.getFullYear(), 0, 1).getTimezoneOffset() != this.getTimezoneOffset();
    },

    
    clearTime: function(clone) {
        if (clone) {
            return this.clone().clearTime();
        }

        
        var d = this.getDate();

        
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);

        if (this.getDate() != d) {
            
            
            
            
            for (var hr = 1, c = this.add(Date.HOUR, hr); c.getDate() != d; hr++, c = this.add(Date.HOUR, hr));

            this.setDate(d);
            this.setHours(c.getHours());
        }

        return this;
    },

    
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

    
    between: function(start, end) {
        var t = this.getTime();
        return start.getTime() <= t && t <= end.getTime();
    }
});



Date.prototype.format = Date.prototype.dateFormat;



if (Ext.isSafari && (navigator.userAgent.match(/WebKit\/(\d+)/)[1] || NaN) < 420) {
    Ext.apply(Date.prototype, {
        _xMonth: Date.prototype.setMonth,
        _xDate: Date.prototype.setDate,

        
        
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

        
        
        
        setDate: function(d) {
            
            
            return this.setTime(this.getTime() - (this.getDate() - d) * 864e5);
        }
    });
}






Ext.Template = function(html) {
    var me = this,
        a = arguments,
        buf = [];

    if (Ext.isArray(html)) {
        html = html.join("");
    }
    else if (a.length > 1) {
        Ext.each(a, function(v) {
            if (Ext.isObject(v)) {
                Ext.apply(me, v);
            } else {
                buf.push(v);
            }
        });
        html = buf.join('');
    }

    
    me.html = html;
    
    if (me.compiled) {
        me.compile();
    }
};

Ext.Template.prototype = {
    
    re: /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
    argsRe: /^\s*['"](.*)["']\s*$/,
    compileARe: /\\/g,
    compileBRe: /(\r\n|\n)/g,
    compileCRe: /'/g,
    /**
     * See <code>{@link #re}</code>.
     * @type RegExp
     * @property re
     */

    disableFormats: false,
    /**
      * See <code>{@link #disableFormats}</code>.
      * @type Boolean
      * @property disableFormats
      */

    /**
     * Returns an HTML fragment of this template with the specified values applied.
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @return {String} The HTML fragment
     * @hide repeat doc
     */
    applyTemplate: function(values) {
        var me = this,
            useF = me.disableFormats !== true,
            fm = Ext.util.Format,
            tpl = me,
            re,
            i,
            len;

        if (me.compiled) {
            return me.compiled(values);
        }
        function fn(m, name, format, args) {
            if (format && useF) {
                if (format.substr(0, 5) == "this.") {
                    return tpl.call(format.substr(5), values[name], values);
                }
                else {
                    if (args) {
                        // quoted values are required for strings in compiled templates,
                        // but for non compiled we need to strip them
                        // quoted reversed for jsmin
                        re = me.argsRe;
                        args = args.split(',');
                        for (i = 0, len = args.length; i < len; i++) {
                            args[i] = args[i].replace(re, "$1");
                        }
                        args = [values[name]].concat(args);
                    }
                    else {
                        args = [values[name]];
                    }
                    return fm[format].apply(fm, args);
                }
            }
            else {
                return values[name] !== undefined ? values[name] : "";
            }
        }
        return me.html.replace(me.re, fn);
    },

    /**
     * Sets the HTML used as the template and optionally compiles it.
     * @param {String} html
     * @param {Boolean} compile (optional) True to compile the template (defaults to undefined)
     * @return {Ext.Template} this
     */
    set: function(html, compile) {
        var me = this;
        me.html = html;
        me.compiled = null;
        return compile ? me.compile() : me;
    },

    /**
     * Compiles the template into an internal function, eliminating the RegEx overhead.
     * @return {Ext.Template} this
     * @hide repeat doc
     */
    compile: function() {
        var me = this,
            fm = Ext.util.Format,
            useF = me.disableFormats !== true,
            body;

        function fn(m, name, format, args) {
            if (format && useF) {
                args = args ? ',' + args: "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                }
                else {
                    format = 'this.call("' + format.substr(5) + '", ';
                    args = ", values";
                }
            }
            else {
                args = '';
                format = "(values['" + name + "'] == undefined ? '' : ";
            }
            return "'," + format + "values['" + name + "']" + args + ") ,'";
        }

        // branched to use + in gecko and [].join() in others
        if (Ext.isGecko) {
            body = "this.compiled = function(values){ return '" +
            me.html.replace(me.compileARe, '\\\\').replace(me.compileBRe, '\\n').replace(me.compileCRe, "\\'").replace(me.re, fn) +
            "';};";
        }
        else {
            body = ["this.compiled = function(values){ return ['"];
            body.push(me.html.replace(me.compileARe, '\\\\').replace(me.compileBRe, '\\n').replace(me.compileCRe, "\\'").replace(me.re, fn));
            body.push("'].join('');};");
            body = body.join('');
        }
        eval(body);
        return me;
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) as the first child of el.
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertFirst: function(el, values, returnElement) {
        return this.doInsert('afterBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) before el.
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertBefore: function(el, values, returnElement) {
        return this.doInsert('beforeBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) after el.
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertAfter: function(el, values, returnElement) {
        return this.doInsert('afterEnd', el, values, returnElement);
    },

    /**
     * Applies the supplied <code>values</code> to the template and appends
     * the new node(s) to the specified <code>el</code>.
     * <p>For example usage {@link #Template see the constructor}.</p>
     * @param {Mixed} el The context element
     * @param {Object/Array} values
     * The template values. Can be an array if the params are numeric (i.e. <code>{0}</code>)
     * or an object (i.e. <code>{foo: 'bar'}</code>).
     * @param {Boolean} returnElement (optional) true to return an Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    append: function(el, values, returnElement) {
        return this.doInsert('beforeEnd', el, values, returnElement);
    },

    doInsert: function(where, el, values, returnEl) {
        el = Ext.getDom(el);
        var newNode = Ext.DomHelper.insertHtml(where, el, this.applyTemplate(values));
        return returnEl ? Ext.get(newNode, true) : newNode;
    },

    /**
     * Applies the supplied values to the template and overwrites the content of el with the new node(s).
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    overwrite: function(el, values, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.applyTemplate(values);
        return returnElement ? Ext.get(el.firstChild, true) : el.firstChild;
    },

    // private function used to call members
    call: function(fnName, value, allValues) {
        return this[fnName](value, allValues);
    }
};
/**
 * Alias for {@link #applyTemplate}
 * Returns an HTML fragment of this template with the specified <code>values</code> applied.
 * @param {Object/Array} values
 * The template values. Can be an array if the params are numeric (i.e. <code>{0}</code>)
 * or an object (i.e. <code>{foo: 'bar'}</code>).
 * @return {String} The HTML fragment
 * @member Ext.Template
 * @method apply
 */
Ext.Template.prototype.apply = Ext.Template.prototype.applyTemplate;

/**
 * Creates a template from the passed element's value (<i>display:none</i> textarea, preferred) or innerHTML.
 * @param {String/HTMLElement} el A DOM element or its id
 * @param {Object} config A configuration object
 * @return {Ext.Template} The created template
 * @static
 */
Ext.Template.from = function(el, config) {
    el = Ext.getDom(el);
    return new Ext.Template(el.value || el.innerHTML, config || '');
};


Ext.XTemplate = function() {
    Ext.XTemplate.superclass.constructor.apply(this, arguments);

    var me = this,
        s = me.html,
        re = /<tpl\b[^>]*>((?:(?=([^<]+))\2|<(?!tpl\b[^>]*>))*?)<\/tpl>/,
        nameRe = /^<tpl\b[^>]*?for="(.*?)"/,
        ifRe = /^<tpl\b[^>]*?if="(.*?)"/,
        execRe = /^<tpl\b[^>]*?exec="(.*?)"/,
        m,
        id = 0,
        tpls = [],
        VALUES = 'values',
        PARENT = 'parent',
        XINDEX = 'xindex',
        XCOUNT = 'xcount',
        RETURN = 'return ',
        WITHVALUES = 'with(values){ ';

    s = ['<tpl>', s, '</tpl>'].join('');

    while ((m = s.match(re))) {
        var m2 = m[0].match(nameRe),
            m3 = m[0].match(ifRe),
            m4 = m[0].match(execRe),
            exp = null,
            fn = null,
            exec = null,
            name = m2 && m2[1] ? m2[1] : '',
            i;

        if (m3) {
            exp = m3 && m3[1] ? m3[1] : null;
            if (exp) {
                fn = new Function(VALUES, PARENT, XINDEX, XCOUNT, WITHVALUES + 'try{' + RETURN + (Ext.util.Format.htmlDecode(exp)) + ';}catch(e){return;}}');
            }
        }
        if (m4) {
            exp = m4 && m4[1] ? m4[1] : null;
            if (exp) {
                exec = new Function(VALUES, PARENT, XINDEX, XCOUNT, WITHVALUES + (Ext.util.Format.htmlDecode(exp)) + '; }');
            }
        }
        if (name) {
            switch (name) {
            case '.':
                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + VALUES + '; }');
                break;
            case '..':
                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + PARENT + '; }');
                break;
            default:
                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + name + '; }');
            }
        }
        tpls.push({
            id: id,
            target: name,
            exec: exec,
            test: fn,
            body: m[1] || ''
        });
        s = s.replace(m[0], '{xtpl' + id + '}');
        ++id;
    }
    for (i = tpls.length - 1; i >= 0; --i) {
        me.compileTpl(tpls[i]);
    }
    me.master = tpls[tpls.length - 1];
    me.tpls = tpls;
};
Ext.extend(Ext.XTemplate, Ext.Template, {
    
    re: /\{([\w-\.\#]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\\]\s?[\d\.\+\-\*\\\(\)]+)?\}/g,
    
    codeRe: /\{\[((?:\\\]|.|\n)*?)\]\}/g,

    
    applySubTemplate: function(id, values, parent, xindex, xcount) {
        var me = this,
            len,
            t = me.tpls[id],
            vs,
            buf = [],
            i;
        if ((t.test && !t.test.call(me, values, parent, xindex, xcount)) ||
        (t.exec && t.exec.call(me, values, parent, xindex, xcount))) {
            return '';
        }
        vs = t.target ? t.target.call(me, values, parent) : values;
        len = vs.length;
        parent = t.target ? values: parent;
        if (t.target && Ext.isArray(vs)) {
            for (i = 0, len = vs.length; i < len; i++) {
                buf[buf.length] = t.compiled.call(me, vs[i], parent, i + 1, len);
            }
            return buf.join('');
        }
        return t.compiled.call(me, vs, parent, xindex, xcount);
    },

    
    compileTpl: function(tpl) {
        var fm = Ext.util.Format,
            useF = this.disableFormats !== true,
            body;

        function fn(m, name, format, args, math) {
            var v;
            

            
            if (name.substr(0, 4) == 'xtpl') {
                return "',this.applySubTemplate(" + name.substr(4) + ", values, parent, xindex, xcount),'";
            }
            
            if (name == '.') {
                v = 'typeof values == "string" ? values : ""';
            }

            
            else if (name == '#') {
                v = 'xindex';
            }

            
            else if (name.indexOf('.') != -1) {
                v = "values." + name;
            }

            
            else {
                v = "values['" + name + "']";
            }
            if (math) {
                v = '(' + v + math + ')';
            }
            if (format && useF) {
                args = args ? ',' + args: "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                }
                else {
                    format = 'this.call("' + format.substr(5) + '", ';
                    args = ", values";
                }
            }
            else {
                args = '';
                format = "(" + v + " === undefined ? '' : ";
            }
            return "'," + format + v + args + "),'";
        }

        function codeFn(m, code) {
            
            return "',(" + code.replace(/\\'/g, "'") + "),'";
        }
        body = ["tpl.compiled = function(values, parent, xindex, xcount){return ['"];
        body.push(tpl.body.replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn).replace(this.codeRe, codeFn));
        body.push("'].join('');};");
        body = body.join('');
        eval(body);
        return this;
    },

    
    applyTemplate: function(values) {
        return this.master.compiled.call(this, values, {}, 1, 1);
    },

    
    compile: function() {
        return this;
    }

    
    
    

});

Ext.XTemplate.prototype.apply = Ext.XTemplate.prototype.applyTemplate;


Ext.XTemplate.from = function(el, config) {
    el = Ext.getDom(el);
    return new Ext.XTemplate(el.value || el.innerHTML, config || {});
};


Ext.util.DelayedTask = function(fn, scope, args) {
    var me = this,
        id,
        call = function() {
            clearInterval(id);
            id = null;
            fn.apply(scope, args || []);
        };

    
    this.delay = function(delay, newFn, newScope, newArgs) {
        me.cancel();
        fn = newFn || fn;
        scope = newScope || scope;
        args = newArgs || args;
        id = setInterval(call, delay);
    };

    
    this.cancel = function(){
        if (id) {
            clearInterval(id);
            id = null;
        }
    };
};

Ext.data.Connection = Ext.extend(Ext.util.Observable, {
    method: 'post',
    url: null,

    
    disableCaching: true,

    
    disableCachingParam: '_dc',

    
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
            
            'beforerequest',
            
            'requestcomplete',
            
            'requestexception'
        );

        Ext.data.Connection.superclass.constructor.call(this);
    },

    
    request : function(o) {
        var me = this;
        if (me.fireEvent('beforerequest', me, o) !== false) {
            var params = o.params,
                url = o.url || me.url,
                request, data, headers,
                urlParams = o.urlParams,
                method, key, xhr;

            
            if (Ext.isFunction(params)) {
                params = params.call(o.scope || window, o);
            }

            
            if (Ext.isFunction(url)) {
                url = url.call(o.scope || window, o);
            }

            
            data = o.rawData || o.xmlData || o.jsonData || null;
            if (o.jsonData && !Ext.isPrimitive(o.jsonData)) {
                data = Ext.encode(data);
            }

            
            params = Ext.isObject(params) ? Ext.urlEncode(params) : params;
            urlParams = Ext.isObject(urlParams) ? Ext.urlEncode(urlParams) : urlParams;

            
            method = (o.method || me.method || ((params || data) ? 'POST' : 'GET')).toUpperCase();

            
            if (method === 'GET' && o.disableCaching !== false && !me.disableCaching) {
                url = Ext.urlAppend(url, o.disableCachingParam || me.disableCachingParam + '=' + (new Date().getTime()));
            }

            
            if ((method == 'GET' || data) && params){
                url = Ext.urlAppend(url, params);
                params = null;
            }

            
            if (urlParams) {
                url = Ext.urlAppend(url, urlParams);
            }

            
            if(o.autoAbort === true || me.autoAbort) {
                me.abort();
            }

            
            xhr = new XMLHttpRequest();

            
            xhr.open(method.toUpperCase(), url, true);

            
            headers = Ext.apply({}, o.headers || {}, me.defaultHeaders || {});
            if (!headers['Content-Type'] && (data || params)) {
                headers['Content-Type'] = data ? (o.rawData ? 'text/plain' : (o.xmlData ? 'text/xml' : 'application/json')) : me.defaultPostHeader;
            }
            if (me.useDefaultXhrHeader && !headers['X-Requested-With']) {
                headers['X-Requested-With'] = me.defaultXhrHeader;
            }
            
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

            
            xhr.onreadystatechange = me.onStateChange.createDelegate(me, [request]);

            
            xhr.send(data || params || null);
            return request;
        } else {
            return o.callback ? o.callback.apply(o.scope, [o, undefined, undefined]) : null;
        }
    },

    
    isLoading : function(r) {
        
        return r && !{0:true, 4:true}[r.xhr.readyState];
    },

    
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

    
    onStateChange : function(r) {
        if (r.xhr.readyState == 4) {
            clearTimeout(r.timeout);
            delete r.timeout;
            this.onComplete(r);
        }
    },

    
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


Ext.Ajax = new Ext.data.Connection({
    
    
    
    
    
    

    

    
    
    
    
    
    

    
    autoAbort : false
});


Ext.AbstractManager = Ext.extend(Object, {
    typeName: 'type',

    constructor: function(config) {
        Ext.apply(this, config || {});

        
        this.all = new Ext.util.MixedCollection();

        this.types = {};
    },

    
    get : function(id) {
        return this.all.get(id);
    },

    
    register: function(item) {
        this.all.add(item);
    },

    
    unregister: function(item) {
        this.all.remove(item);
    },

    
    registerType : function(type, cls){
        this.types[type] = cls;
        cls[this.typeName] = type;
    },

    
    isRegistered : function(type){
        return this.types[type] !== undefined;
    },

    
    create: function(config, defaultType) {
        var type        = config[this.typeName] || config.type || defaultType,
            Constructor = this.types[type];

        if (Constructor == undefined) {
            throw new Error(String.format("The '{0}' type has not been registered with this manager", type));
        }

        return new Constructor(config);
    },

    
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


Ext.PluginMgr = new Ext.AbstractManager({
    typeName: 'ptype',

    
    create : function(config, defaultType){
        var PluginCls = this.types[config.ptype || defaultType];
        if (PluginCls.init) {
            return PluginCls;
        } else {
            return new PluginCls(config);
        }
    },

    
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


Ext.preg = function() {
    return Ext.PluginMgr.registerType.apply(Ext.PluginMgr, arguments);
};


Ext.ComponentMgr = new Ext.AbstractManager({
    typeName: 'xtype',

    
    create : function(config, defaultType){
        return config.render ? config : new this.types[config.xtype || defaultType](config);
    }
});


Ext.reg = function() {
    return Ext.ComponentMgr.registerType.apply(Ext.ComponentMgr, arguments);
}; 


Ext.create = function() {
    return Ext.ComponentMgr.create.apply(Ext.ComponentMgr, arguments);
};





Ext.data.Batch = Ext.extend(Ext.util.Observable, {
    
    autoStart: false,
    
    
    current: -1,
    
    
    total: 0,
    
    
    running: false,
    
    
    complete: false,
    
    
    exception: false,
    
    
    pauseOnException: true,
    
    constructor: function(config) {
        Ext.apply(this, config || {});
        
        
        this.operations = [];
        
        this.addEvents(
          
          'complete',
          
          
          'exception',
          
          
          'operation-complete'
        );
        
        Ext.data.Batch.superclass.constructor.call(this, config);
    },
    
    
    add: function(operation) {
        this.total++;
        
        operation.setBatch(this);
        
        this.operations.push(operation);
    },
    
    
    start: function() {
        this.exception = false;
        this.running = true;
        
        this.runNextOperation();
    },
    
    
    runNextOperation: function() {
        this.runOperation(this.current + 1);
    },
    
    
    pause: function() {
        this.running = false;
    },
    
    
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

Ext.data.Model = Ext.extend(Ext.util.Observable, {
    evented: false,
    isModel: true,
    
    
    dirty : false,
    
    
    phantom : false,
    
    
    editing : false,
    
    
    idProperty: 'id',
    
    constructor: function(data, id) {
        data = data || {};
        
        if (this.evented) {
            this.addEvents(
                
            );
        }
        
        
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
        
        
        this.internalId = (id || id === 0) ? id : Ext.data.Model.id(this);
        
        this.data = data;
        
        
        this.modified = {};
        
        Ext.data.Model.superclass.constructor.apply(this);
    },
    
    
    markDirty : function() {
        this.dirty = true;
        
        if (!this.modified) {
            this.modified = {};
        }
        
        this.fields.each(function(field) {
            this.modified[field.name] = this.data[field.name];
        }, this);
    },
    
    
    getId: function() {
        return this.get(this.idProperty);
    },
    
    
    setId: function(id) {
        this.set(this.idProperty, id);
    },
    
    
    get: function(field) {
        return this.data[field];
    },
    
    
    set: function(field, value) {
        this.data[field] = value;
        
        this.dirty = true;
        
        if (!this.editing) {
            this.afterEdit();
        }
    },
    
    
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
    
    
    isModified : function(fieldName) {
        return !!(this.modified && this.modified.hasOwnProperty(fieldName));
    },
    
    
    copy : function(newId) {
        return new this.constructor(Ext.apply({}, this.data), newId || this.internalId);
    },
    
    
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
    
    
    commit : function(silent) {
        this.dirty = false;
        this.editing = false;
        
        delete this.modified;
        
        if (silent !== true) {
            this.afterCommit();
        }
    },
    
    
    join : function(store){
        
        this.store = store;
    },
    
    
    unjoin: function(store) {
        delete this.store;
    },
    
    
    afterEdit : function() {
        this.callStore('afterEdit');
    },
    
    
    afterReject : function(){
        this.callStore("afterReject");
    },
    
    
    afterCommit: function() {
        this.callStore('afterCommit');
    },
    
    
    callStore: function(fn) {
        var store = this.store;
        
        if (store != undefined && typeof store[fn] == "function") {
            store[fn](this);
        }
    }
});



Ext.data.Model.id = function(rec) {
    rec.phantom = true;
    return [Ext.data.Model.PREFIX, '-', Ext.data.Model.AUTO_ID++].join('');
};



Ext.ns('Ext.data.Record');


Ext.data.Record.id = Ext.data.Model.id;


Ext.data.Model.PREFIX = 'ext-record';
Ext.data.Model.AUTO_ID = 1;
Ext.data.Model.EDIT = 'edit';
Ext.data.Model.REJECT = 'reject';
Ext.data.Model.COMMIT = 'commit';


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

        
        if (Ext.isString(st)) {
            this.sortType = Ext.data.SortTypes[st];
        } else if(Ext.isEmpty(st)) {
            this.sortType = this.type.sortType;
        }

        if (!this.convert) {
            this.convert = this.type.convert;
        }
    },
    
    
    
    
    
    dateFormat: null,
    
    defaultValue: "",
    
    mapping: null,
    
    sortType : null,
    
    sortDir : "ASC",
    
    allowBlank : true
});


Ext.data.SortTypes = {
    
    none : function(s){
        return s;
    },
    
    
    stripTagsRE : /<\/?[^>]+>/gi,
    
    
    asText : function(s){
        return String(s).replace(this.stripTagsRE, "");
    },
    
    
    asUCText : function(s){
        return String(s).toUpperCase().replace(this.stripTagsRE, "");
    },
    
    
    asUCString : function(s) {
    	return String(s).toUpperCase();
    },
    
    
    asDate : function(s) {
        if(!s){
            return 0;
        }
        if(Ext.isDate(s)){
            return s.getTime();
        }
    	return Date.parse(String(s));
    },
    
    
    asFloat : function(s) {
    	var val = parseFloat(String(s).replace(/,/g, ""));
    	return isNaN(val) ? 0 : val;
    },
    
    
    asInt : function(s) {
        var val = parseInt(String(s).replace(/,/g, ""), 10);
        return isNaN(val) ? 0 : val;
    }
};

Ext.data.Types = new function(){
    var st = Ext.data.SortTypes;
    Ext.apply(this, {
        
        stripRe: /[\$,%]/g,
        
        
        AUTO: {
            convert: function(v){ return v; },
            sortType: st.none,
            type: 'auto'
        },

        
        STRING: {
            convert: function(v){ return (v === undefined || v === null) ? '' : String(v); },
            sortType: st.asUCString,
            type: 'string'
        },

        
        INT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : 0;
            },
            sortType: st.none,
            type: 'int'
        },
        
        
        FLOAT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : 0;
            },
            sortType: st.none,
            type: 'float'
        },
        
        
        BOOL: {
            convert: function(v){ return v === true || v === 'true' || v == 1; },
            sortType: st.none,
            type: 'bool'
        },
        
        
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
        
        BOOLEAN: this.BOOL,
        
        INTEGER: this.INT,
        
        NUMBER: this.FLOAT    
    });
};

Ext.ModelMgr = new Ext.AbstractManager({
    typeName: 'mtype',
    
    
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

Ext.data.Operation = Ext.extend(Object, {
    
    synchronous: true,
    
    
    action: undefined,
    
    
    filters: undefined,
    
    
    sorters: undefined,
    
    
    group: undefined,
    
    
    start: undefined,
    
    
    limit: undefined,
    
    
    batch: undefined,
    
        
    
    started: false,
    
    
    running: false,
    
    
    complete: false,
    
    
    success: undefined,
    
    
    exception: false,
    
    
    error: undefined,
    
    constructor: function(config) {
        Ext.apply(this, config || {});
    },
    
    
    markStarted: function() {
        this.started = true;
        this.running = true;
    },
    
    
    markCompleted: function() {
        this.complete = true;
        this.running  = false;
    },
    
    
    markException: function(error) {
        this.exception = true;
        this.success = false;
        this.running = false;
        this.error = error;
    },
    
    
    hasException: function() {
        return this.exception === true;
    },
    
    
    getError: function() {
        return this.error;
    },
    
    
    getRecords: function() {
        var resultSet = this.getResultSet();
        
        return (resultSet == undefined ? [] : resultSet.records);
    },
    
    
    getResultSet: function() {
        return this.resultSet;
    },
    
    
    isStarted: function() {
        return this.started === true;
    },
    
    
    isRunning: function() {
        return this.running === true;
    },
    
    
    isComplete: function() {
        return this.complete === true;
    },
    
    
    wasSuccessful: function() {
        return this.isComplete() && this.success === true;
    },
    
    
    setBatch: function(batch) {
        this.batch = batch;
    },
    
    
    allowWrite: function(){
        return this.action != 'read';
    }
});
Ext.data.ProxyMgr = new Ext.AbstractManager({
    
});

Ext.data.ReaderMgr = new Ext.AbstractManager({
    typeName: 'rtype'
});

Ext.data.Request = Ext.extend(Object, {
    
    action: undefined,
    
    
    params: undefined,
    
    
    method: 'GET',
    
    
    url: undefined,

    constructor: function(config) {
        Ext.apply(this, config || {});
    }
});

Ext.data.ResultSet = Ext.extend(Object, {
    
    loaded: true,
    
    
    count: 0,
    
    
    total: 0,
    
    
    success: false,
    
    

    constructor: function(config) {
        Ext.apply(this, config || {});
        
        if (config.count == undefined) {
            this.count = this.records.length;
        }
    }
});

Ext.data.Store = Ext.extend(Ext.util.Observable, {
    remoteSort  : false,
    remoteFilter: false,
    
    
    
    
    
    
    autoLoad: false,
    
    
    autoSave: false,
    
    
    groupField: undefined,
    
    
    groupDir: "ASC",
    
    
    pageSize: 25,
    
    
    batchUpdateMode: 'operation',
    
    
    filterOnLoad: true,
    
    
    sortOnLoad: true,
    
    
    currentPage: 1,
    
    
    implicitModel: true,
    
    
    defaultProxyType: 'memory',
    
    
    constructor: function(config) {
        this.addEvents(
            
            'add',
            
            
            'remove',
            
            
            'update',
            
            
            'datachanged'
        );
        
        
        this.removed = [];
        
        
        this.sortToggle = {};
        
        
        this.data = new Ext.util.MixedCollection(false, function(record) {
            return record.id;
        });
        
        if (config.data) {
            this.inlineData = config.data;
            delete config.data;
        }
        
        Ext.data.Store.superclass.constructor.apply(this, arguments);
        
        this.model = Ext.ModelMgr.getModel(config.model);
        
        
        if (!this.model && config.fields) {
            this.model = Ext.regModel('ImplicitModel-' + this.storeId || Ext.id(), {
                fields: config.fields
            });
            
            delete this.fields;
            
            this.implicitModel = true;
        }
        
        
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

    
    getProxy: function() {
        return this.proxy;
    },
    
    
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
    
    
    getGroupString: function(instance) {
        return instance.get(this.groupField);
    },
    
    
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
    
    
    create: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'create',
            records: this.getNewRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.create(operation, this.onProxyWrite, this);
    },

    
    each : function(fn, scope){
        this.data.each(fn, scope);
    },

    
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
    
    
    removeAt: function(index) {
        var record = this.getAt(index);
        
        if (record) {
            this.remove(record);
        }
    },
    
    
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
        
        
        var callback = operation.callback;
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },
    
    onBatchOperationComplete: function(batch, operation) {
        
    },
    
    
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
        
        
        
        
        
    },
    
    
    
    getNewRecords: function() {
        return this.data.filterBy(this.filterNew).items;
    },
    
    
    filterNew: function(item){
        return item.phantom == true;
    },
    
    
    getUpdatedRecords: function() {
        return this.data.filterBy(this.filterDirty).items;
    },
    
    
    filterDirty: function(item){
        return item.dirty == true;    
    },
    
    
    getRemovedRecords: function() {
        return this.removed;
    },
    
    
    defaultSortDirection: "ASC",
    
    
    sort: function(sorters, direction, suppressEvent) {
        sorters = sorters || this.sorters;
        direction = (this.sortToggle[name] || this.defaultSortDirection).toggle('ASC', 'DESC');
        
        this.sortToggle[name] = direction;
        
        
        
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
            
            this.read();
        } else {
            if (sorters == undefined || sorters.length == 0) {
                return;
            }
            
            var sortFns = [],
                length  = sorters.length,
                i;
            
            
            for (i = 0; i < length; i++) {
                sortFns.push(this.createSortFunction(sorters[i].field, sorters[i].direction));
            }

            
            
            var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

            
            var fn = function(r1, r2) {
                var result = sortFns[0].call(this, r1, r2);
               
                
                if (sortFns.length > 1) {
                    for (var i=1, j = sortFns.length; i < j; i++) {
                        result = result || sortFns[i].call(this, r1, r2);
                    }
                }
               
                return directionModifier * result;
            };

            
            this.data.sort(direction, fn);
            
            if (!suppressEvent) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    
    createSortFunction: function(field, direction) {
        direction = direction || "ASC";
        var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

        var fields   = this.model.prototype.fields,
            sortType = fields.get(field).sortType;

        
        
        return function(r1, r2) {
            var v1 = sortType(r1.data[field]),
                v2 = sortType(r2.data[field]);

            return directionModifier * (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
        };
    },
    
    
    filter: function(filters, suppressEvent) {
        this.filters = filters || this.filters;
        
        if (this.remoteFilter) {
            
            this.read();
        } else {
            
            this.snapshot = this.snapshot || this.data.clone();
            
            this.data = this.data.filter(this.filters);
            
            if (!suppressEvent) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    
    clearFilter : function(suppressEvent){
        if (this.isFiltered()) {
            this.data = this.snapshot.clone();
            delete this.snapshot;
            
            if (suppressEvent !== true) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    
    isFiltered : function(){
        return !!this.snapshot && this.snapshot != this.data;
    },
    
    
    sync: function() {
        this.proxy.batch({
            create : this.getNewRecords(),
            update : this.getUpdatedRecords(),
            destroy: this.getRemovedRecords()
        }, this.getBatchListeners());
    },
    
    
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
    
    
    save: function() {
        return this.sync.apply(this, arguments);
    },
    
    
    load: function() {
        return this.read.apply(this, arguments);
    },
    
    
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
    
    
    afterEdit : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.EDIT);
    },
    
    
    afterReject : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.REJECT);
    },

    
    afterCommit : function(record) {
        if (this.autoSave) {
            this.sync();
        }
        
        this.fireEvent('update', this, record, Ext.data.Model.COMMIT);
    },
    
    
    loadData: function(data, append) {
        var model = this.model,
            i, length, record;
        
        
        for (i = 0, length = data.length; i < length; i++) {
            record = data[i];
            
            if (!(record instanceof Ext.data.Model)) {
                data[i] = Ext.ModelMgr.create(record, model);
            }
        }
        
        this.loadRecords(data, append);
    },
    
    
    
    
    
    loadPage: function(page) {
        this.currentPage = page;
        
        this.read({
            start: (page - 1) * this.pageSize,
            limit: this.pageSize
        });
    },
    
    
    nextPage: function() {
        this.loadPage(this.currentPage + 1);
    },
    
    
    previousPage: function() {
        this.loadPage(this.currentPage - 1);
    },
    
    
    
    
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
    
    
    clearData: function(){
        this.data.each(function(record) {
            record.unjoin();
        });
        
        this.data.clear();
    },
    
    
    find : function(property, value, start, anyMatch, caseSensitive) {
        var fn = this.createFilterFn(property, value, anyMatch, caseSensitive);
        return fn ? this.data.findIndexBy(fn, null, start) : -1;
    },
    
    
    createFilterFn : function(property, value, anyMatch, caseSensitive, exactMatch){
        if(Ext.isEmpty(value, false)){
            return false;
        }
        value = this.data.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r.data[property]);
        };
    },

    
    findExact: function(property, value, start){
        return this.data.findIndexBy(function(rec){
            return rec.get(property) === value;
        }, this, start);
    },

    
    findBy : function(fn, scope, start){
        return this.data.findIndexBy(fn, scope, start);
    },
    
    
    getCount : function() {
        return this.data.length || 0;
    },
    
    
    getAt : function(index) {
        return this.data.itemAt(index);
    },

    
    getRange : function(start, end) {
        return this.data.getRange(start, end);
    },
    
    
    getById : function(id) {
        return (this.snapshot || this.data).find(function(record) {
            return record.getId() === id;
        });
    },
    
    
    indexOf : function(record) {
        return this.data.indexOf(record);
    },

    
    indexOfId : function(id) {
        return this.data.indexOfKey(id);
    },
    
    
    getSortState : function() {
        return this.sortInfo;
    }
});

Ext.StoreMgr = Ext.apply(new Ext.util.MixedCollection(), {
    

    
    register : function() {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.add(s);
        }
    },

    
    unregister : function() {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.remove(this.lookup(s));
        }
    },

    
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

    
    getKey : function(o) {
         return o.storeId;
    }
});
Ext.data.WriterMgr = new Ext.AbstractManager({
    
});

Ext.data.Tree = Ext.extend(Ext.util.Observable, {
    
    constructor: function(root){
        this.nodeHash = {};
        
        this.root = null;
        if(root){
            this.setRootNode(root);
        }
        this.addEvents(
            
            "append",
            
            "remove",
            
            "move",
            
            "insert",
            
            "beforeappend",
            
            "beforeremove",
            
            "beforemove",
            
            "beforeinsert"
        );
        Ext.data.Tree.superclass.constructor.call(this);        
    },
    
    
    pathSeparator: "/",

    
    proxyNodeEvent : function(){
        return this.fireEvent.apply(this, arguments);
    },

    
    getRootNode : function(){
        return this.root;
    },

    
    setRootNode : function(node){
        this.root = node;
        node.ownerTree = this;
        node.isRoot = true;
        this.registerNode(node);
        return node;
    },

    
    getNodeById : function(id){
        return this.nodeHash[id];
    },

    
    registerNode : function(node){
        this.nodeHash[node.id] = node;
    },

    
    unregisterNode : function(node){
        delete this.nodeHash[node.id];
    },

    toString : function(){
        return "[Tree"+(this.id?" "+this.id:"")+"]";
    }
});


Ext.data.Node = Ext.extend(Ext.util.Observable, {
    
    constructor: function(attributes){
        
        this.attributes = attributes || {};
        this.leaf = this.attributes.leaf;
        
        this.id = this.attributes.id;
        if(!this.id){
            this.id = Ext.id(null, "xnode-");
            this.attributes.id = this.id;
        }
        
        this.childNodes = [];
        
        this.parentNode = null;
        
        this.firstChild = null;
        
        this.lastChild = null;
        
        this.previousSibling = null;
        
        this.nextSibling = null;

        this.addEvents({
            
            "append" : true,
            
            "remove" : true,
            
            "move" : true,
            
            "insert" : true,
            
            "beforeappend" : true,
            
            "beforeremove" : true,
            
            "beforemove" : true,
             
            "beforeinsert" : true
        });
        this.listeners = this.attributes.listeners;
        Ext.data.Node.superclass.constructor.call(this);    
    },
    
    
    fireEvent : function(evtName){
        
        if(Ext.data.Node.superclass.fireEvent.apply(this, arguments) === false){
            return false;
        }
        
        var ot = this.getOwnerTree();
        if(ot){
            if(ot.proxyNodeEvent.apply(ot, arguments) === false){
                return false;
            }
        }
        return true;
    },

    
    isLeaf : function(){
        return this.leaf === true;
    },

    
    setFirstChild : function(node){
        this.firstChild = node;
    },

    
    setLastChild : function(node){
        this.lastChild = node;
    },


    
    isLast : function(){
       return (!this.parentNode ? true : this.parentNode.lastChild == this);
    },

    
    isFirst : function(){
       return (!this.parentNode ? true : this.parentNode.firstChild == this);
    },

    
    hasChildNodes : function(){
        return !this.isLeaf() && this.childNodes.length > 0;
    },

    
    isExpandable : function(){
        return this.attributes.expandable || this.hasChildNodes();
    },

    
    appendChild : function(node){
        var multi = false;
        if(Ext.isArray(node)){
            multi = node;
        }else if(arguments.length > 1){
            multi = arguments;
        }
        
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

    
    removeChild : function(node, destroy){
        var index = this.childNodes.indexOf(node);
        if(index == -1){
            return false;
        }
        if(this.fireEvent("beforeremove", this.ownerTree, this, node) === false){
            return false;
        }

        
        this.childNodes.splice(index, 1);

        
        if(node.previousSibling){
            node.previousSibling.nextSibling = node.nextSibling;
        }
        if(node.nextSibling){
            node.nextSibling.previousSibling = node.previousSibling;
        }

        
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

    
    clear : function(destroy){
        
        this.setOwnerTree(null, destroy);
        this.parentNode = this.previousSibling = this.nextSibling = null;
        if(destroy){
            this.firstChild = this.lastChild = null;
        }
    },

    
    destroy : function( silent){
        
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

    
    insertBefore : function(node, refNode){
        if(!refNode){ 
            return this.appendChild(node);
        }
        
        if(node == refNode){
            return false;
        }

        if(this.fireEvent("beforeinsert", this.ownerTree, this, node, refNode) === false){
            return false;
        }
        var index = this.childNodes.indexOf(refNode);
        var oldParent = node.parentNode;
        var refIndex = index;

        
        if(oldParent == this && this.childNodes.indexOf(node) < index){
            refIndex--;
        }

        
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

    
    remove : function(destroy){
        if (this.parentNode) {
            this.parentNode.removeChild(this, destroy);
        }
        return this;
    },

    
    removeAll : function(destroy){
        var cn = this.childNodes,
            n;
        while((n = cn[0])){
            this.removeChild(n, destroy);
        }
        return this;
    },

    
    item : function(index){
        return this.childNodes[index];
    },

    
    replaceChild : function(newChild, oldChild){
        var s = oldChild ? oldChild.nextSibling : null;
        this.removeChild(oldChild);
        this.insertBefore(newChild, s);
        return oldChild;
    },

    
    indexOf : function(child){
        return this.childNodes.indexOf(child);
    },

    
    getOwnerTree : function(){
        
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

    
    getDepth : function(){
        var depth = 0;
        var p = this;
        while(p.parentNode){
            ++depth;
            p = p.parentNode;
        }
        return depth;
    },

    
    setOwnerTree : function(tree, destroy){
        
        if(tree != this.ownerTree){
            if(this.ownerTree){
                this.ownerTree.unregisterNode(this);
            }
            this.ownerTree = tree;
            
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

    
    onIdChange: Ext.emptyFn,

    
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

    
    bubble : function(fn, scope, args){
        var p = this;
        while(p){
            if(fn.apply(scope || p, args || [p]) === false){
                break;
            }
            p = p.parentNode;
        }
    },

    
    cascade : function(fn, scope, args){
        if(fn.apply(scope || this, args || [this]) !== false){
            var cs = this.childNodes;
            for(var i = 0, len = cs.length; i < len; i++) {
                cs[i].cascade(fn, scope, args);
            }
        }
    },

    
    eachChild : function(fn, scope, args){
        var cs = this.childNodes;
        for(var i = 0, len = cs.length; i < len; i++) {
            if(fn.apply(scope || this, args || [cs[i]]) === false){
                break;
            }
        }
    },

    
    findChild : function(attribute, value, deep){
        return this.findChildBy(function(){
            return this.attributes[attribute] == value;
        }, null, deep);
    },

    
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

    
    contains : function(node){
        return node.isAncestor(this);
    },

    
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

Ext.data.Proxy = Ext.extend(Ext.util.Observable, {
    
    batchOrder: 'create,update,destroy',
    
    
    constructor: function(config) {
        Ext.data.Proxy.superclass.constructor.call(this, config);
        
        Ext.apply(this, config || {});
    },
    
    
    setModel: function(model) {
        this.model = Ext.ModelMgr.getModel(model);
    },
    
    
    getModel: function() {
        return this.model;
    },
    
    
    create: Ext.emptyFn,
    
    
    read: Ext.emptyFn,
    
    
    update: Ext.emptyFn,
    
    
    destroy: Ext.emptyFn,
    
    
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


Ext.data.DataProxy = Ext.data.Proxy;

Ext.data.ProxyMgr.registerType('proxy', Ext.data.Proxy);

Ext.data.ServerProxy = Ext.extend(Ext.data.Proxy, {
    
    
    
    noCache : true,
    
    
    cacheString: "_dc",
    
    
    defaultReaderType: 'json',
    
    
    defaultWriterType: 'json',
    
    
    constructor: function(config) {
        Ext.data.ServerProxy.superclass.constructor.call(this, config);
        
        
        this.extraParams = config.extraParams || {};
        
        
        this.nocache = this.noCache;
        
        
        this.setReader(this.reader);
        this.setWriter(this.writer);
    },
    
    
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
    
    
    getReader: function() {
        return this.reader;
    },
    
    
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
    
    
    getWriter: function() {
        return this.writer;
    },
    
    
    setModel: function(model){
        Ext.data.ServerProxy.superclass.setModel.call(this, model);
        model = this.model;
        
        var reader = this.reader;
        if(reader && !reader.model){
            this.reader.setModel(model);
        }
        if(this.writer){
            this.writer.model = model;
        }
    },
    
    
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
    
    
    buildRequest: function(operation) {
        var params = Ext.applyIf(operation.params || {}, this.extraParams || {});
        
        
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
        
        
        operation.request = request;
        
        return request;
    },
    
    
    buildUrl: function(request) {
        var url = request.url || this.url;
        
        if (this.noCache) {
            url = Ext.urlAppend(url, String.format("{0}={1}", this.cacheString, (new Date().getTime())));
        }
        
        return url;
    },
    
    
    doRequest: function(operation, callback, scope) {
        throw new Error("The doRequest function has not been implemented on your Ext.data.ServerProxy subclass. See src/data/ServerProxy.js for details");
    },
    
    
    afterRequest: Ext.emptyFn,
    
    onDestroy: function() {
        Ext.destroy(this.reader, this.writer);
        
        Ext.data.ServerProxy.superclass.destroy.apply(this, arguments);
    }
});

Ext.data.AjaxProxy = Ext.extend(Ext.data.ServerProxy, {
    
    actionMethods: {
        create : 'POST',
        read   : 'GET',
        update : 'POST',
        destroy: 'POST'
    },
    
    
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
    
    
    getMethod: function(request) {
        return this.actionMethods[request.action];
    },
    
    
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;
        
        return function(options, success, response) {
            if (success === true) {
                var reader = me.getReader(),
                    result = reader.read(response);

                
                Ext.apply(operation, {
                    response : response,
                    resultSet: result
                });

                operation.markCompleted();
            } else {
                this.fireEvent('exception', this, 'response', operation);
                
                
                operation.markException();                
            }
            
            
            if (typeof callback == 'function') {
                callback.call(scope || me, operation);
            }
            
            me.afterRequest(request, true);
        };
    }
});

Ext.data.ProxyMgr.registerType('ajax', Ext.data.AjaxProxy);


Ext.data.HttpProxy = Ext.data.AjaxProxy;

Ext.data.RestProxy = Ext.extend(Ext.data.AjaxProxy, {
    
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


Ext.data.ScriptTagProxy = Ext.extend(Ext.data.ServerProxy, {
    defaultWriterType: 'base',
    
    
    timeout : 30000,
    
    
    callbackParam : "callback",
    
    
    scriptIdPrefix: 'stcScript',
    
    
    callbackPrefix: 'stcCallback',
    
    
    recordParam: 'records',
    
    
    lastRequest: undefined,

    
    doRequest: function(operation, callback, scope) {
        
        var format     = String.format,
            transId    = ++Ext.data.ScriptTagProxy.TRANS_ID,
            scriptId   = format("{0}{1}", this.scriptIdPrefix, transId),
            stCallback = format("{0}{1}", this.callbackPrefix, transId);
        
        var writer  = this.getWriter(),
            request = this.buildRequest(operation),
            
            url     = Ext.urlAppend(request.url, format("{0}={1}", this.callbackParam, stCallback));
            
        if(operation.allowWrite()){
            request = writer.write(request);
        }
        
        
        Ext.apply(request, {
            url       : url,
            transId   : transId,
            scriptId  : scriptId,
            stCallback: stCallback
        });
        
        
        request.timeoutId = this.createTimeoutHandler.defer(this.timeout, this, [request]);
        
        
        window[stCallback] = this.createRequestCallback(request, operation, callback, scope);
        
        
        var script = document.createElement("script");
        script.setAttribute("src", url);
        script.setAttribute("type", "text/javascript");
        script.setAttribute("id", scriptId);
        
        Ext.getHead().appendChild(script);
        operation.markStarted();
        
        this.lastRequest = request;
        
        return request;
    },
    
    
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;
        
        return function(response) {
            var reader = me.getReader(),
                result = reader.read(response);
            
            
            Ext.apply(operation, {
                response : response,
                resultSet: result
            });
            
            operation.markCompleted();
            
            
            if (typeof callback == 'function') {
                callback.call(scope || me, operation);
            }
            
            me.afterRequest(request, true);
        };
    },
    
    
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
                
                window[callbackName] = cleanup(callbackName);
            }
        };
    }(),
    
    
    buildUrl: function(request) {
        var url = Ext.data.ScriptTagProxy.superclass.buildUrl.call(this, request);
        
        url = Ext.urlAppend(url, Ext.urlEncode(request.params));
        
        
        var records = request.records;
        
        if (Ext.isArray(records) && records.length > 0) {
            url = Ext.urlAppend(url, String.format("{0}={1}", this.recordParam, this.encodeRecords(records)));
        }
        
        return url;
    },
    
    
    destroy: function() {
        this.abort();
        
        Ext.data.ScriptTagProxy.superclass.destroy.apply(this, arguments);
    },
        
    
    isLoading : function(){
        var lastRequest = this.lastRequest;
        
        return (lastRequest != undefined && !lastRequest.completed);
    },
    
    
    abort: function() {
        if (this.isLoading()) {
            this.afterRequest(this.lastRequest);
        }
    },
        
    
    encodeRecords: function(records) {
        var encoded = "";
        
        for (var i = 0, length = records.length; i < length; i++) {
            encoded += Ext.urlEncode(records[i].data);
        }
        
        return encoded;
    },
    
    
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

Ext.data.ClientProxy = Ext.extend(Ext.data.Proxy, {
    
    clear: function() {
        throw new Error("The Ext.data.ClientProxy subclass that you are using has not defined a 'clear' function. See src/data/ClientProxy.js for details.");
    }
});

Ext.data.MemoryProxy = Ext.extend(Ext.data.ClientProxy, {
    constructor: function(config) {
        Ext.data.MemoryProxy.superclass.constructor.call(this, config);
        
        this.data = {};
    }
});

Ext.data.ProxyMgr.registerType('memory', Ext.data.MemoryProxy);

Ext.data.WebStorageProxy = Ext.extend(Ext.data.ClientProxy, {
    
    id: undefined,
    
    
    constructor: function(config) {
        Ext.data.WebStorageProxy.superclass.constructor.call(this, config);
        
        if (this.getStorageObject() == undefined) {
            throw new Error("Local Storage is not supported in this browser, please use another type of data proxy");
        }
        
        
        this.id = this.id || (this.store ? this.store.storeId : undefined);
        
        if (this.id == undefined) {
            throw new Error("No unique id was provided to the local storage proxy. See Ext.data.LocalStorageProxy documentation for details");
        }
        
        this.initialize();
    },
    
    
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
    
    
    read: function(operation, callback, scope) {
        
        
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
    
    
    destroy: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),
            
            
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
        
        
        obj.removeItem(key);
        obj.setItem(key, Ext.encode(data));
    },
    
    
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
    
    
    getRecordKey: function(id) {
        if (id instanceof Ext.data.Model) {
            id = id.getId();
        }
        
        return String.format("{0}-{1}", this.id, id);
    },
    
    
    getRecordCounterKey: function() {
        return String.format("{0}-counter", this.id);
    },
    
    
    getIds: function() {
        var ids = (this.getStorageObject().getItem(this.id) || "").split(",");
        
        if (ids.length == 1 && ids[0] == "") {
            ids = [];
        }
        
        return ids;
    },
    
    
    setIds: function(ids) {
        var obj = this.getStorageObject(),
            str = ids.join(",");
        
        if (Ext.isEmpty(str)) {
            obj.removeItem(this.id);
        } else {
            obj.setItem(this.id,  str);
        }
    },
    
    
    getNextId: function() {
        var obj  = this.getStorageObject(),
            key  = this.getRecordCounterKey(),
            last = +obj[key],
            id   = last ? last + 1 : 1;
        
        obj.setItem(key, id);
        
        return parseInt(id, 10);
    },
    
    
    initialize: function() {
        var storageObject = this.getStorageObject();
        storageObject.setItem(this.id, storageObject.getItem(this.id) || "");
    },
    
    
    clear: function() {
        var obj = this.getStorageObject(),
            ids = this.getIds(),
            len = ids.length,
            i;
        
        
        for (i = 0; i < len; i++) {
            this.removeRecord(ids[i]);
        }
        
        
        obj.removeItem(this.getRecordCounterKey());
        obj.removeItem(this.id);
    },
    
    
    getStorageObject: function() {
        throw new Error("The getStorageObject function has not been defined in your Ext.data.WebStorageProxy subclass");
    }
});

Ext.data.LocalStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    
    getStorageObject: function() {
        return localStorage;
    }
});

Ext.data.ProxyMgr.registerType('localstorage', Ext.data.LocalStorageProxy);

Ext.data.SessionStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    
    getStorageObject: function() {
        return sessionStorage;
    }
});

Ext.data.ProxyMgr.registerType('sessionstorage', Ext.data.SessionStorageProxy);

Ext.data.Reader = Ext.extend(Object, {
    
    
    
    
    
    
    
    root: '',
    
    constructor: function(config) {
        Ext.apply(this, config || {});
        
        this.model = Ext.ModelMgr.getModel(config.model);
        if (this.model) {
            this.buildExtractors();
        }
    },
    
    
    setModel: function(model){
        this.model = Ext.ModelMgr.getModel(model);
        delete this.extractorFunctions;
        this.buildExtractors();
    },
    
    
    read: function(response) {
        var data = response;
        
        if (response.responseText) {
            data = this.getResponseData(response);
        }
        
        return this.readRecords(data);
    },
    
    
    readRecords: function(data) {
        
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
    
    
    getData: function(data) {
        return data;
    },
    
    
    getRoot: function(data) {
        return data;
    },
    
    
    getResponseData: function(response) {
        throw new Error("getResponseData must be implemented in the Ext.data.Reader subclass");
    },
    
    
    onMetaChange : function(meta) {
        Ext.apply(this, meta || {});
        
        delete this.extractorFunctions;
        this.buildExtractors();
    },
    
    
    buildExtractors: function() {
        if (this.extractorFunctions) {
            return;
        }
        
        var idProp      = this.id || this.idProperty,
            totalProp   = this.totalProperty,
            successProp = this.successProperty,
            messageProp = this.messageProperty;
        
        
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

Ext.data.Writer = Ext.extend(Object, {
    
    constructor: function(config) {
        Ext.apply(this, config);
    },
    
    
    write: function(request) {
        var operation = request.operation,
            records   = operation.records || [],
            data      = [];
        
        for (var i = 0, length = records.length; i < length; i++) {
            data.push(this.getRecordData(records[i]));
        }
        return this.writeRecords(request, data);
    },
    
    
    getRecordData: function(record){
        return record.data;
    }
});

Ext.data.WriterMgr.registerType('base', Ext.data.Writer);




Ext.data.JsonWriter = Ext.extend(Ext.data.Writer, {
    
    root: 'records',
    
    
    encode: false,
    
    
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


Ext.data.JsonReader = Ext.extend(Ext.data.Reader, {

    
    readRecords: function(data) {
        
        if (data.metaData) {
            this.onMetaChange(data.metaData);
        }
        
        
        this.jsonData = data;
        
        return Ext.data.JsonReader.superclass.readRecords.call(this, data);
    },
    
    
    getResponseData: function(response) {
        var data = Ext.decode(response.responseText);
        
        if (!data) {
            throw {message: 'Ext.data.JsonReader.read: Json object not found'};
        }
        
        return data;
    },
    
    
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

Ext.data.ArrayReader = Ext.extend(Ext.data.JsonReader, {

    
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


Ext.data.ArrayStore = Ext.extend(Ext.data.Store, {
    
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


Ext.data.SimpleStore = Ext.data.ArrayStore;
Ext.reg('simplestore', Ext.data.SimpleStore);

Ext.data.JsonStore = Ext.extend(Ext.data.Store, {
    
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

Ext.data.JsonPStore = Ext.extend(Ext.data.Store, {
    
    constructor: function(config){
        Ext.data.JsonPStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new Ext.data.JsonReader(config),
            proxy : new Ext.data.ScriptTagProxy(config)
        }));
    }
});

Ext.reg('jsonpstore', Ext.data.JsonPStore);




Ext.data.XmlWriter = Ext.extend(Ext.data.Writer, {
    
    documentRoot: 'xmlData',
    
    
    header: '',
    
    
    record: 'record',
    
    
    writeRecords: function(request, data) {
        var tpl = this.buildTpl(request, data);
        
        request.xmlData = tpl.apply(data);
        
        return request;   
    },
    
    buildTpl: function(request, data){
        if(this.tpl){
            return this.tpl;
        }
        
        var tpl = [],
            root = this.documentRoot,
            record = this.record,
            first,
            key;
            
        if(this.header){
            tpl.push(header);
        }
        tpl.push('<', root, '>');
        if(data.length > 0){
            tpl.push('<tpl for="."><', record, '>')
            first = data[0];
            for(key in first){
                if(first.hasOwnProperty(key)){
                    tpl.push('<', key, '>{', key, '}</', key, '>');    
                }
            }
            tpl.push('</', record, '></tpl>');
        }
        tpl.push('</', root, '>');
        this.tpl = new Ext.XTemplate(tpl.join(''));
        return this.tpl;
    }
});

Ext.data.WriterMgr.registerType('xml', Ext.data.XmlWriter);

Ext.data.XmlReader = Ext.extend(Ext.data.Reader, {
    
    
    
    
    createAccessor: function() {
        var selectValue = function(key, root, defaultValue){
            var node = Ext.DomQuery.selectNode(key, root),
                val;
            if(node && node.firstChild){
                val = node.firstChild.nodeValue;
            }
            return Ext.isEmpty(val) ? defaultValue : val;
        };
        
        return function(key) {
            var fn;
            
            if (key == this.totalProperty) {
                fn = function(root, def) {
                    var value = selectValue(key, root, defaultValue);
                    return parseFloat(value);
                };
            }
            
            else if (key == this.successProperty) {
                fn = function(root, def) {
                    var value = selectValue(key, root, true);
                    return (value !== false && value !== 'false');
                };
            }
            
            else {
                fn = function(root, def) {
                    return selectValue(key, root, def);
                };
            }
            
            return fn;
        };
    }(),
    
    
    getResponseData: function(response) {
        var xml = response.responseXML;
        
        if (!xml) {
            throw {message: 'Ext.data.XmlReader.read: XML data not found'};
        }
        
        return xml;
    },
    
    
    getData: function(data) {
        return data.documentElement || data;
    },
    
    
    getRoot: function(data) {
        return Ext.DomQuery.select(this.root, data);
    },
    
    
    
    
    
    
     
    
     
    
    
    
    constructor: function(config) {
        config = config || {};
        
        
        
        
        
        Ext.applyIf(config, {
            idProperty     : config.idPath || config.id,
            successProperty: config.success,
            root           : config.record
        });
        Ext.data.XmlReader.superclass.constructor.call(this, config);
    },
    
    
    
    readRecords: function(doc) {
        
        this.xmlData = doc;
        
        return Ext.data.XmlReader.superclass.readRecords.call(this, doc);
    }
});

Ext.data.ReaderMgr.registerType('xml', Ext.data.XmlReader);

Ext.data.XmlStore = Ext.extend(Ext.data.Store, {
    
    constructor: function(config){
        config = config || {};
        config = config || {};
              
        Ext.applyIf(config, {
            proxy: {
                type: 'ajax',
                reader: 'xml',
                writer: 'xml'
            }
        });
        Ext.data.XmlStore.superclass.constructor.call(this, config);
    }
});
Ext.reg('xmlstore', Ext.data.XmlStore);




Ext.Component = Ext.extend(Ext.util.Observable, {
    
    disabled: false,

    
    hidden: false,

    
     renderTpl: [
         '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>"<tpl if="style"> style="{style}"</tpl>></div>'
     ],

    
    disabledClass: 'x-item-disabled',

    
    styleHtmlContent: false,

    
    allowDomMove: true,
    autoShow: false,

    
    rendered: false,

    

    
    tplWriteMode: 'overwrite',
    bubbleEvents: [],
    isComponent: true,
    autoRender: true,

    
    actionMode: 'el',
    
    baseCls: 'x-component',
    monPropRe: /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/,
    domEventsRe: /^(?:tap|doubletap|pinch|unpich|swipe|swipeleft|swiperight|scroll|scrollstart|scrollend|touchstart|touchmove|touchend|taphold|tapstart|tapcancel)$/i,

    
    floatingCls: 'x-floating',

    
    modal: false,

    
    
    floating: false,

    
    
    draggable: false,

    
    centered: false,

    
    hideOnMaskTap: true,

    
    showAnimation: null,

    
    monitorOrientation: false,
    
    
    

    

    

    
    
    
    
    
    
    
    
    
    
    

    constructor : function(config) {
        config = config || {};
        this.initialConfig = config;
        Ext.apply(this, config);

        this.addEvents(
            
             'beforeactivate',
            
             'activate',
            
             'beforedeactivate',
            
             'deactivate',
            
             'added',
            
             'disable',
            
             'enable',
            
             'beforeshow',
            
             'show',
            
             'beforehide',
            
             'hide',
            
             'removed',
            
             'beforerender',
            
             'render',
            
             'afterrender',
            
             'beforedestroy',
            
             'destroy',
            
             'resize',
            
             'move',
             
             'beforeorientationchange',
             
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
            
        }
    },

    
    initComponent : function() {
        this.enableBubble(this.bubbleEvents);
    },

    
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
                
                this.onHide();
            }

            if (this.disabled) {
                
                this.disable(true);
            }

            this.fireEvent('afterrender', this);
        }

        return this;
    },

    
    onRender : function(ct, position) {
        var el = this.el,
            renderTpl = this.renderTpl;
        if (!el) {
            
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

    
    
    applyRefs: function(el) {
        var ref,
            refObj = this.renderSelectors || {},
            ret = {};

        for (ref in refObj) {
            ret[ref] = Ext.get(Ext.DomQuery.selectNode(refObj[ref], el));
        }
        return ret;
    },

    
    afterRender : function() {
        this.componentLayout = this.initLayout(this.componentLayout, 'component');
        this.setComponentLayout(this.componentLayout);

        
        
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

    
    onOrientationChange : function(orientation, w, h) {
        Ext.repaint.defer(50);
    },
    
    hideBrowserChrome : function() {
        setTimeout(function() {
            window.scrollTo(0, 0);
            this.setSize(window.innerWidth, window.innerHeight);
        }, 100);
    },

    
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

    
    initEvents : function() {
        if (this.monitorResize === true) {
            Ext.EventManager.onWindowResize(this.setSize, this);
        }
    },

    
    setComponentLayout : function(layout) {
        if (this.componentLayout && this.componentLayout != layout) {
            this.componentLayout.setOwner(null);
        }
        this.componentLayout = layout;
        layout.setOwner(this);
    },

    
    doComponentLayout : function(w, h) {
        if (this.rendered && this.componentLayout) {
            this.componentLayout.layout(w, h);
        }
        return this;
    },

    
    
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

    
    onPosition: Ext.emptyFn,

    
    setSize : function(w, h) {
        
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

        
        if (this.cacheSizes !== false && this.lastSize && this.lastSize.width == w && this.lastSize.height == h) {
            return this;
        }

        
        this.lastSize = {
            width: w,
            height: h
        };

        var adjustedSize = this.adjustSize(w, h);

        w = adjustedSize.width;
        h = adjustedSize.height;

        if (w !== undefined || h !== undefined) {
            this.doComponentLayout(w, h);

            
            this.onResize(w, h);
            this.fireEvent('resize', this, w, h);
        }

        return this;
    },

    
    setWidth : function(width) {
        return this.setSize(width);
    },

    
    setHeight : function(height) {
        return this.setSize(undefined, height);
    },

    
    getSize : function() {
        return this.getResizeEl().getSize();
    },

    
    getWidth : function() {
        return this.getResizeEl().getWidth();
    },

    
    getHeight : function() {
        return this.getResizeEl().getHeight();
    },

    
    
    getOuterSize : function() {
        var el = this.getResizeEl();
        return {
            width: el.getOuterWidth(),
            height: el.getOuterHeight()
        };
    },

    
    getTargetBox : function() {
        return this.el.getBox(true, true);
    },

    
    getResizeEl : function() {
        return this.el;
    },

    
    onResize : Ext.emptyFn,

    
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

    
    adjustPosition : function(x, y) {
        return {
            x: x,
            y: y
        };
    },

    
    getId : function() {
        return this.id || (this.id = 'ext-comp-' + (++Ext.Component.AUTO_ID));
    },

    
    getItemId : function() {
        return this.itemId || this.getId();
    },

    
    getEl : function() {
        return this.el;
    },

    
    getActionEl : function() {
        return this[this.actionMode];
    },

    
    getBubbleTarget : function() {
        return this.ownerCt;
    },

    
    getContentTarget : function() {
        return this.el;
    },

    
    addClass : function(cls) {
        if (this.el) {
            this.el.addClass(cls);
        }
        else {
            this.cls = this.cls ? this.cls + ' ' + cls: cls;
        }
        return this;
    },

    
    removeClass : function(cls) {
        if (this.el) {
            this.el.removeClass(cls);
        }
        else if (this.cls) {
            this.cls = this.cls.split(' ').remove(cls).join(' ');
        }
        return this;
    },

    
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

    
    onEnable : function() {
        this.getActionEl().removeClass(this.disabledClass);
        this.el.dom.disabled = false;
    },

    
    onDisable : function() {
        this.getActionEl().addClass(this.disabledClass);
        this.el.dom.disabled = true;
    },

    
    setDisabled : function(disabled) {
        return this[disabled ? 'disable': 'enable']();
    },

    
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
                    
                    item.on(e, o[e], o.scope, o);
                }
                else {
                    
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

    
    purgeListeners : function() {
        Ext.Component.superclass.purgeListeners.call(this);
        this.clearMons();
    },

    
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

    
    beforeDestroy : function() {
        this.clearMons();
        if (this.monitorResize) {
            Ext.EventManager.removeResizeListener(this.doComponentLayout, this);
        }
    },

    
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

    
    onDestroy: Ext.emptyFn,

    
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

    
    onAdded : function(container, pos) {
        this.ownerCt = container;
        this.fireEvent('added', this, container, pos);
    },

    
    onRemoved : function() {
        this.fireEvent('removed', this, this.ownerCt);
        delete this.ownerCt;
    },

    
    setVisible : function(visible) {
        return this[visible ? 'show': 'hide']();
    },

    
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

    
    getPositionEl : function() {
        return this.positionEl || this.el;
    },

    
    getVisibilityEl : function() {
        return this.el;
    }
});

Ext.layout.TYPES = {};


Ext.Component.AUTO_ID = 1000;

Ext.BoxComponent = Ext.Component;

Ext.reg('component', Ext.Component);
Ext.reg('box', Ext.BoxComponent);

Ext.Component.prototype.on = Ext.Component.prototype.addListener;




Ext.Button = Ext.extend(Ext.Component, {
    
    hidden : false,
    
    disabled : false,

    

    
    pressEvent : 'tap',


    

    

    

    

    

    

    baseCls: 'x-button',

    pressedCls: 'x-button-pressed',
    
    
    badgeText: '',

    badgeCls: 'x-badge',

    hasBadgeCls: 'x-hasbadge',

    labelCls: 'x-button-label',
    
    
    ui: 'normal',

    isButton: true,

    

    
    pressedDelay: 0,

    
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

    
    onTapCancel : function() {
        if (this.pressedTimeout) {
            clearTimeout(this.pressedTimeout);
            delete this.pressedTimeout;
        }
        this.el.removeClass(this.pressedCls);
    },

    
    setHandler : function(handler, scope) {
        this.handler = handler;
        this.scope = scope;
        return this;
    },

    
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

    
    getText : function() {
        return this.text;
    },

    
    getBadgeText : function() {
        return this.badgeText;
    },

    
    onDisable : function() {
        this.onDisableChange(true);
    },

    
    onEnable : function() {
        this.onDisableChange(false);
    },

    
    onDisableChange : function(disabled) {
        if (this.el) {
            this.el[disabled ? 'addClass' : 'removeClass'](this.disabledClass);
            this.el.dom.disabled = disabled;
        }
        this.disabled = disabled;
    },

    
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


Ext.Container = Ext.extend(Ext.Component, {
    
    


    
    
    


    
    autoDestroy : true,

     
    defaultType: 'panel',

    isContainer : true,

    baseCls: 'x-container',

    
    animation: null,

    
    initComponent : function(){
        Ext.Container.superclass.initComponent.call(this);

        this.addEvents(
            
            'afterlayout',
            
            'beforeadd',
            
            'beforeremove',
            
            'add',
            
            'remove',            
            
            'beforecardswitch',
            
            'cardswitch'
        );

        this.initItems();
    },

    
    initItems : function(){
        var items = this.items;
        
        this.items = new Ext.util.MixedCollection(false, this.getComponentId);
        if (items) {
            this.add(items);
        }
    },

    
    setLayout : function(layout) {
        if (this.layout && this.layout != layout) {
            this.layout.setOwner(null);
        }
        this.layout = layout;
        layout.setOwner(this);
    },

    
    prepareItems : function(items, applyDefaults) {
        if (!Ext.isArray(items)) {
            items = [items];
        }
        
        var item, i, ln;
        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            if (applyDefaults) {
                item = this.applyDefaults(item);
            }
            items[i] = this.lookupComponent(item);
        }
        return items;
    },

    
    applyDefaults : function(c) {
        var d = this.defaults;
        if (d) {
            if (Ext.isFunction(d)) {
                d = d.call(this, c);
            }
            if (typeof c == 'string') {
                c = Ext.ComponentMgr.get(c);
                Ext.apply(c, d);
            }
            else if (!c.events) {
                Ext.applyIf(c, d);
            }
            else {
                Ext.apply(c, d);
            }
        }
        return c;
    },

    
    lookupComponent : function(comp) {
        if (typeof comp == 'string') {
            return Ext.ComponentMgr.get(comp);
        }
        else if (!comp.events) {
            return this.createComponent(comp);
        }
        return comp;
    },

    
    createComponent : function(config, defaultType){
        if (config.render) {
            return config;
        }
        
        
        var c = Ext.create(Ext.apply({
            ownerCt: this
        }, config), defaultType || this.defaultType);
        delete c.initialConfig.ownerCt;
        delete c.ownerCt;
        return c;
    },

    
    afterRender : function() {
        this.layout = this.initLayout(this.layout, 'auto');
        this.setLayout(this.layout);

        Ext.Container.superclass.afterRender.call(this);
    },

    
    doLayout : function() {
        if (this.rendered && this.layout) {
            this.layout.layout();
        }
        return this;
    },

    
    afterLayout : function(layout) {
        if (this.floating && this.centered) {
            this.setCentered(true, true);
        }

        if (this.scroller) {
            this.scroller.updateBounds();
        }

        this.fireEvent('afterlayout', this, layout);
    },

    
    getLayoutTarget : function(){
        return this.el;
    },

    
    getComponentId : function(comp){
        return comp.getItemId();
    },

    
    add : function() {
        var args = Array.prototype.slice.call(arguments),
            index = -1;

        if (typeof args[0] == 'number') {
            index = args.shift();
        }

        var hasMultipleArgs = args.length > 1;
        if (hasMultipleArgs || Ext.isArray(args[0])) {
            var items = hasMultipleArgs ? args : args[0],
                results = [],
                i, ln, item;

            for (i = 0, ln = items.length; i < ln; i++) {
                item = items[i];
                if (index != -1) {
                    item = this.add(index + i, item);
                }
                else {
                    item = this.add(item);
                }
                results.push(item);
            }

            return results;
        }

        var cmp = this.prepareItems(args[0], true)[0];
        index = (index !== -1) ? index : this.items.length;

        if (this.fireEvent('beforeadd', this, cmp, index) !== false && this.onBeforeAdd(cmp) !== false) {
            this.items.insert(index, cmp);
            cmp.onAdded(this, index);
            this.onAdd(cmp);
            this.fireEvent('add', this, cmp, index);
        }

        return cmp;
    },

    onAdd : Ext.emptyFn,
    onRemove : Ext.emptyFn,

    
    insert : function(index, comp){
        this.add(index, comp);
    },

    
    onBeforeAdd : function(item) {
        if (item.ownerCt) {
            item.ownerCt.remove(item, false);
        }
        if (this.hideBorders === true){
            item.border = (item.border === true);
        }
    },

    
    remove : function(comp, autoDestroy) {
        var c = this.getComponent(comp);
        if (c && this.fireEvent('beforeremove', this, c) !== false) {
            this.doRemove(c, autoDestroy);
            this.fireEvent('remove', this, c);
        }
        return c;
    },

    
    doRemove : function(component, autoDestroy) {
        var layout = this.layout,
            hasLayout = layout && this.rendered;

        if (hasLayout) {
            layout.onRemove(component);
        }

        this.items.remove(component);
        component.onRemoved();
        this.onRemove(component);

        if (autoDestroy === true || (autoDestroy !== false && this.autoDestroy)) {
            component.destroy();
        }

        if (hasLayout) {
            layout.afterRemove(component);
        }
    },

    
    removeAll : function(autoDestroy) {
        var item,
            removeItems = this.items.items.slice(),
            items = [],
            ln = removeItems.length,
            i;
        for (i = 0; i < ln; i++) {
            item = removeItems[i];
            this.remove(item, autoDestroy);
            if (item.ownerCt !== this) {
                items.push(item);
            }
        }
        return items;
    },

    
    getComponent : function(comp) {
        if (Ext.isObject(comp)) {
            comp = comp.getItemId();
        }
        return this.items.get(comp);
    },

    
    onShow : function(){
        
        Ext.Container.superclass.onShow.apply(this, arguments);
        
        if (Ext.isDefined(this.deferLayout)) {
            delete this.deferLayout;
            this.doLayout(true);
        }
    },

    
    getLayout : function() {
        if (!this.layout) {
            var layout = new Ext.layout.AutoLayout(this.layoutConfig);
            this.setLayout(layout);
        }
        return this.layout;
    },

    
    setScrollable : function(direction) {
        Ext.Container.superclass.setScrollable.call(this, direction);

        if (direction !== false) {
            this.originalGetLayoutTarget = this.getLayoutTarget;
            this.getLayoutTarget = function() {
                return this.scrollEl;
            };
        }
        else {
            this.getLayoutTarget = this.originalGetLayoutTarget;
        }
    },

    
    beforeDestroy : function() {
        var c;
        if (this.items) {
            c = this.items.first();
            while (c) {
                this.doRemove(c, true);
                c = this.items.first();
            }
        }
        Ext.destroy(this.layout);
        Ext.Container.superclass.beforeDestroy.call(this);
    },

    
    getActiveItem : function() {
        if (this.layout && this.layout.type === 'card') {
            return this.layout.activeItem;
        }
        else {
            return null;
        }
    },

    
    setCard : function(card, animation) {
        this.layout.setActiveItem(card, animation);
        return this;
    },
        
    
    onBeforeCardSwitch : function(newCard, oldCard, animated) {
        return this.fireEvent('beforecardswitch', this, newCard, oldCard, this.items.indexOf(newCard), animated);
    },
    
    
    onCardSwitch : function(newCard, oldCard, animated) {
        return this.fireEvent('cardswitch', this, newCard, oldCard, this.items.indexOf(newCard), animated);
    }
});


Ext.Container.LAYOUTS = Ext.layout.TYPES;

Ext.reg('container', Ext.Container);


Ext.SplitButton = Ext.extend(Ext.Container, {
    defaultType: 'button',

    cmpCls: 'x-splitbutton',
    activeCls: 'x-button-active',

    
    allowMultiple: false,
    
    

    
    initComponent : function() {
        this.layout = {
            type: 'hbox',
            align: 'stretch'
        };

        Ext.SplitButton.superclass.initComponent.call(this);
    },

    
    afterRender : function() {
        Ext.SplitButton.superclass.afterRender.call(this);

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });
    },

    
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

    
    onTap : function(e, t) {
        t = e.getTarget('.x-button');

        if (t && !this.disabled) {
            this.setActive(Ext.getCmp(t.id));
        }
    },

    
    getActive : function() {
        return this.allowMultiple ? this.activeButtons : this.activeButton;
    },

    
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

    
    disable : function() {
        this.items.each(function(item) {
            item.disable();
        }, this);

        Ext.SplitButton.superclass.disable.apply(this, arguments);
    },

    
    enable : function() {
        this.items.each(function(item) {
            item.enable();
        }, this);

        Ext.SplitButton.superclass.enable.apply(this, arguments);
    }
});

Ext.reg('splitbutton', Ext.SplitButton);


Ext.Panel = Ext.extend(Ext.Container, {
    
    baseCls : 'x-panel',

    
    padding: undefined,

    
    scroll: false,

    
    fullscreen: false,

    isPanel: true,
    componentLayout: 'dock',

    renderTpl: [
        '<div <tpl if="id">id="{id}"</tpl> class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<div class="{baseCls}-body"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>',
        '</div>'
    ],

    

    initComponent : function() {
        Ext.Panel.superclass.initComponent.call(this);

        this.addEvents(
            
            'bodyresize',
            
            'activate',
            
            'deactivate'
        );
    },

    
    initItems : function() {
        Ext.Panel.superclass.initItems.call(this);

        var items = this.dockedItems;
        this.dockedItems = new Ext.util.MixedCollection(false, this.getComponentId);
        if (items) {
            this.addDocked(items);
        }
    },

    
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

    
    onDockedAdd : Ext.emptyFn,
    onDockedRemove : Ext.emptyFn,

    
    insertDocked : function(pos, items) {
        this.addDocked(items, pos);
    },

    
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

    
    getDockedItems : function() {
        if (this.dockedItems && this.dockedItems.items.length) {
            return this.dockedItems.items.slice();
        }
        return [];
    },

    
    getLayoutTarget : function(){
        return this.body;
    },

    
    getContentTarget : function() {
        return this.body;
    },

    
    getTargetSize : function() {
        var ret = this.body.getViewSize();
        ret.width  -= this.body.getPadding('lr');
        ret.height -= this.body.getPadding('tb');
        return ret;
    }
});

Ext.reg('panel', Ext.Panel);


Ext.DataPanel = Ext.extend(Ext.Panel, {
    
    
    

    
    blockRefresh: false,

    
    initComponent: function() {
        if (Ext.isString(this.tpl) || Ext.isArray(this.tpl)) {
            this.tpl = new Ext.XTemplate(this.tpl);
        }

        this.store = Ext.StoreMgr.lookup(this.store);
        this.all = new Ext.CompositeElementLite();
        this.instances = new Ext.util.MixedCollection();

        if (this.components) {
            if (Ext.isFunction(this.components)) {
                this.components = [{config: this.components}];
            }
            else if (Ext.isObject(this.components)) {
                this.components = [this.components];
            }
            
            if (!this.tpl) {
                this.tpl = new Ext.XTemplate('<tpl for="."><div class="x-list-item"></div></tpl>', {compiled: true});
                this.itemSelector = '.x-list-item';
            }         
        }
        
        Ext.DataPanel.superclass.initComponent.call(this);
    },


    
    afterRender: function(){
        Ext.DataPanel.superclass.afterRender.call(this);

        var components = this.components,
            ln, i, component, delegate;        
        if (components) {
            for (i = 0, ln = components.length; i < ln; i++) {
                component = components[i];
                if (component.listeners) {
                    component.delegateCls = Ext.id(null, 'x-cmp-');
                    component.listeners.delegate = (component.targetSelector || this.itemSelector) + ' > .' + component.delegateCls;
                    this.mon(this.getTemplateTarget(), component.listeners);                    
                }
            }
        }
        
        if (this.store) {
            this.bindStore(this.store, true);
        }
    },

    
    getStore: function(){
        return this.store;
    },

    
    refresh: function() {
        if (!this.rendered) {
            return;
        }

        var el = this.getTemplateTarget(),
            records = this.store.getRange();

        if (records.length < 1) {
            this.all.clear();
        }
        else {
            this.tpl.overwrite(el, this.collectData(records, 0));
            this.all.fill(Ext.query(this.itemSelector, el.dom));
        }
        this.updateItems(0);
    },

    
    getTemplateTarget: function() {
        return this.scrollEl || this.body;
    },

    
    prepareData: function(data) {
        return data;
    },


    
    collectData: function(records, startIndex) {
        var results = [],
            i, ln = records.length;
        for (i = 0; i < ln; i++) {
            results[results.length] = this.prepareData(records[i].data, startIndex + i, records[i]);
        }
        return results;
    },

    
    bindStore: function(store, initial) {
        if (!this.rendered) {
            this.store = store;
            return;
        }

        if (!initial && this.store) {
            if (store !== this.store && this.store.autoDestroy) {
                this.store.destroyStore();
            }
            else {
                this.store.un({
                    scope: this,
                    beforeload: this.onBeforeLoad,
                    datachanged: this.onDataChanged,
                    add: this.onAdd,
                    remove: this.onRemove,
                    update: this.onUpdate,
                    clear: this.refresh
                });
            }
            if (!store) {
                this.store = null;
            }
        }
        if (store) {
            store = Ext.StoreMgr.lookup(store);
            store.on({
                scope: this,
                beforeload: this.onBeforeLoad,
                datachanged: this.onDataChanged,
                add: this.onAdd,
                remove: this.onRemove,
                update: this.onUpdate,
                clear: this.refresh
            });
        }
        this.store = store;
        if (store) {
            this.refresh();
        }
    },

    onBeforeLoad: Ext.emptyFn,

    
    bufferRender: function(records, index) {
        var div = document.createElement('div');
        this.tpl.overwrite(div, this.collectData(records, index));
        return Ext.query(this.itemSelector, div);
    },

    
    onUpdate: function(ds, record) {
        var index = this.store.indexOf(record),
            sel, original, node;
        
        if (index > -1) {
            sel = this.isSelected(index);
            original = this.all.elements[index];
            node = this.bufferRender([record], index)[0];

            this.all.replaceElement(index, node, true);
            if (sel) {
                this.selected.replaceElement(original, node);
                this.all.item(index).addClass(this.selectedClass);
            }
            this.updateItems(index, index);
        }
    },

    
    onAdd: function(ds, records, index) {
        if (this.all.getCount() === 0) {
            this.refresh();
            return;
        }
        var nodes = this.bufferRender(records, index), n, a = this.all.elements;
        if (index < this.all.getCount()) {
            n = this.all.item(index).insertSibling(nodes, 'before', true);
            a.splice.apply(a, [index, 0].concat(nodes));
        }
        else {
            n = this.all.last().insertSibling(nodes, 'after', true);
            a.push.apply(a, nodes);
        }
        this.updateItems(index);
    },

    
    onRemove: function(ds, record, index) {
        this.deselect(index);
        this.all.removeElement(index, true);
        this.updateItems(index);
        if (this.store.getCount() === 0){
            this.refresh();
        }
    },

    
    refreshNode: function(index){
        this.onUpdate(this.store, this.store.getAt(index));
    },

    
    updateItems: function(startIndex, endIndex) {
        var ns = this.all.elements;
        startIndex = startIndex || 0;
        endIndex = endIndex || ((endIndex === 0) ? 0 : (ns.length - 1));
        for(var i = startIndex; i <= endIndex; i++){
            ns[i].viewIndex = i;
            if (this.components) {
                this.createInstances(ns[i]);
            }
        }
        this.cleanInstances();
    },
    
    createInstances : function(node) {
        var id = Ext.id(node),
            components = this.components,
            ln = components.length,
            i, component, instance, target;

        for (i = 0; i < ln; i++) {
            component = components[i];
            target = component.targetSelector ? Ext.fly(node).down(component.targetSelector, true) : node;
            if (target) {
                if (Ext.isObject(component.config)) {
                    instance = Ext.create(component.config, 'button');
                }
                else if (Ext.isFunction(component.config)) {
                    instance = component.config.call(this, this.getRecord(node), node, node.viewIndex);
                }
                if (instance) {
                    this.instances.add(instance);
                    instance.addClass(component.delegateCls);
                    instance.render(target);
                    instance.doComponentLayout();              
                }
            }            
        }
    },
    
    cleanInstances : function() {
        this.instances.each(function(instance) {
            if (!document.getElementById(instance.id)) {
                this.instances.remove(instance);
                instance.destroy();
            }
        }, this);
    },

    
    onDataChanged: function() {
        if (this.blockRefresh !== true) {
            this.refresh.apply(this, arguments);
        }
    },

    
    findItemFromChild: function(node) {
        return Ext.fly(node).findParent(this.itemSelector, this.getTemplateTarget());
    },

    
    getRecords: function(nodes) {
        var r = [],
            s = nodes,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            r[r.length] = this.store.getAt(s[i].viewIndex);
        }
        return r;
    },

    
    getRecord: function(node) {
        return this.store.getAt(node.viewIndex);
    },

    
    getNode: function(nodeInfo) {
        if (Ext.isString(nodeInfo)) {
            return document.getElementById(nodeInfo);
        }
        else if (Ext.isNumber(nodeInfo)) {
            return this.all.elements[nodeInfo];
        }
        else if (nodeInfo instanceof Ext.data.Model) {
            var idx = this.store.indexOf(nodeInfo);
            return this.all.elements[idx];
        }
        return nodeInfo;
    },

    
    getNodes: function(start, end) {
        var ns = this.all.elements,
            nodes = [],
            i;
        start = start || 0;
        end = !Ext.isDefined(end) ? Math.max(ns.length - 1, 0) : end;
        if (start <= end) {
            for (i = start; i <= end && ns[i]; i++) {
                nodes.push(ns[i]);
            }
        }
        else {
            for (i = start; i >= end && ns[i]; i--) {
                nodes.push(ns[i]);
            }
        }
        return nodes;
    },

    
    indexOf: function(node) {
        node = this.getNode(node);
        if (Ext.isNumber(node.viewIndex)) {
            return node.viewIndex;
        }
        return this.all.indexOf(node);
    },

    
    onDestroy: function() {
        this.all.clear();
        Ext.DataPanel.superclass.onDestroy.call(this);
        this.bindStore(null);
    }
});

Ext.reg('datapanel', Ext.DataPanel);


Ext.DataView = Ext.extend(Ext.DataPanel, {
    scroll: 'vertical',

    
    
    
    
    selectedCls : "x-item-selected",
    
    pressedCls : "x-item-pressed",

    
    pressedDelay: 100,

    
    emptyText : "",

    
    deferEmptyText: true,

    
    last: false,

    
    initComponent: function() {
        Ext.DataView.superclass.initComponent.call(this);

        this.addEvents(
            
            'itemtap',
            
            'itemdoubletap',
            
            "containertap",

            
            "selectionchange",

            
            "beforeselect"
        );

        this.selected = new Ext.CompositeElementLite();
    },

    
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

    
    onContainerTap: function(e) {
        this.clearSelections();
    },

    
    onDoubleTap: function(e) {
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if (item) {
            this.fireEvent("itemdoubletap", this, this.indexOf(item), item, e);
        }
    },

    
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

    
    doSingleSelection: function(item, index, e) {
        if (this.isSelected(index)) {
            this.deselect(index);
        }
        else {
            this.select(index, false);
        }
    },

    
    doMultiSelection: function(item, index, e) {
        if (this.isSelected(index)) {
            this.deselect(index);
        }
        else {
            this.select(index, true);
        }
    },

    
    getSelectionCount: function() {
        return this.selected.getCount();
    },

    
    getSelectedNodes: function() {
        return this.selected.elements;
    },

    
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

    
    isSelected: function(node) {
        return this.selected.contains(this.getNode(node));
    },

    
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

    
    selectRange: function(start, end, keepExisting) {
        if (!keepExisting) {
            this.clearSelections(true);
        }
        this.select(this.getNodes(start, end), true);
    },

    
    onBeforeLoad: function() {
        if (this.loadingText) {
            this.clearSelections(false, true);
            this.getTemplateTarget().update('<div class="loading-indicator">'+this.loadingText+'</div>');
            this.all.clear();
        }
    },

    
    onDestroy: function() {
        this.selected.clear();
        Ext.DataView.superclass.onDestroy.call(this);
    }
});


Ext.DataView.prototype.setStore = Ext.DataView.prototype.bindStore;

Ext.reg('dataview', Ext.DataView);


Ext.List = Ext.extend(Ext.DataView, {
    cmpCls: 'x-list',

    pinHeaders: true,

    
    indexBar: false,

    
    grouped: false,

    renderTpl: [
        '<div <tpl if="id">id="{id}"</tpl> class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<div class="{baseCls}-body"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>>',
                '<tpl if="grouped"><h3 class="x-list-header x-list-header-swap x-hidden-display"></h3></tpl>',
            '</div>',
        '</div>'
    ],
    
    groupTpl : [
        '<tpl for=".">',
            '<div class="x-list-group x-group-{id}">',
                '<h3 class="x-list-header">{group}</h3>',
                '<div class="x-list-group-items">',
                    '{items}',
                '</div>',
            '</div>',
        '</tpl>'
    ],

    
    disclosure : false,
    
    
    initComponent : function() {
        if (this.scroll !== false) {
            this.scroll = {
                direction: 'vertical',
                scrollbars: false
            };
        }

        if (this.grouped) {
            this.itemTpl = this.tpl;
            if (Ext.isString(this.itemTpl) || Ext.isArray(this.itemTpl)) {
                this.itemTpl = new Ext.XTemplate(this.itemTpl);
            }
            if (Ext.isString(this.groupTpl) || Ext.isArray(this.groupTpl)) {
                this.tpl = new Ext.XTemplate(this.groupTpl);
            }
        }
        else {
            this.indexBar = false;
        }

        if (this.indexBar) {
            var indexBarConfig = Ext.apply({}, Ext.isObject(this.indexBar) ? this.indexBar : {}, {
                xtype: 'indexbar',
                dock: 'right',
                overlay: true,
                alphabet: true
            });
            this.indexBar = new Ext.IndexBar(indexBarConfig);
            this.dockedItems = this.dockedItems || [];
            this.dockedItems.push(this.indexBar);
            this.cls = this.cls || '';
            this.cls += ' x-list-indexed';
        } else if (this.scroll) {
            this.scroll.scrollbars = true;
        }

        Ext.List.superclass.initComponent.call(this);

        if (this.disclosure) {
            
            
            if (Ext.isFunction(this.disclosure)) {
                this.disclosure = {
                    scope: this,
                    handler: this.disclosure
                };
            }
            this.components = this.components || [];
            
            
            this.components.push({
                config: Ext.apply({}, this.disclosure.config || {}, {
                    xtype: 'button',
                    baseCls: 'x-disclosure'
                }),
                listeners: {
                    tap: this.onDisclosureTap,
                    scope: this
                }
            });
        }
        
        this.on('deactivate', this.onDeactivate, this);
        
        this.addEvents(
            
            
            
            
            
            
            
            
            
            
            
            'disclose'
        );
    },
    
    onRender : function() {
        if (this.grouped) {
            Ext.applyIf(this.renderData, {
                grouped: true
            });
            
            Ext.applyIf(this.renderSelectors, {
                header: '.x-list-header-swap'
            });            
        }
        
        Ext.List.superclass.onRender.apply(this, arguments);
    },

    
    onDeactivate : function() {
        this.clearSelections();
    },

    
    afterRender : function() {
        if (!this.grouped) {
            this.el.addClass('x-list-flat');
        }        
        this.getTemplateTarget().addClass('x-list-parent');
        
        Ext.List.superclass.afterRender.call(this);
        
        
        
        
        
        
    },

    
    initEvents : function() {
        Ext.List.superclass.initEvents.call(this);

        if (this.grouped) {
            if (this.pinHeaders && this.scroll) {
                this.mon(this.scroller, {
                    scrollstart: this.onScrollStart,
                    scroll: this.onScroll,
                    scope: this
                });                
            }
            
            if (this.indexBar) {
                this.mon(this.indexBar, {
                    index: this.onIndex,
                    scope: this
                });                
            }
        }
    },
    
    onDisclosureTap : function(e, t) {
        var node = this.findItemFromChild(t);
        if (node) {
            var record = this.getRecord(node),
                index = this.indexOf(node);
                
            this.fireEvent('disclose', record, node, index);
            
            if (Ext.isObject(this.disclosure) && this.disclosure.handler) {
                this.disclosure.handler.call(this, record, node, index);
            }
        }
    },
    
    
    
    
    
    
    
    
    setActiveGroup : function(group) {
        if (group) {
            if (!this.activeGroup || this.activeGroup.header != group.header) {
                
                this.header.show();
                this.header.setHTML(group.header.getHTML());
                
                
                
            }            
        }
        else {
            this.header.hide();
            
            
            
        }
        
        this.activeGroup = group;
    },
    
    getClosestGroups : function(pos) {
        var groups = this.groupOffsets,
            ln = groups.length,
            group, i,
            current, next;
            
        for (i = 0; i < ln; i++) {
            group = groups[i];
            if (group.offset > pos.y) {
                next = group;
                break;
            }
            current = group;
        }
        
        return {
            current: current,
            next: next
        };
    },
    
    updateItems : function() {
        Ext.List.superclass.updateItems.apply(this, arguments);
        this.updateOffsets();
    },

    afterLayout : function() {
        Ext.List.superclass.afterLayout.apply(this, arguments);
        this.updateOffsets();
    },
        
    updateOffsets : function() {
        if (this.grouped) {
            this.groupOffsets = [];

            var headers = this.body.query('h3.x-list-header'),
                ln = headers.length,
                header, i;

            for (i = 0; i < ln; i++) {
                header = Ext.get(headers[i]);
                header.setDisplayMode(Ext.Element.VISIBILITY);            
                this.groupOffsets.push({
                    header: header,
                    offset: header.dom.offsetTop
                });
            }
        }
    },

    
    onScrollStart : function() {
        var offset = this.scroller.getOffset();
        this.closest = this.getClosestGroups(offset);
        this.setActiveGroup(this.closest.current);
    },
    
    
    onScroll : function(scroller, pos, options) {
        if (!this.closest) {
            this.closest = this.getClosestGroups(pos);
        }
        
        if (!this.headerHeight) {
            this.headerHeight = this.header.getHeight();  
        }
        
        if (pos.y <= 0) {
            if (this.activeGroup) {
                this.setActiveGroup(false);
                this.closest.next = this.closest.current;                
            }
            return;
        }
        else if (
            (this.closest.next && pos.y > this.closest.next.offset) || 
            (pos.y < this.closest.current.offset)
        ) {
            this.closest = this.getClosestGroups(pos);
            this.setActiveGroup(this.closest.current);
        }

        if (this.closest.next && pos.y > 0 && this.closest.next.offset - pos.y < this.headerHeight) {
            var transform = this.headerHeight - (this.closest.next.offset - pos.y);
            this.header.setStyle('-webkit-transform', 'translate(0, -' + transform + 'px)');
            this.transformed = true;
        }
        else if (this.transformed) {
            this.header.setStyle('-webkit-transform', null);
            this.transformed = false;
        }
    },

    
    onIndex : function(record, target, index) {
        var key = record.get('key').toLowerCase(),
            groups = this.store.getGroups(),
            ln = groups.length,
            group, i, closest, id;

        for (i = 0; i < ln; i++) {
            group = groups[i];
            id = this.getGroupId(group);
            
            if (id == key || id > key) {
                closest = id;
                break;
            }
            else {
                closest = id;
            }
        }

        closest = this.body.down('.x-group-' + id);
        if (closest) {
            this.scroller.scrollTo({x: 0, y: closest.getOffsetsTo(this.scrollEl)[1]}, false, null, true);
        }
    },
    
    getGroupId : function(group) {
        return group.name.toLowerCase();
    },

    
    collectData : function(records, startIndex) {
        
        this.store.sort(null, null, true);

        if (!this.grouped) {
            return Ext.List.superclass.collectData.call(this, records, startIndex);
        }

        var results = [],
            groups = this.store.getGroups(),
            ln = groups.length,
            children, cln, c,
            group, i;

        for (i = 0, ln = groups.length; i < ln; i++) {
            group = groups[i];
            children = group.children;
            for (c = 0, cln = children.length; c < cln; c++) {
                children[c] = children[c].data;                
            }
            results.push({
                group: group.name,
                id: this.getGroupId(group),
                items: this.itemTpl.apply(children)
            });
        }

        return results;
    },

    
    
    
    onUpdate : function(ds, record) {
        if (this.grouped) {
            this.refresh();
        }
        else {
            Ext.List.superclass.onUpdate.apply(this, arguments);
        }  
    },

    
    onAdd : function(ds, records, index) {
        if (this.grouped) {
            this.refresh();
        }
        else {
            Ext.List.superclass.onAdd.apply(this, arguments);
        }
    },

    
    onRemove : function(ds, record, index) {
        if (this.grouped) {
            this.refresh();
        }
        else {
            Ext.List.superclass.onRemove.apply(this, arguments);
        }
    }
});

Ext.reg('list', Ext.List);

Ext.IndexBar = Ext.extend(Ext.DataPanel, {
    cmpCls: 'x-indexbar',
    direction: 'vertical',
    tpl: '<tpl for="."><span class="x-indexbar-item">{value}</span></tpl>',
    itemSelector: 'span.x-indexbar-item',
    
    
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

    
    initComponent : function() {
        
        this.componentLayout = new Ext.layout.AutoComponentLayout();

        if (!this.store) {
            this.store = new Ext.data.Store({
                model: 'IndexBarModel'
            });
        }

        if (this.alphabet == true) {
            this.ui = this.ui || 'alphabet';
        }

        if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else {
            this.vertical = true;
        }

        this.addEvents('index');

        Ext.IndexBar.superclass.initComponent.call(this);
    },

    
    afterRender : function() {
        Ext.IndexBar.superclass.afterRender.call(this);

        if (this.alphabet === true) {
            this.loadAlphabet();
        }

        if (this.vertical) {
            this.el.addClass(this.cmpCls + '-vertical');
        }
        else if (this.horizontal) {
            this.el.addClass(this.cmpCls + '-horizontal');
        }
    },

    
    loadAlphabet : function() {
        var letters = this.letters,
            len = letters.length,
            data = [],
            i, letter;

        for (i = 0; i < len; i++) {
            letter = letters[i];
            data.push({key: letter.toLowerCase(), value: letter});
        }

        this.store.loadData(data);
    },

    
    initEvents : function() {
        Ext.IndexBar.superclass.initEvents.call(this);

        this.mon(this.body, {
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            touchmove: this.onTouchMove,
            scope: this
        });
    },

    
    onTouchStart : function(e, t) {
        this.el.addClass(this.cmpCls + '-pressed');
        this.pageBox = this.body.getPageBox();
        this.onTouchMove(e);
    },

    
    onTouchEnd : function(e, t) {
        this.el.removeClass(this.cmpCls + '-pressed');
    },

    
    onTouchMove : function(e) {
        var target,
            me = this,
            record,
            pageBox = me.pageBox;
            
        if (!pageBox) {
            pageBox = me.pageBox = me.body.getPageBox();
        }

        if (me.vertical) {
            if (e.pageY > pageBox.bottom || e.pageY < pageBox.top) {
                return;
            }
            target = Ext.Element.fromPoint(pageBox.left + (pageBox.width / 2), e.pageY);
        }
        else if (me.horizontal) {
            if (e.pageX > pageBox.right || e.pageX < pageBox.left) {
                return;
            }
            target = Ext.Element.fromPoint(e.pageX, pageBox.top + (pageBox.height / 2));
        }

        if (target) {
            record = me.getRecord(target.dom);
            if (record) {
                me.fireEvent('index', record, target, me.indexOf(target));
            }
        }
    }
});

Ext.reg('indexbar', Ext.IndexBar);

Ext.regModel('IndexBarModel', {
    fields: ['key', 'value']
});


Ext.Toolbar = Ext.extend(Ext.Container, {
    
    defaultType: 'button',

    
    baseCls: 'x-toolbar',

    
    titleCls: 'x-toolbar-title',

    
    ui: null,

    
    layout: null,

    

    

    
    titleEl: null,

    initComponent : function() {
        this.layout = Ext.apply({}, this.layout || {}, {
            type: 'hbox',
            align: 'center'
        });
        Ext.Toolbar.superclass.initComponent.call(this);
    },

    afterRender : function() {
        Ext.Toolbar.superclass.afterRender.call(this);

        if (this.title) {
            this.titleEl = this.el.createChild({
                cls: this.titleCls,
                html: this.title
            });
        }
    },

    
    setTitle : function(title) {
        this.title = title;
        if (this.rendered) {
            if (!this.titleEl) {
                this.titleEl = this.el.createChild({
                    cls: this.titleCls,
                    html: this.title
                });
            }
            this.titleEl.setHTML(title);
        }
    },

    
    showTitle : function() {
        if (this.titleEl) {
            this.titleEl.show();
        }
    },

    
    hideTitle : function() {
        if (this.titleEl) {
            this.titleEl.hide();
        }
    }
});

Ext.reg('toolbar', Ext.Toolbar);



Ext.Spacer = Ext.extend(Ext.Component, {
    initComponent : function() {
        if (!this.width) {
            this.flex = 1;
        }

        Ext.Spacer.superclass.initComponent.call(this);
    },

    onRender : function() {
        Ext.Spacer.superclass.onRender.apply(this, arguments);

        if (this.flex) {
            this.el.setStyle('-webkit-box-flex', this.flex);
        }
    }
});

Ext.reg('spacer', Ext.Spacer);

Ext.TabBar = Ext.extend(Ext.Panel, {
    cmpCls: 'x-tabbar',

    
    activeTab: null,

    
    defaultType: 'tab',

    
    sortable: false,

    
    sortHoldThreshold: 350,

    
    initComponent : function() {
        
        this.addEvents('change');

        this.layout = Ext.apply({}, this.layout || {}, {
            type: 'hbox',
            align: 'middle'
        });

        Ext.TabBar.superclass.initComponent.call(this);

        var cardLayout = this.cardLayout;
        if (cardLayout) {
            this.cardLayout = null;
            this.setCardLayout(cardLayout);
        }
    },

    
    initEvents : function() {
        if (this.sortable) {
            this.sortable = new Ext.util.Sortable(this.el, {
                itemSelector: '.x-tab',
                direction: 'horizontal',
                delay: this.sortHoldThreshold,
                constrain: true
            });
            this.mon(this.sortable, 'sortchange', this.onSortChange, this);
        }

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });

        Ext.TabBar.superclass.initEvents.call(this);
    },

    
    onTap : function(e, t) {
        t = e.getTarget('.x-tab');
        if (t) {
            this.onTabTap(Ext.getCmp(t.id));
        }
    },

    
    onSortChange : function(sortable, el, index) {
    },

    
    onTabTap : function(tab) {
        this.activeTab = tab;
        if (this.cardLayout) {
            this.cardLayout.setActiveItem(tab.card);
        }
        this.fireEvent('change', this, tab, tab.card);
    },

    
    setCardLayout : function(layout) {
        if (this.cardLayout) {
            this.mun(this.cardLayout.owner, {
                add: this.onCardAdd,
                remove: this.onCardRemove,
                scope: this
            });
        }
        this.cardLayout = layout;
        if (layout) {
            this.mon(layout.owner, {
                add: this.onCardAdd,
                remove: this.onCardRemove,
                scope: this
            });
        }
    },

    
    onCardAdd : function(panel, card) {
        card.tab = this.add({
            xtype: 'tab',
            card: card
        });
    },

    
    onCardRemove : function(panel, card) {
        var items = this.items.items,
            ln = items.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.card === card) {
                item.card = null;
                this.remove(item, true);
                return;
            }
        }
    },

    getCardLayout : function() {
        return this.cardLayout;
    }
});

Ext.reg('tabbar', Ext.TabBar);



Ext.Tab = Ext.extend(Ext.Button, {
    
    isTab: true,
    baseCls: 'x-tab',

    
    pressedCls: 'x-tab-pressed',

    
    activeCls: 'x-tab-active',

    
    initComponent : function() {
        this.addEvents(
            
            'activate',
            
            'deactivate'
        );

        Ext.Tab.superclass.initComponent.call(this);

        var card = this.card;
        if (card) {
            this.card = null;
            this.setCard(card);
        }
    },

    
    setCard : function(card) {
        if (this.card) {
            this.mun(this.card, {
                activate: this.activate,
                deactivate: this.deactivate,
                scope: this
            });
        }
        this.card = card;
        if (card) {
            Ext.apply(this, card.tab || {});
            this.setText(this.title || card.title || this.text );
            this.setIconClass(this.iconCls || card.iconCls);
            this.setBadge(this.badgeText || card.badgeText);

            this.mon(card, {
                beforeactivate: this.activate,
                beforedeactivate: this.deactivate,
                scope: this
            });
        }
    },

    
    getCard : function() {
        return this.card;
    },

    
    activate : function() {
        this.el.addClass(this.activeCls);
        this.fireEvent('activate', this);
    },

    
    deactivate : function() {
        this.el.removeClass(this.activeCls);
        this.fireEvent('deactivate', this);
    }
});

Ext.reg('tab', Ext.Tab);


Ext.TabPanel = Ext.extend(Ext.Panel, {
    
    animation: null,

    
    tabBarPosition: 'top',
    cmpCls: 'x-tabpanel',

    
    ui: 'dark',

    

    

    

    
    initComponent : function() {
        var layout = new Ext.layout.CardLayout(this.layout || {});
        this.layout = null;
        this.setLayout(layout);

        this.tabBar = new Ext.TabBar(Ext.apply({}, this.tabBar || {}, {
            cardLayout: layout,
            animation: this.animation,
            dock: this.tabBarPosition,
            ui: this.ui,
            sortable: this.sortable
        }));

        if (this.dockedItems && !Ext.isArray(this.dockedItems)) {
            this.dockedItems = [this.dockedItems];
        }
        else if (!this.dockedItems) {
            this.dockedItems = [];
        }
        this.dockedItems.push(this.tabBar);

        Ext.TabPanel.superclass.initComponent.call(this);
    },

    
    getTabBar : function() {
        return this.tabBar;
    },
    
    afterLayout : function() {
        Ext.TabPanel.superclass.afterLayout.call(this);
        this.getTabBar().doLayout();
    }
});

Ext.reg('tabpanel', Ext.TabPanel);


Ext.Carousel = Ext.extend(Ext.Panel, {
    

    
    cmpCls: 'x-carousel',

    
    indicator: true,

    
    ui: null,

    
    direction: 'horizontal',

    

    
    initComponent: function() {
        this.layout = {
            type: 'card',
            
            sizeAllCards: true,
            
            hideInactive: false,
            extraCls: 'x-carousel-item',
            targetCls: 'x-carousel-body',
            setOwner : function(owner) {
                Ext.layout.CardLayout.superclass.setOwner.call(this, owner);
            }
        };
         
        if (this.indicator) {
            var cfg = Ext.isObject(this.indicator) ? this.indicator : {};
            this.indicator = new Ext.Carousel.Indicator(Ext.apply({}, cfg, {
                direction: this.direction,
                carousel: this,
                ui: this.ui
            }));
        }

        Ext.Carousel.superclass.initComponent.call(this);
    },

    
    afterRender: function() {
        Ext.Carousel.superclass.afterRender.call(this);

        
        this.body.on({
            scroll: this.onScroll,
            scrollend: this.onScrollEnd,
            horizontal: this.direction == 'horizontal',
            vertical: this.direction == 'vertical',
            scope: this
        });
        
        this.el.addClass(this.cmpCls + '-' + this.direction);
    },
    
        
    afterLayout : function() {
        Ext.Carousel.superclass.afterLayout.apply(this, arguments);
        
        this.currentSize = this.body.getSize();
        this.currentScroll = {x: 0, y: 0};
        
        this.updateCardPositions();
        
        var activeItem = this.layout.getActiveItem();        
        if (activeItem && this.indicator) {  
            this.indicator.onBeforeCardSwitch(this, activeItem, null, this.items.indexOf(activeItem));
        }
    },

        
    onScroll : function(e) {
        this.currentScroll = {
            x: e.deltaX,
            y: e.deltaY
        };

        
        var activeIndex = this.items.items.indexOf(this.layout.activeItem);    
        
        
        if (this.direction == 'horizontal' && (
            
            (activeIndex == 0 && e.deltaX > 0) || 
            
            (activeIndex == this.items.length - 1 && e.deltaX < 0)
        )) {
            
            this.currentScroll.x = e.deltaX / 2;
        }
        
        else if (this.direction == 'vertical' && (
            
            (activeIndex == 0 && e.deltaY > 0) || 
            
            (activeIndex == this.items.length - 1 && e.deltaY < 0)
        )) {
            
            this.currentScroll.y = e.deltaY / 2;           
        }
        
        
        this.updateCardPositions();
    },

    
    updateCardPositions : function(animate) {
        var cards = this.items.items,
            ln = cards.length,
            i, card, el, style;
        
        
        
        
        for (i = 0; i < ln; i++) {
            card = cards[i];  
            
            
            if (this.isCardInRange(card)) {
                if (card.hidden) {
                    card.show();
                }
                
                el = card.el;
                style = el.dom.style;
                
                if (animate) {
                    if (card === this.layout.activeItem) {
                        el.on('webkitTransitionEnd', this.onTransitionEnd, this, {single: true});
                    }
                    style.webkitTransitionDuration = '300ms';
                }
                else {
                    style.webkitTransitionDuration = '0ms';
                }

                if (this.direction == 'horizontal') {
                    style.webkitTransform = 'translate3d(' + this.getCardOffset(card) + 'px, 0, 0)';
                }
                else {
                    style.webkitTransform = 'translate3d(0, ' + this.getCardOffset(card) + 'px, 0)';
                }
            }
            else if (!card.hidden) {
                
                card.hide();
            }
        }
    },

        
    getCardOffset : function(card) {
        var cardOffset = this.getCardIndexOffset(card),
            currentSize = this.currentSize,
            currentScroll = this.currentScroll;
            
        return this.direction == 'horizontal' ?
            (cardOffset * currentSize.width) + currentScroll.x :
            (cardOffset * currentSize.height) + currentScroll.y;
    },

            
    getCardIndexOffset : function(card) {
        return this.items.items.indexOf(card) - this.getActiveIndex();
    },

        
    isCardInRange : function(card) {
        return Math.abs(this.getCardIndexOffset(card)) <= 2;
    },

        
    getActiveIndex : function() {
        return this.items.indexOf(this.layout.activeItem);
    },

            
    onScrollEnd : function(e, t) {
        var previousDelta, deltaOffset; 
            
        if (this.direction == 'horizontal') {
            deltaOffset = e.deltaX;
            previousDelta = e.previousDeltaX;
        }
        else {
            deltaOffset = e.deltaY;
            previousDelta = e.previousDeltaY;
        }
            
        
        if (deltaOffset < 0 && Math.abs(deltaOffset) > 3 && previousDelta <= 0 && this.layout.getNext()) {
            this.next();
        }
        
        else if (deltaOffset > 0 && Math.abs(deltaOffset) > 3 && previousDelta >= 0 && this.layout.getPrev()) {
            this.prev();
        }
        else {
            
            this.scrollToCard(this.layout.activeItem);
        }
    },

    
    onBeforeCardSwitch : function(newCard) {
        if (!this.customScroll && this.items.indexOf(newCard) != -1) {
            var style = newCard.el.dom.style;
            style.webkitTransitionDuration = null;
            style.webkitTransform = null;
        }
        return Ext.Carousel.superclass.onBeforeCardSwitch.apply(this, arguments);
    },

        
    scrollToCard : function(newCard) {
        this.currentScroll = {x: 0, y: 0};
        this.oldCard = this.layout.activeItem;
        
        if (newCard != this.oldCard && this.isCardInRange(newCard) && this.onBeforeCardSwitch(newCard, this.oldCard, this.items.indexOf(newCard), true) !== false) {
            this.layout.activeItem = newCard;
            if (this.direction == 'horizontal') {
                this.currentScroll.x = -this.getCardOffset(newCard);
            }
            else {
                this.currentScroll.y = -this.getCardOffset(newCard);
            }
        }
        
        this.updateCardPositions(true);
    },    
    
    onTransitionEnd : function(e, t) {
        this.customScroll = false;
        this.currentScroll = {x: 0, y: 0};
        if (this.oldCard && this.layout.activeItem != this.oldCard) {
            this.onCardSwitch(this.layout.activeItem, this.oldCard, this.items.indexOf(this.layout.activeItem), true);
        }
        delete this.oldCard;
    },
        
    
    onCardSwitch : function(newCard, oldCard, index, animated) {
        this.currentScroll = {x: 0, y: 0};
        this.updateCardPositions();
        Ext.Carousel.superclass.onCardSwitch.apply(this, arguments);
    },

    
    next: function() {
        var next = this.layout.getNext();
        if (next) {
            this.customScroll = true;
            this.scrollToCard(next);
        }
        return this;
    },

    
    prev: function() {
        var prev = this.layout.getPrev();
        if (prev) {
            this.customScroll = true;
            this.scrollToCard(prev);
        }
        return this;
    }
});

Ext.reg('carousel', Ext.Carousel);


Ext.Carousel.Indicator = Ext.extend(Ext.Component, {
    baseCls: 'x-carousel-indicator',

    initComponent: function() {
        if (this.carousel.rendered) {
            this.render(this.carousel.body);
            this.onBeforeCardSwitch(null, null, this.carousel.items.indexOf(this.carousel.layout.getActiveItem()));
        }
        else {
            this.carousel.on('render', function() {
                this.render(this.carousel.body);
            }, this, {single: true});
        }
        Ext.Carousel.Indicator.superclass.initComponent.call(this);
    },

    
    onRender: function() {
        Ext.Carousel.Indicator.superclass.onRender.apply(this, arguments);

        for (var i = 0, ln = this.carousel.items.length; i < ln; i++) {
            this.createIndicator();
        }

        this.mon(this.carousel, {
            beforecardswitch: this.onBeforeCardSwitch,
            add: this.onCardAdd,
            remove: this.onCardRemove,
            scope: this
        });

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });
        
        this.el.addClass(this.baseCls + '-' + this.direction);
    },

    
    onTap: function(e, t) {
        var box = this.el.getPageBox(),
            centerX = box.left + (box.width / 2);

        if (e.pageX > centerX) {
            this.carousel.next();
        }
        else {
            this.carousel.prev();
        }
    },

    
    createIndicator: function() {
        this.indicators = this.indicators || [];
        this.indicators.push(this.el.createChild({
            tag: 'span'
        }));
    },

    
    onBeforeCardSwitch: function(carousel, card, old, index) {
        if (Ext.isNumber(index) && index != -1 && this.indicators[index]) {
            this.indicators[index].radioClass('x-carousel-indicator-active');
        }
    },

    
    onCardAdd: function() {
        this.createIndicator();
    },

    
    onCardRemove: function() {
        this.indicators.pop().remove();
    }
});

Ext.reg('carouselindicator', Ext.Carousel.Indicator);


Ext.Map = Ext.extend(Ext.Component, {

    

    
    baseCls: 'x-map',

    
    getLocation: false,

    

    
    map: null,

    
    geo: null,

    maskMap: false,


    initComponent : function() {
        this.mapOptions = this.mapOptions || {};

        Ext.Map.superclass.initComponent.call(this);

        if (this.getLocation) {
            this.geo = new Ext.util.GeoLocation();
            this.geo.on('update', this.onGeoUpdate, this);
        }
        else {
            this.on({
                afterrender: this.update,
                activate: this.onUpdate,
                scope: this,
                single: true
            });
        }
    },

    onGeoUpdate : function(coords) {
        if (coords) {
            this.mapOptions.center = new google.maps.LatLng(coords.latitude, coords.longitude);
        }

        if (this.rendered) {
            this.update();
        }
        else {
            this.on('activate', this.onUpdate, this, {single: true});
        }
    },

    onUpdate : function(map, e, options) {
        this.update(options.data || null);
    },

    update : function(data) {
        var geocoder;

        if (Ext.platform.isTablet && Ext.platform.isIPhoneOS) {
            Ext.apply(this.mapOptions, {
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.ZOOM_PAN
                }
            });
        }

        Ext.applyIf(this.mapOptions, {
            center: new google.maps.LatLng(37.381592,-122.135672), 
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        if (!this.hidden && this.rendered) {

            if (this.maskMap && !this.mask) {
                this.el.mask();
                this.mask=true;
            }

            if (this.map && this.el && this.el.dom && this.el.dom.firstChild) {
                Ext.fly(this.el.dom.firstChild).remove();
            }
            this.map = new google.maps.Map(this.el.dom, this.mapOptions);
        }
        else {
            this.on('activate', this.onUpdate, this, {single: true, data: data});
        }
    }
});

Ext.reg('map', Ext.Map);

Ext.NestedList = Ext.extend(Ext.Panel, {
    cmpCls: 'x-nested-list',
    
    layout: 'card',

    
    animation: 'slide',

    
    backButton: null,
    
    
    backText: 'Back',

    initComponent : function() {
        
        this.backButton = new Ext.Button({
            text: this.backText,
            ui: 'back',
            handler: this.onBackTap,
            scope: this,
            hidden: true 
        });

        if (!this.toolbar || !this.toolbar.isComponent) {
                        
            this.toolbar = Ext.apply({}, this.toolbar || {}, {
                dock: 'top',
                xtype: 'toolbar',
                ui: 'light',
                items: []
            });
            this.toolbar.items.unshift(this.backButton);
            this.toolbar = new Ext.Toolbar(this.toolbar);

            this.dockedItems = this.dockedItems || [];
            this.dockedItems.push(this.toolbar);
        }
        else {
            this.toolbar.insert(0, this.backButton);
        }

        var list = this.items;
        this.items = null;

        Ext.NestedList.superclass.initComponent.call(this);

        this.addEvents(
            
            'listchange'
        );

        this.listIndex = 0;
        this.setList(list, true);

        this.on({
            beforeactivate: this.onBeforeActivate,
            beforedeactivate: this.onBeforeDeactivate,
            scope: this
        });
    },

    setList : function(list, init) {
        var items = init ? list : list.items;
        if (!list.isList) {
            list = new Ext.Container({
                isList: true,
                baseCls: 'x-list',
                cls: 'x-list-flat',
                defaults: {
                    xtype: 'button',
                    baseCls: 'x-list-item',
                    pressedCls: 'x-item-pressed',
                    ui: null,
                    pressedDelay: true
                },
                listeners: {
                    afterrender: function() {
                        this.getContentTarget().addClass('x-list-parent');
                    }
                },
                scroll: 'vertical',
                items: items,
                text: list.text
            });
        }

        this.lists = this.lists || [];
        if (!this.lists.contains(list)) {
            this.lists.push(this.add(list));
        }

        var isBack = (this.lists.indexOf(list) < this.lists.indexOf(this.activeItem));
        if (this.rendered) {
            this.setCard(list, init ? false : {
                type: this.animation,
                reverse: isBack
            });
        }
        this.activeItem = list;
    },

    afterRender : function() {
        Ext.NestedList.superclass.afterRender.call(this);

        this.mon(this.body, {
            tap: this.onTap,
            scope: this
        });
    },

    onTap : function(e, t) {
        t = e.getTarget('.x-list-item');
        if (t) {
            this.onItemTap(Ext.getCmp(t.id));
        }
    },

    onItemTap : function(item) {
        item.el.radioClass('x-item-selected');
        if (item.items) {
            this.backButton.show();
            this.setList(item);
            this.listIndex++;
        }
        this.fireEvent('listchange', this, item);
    },

    onBackTap : function() {
        this.listIndex--;

        var list = this.lists[this.listIndex];

        if (this.listIndex === 0) {
            this.backButton.hide();
        }

        this.activeItem.on('deactivate', function(item) {
            this.lists.remove(item);
            item.destroy();
        }, this, {single: true});

        this.setList(list);

        var me = this;
        setTimeout(function() {
            list.el.select('.x-item-selected').removeClass('x-item-selected');
        }, 500);

        this.fireEvent('listchange', this, list);
    },

    onBeforeDeactivate : function() {
        this.backButton.hide();
        this.toolbar.doLayout();
        this.initialActivate = true;
    },

    onBeforeActivate : function() {
        if (this.initialActivate && this.listIndex !== 0) {
            this.backButton.show();
            this.toolbar.doLayout();
        }
        var me = this;
        setTimeout(function() {
            me.activeItem.el.select('.x-item-selected').removeClass('x-item-selected');
        }, 500);
    }
});
Ext.reg('nestedlist', Ext.NestedList);

Ext.regModel("KeyValueModel", {
    fields: [{
        name: "key",
        type: "string"
    },{
        name: "value",
        type: "auto"
    }]
});


Ext.Picker = Ext.extend(Ext.Panel, {
    cmpCls: 'x-picker',

    centered: true,

    
    displayField: 'key',

    
    valueField: 'value',

    
    useTitles: true,

    
    activeCls: 'x-picker-active-item',

    
    rowHeight: false,

    
    align: 'left',

    

    pickerItemCls: 'li.x-picker-item',

    chosenCls: 'x-picker-chosen-item',
    model: 'KeyValueModel',

    initComponent : function() {
        var items = [],
            i,
            slot,
            slotItem,
            ln;

        this.layout = {
            type: 'hbox',
            align: 'stretch'
        };

        for (i = 0, ln = this.slots.length; i < ln; i++) {
            slot = this.slots[i];
            slotItem = {
                xtype: 'dataview',
                itemSelector: this.pickerItemCls,
                isSlot: true,
                flex: 1,
                listeners: {
                    itemtap: this.onItemTap,
                    scope: this
                },
                scroll: {
                    direction: 'vertical',
                    scrollbars: false,
                    snap: true,
                    friction: 0.5,
                    
                    
                    index: i,
                    listeners: {
                        scrollend: this.onScrollEnd,
                        scope: this
                    }
                },
                tpl: '<ul class="x-picker-{align}"><tpl for="."><li class="x-picker-item {cls} <tpl if="extra">x-picker-invalid</tpl>">{' + this.displayField + '}</li></tpl></ul>',
                store: new Ext.data.Store({
                    model: this.model,
                    data: slot.items
                })
            };


            if (this.useTitles) {
                slotItem.dockedItems = [{
                    xtype: 'toolbar',
                    dock: 'top',
                    title: slot.title || slot.text
                }];
            }

            items.push(slotItem);
        }

        this.items = items;
        this.activeEls = [];
        this.lastEls = [];

        Ext.Picker.superclass.initComponent.call(this);

        this.addEvents(
            
            'pick'
        );
    },

    
    getSelectedEls: function() {
        var el,
            xy,
            result,
            results = [],
            i = 0,
            ln = this.slots.length,
            closestValidItem = this.pickerItemCls+":not(.x-picker-invalid)";

        for (; i < ln; i++) {
            el = this.activeEls[i];
            xy = el.getXY();
            xy[0] += (el.getWidth() / 2);
            xy[1] += (el.getHeight() / 2);
            el.hide();

            result = document.elementFromPoint(xy[0], xy[1]);
            if (result.innerText === "") {
                var resultEl = Ext.fly(result).next(closestValidItem) || Ext.fly(result).prev(closestValidItem);
                if (resultEl) {
                    result = resultEl.dom;
                    this.scrollToNode(this.items.itemAt(i), result);
                }
            }

            results.push(result);
            el.show();
        }
        this.lastEls = results;
        return results;
    },

    
    getValue: function() {
        var vals = {},
            els = this.getSelectedEls(),
            i,
            name,
            r,
            ln;

        for (i = 0, ln = els.length; i < ln; i++) {
            if (Ext.DomQuery.is(els[i], this.pickerItemCls)) {
                name = this.slots[i].name || Ext.id();
                r = this.items.itemAt(i).getRecord(els[i]);
                vals[name] = r.get(this.valueField);
            }
        }
        return vals;
    },

    
    scrollToNode: function(dv, n, animate) {
        var xy = Ext.fly(n).getOffsetsTo(dv.body),
            itemIndex = this.items.indexOf(dv);

        if (animate !== false) {
            animate = true;
        }

        dv.scroller.scrollTo({
            x: 0,
            y: (-xy[1] + this.activeEls[itemIndex].getTop())
        }, animate ? 200 : false);
    },

    
    onItemTap: function(dv, idx, n) {
        this.scrollToNode(dv, n);
    },

    
    afterLayout: function() {
        Ext.Picker.superclass.afterLayout.apply(this, arguments);

        if (this.initialized) {
            return;
        }

        if (!this.rowHeight) {
            var aRow = this.el.down(this.pickerItemCls);
            var rowHeight = aRow.getHeight();
            this.rowHeight = rowHeight;
            this.items.each(function(item) {
                if (item.scroller) {
                    item.scroller.snap = rowHeight;
                }
            });
        }

        var innerHeight,
            maxRows,
            targetRowIdx,
            afterRows,
            lessThanHalf,
            skip,
            loopTo,
            i,
            j,
            slotsLn = this.slots.length,
            slot,
            slotItems,
            subChosenEl,
            bd = this.items.itemAt(0).body;

        innerHeight = bd.getHeight();
        maxRows = Math.ceil(innerHeight / this.rowHeight);
        targetRowIdx = Math.max((Math.floor(maxRows / 2)) - 1, 1);

        afterRows = (innerHeight / this.rowHeight) - targetRowIdx - 1;
        lessThanHalf = Math.floor(afterRows) + 0.5 > afterRows;
        skip = lessThanHalf ? 0 : -1;

        loopTo = Math.floor(innerHeight/ this.rowHeight);
        for (i = 0; i < slotsLn; i++) {
            slot = this.slots[i];
            var ds = this.items.itemAt(i).store;

            slotItems = slot.items;
            for (j = 0; j < loopTo; j++) {
                if (j < targetRowIdx) {
                    ds.insert(0, Ext.ModelMgr.create({key: '', value: '', extra: true}, this.model));
                }
                else if (j > (targetRowIdx + skip)) {
                    ds.add(Ext.ModelMgr.create({key: '', value: '', extra: true}, this.model));
                }
            }

            subChosenEl = Ext.DomHelper.append(this.items.itemAt(i).body, {
                cls: 'x-picker-chosen'
            }, true);

            subChosenEl.setTop((targetRowIdx) * this.rowHeight + bd.getTop());
            subChosenEl.setWidth(bd.getWidth());
            this.activeEls[i] = subChosenEl;
        }

        if (this.value !== undefined) {
            this.setValue(this.value, false);
        }
        else {
            this.onScrollEnd();
        }

        this.initialized = true;
    },

    setValue: function(obj, animate) {
        var i = 0,
            slotsLn = this.slots.length,
            dv,
            items = this.items,
            value;

        for (; i < slotsLn; i++) {
            value = this.value[this.slots[i].name];
            if (value) {
                dv = items.itemAt(i);
                var idx = dv.store.find(this.valueField, value),
                    r = dv.store.getAt(idx),
                    n = dv.getNode(r);

                this.scrollToNode(dv, n, animate);
            }
        }
    },

    
    onScrollEnd: function(scroller) {
        
        if (scroller) {
            
            var index = scroller.index,
                dv = this.items.itemAt(index),
                lastEl = this.lastEls[index],
                oldRecord = lastEl ? dv.getRecord(lastEl) : undefined,
                oldValue = oldRecord ? oldRecord.get(this.valueField) : undefined,
                els = this.getSelectedEls(),
                r = dv.getRecord(els[index]);

            if (lastEl) {
                Ext.fly(lastEl).removeClass(this.chosenCls);
            }
            Ext.fly(els[index]).addClass(this.chosenCls);

            this.fireEvent('pick', this, this.slots[index].name, r.get(this.valueField), oldValue, r);
        }
        else {
            
            var i = 0, els = this.getSelectedEls(), ln = els.length;
            for (; i < ln; i++) {
                Ext.fly(els[i]).addClass(this.chosenCls);
            }
        }
    }
});
Ext.reg('picker', Ext.Picker);


Ext.DatePicker = Ext.extend(Ext.Picker, {

    
    yearFrom: 1980,

    
    yearTo: new Date().getFullYear(),
    
    
    monthText: 'Month',
    
    
    dayText: 'Day',
    
    
    yearText: 'Year',

    initComponent: function() {
        var yearsFrom = this.yearFrom,
            yearsTo = this.yearTo,
            years = [],
            ln;

        
        if (yearsFrom > yearsTo) {
            var tmp = yearsFrom;
            yearsFrom = yearsTo;
            yearsTo = tmp;
        }

        for (var i = yearsFrom; i <= yearsTo; i++) {
            years.push({
                key: i,
                value: i
            });
        }

        var daysInMonth;
        if (this.value) {
            daysInMonth = this.getDaysInMonth(this.value.month, this.value.year);
        } else {
            daysInMonth = this.getDaysInMonth(0, new Date().getFullYear());
        }

        var days = [];
        for (i = 0; i < daysInMonth; i++) {
            days.push({
                key: i+1,
                value: i+1
            });
        }

        var months = [];
        for (i = 0, ln = Date.monthNames.length; i < ln; i++) {
            months.push({
                key: Date.monthNames[i],
                value: i
            });
        }

        this.slots = [{
            text: this.monthText,
            name: 'month',
            align: 'left',
            items: months
        },{
            text: this.dayText,
            name: 'day',
            align: 'center',
            items: days
        },{
            text: this.yearText,
            name: 'year',
            align: 'right',
            items: years
        }];

        Ext.DatePicker.superclass.initComponent.call(this);
        this.on('pick', this.onPick, this);
    },


    
    getValue: function() {
        var v = Ext.DatePicker.superclass.getValue.call(this),
            day,
            daysInMonth = this.getDaysInMonth(v.month, v.year);

        if (v.day !== "") {
            day = Math.min(v.day, daysInMonth);
        } else {
            day = daysInMonth;
            var dv = this.items.itemAt(1),
                idx = dv.store.find(this.valueField, daysInMonth),
                r = dv.store.getAt(idx),
                n = dv.getNode(r);
            this.scrollToNode(dv, n);
        }
        return new Date(v.year, v.month, day);
    },

    
    onPick: function(picker, name, value, r) {
        if (name === "month" || name === "year") {
            var dayView = this.items.itemAt(1);
            var store = dayView.store;
            var date = this.getValue();
            var daysInMonth = this.getDaysInMonth(date.getMonth(), date.getFullYear());
            store.filter([{
                fn: function(r) {
                    return r.get('extra') === true || r.get('value') <= daysInMonth;
                }
            }]);
            this.onScrollEnd(dayView.scroller);
        }
    },

    
    getDaysInMonth: function(month, year) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return month == 1 && this.isLeapYear(year) ? 29 : daysInMonth[month];
    },

    
    isLeapYear: function(year) {
        return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
    }
});

Ext.reg('datepicker', Ext.DatePicker);


Ext.Media = Ext.extend(Ext.Container, {
    

    
    url: '',

    
    enableControls: true,
    
    
    autoResume: false,

    
    autoPause: true,

    
    preload: true,

    
    playing: false,

    
    afterRender : function() {
        var cfg = this.getConfiguration();
        Ext.apply(cfg, {
            src: this.url,
            preload: this.preload ? 'auto' : 'none'
        });
        if(this.enableControls){
            cfg.controls = 'controls';
        }
        if(this.loop){
            cfg.loop = 'loop';
        }
        this.media = this.el.createChild(cfg);
        Ext.Media.superclass.afterRender.call(this);
        
        this.on({
            scope: this,
            activate: this.onActivate,
            beforedeactivate: this.onDeactivate
        });
    },
    
    
    onActivate: function(){
        if (this.autoResume && !this.playing) {
            this.play();
        }
    },
    
    
    onDeactivate: function(){
        if (this.autoPause && this.playing) {
            this.pause();
        }
    },

    
    play : function() {
        this.media.dom.play();
        this.playing = true;
    },

    
    pause : function() {
        this.media.dom.pause();
        this.playing = false;
    },

    
    toggle : function() {
        if(this.playing){
            this.pause();    
        }else{
            this.play();
        }
    }
});

Ext.reg('media', Ext.Media);

Ext.Video = Ext.extend(Ext.Media, {
    

    

    
    poster: '',
    
    
    cmpCls: 'x-video',

    afterRender : function() {
        Ext.Video.superclass.afterRender.call(this);
        if (this.poster) {
            this.media.hide();
            this.ghost = this.el.createChild({
                cls: 'x-video-ghost',
                style: 'width: 100%; height: 100%; background: #000 url(' + this.poster + ') center center no-repeat; -webkit-background-size: 100% auto;'
            });
            this.ghost.on('tap', this.onGhostTap, this, {single: true});
        }
    },
    
    onGhostTap: function(){
        this.media.show();
        this.ghost.hide();
        this.play();
    },
    
    
    getConfiguration: function(){
        return {
            tag: 'video',
            width: '100%',
            height: '100%'
        };
    }    
});

Ext.reg('video', Ext.Video);

Ext.Audio = Ext.extend(Ext.Media, {
    

    

    cmpCls: 'x-audio',
    
    
    onActivate: function(){
        Ext.Audio.superclass.onActivate.call(this);
        if (Ext.platform.isPhone) {
            this.media.show();
        }    
    },
    
    
    onDeactivate: function(){
        Ext.Audio.superclass.onDeactivate.call(this);
        if (Ext.platform.isPhone) {
            this.media.hide();
        }
    },
    
    
    getConfiguration: function(){
        var hidden = !this.enableControls;
        if (Ext.platform.isPhone) {
            return {
                tag: 'embed',
                type: 'audio/mpeg',
                target: 'myself',
                controls: 'true',
                hidden: hidden
            };
        } else {
            return {
                tag: 'audio',
                hidden: hidden
            };
        }    
    }
});

Ext.reg('audio', Ext.Audio);

Ext.form.FormPanel = Ext.extend(Ext.Panel, {
    
    standardSubmit: false,

    cmpCls: 'x-form',
    
    
    url : undefined,
    
    
    baseParams : undefined,

    renderTpl: [
        '<form <tpl if="id">id="{id}"</tpl> class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<div class="{baseCls}-body"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>',
        '</form>'
    ],
    
    
    waitTpl: new Ext.XTemplate(
        '<div class="{cls}">{message}&hellip;</div>'
    ),

    
    initComponent : function() {
        this.addEvents(
           
            'submit', 
           
             'beforesubmit', 
           
             'exception'
        );
        Ext.form.FormPanel.superclass.initComponent.call(this);
    },

    
    afterRender : function() {
        Ext.form.FormPanel.superclass.afterRender.call(this);
        this.el.on('submit', this.onSubmit, this);
    },

    
    onSubmit : function(e, t) {
        if (!this.standardSubmit || this.fireEvent('beforesubmit', this, this.getValues(true)) === false) {
            if (e) {
                e.stopEvent();
            }       
        }
    },
    
    

    submit : function(options) {
        var form = this.el.dom || {};
        
        options = Ext.applyIf(options || {},{
           url : this.url || form.action,
           submitDisabled : false,
           method : form.method || 'post',
           params : null,
           autoAbort : false,
           waitMsg : null,
           headers : null,
           success : Ext.emptyFn,
           failure : Ext.emptyFn
        });
        
        var formValues = this.getValues(this.standardSubmit || !options.submitDisabled);
        
        if (this.standardSubmit) {
            if (form) {
                if (options.url && Ext.isEmpty(form.action)) {
                    form.action = options.url;
                }
                form.method = (options.method || form.method).toLowerCase();
                form.submit();
            }
            return null;
        }
        if (this.fireEvent('beforesubmit', this, formValues, options ) !== false) {
            if (options.waitMsg) {
                this.showMask(options.waitMsg);
            }
            
            return Ext.Ajax.request({
                url : options.url,
                method : options.method,
                rawData : Ext.urlEncode(Ext.apply(
                    Ext.apply({},this.baseParams || {}),
                    options.params || {},
                    formValues
                  )),
                autoAbort : options.autoAbort,
                headers  : Ext.apply(
                   {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    options.headers || {}),
                scope : this,
                callback: function(options, success, response) {
                     var R = response;
                     this.hideMask();   
                        
                     if (success) {
                          R = Ext.decode(R.responseText);
                          success = !!R.success;
                          if (success) {
                              if (typeof options.success == 'function') {
                                options.success.call(options.scope, this, R);
                              }
                              this.fireEvent('submit', this, R);
                              return;
                          }
                     }
                    if (typeof options.failure == 'function') {
                        options.failure.call(options.scope, this, R);
                    }
                    this.fireEvent('exception', this, R);
                }
            });
        }
    },

    
    loadModel: function(instance) {        
        if(instance && instance.data){
            this.setValues(instance.data);
        }
        return this;
    },
    
    
    updateModel: function(instance, enabled) {
        var fields, values, name;
        
        if(instance && (fields = instance.fields)){
            values = this.getValues(enabled);
            for (name in values) {
                if(values.hasOwnProperty(name) && fields.containsKey(name)){
                   instance.set(name, values[name]);     
                }
            }
        }
        return this;
         
    },

    
    setValues: function(values) {
         var fields = this.getFields(),
            name, field;
        values = values || {};
        for (name in values) {
            if (values.hasOwnProperty(name) && name in fields) {
                field = fields[name];
                field.setValue && field.setValue(values[name]);
            }       
        }
        return this;
    },

    
    getValues: function(enabled) {
        var fields = this.getFields(),
            field,
            values = {},
            name;

        for (name in fields) {
            if (fields.hasOwnProperty(name)) {
                field = fields[name];
                if (enabled && field.disabled) {
                    continue;
                }
                if (field.getValue) {
                    values[name] = field.getGroupValue ? field.getGroupValue() : field.getValue();
                }
            }
        }

        return values;

    },

    
    reset: function() {
        var fields = this.getFields(),
            name;
        for (name in fields) {
            if(fields.hasOwnProperty(name)){
                fields[name].reset();
            }
        }
    },

    
    getFields: function() {
        var fields = {};

        var getFieldsFrom = function(item) {
            if (item.isField) {
                fields[item.getName()] = item;
            }

            if (item.isContainer) {
                item.items.each(getFieldsFrom);
            }
        };

        this.items.each(getFieldsFrom);
        return fields;
    },
    
    showMask : function(cfg, target){
        
        cfg = Ext.isString(cfg)? {message : cfg, transparent : false} : cfg; 
        
        if(cfg && this.waitTpl){
            this.maskTarget = target = Ext.get(target || cfg.target) || this.el;
            target && target.mask(!!cfg.transparent, this.waitTpl.apply(cfg));
        }
        return this;
    },
    
    
    hideMask : function(){
        if(this.maskTarget){
            this.maskTarget.unmask();
            delete this.maskTarget;
        }
        return this;
    }
});

 
Ext.form.FormPanel.prototype.load = Ext.form.FormPanel.prototype.loadModel; 
Ext.reg('form', Ext.form.FormPanel);


Ext.form.FieldSet = Ext.extend(Ext.Panel, {
    cmpCls: 'x-form-fieldset',

    
    initComponent : function() {
        this.componentLayout = new Ext.layout.AutoComponentLayout();
        Ext.form.FieldSet.superclass.initComponent.call(this);
    },

    

    

    
    afterLayout : function(layout) {
        Ext.form.FieldSet.superclass.afterLayout.call(this, layout);
        if (this.title && !this.titleEl) {
            this.titleEl = this.el.insertFirst({
                cls: this.cmpCls + '-title',
                html: this.title
            });
        }
        else if (this.titleEl) {
            this.el.insertFirst(this.titleEl);
        }

        if (this.instructions && !this.instructionsEl) {
            this.instructionsEl = this.el.createChild({
                cls: this.cmpCls + '-instructions',
                html: this.instructions
            });
        }
        else if (this.instructionsEl) {
            this.el.appendChild(this.instructionsEl);
        }
    }
});

Ext.reg('fieldset', Ext.form.FieldSet);


Ext.form.Field = Ext.extend(Ext.Component,  {
    ui: 'text',

    
    isField: true,

    

    

    

    

    

    
    baseCls : 'x-field',

    
    inputCls: undefined,

    
    focusClass : 'x-field-focus',
    
    
    placeHolder : undefined,
    
    
    autoComplete: undefined,
    
    
    autoCapitalize: undefined,
    
    

    renderTpl: [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls}<tpl if="required"> {required}</tpl><tpl if="cls"> {cls}</tpl><tpl if="cmpCls"> {cmpCls}</tpl><tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>><span>{label}</span></label></tpl>',
            '<tpl if="fieldEl"><input id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="maxlength">maxlength="{maxlength}" </tpl>',
                '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
                '<tpl if="autoCorrect">autocorrect="{autoCorrect}" </tpl>',
            '/></tpl>',
            '<tpl if="showClear"><div class="x-field-clear x-hidden-display"></div></tpl>',
            '<tpl if="maskField"><div class="x-field-mask"></div></tpl>',
        '</div>'
    ],

    
    disabled : false,

    
    isFormField : true,

    
    hasFocus : false,

    
    autoCreateField: true,

    
    inputType: 'text',
    
    
    label: null,
    
    labelWidth: 100, 

    
    labelAlign: 'left',

    
    required: false,

    maskField: false,

    
    initComponent : function() {
        
        this.label = this.label || this.fieldLabel;

        Ext.form.Field.superclass.initComponent.call(this);
        this.addEvents(
            
            'focus',
            
            'blur',
            
            'change',
            
            'keyup'
        );
    },

    
    getName : function() {
        return this.name || this.id || '';
    },

    
    onRender : function(ct, position) {
        var me = this,
            renderData     = me.renderData,
            autoComplete   = me.autoComplete,
            autoCapitalize = me.autoCapitalize,
            autoCorrect    = me.autoCorrect;
        
        Ext.applyIf(renderData, {
            disabled:   me.disabled,
            fieldCls:   'x-input-' + me.inputType + (me.inputCls ? ' ' + me.inputCls : ''),
            fieldEl:    !me.fieldEl && me.autoCreateField,
            inputId:    Ext.id(),
            label:      me.label,
            labelAlign: 'x-label-align-' + me.labelAlign,
            name:       me.name || me.id,
            placeholder: me.placeholder,
            required:   me.required ? 'x-field-required' : undefined,
            style:      me.style,
            tabIndex:   me.tabIndex,
            maxlength : me.maxLength,
            type:       me.inputType,
            maskField:  me.maskField,
            showClear:  me.showClear
        });
        
        var positive = /true|on/i;
        if (typeof autoComplete != 'undefined') {
            renderData.autoComplete = positive.test(autoComplete+'') ? 'on' : 'off';
        }
        
        if (typeof autoCapitalize != 'undefined') {
            renderData.autoCapitalize = positive.test(autoCapitalize+'') ? 'on' : 'off';
        }
        
        if (typeof autoCorrect != 'undefined') {
            renderData.autoCorrect = positive.test(autoCorrect+'') ? 'on' : 'off';
        }
        
        Ext.applyIf(me.renderSelectors, {
            mask   : '.x-field-mask',
            labelEl: 'label',
            clearEl: '.x-field-clear',
            fieldEl: '.' + renderData.fieldCls.trim().replace(/ /g, '.')
        });
        Ext.form.Field.superclass.onRender.call(me, ct, position);

        if (me.fieldEl) {
            me.mon(me.fieldEl, {
                focus: me.onFocus,
                blur: me.onBlur,
                change: me.onChange,
                keyup: me.onKeyUp,
                paste: me.checkClear,
                scope: me
            });
            
            if (me.maskField) {
                me.mon(me.mask, {
                    tap: me.onMaskTap,
                    scope: me
                });
            }
            
            if(me.clearEl){
                me.mon(me.clearEl, {
                    scope: this,
                    tap: this.onClearTap    
                });
            }
        }
    },

    
    onEnable : function() {
        this.getActionEl().removeClass(this.disabledClass);
        this.el.dom.disabled = false;
        this.fieldEl.dom.disabled = false;
        this.checkClear();
    },

    
    onDisable : function() {
        this.getActionEl().addClass(this.disabledClass);
        this.el.dom.disabled = true;
        this.fieldEl.dom.disabled = true;
        this.checkClear(true);
    },

    
    initValue : function(){
        if (this.value !== undefined) {
            this.setValue(this.value);
        }

        
        this.originalValue = this.getValue();
    },

    
    isDirty : function() {
        if (this.disabled || !this.rendered) {
            return false;
        }
        return String(this.getValue()) !== String(this.originalValue);
    },
    
    onClearTap: function(){
        this.setValue('');    
    },
    
    checkClear: function(force){
        var clearEl = this.clearEl,
            fieldEl = this.fieldEl,
            value = this.getValue();
        if (!(clearEl && fieldEl)) {
            return;
        }
        value = Ext.isEmpty(value) ? '' : String(value);
        if(force || value.length === 0){
            clearEl.addClass('x-hidden-display');
            fieldEl.removeClass('x-field-clearable');
        }else{
            clearEl.removeClass('x-hidden-display');
            fieldEl.addClass('x-field-clearable');
        }
          
    },

    
    afterRender : function(){
        Ext.form.Field.superclass.afterRender.call(this);
        this.initValue();
        this.checkClear();
    },

    onKeyUp : function(e) {
        this.checkClear();
        this.fireEvent('keyup', this, e);
    },

    onMaskTap : function(e) {
        this.mask.hide();
    },

    onChange : function(e) {
        this.checkClear();
        this.fireEvent('change', this, this.getValue());
    },

    
    reset : function() {
        this.setValue(this.originalValue);
    },

    
    beforeFocus: Ext.emptyFn,

    undoNativeScroll : function() {
        var parent = this.el.parent();
        while (parent) {
            if (parent.getStyle('overflow') == 'hidden') {
                parent.dom.scrollTop = 0;
                parent.dom.scrollLeft = 0;
            }
            parent = parent.parent();
        }
    },

    
    onFocus : function(e) {
        
        
        var me = this;
        setTimeout(function() {
            me.undoNativeScroll();
        }, 0);

        this.beforeFocus();
        if (this.focusClass) {
            this.el.addClass(this.focusClass);
        }

        if (!this.hasFocus) {
            this.hasFocus = true;
            
            this.startValue = this.getValue();
            this.fireEvent('focus', this);
        }
    },

    
    beforeBlur : Ext.emptyFn,

    
    onBlur : function() {
        this.beforeBlur();
        if (this.focusClass) {
            this.el.removeClass(this.focusClass);
        }
        this.hasFocus = false;
        var v = this.getValue();
        if (String(v) !== String(this.startValue)){
            this.fireEvent('change', this, v, this.startValue);
        }
        this.fireEvent('blur', this);
        if (this.maskField) {
            this.mask.show();
        }
        this.postBlur();
    },

    
    postBlur : Ext.emptyFn,

    
    getValue : function(){
        if (!this.rendered || !this.fieldEl) {
            return this.value;
        }

        return this.fieldEl.getValue() || '';
    },

    
    setValue : function(v){
        this.value = v;
        if (this.rendered && this.fieldEl) {
            this.fieldEl.dom.value = (Ext.isEmpty(v) ? '' : v);
        }
        this.checkClear();
        return this;
    }
});

Ext.reg('field', Ext.form.Field);


Ext.form.Slider = Ext.extend(Ext.form.Field, {
    ui: 'slider',
    

    
    inputCls: 'x-slider',

    
    minValue: 0,

    
    maxValue: 100,

    
    animate: true,

    
    value: 0,

    renderTpl: [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
        '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
        '<tpl if="fieldEl"><div id="{inputId}" name="{name}" class="{fieldCls}"',
        '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
        '<tpl if="style">style="{style}" </tpl>',
        '/></tpl>',
        '<div class="x-field-mask"></div>',
        '</div>'
    ],

    
    increment: 1,

    

    

    
    constructor: function(config) {
        this.addEvents(
            
            'beforechange',

            
            'change',
            
            'drag'
        );

        Ext.form.Slider.superclass.constructor.call(this, config);
    },

    
    initComponent: function() {
        
        
        this.values = [this.value];

        Ext.form.Slider.superclass.initComponent.apply(this, arguments);

        if (this.thumbs == undefined) {
            var thumbs = [],
                values = this.values,
                length = values.length,
                i;

            for (i = 0; i < length; i++) {
                thumbs[thumbs.length] = new Ext.form.Slider.Thumb({
                    value: values[i],
                    slider: this,

                    listeners: {
                        scope: this,
                        drag: this.onDrag,
                        dragend: this.onThumbDragEnd
                    }
                });
            }

            this.thumbs = thumbs;
        }
    },

    
    setValue: function(value) {
        
        var me = this,
            thumb = me.getThumb(),
            oldValue = thumb.getValue(),
            newValue = me.constrain(value);

        if (me.fireEvent('beforechange', me, thumb, oldValue, newValue) !== false) {
            this.moveThumb(thumb, this.getPixelValue(newValue, thumb));
            thumb.setValue(newValue);
            me.doComponentLayout();

            me.fireEvent('change', me, thumb, oldValue, newValue);
        }
    },

    
    constrain: function(value) {
        var increment = this.increment,
        div = Math.floor(Math.abs(value / increment)),
        lower = this.minValue + (div * increment),
        higher = Math.min(lower + increment, this.maxValue),
        dLower = value - lower,
        dHigher = higher - value;

        return (dLower < dHigher) ? lower: higher;
    },

    
    getValue: function() {
        
        return this.getThumb().getValue();
    },

    
    getThumb: function() {
        
        
        return this.thumbs[0];
    },

    
    getSliderValue: function(pixelValue, thumb) {
        var thumbWidth = thumb.el.getOuterWidth(),
            halfWidth = thumbWidth / 2,
            trackWidth = this.fieldEl.getWidth() - thumbWidth,
            range = this.maxValue - this.minValue,

            
            ratio = range / trackWidth;

        return this.minValue + (ratio * (pixelValue - halfWidth));
    },

    
    getPixelValue: function(value, thumb) {
        var thumbWidth = thumb.el.getOuterWidth(),
            halfWidth = thumbWidth / 2,
            trackWidth = this.fieldEl.getWidth() - thumbWidth,
            range = this.maxValue - this.minValue,

            
            ratio = trackWidth / range;

        return (ratio * (value - this.minValue)) + halfWidth;
    },

    
    renderThumbs: function() {
        var thumbs = this.thumbs,
            length = thumbs.length,
            i;

        for (i = 0; i < length; i++) {
            thumbs[i].render(this.fieldEl);
        }
    },

    
    onThumbDragEnd: function(draggable) {
        this.setValue(this.getThumbValue(draggable));
    },
    
    
    getThumbValue: function(draggable){
        var thumb = draggable.thumb,
            sliderBox = this.fieldEl.getPageBox(),
            thumbBox = thumb.el.getPageBox(),

            thumbWidth = thumbBox.width,
            halfWidth = thumbWidth / 2,
            center = (thumbBox.left - sliderBox.left) + halfWidth;
            
        return this.getSliderValue(center, thumb);
    },
    
    
    onDrag: function(draggable){
        var value = this.getThumbValue(draggable);
        this.fireEvent('drag', this, draggable.thumb, this.constrain(value));
    },

    
    onTap: function(e) {
        var sliderBox = this.fieldEl.getPageBox(),
            leftOffset = e.pageX - sliderBox.left,
            thumb = this.getNearest(leftOffset);

        this.setValue(this.getSliderValue(leftOffset, thumb));
    },

    
    moveThumb: function(thumb, pixel, animate) {
        var halfWidth = thumb.el.getOuterWidth() / 2;

        thumb.el.setLeft(pixel - halfWidth);
    },

    
    afterRender: function(ct) {
        this.renderThumbs();

        Ext.form.Slider.superclass.afterRender.apply(this, arguments);

        this.fieldEl.on({
            scope: this,
            tap: this.onTap
        });
    },

    
    getNearest: function(value) {
        
        return this.thumbs[0];
    }
});

Ext.reg('slider', Ext.form.Slider);


Ext.form.Slider.Thumb = Ext.extend(Ext.form.Field, {
    isField: false,
    ui: 'thumb',
    autoCreateField: false,
    draggable: true,

    
    value: 0,

    

    
    onRender: function() {
        Ext.form.Slider.Thumb.superclass.onRender.apply(this, arguments);

        this.dragConfig = {
            direction: 'horizontal',
            constrain: this.slider.fieldEl,
            revert: false,
            thumb: this
        };
    },

    
    setValue: function(newValue) {
        this.value = newValue;
    },

    
    getValue: function() {
        return this.value;
    }
});

Ext.reg('thumb', Ext.form.Slider.Thumb);


Ext.form.Toggle = Ext.extend(Ext.form.Slider, {
    minValue: 0,
    maxValue: 1,
    ui: 'toggle',
    
    

    
    minValueCls: 'x-toggle-off',

    
    maxValueCls: 'x-toggle-on',

    
    toggle: function() {
        var thumb = this.thumbs[0],
            value = thumb.getValue();

        this.setValue(value == this.minValue ? this.maxValue : this.minValue);
    },

    
    setValue: function(value) {
        Ext.form.Toggle.superclass.setValue.apply(this, arguments);

        var fieldEl = this.fieldEl;

        if (this.constrain(value) === this.minValue) {
            fieldEl.addClass(this.minValueCls);
            fieldEl.removeClass(this.maxValueCls);
        } 
        else {
            fieldEl.addClass(this.maxValueCls);
            fieldEl.removeClass(this.minValueCls);
        }
    },

    
    onTap: function() {
        this.toggle();
    }
});

Ext.reg('toggle', Ext.form.Toggle);


Ext.form.TextField = Ext.extend(Ext.form.Field, {
    type: 'text',
    maskField: Ext.platform.isIPhoneOS
    
    
});

Ext.reg('textfield', Ext.form.TextField);


Ext.form.PasswordField = Ext.extend(Ext.form.Field, {
    maskField: Ext.platform.isIPhoneOS,
    inputType: 'password'
});

Ext.reg('passwordfield', Ext.form.PasswordField);


Ext.form.EmailField = Ext.extend(Ext.form.TextField, {
    inputType: 'email',
    autoCapitalize : false
});

Ext.reg('emailfield', Ext.form.EmailField);


Ext.form.UrlField = Ext.extend(Ext.form.TextField, {
    inputType: 'url',    
    autoCapitalize : false
});

Ext.reg('urlfield', Ext.form.UrlField);


Ext.form.SearchField = Ext.extend(Ext.form.Field, {
    inputType: 'search'
    
});

Ext.reg('searchfield', Ext.form.SearchField);


Ext.form.NumberField = Ext.extend(Ext.form.Field, {
    inputType: 'number',
    
    minValue : undefined,
    
    maxValue : undefined,
    
    stepValue : undefined,
    
    renderTpl: [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
            '<tpl if="fieldEl"><input id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="minValue != undefined">min="{minValue}" </tpl>',
                '<tpl if="maxValue != undefined">max="{maxValue}" </tpl>',
                '<tpl if="stepValue != undefined">step="{stepValue}" </tpl>',
                '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
            '/></tpl>',
            '<tpl if="showClear"><div class="x-field-clear x-hidden-display"></div></tpl>',
        '</div>'
    ],
    
    ui: 'number',
    maskField: Ext.platform.isIPhoneOS,
    
    
    onRender : function(ct, position) {
        Ext.apply(this.renderData, {
            maxValue : this.maxValue,
            minValue : this.minValue,
            stepValue : this.stepValue 
        });
        Ext.form.NumberField.superclass.onRender.call(this, ct, position);
    }
});

Ext.reg('numberfield', Ext.form.NumberField);


Ext.form.SpinnerField = Ext.extend(Ext.form.NumberField, {

    
    cmpCls: 'x-spinner',
    
    
    minValue: Number.NEGATIVE_INFINITY,
    
    maxValue: Number.MAX_VALUE,
    
    incrementValue: 1,
    
    accelerate: true,
    
    defaultValue: 0,

    
    cycle: false,
    
    
    disableInput: false,

    renderTpl: [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
            '<tpl if="fieldEl">',
                '<div class="{cmpCls}-body">',
                    '<div class="{cmpCls}-down"><span>-</span></div>',
                    '<input id="{inputId}" type="number" name="{name}" class="{fieldCls}"',
                        '<tpl if="disableInput">disabled </tpl>',
                        '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                        '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                        '<tpl if="style">style="{style}" </tpl>',
                        '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                    '/>',
                    '<div class="{cmpCls}-up"><span>+</span></div>',
                '</div>',
            '</tpl>',
            '<div class="x-field-mask"></div>',
        '</div>'
    ],
    
    initComponent: function(){
        this.addEvents(
            
            'spin',
            
            'spindown',
            
            'spinup'
        );
        Ext.form.SpinnerField.superclass.initComponent.call(this);    
    },

    
    onRender: function(ct, position) {
        var me = this;
        me.renderData.disableInput = me.disableInput;

        Ext.applyIf(me.renderSelectors, {
            spinUpEl: '.x-spinner-up',
            spinDownEl: '.x-spinner-down'
        });

        Ext.form.SpinnerField.superclass.onRender.call(me, ct, position);
        
        me.downRepeater = me.createRepeater(me.spinDownEl, me.onSpinDown);
        me.upRepeater = me.createRepeater(me.spinUpEl, me.onSpinUp);
    },
    
    
    createRepeater: function(el, fn){
        var repeat = new Ext.util.TapRepeater(el, {
            accelerate: this.accelerate
        });
        this.mon(repeat, {
            tap: fn,
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            preventDefault: true,
            scope: this
        });
        return repeat;
    },

    
    onSpinDown: function() {
        if (!this.disabled) {
            this.spin(true);
        }
    },

    
    onSpinUp: function() {
        if (!this.disabled) {
            this.spin(false);
        }
    },

    
    onTouchStart : function(btn) {
        btn.el.addClass('x-button-pressed');
    },

    
    onTouchEnd : function(btn) {
        btn.el.removeClass('x-button-pressed');
    },

    
    spin: function(down) {
        var me = this,
            value = parseFloat(me.getValue()),
            increment = me.incrementValue,
            cycle = me.cycle,
            min = me.minValue,
            max = me.maxValue,
            direction = down ? 'down' : 'up';

        if(down){
            value -= increment;
        }else{
            value += increment;
        }

        value = (isNaN(value)) ? me.defaultValue: value;
        if (value < min) {
            value = cycle ? max : min;
        }
        else if (value > max) {
            value = cycle ? min : max;
        }
        me.setValue(value);
        this.fireEvent('spin' + direction, this, value);
        this.fireEvent('spin', this, value, direction);
    },

    
    destroy : function() {
        Ext.destroy(this.downRepeater, this.upRepeater);
        Ext.form.SpinnerField.superclass.destroy.call(this, arguments);
    }
});

Ext.reg('spinnerfield', Ext.form.SpinnerField);


Ext.form.HiddenField = Ext.extend(Ext.form.Field, {
    inputType: 'hidden',
    ui: 'hidden',
    autoCreateField: false
    
});

Ext.reg('hidden', Ext.form.HiddenField);


Ext.form.UrlField = Ext.extend(Ext.form.TextField, {
    inputType: 'url',    
    autoCapitalize : false
});

Ext.reg('urlfield', Ext.form.UrlField);


Ext.form.Checkbox = Ext.extend(Ext.form.Field, {
    inputType: 'checkbox',
    ui: 'checkbox',
    
    

    
    checked : false,
    
    
    inputValue : undefined,

    
    constructor: function(config) {
        this.addEvents(
            
            'check'
        );

        Ext.form.Checkbox.superclass.constructor.call(this, config);
    },
    
    renderTpl: [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls}<tpl if="required"> {required}</tpl><tpl if="cls"> {cls}</tpl><tpl if="cmpCls"> {cmpCls}</tpl><tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>><span>{label}</span></label></tpl>',
            '<tpl if="fieldEl"><input id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="style">style="{style}" </tpl> value="{inputValue}" ',
            '/></tpl>',
        '</div>'
    ],

    
    onRender : function(ct, position) {
        
        this.renderData.inputValue = this.inputValue || this.value || '';
        Ext.form.Checkbox.superclass.onRender.call(this, ct, position);

        if (this.checked) {
            this.setValue(true);
        } else {
            this.checked = this.fieldEl.dom.checked;
        }
    },

    
    getValue : function(){
        if (this.rendered) {
            return this.fieldEl.dom.checked;
        }
        return this.checked;
    },

    
    setValue : function(v) {

        var checked = this.checked;
        this.checked = (v === true || v === 'true' || v == '1' || String(v).toLowerCase() == 'on');

        if (this.rendered) {
            this.fieldEl.dom.checked = this.checked;
            this.fieldEl.dom.defaultChecked = this.checked;
        }

        if (checked != this.checked) {
            this.fireEvent('check', this, this.checked);
        }
    }
});

Ext.reg('checkbox', Ext.form.Checkbox);


Ext.form.Radio = Ext.extend(Ext.form.Checkbox, {
    inputType: 'radio',
    ui: 'radio',
    

    
    getGroupValue: function() {
        var p = this.el.up('form') || Ext.getBody(),
            c = p.down('input[name=' + this.fieldEl.dom.name + ']:checked', true);
        return c ? c.value: null;
    },

    
    onClick: function() {
        if (this.fieldEl.dom.checked != this.checked) {
            var els = this.getCheckEl().select('input[name=' + this.fieldEl.dom.name + ']');
            els.each(function(el) {
                if (el.dom.id == this.id) {
                    this.setValue(true);
                } else {
                    Ext.getCmp(el.dom.id).setValue(false);
                }
            },
            this);
        }
    },

    
    setValue: function(v) {
        if (typeof v == 'boolean') {
            Ext.form.Radio.superclass.setValue.call(this, v);
        } 
        else if (this.rendered && v != undefined) {
            var wrap,
                r = this.getCheckEl().down('input[name=' + this.fieldEl.dom.name + '][value=' + v + ']');
            if (r && (wrap = r.up('.' + this.renderData.baseCls))) {
                Ext.getCmp(wrap.id).setValue(true);
            }
        }
    },

    
    getCheckEl: function() {
        if (this.inGroup) {
            return this.el.up('.x-form-radio-group');
        }
        return this.el.up('form') || Ext.getBody();
    }
});
Ext.reg('radio', Ext.form.Radio);


Ext.form.Select = Ext.extend(Ext.form.Field, {
    ui: 'select',
    

    
    valueField: 'value',
    
    
    displayField: 'text',
    
    

    
    
    renderTpl : [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
            '<tpl if="fieldEl"><select id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
            '</select></tpl>',
        '</div>'
     ],
     
     
     onRender : function(ct, position) {
        Ext.form.Select.superclass.onRender.call(this, ct, position);
        if (this.options) {
            this.setOptions();
        }
        else {
	        var store = this.store || {};
	        delete this.store;
            
	        this.bindStore(store, store.getCount && store.getCount()>0);
        }
     },
    
    
    getOptionsTpl : function() {
        return new Ext.XTemplate(
           '<tpl for="options">',
              '<option value="{' + this.valueField + '}">{' + this.displayField + '}</option>',
           '</tpl>',
           {compiled : true}
        );
    },
    
    
    setOptions : function(options, append) {
        var me = this;
        options || (append = false);
        options = options || me.options;

        if (Ext.isArray(options)) {
            if (me.rendered) { 
                var tpl = me.getOptionsTpl();
                if (tpl && tpl.applyTemplate) {
                    if (append && me.fieldEl.child('option')) {
                        tpl.insertAfter(me.fieldEl.dom.lastChild, {options: options});
                    }
                    else {
                        tpl.overwrite(me.fieldEl, {options : options });    
                    }
                }
                else {
                    throw 'Error: Missing/invalid options template.';
                }
            }
            me.options = append ? (me.options || []).concat(options) : options;
        }
        return me;
    },
    
    
    getStore : function() {
        return this.store;
    },
    
    bindStore : function(store, loadImmediate) {
        var me = this,
            listen = {
              datachanged : me.onDataChanged,
              scope : me
            };

        if (me.store) {
            me.store.un(listen);
            me.store = null;
        }
        if (store && store.getRange) {
            me.store = store;
            store.on(listen);
            if (loadImmediate) {
                me.onDataChanged(store);
            }
        }
        return me;
    },
    
    
    onDataChanged : function(store) {
        store = store || this.store;
        if (store && store.getRange) {
            this.setOptions(Ext.pluck(store.data.items, 'data'));
        }
    },
    
    
    onDestroy : function() {
        this.bindStore(null);
        Ext.form.Select.superclass.onDestroy.call(this);
    }
});

Ext.reg('select', Ext.form.Select);


Ext.form.TextArea = Ext.extend(Ext.form.TextField, {
    maskField: Ext.platform.isIPhoneOS,
    
    
    maxRows  : undefined,
    
    autoCapitalize : false,
    
    renderTpl: [
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
            '<tpl if="fieldEl"><textarea id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="maxRows != undefined">rows="{maxRows}" </tpl>',
                '<tpl if="maxlength != undefined">maxlength="{maxlength}" </tpl>',
                '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
            '></textarea></tpl>',
            '<tpl if="showClear"><div class="x-field-clear x-hidden-display"></div></tpl>',
            '<tpl if="maskField"><div class="x-field-mask"></div></tpl>',
        '</div>'
    ],
    
    ui: 'textarea',
    
    
    onRender : function(ct, position) {
        this.renderData.maxRows = this.maxRows;
        Ext.form.TextArea.superclass.onRender.call(this, ct, position);
    }
});

Ext.reg('textarea', Ext.form.TextArea);






Ext.layout.Layout = Ext.extend(Object, {
    type: 'layout',

    constructor : function(config) {
        this.id = Ext.id(null, 'ext-layout-');
        Ext.apply(this, config);
    },

    
    setOwner : function(owner) {
        this.owner = owner;
    },

    
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

    
    afterLayout : Ext.emptyFn,
    getLayoutItems : Ext.emptyFn,
    getTarget : Ext.emptyFn,
    onLayout : Ext.emptyFn,
    onRemove : Ext.emptyFn,
    onDestroy : Ext.emptyFn,

    
    isValidParent : function(item, target) {
        var dom = item.el ? item.el.dom : Ext.getDom(item);
        return target && (dom.parentNode == (target.dom || target));
    },

    
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

    
    renderItem : function(item, position, target) {
        if (!item.rendered) {
            item.render(target, position);
        }
    },

    
    getTargetBox : function() {
        return this.getTarget().getBox(true, true);
    },

    
    moveItem : function(item, position, target) {
        if (typeof position == 'number') {
            position = target.dom.childNodes[position];
        }
        
        target = target.dom || target;

        target.insertBefore(item.getPositionEl().dom, position || null);

        item.container = target;
        this.configureItem(item, position);
    },

    
    configureItem: function(item, position) {
        if (this.extraCls) {
            item.getPositionEl().addClass(this.extraCls);
        }
    },

    
    afterRemove : function(item) {
        if (this.extraCls && item.rendered) {
            item.getPositionEl().removeClass(this.extraCls);
        }
    },

    
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


Ext.layout.ComponentLayout = Ext.extend(Ext.layout.Layout, {
    
    onLayout : function(owner, target, args) {
        var layout = owner.layout;
        owner.afterComponentLayout(this);

        
        if(layout && typeof layout.layout == 'function') {
            layout.layout();
        }
    },

    
    getLayoutItems : function() {
        return [];
    },

    
    getTarget : function() {
        return this.owner.getResizeEl();
    },

    
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

Ext.layout.AutoComponentLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'component',

    
    onLayout : function(owner, target, args) {
        var w = args[0],
            h = args[1];

        w = (typeof w == 'number' || w == 'auto') ? args[0] : undefined;
        h = (typeof h == 'number' || h == 'auto') ? args[1] : undefined;

        this.setTargetSize(w, h);

        Ext.layout.AutoComponentLayout.superclass.onLayout.call(this, owner, target, args);
    }
});

Ext.layout.TYPES['component'] = Ext.layout.AutoComponentLayout;


Ext.layout.DockLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'dock',

    renderHidden: false,

    
    extraCls: 'x-docked',

    
    onLayout: function(owner, target, args) {
        
        var items = this.getLayoutItems(),
            w = args[0],
            h = args[1];

        var info = this.info = {
            boxes: [],
            panelSize: {
                width: w,
                height: h
            }
        };

        
        this.renderItems(items, target);

        
        
        
        this.setTargetSize(w, h);
        this.dockItems(items);

        
        
        Ext.layout.DockLayout.superclass.onLayout.call(this, owner, target);
    },

    
    getLayoutItems : function() {
        return this.owner.getDockedItems() || [];
    },

    
    configureItem : function(item, pos) {
        Ext.layout.DockLayout.superclass.configureItem.call(this, item, pos);
        if (this.extraCls) {
            item.getPositionEl().addClass(this.extraCls + '-' + item.dock);
        }

        if (item.overlay) {
            item.getPositionEl().addClass(this.extraCls + '-overlay');
        }
    },

    
    afterRemove : function(item) {
        Ext.layout.DockLayout.superclass.afterRemove.call(this, item);
        if (this.extraCls) {
            item.getPositionEl().removeClass(this.extraCls + '-' + item.dock);
        }
        if (item.overlay) {
            item.getPositionEl().removeClass(this.extraCls + '-overlay');
        }
    },

    
    dockItems : function(items, autoBoxes) {
        this.calculateDockBoxes(items, autoBoxes);

        
        
        
        var info = this.info,
            boxes = info.boxes,
            ln = boxes.length,
            owner = this.owner,
            target = this.getTarget(),
            box, i;

        
        
        owner.body.setBox({
            width: info.targetBox.width || null,
            height: info.targetBox.height || null,
            top: (info.targetBox.top - owner.el.getPadding('t')),
            left: (info.targetBox.left - owner.el.getPadding('l'))
        });

        
        
        for (i = 0; i < ln; i++) {
            box = boxes[i];
            box.item.setPosition(box.left, box.top);
        }
    },

    
    calculateDockBoxes : function(items, autoBoxes) {
        
        
        
        var target = this.getTarget(),
            owner = this.owner,
            bodyEl = owner.body,
            info = this.info,
            ln = items.length,
            item, i, box, w, h;

        
        info.panelSize = target.getSize();
        info.targetBox = this.getTargetBox();
        info.targetBox.left -= target.getBorderWidth('l');
        info.targetBox.top -= target.getBorderWidth('t');

        
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.hidden && !this.renderHidden) {
                continue;
            }

            
            
            
            box = this.initBox(item);

            
            item.setSize(box);

            
            
            if (box.width == undefined) {
                box.width = item.getWidth();
            }
            if (box.height == undefined) {
                box.height = item.getHeight();
            }

            box = this.adjustSizedBox(box, i);

            
            
            
            info.boxes.push(box);
        }
    },

    
    adjustSizedBox : function(box, index) {
        var targetBox = this.info.targetBox,
            item = box.item;

        switch (box.type) {
            case 'top':
                box.top = targetBox.top;
                if (!item.overlay) {
                    targetBox.top += box.height;
                    targetBox.height -= box.height;
                }
                break;

            case 'left':
                box.left = targetBox.left;
                if (!item.overlay) {
                    targetBox.left += box.width;
                    targetBox.width -= box.width;
                }
                break;

            case 'bottom':
                box.top = (targetBox.top + targetBox.height) - box.height;
                if (!item.overlay) {
                    targetBox.height -= box.height;
                }
                break;

            case 'right':
                box.left = (targetBox.left + targetBox.width) - box.width;
                if (!item.overlay) {
                    targetBox.width -= box.width;
                }
                break;
        }
        return box;
    },

    
    initBox : function(item) {
        var targetBox = this.info.targetBox,
            horizontal = (item.dock == 'top' || item.dock == 'bottom'),
            box = {
                item: item,
                type: item.dock
            };

        
        if (item.stretch !== false) {
            if (horizontal) {
                box.left = targetBox.left;
                box.width = targetBox.width;
            }
            else {
                box.top = targetBox.top;
                box.height = targetBox.height;
            }
            box.stretched = true;
        }
        else {
            item.setSize(item.width || undefined, item.height || undefined);
            box.width = item.getWidth();
            box.height = item.getHeight();
            if (horizontal) {
                box.left = targetBox.left;
                if (item.align == 'right') {
                    box.left += (targetBox.width - box.width);
                }
                else if(item.align == 'center') {
                    box.left += ((targetBox.width - box.width) / 2);
                }
            }
            else {
                box.top = targetBox.top;
                if (item.align == 'bottom') {
                    box.top += (targetBox.height - box.height);
                }
                else if (item.align == 'center') {
                    box.top += ((targetBox.height - box.height) / 2);
                }
            }
        }

        return box;
    }
});

Ext.layout.TYPES['dock'] = Ext.layout.DockLayout;


Ext.layout.FieldLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'field',

    
    onLayout: function(owner, target, args) {
        var w = args[0],
            h = args[1];

        this.owner = owner;
        this.handleLabel();

        owner.el.setSize(w, h);

        Ext.layout.FieldLayout.superclass.onLayout.call(this, owner, target);
    },

    
    handleLabel : function() {
        this.owner.labelEl.setWidth(this.owner.labelWidth);
    }
});

Ext.layout.TYPES['field'] = Ext.layout.FieldLayout;


Ext.layout.ContainerLayout = Ext.extend(Ext.layout.Layout, {
    

    
    onLayout : function(items, target) {
        this.renderItems(this.getLayoutItems(), target);
    },

    afterLayout : function() {
        this.owner.afterLayout(this);
    },

    
    getLayoutItems : function() {
        return this.owner && this.owner.items && this.owner.items.items || [];
    },

    
    getTarget : function() {
        return this.owner.getLayoutTarget();
    },

    
    getRenderedItems: function() {
        var target   = this.getTarget(),
            items = this.getLayoutItems(),
            ln = items.length,
            renderedItems = [],
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.rendered && this.isValidParent(item, target)) {
                renderedItems.push(item);
            }
        }

        return renderedItems;
    },

    
    getVisibleItems: function() {
        var target   = this.getTarget(),
            items = this.getLayoutItems(),
            ln = items.length,
            visibleItems = [],
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.rendered && this.isValidParent(item, target) && item.hidden !== true) {
                visibleItems.push(item);
            }
        }

        return visibleItems;
    }
});

Ext.layout.TYPES['container'] = Ext.layout.ContainerLayout;

Ext.layout.AutoContainerLayout = Ext.extend(Ext.layout.ContainerLayout, {
    type: 'container',

    
    onLayout : function(owner, target) {
        var items = this.getLayoutItems(),
            ln = items.length,
            i;

        this.renderItems(items, target);
        for (i = 0; i < ln; i++) {
            items[i].doComponentLayout(items[i].width || undefined, items[i].height || undefined);
        }
    }
});

Ext.layout.TYPES['auto'] = Ext.layout.AutoContainerLayout;

Ext.layout.BoxLayout = Ext.extend(Ext.layout.ContainerLayout, {
    type: 'box',

    targetCls: 'x-layout-box',
    
    innerCls: 'x-layout-box-inner',

    pack : 'start',
    direction: 'normal',
    align: 'center',

    
    onLayout: function(owner, target) {
        Ext.layout.BoxLayout.superclass.onLayout.call(this, owner, target);
        var height, width;
        if (this.pack === 'left' || this.pack === 'top') {
            this.pack = 'start';
        }
        else if (this.pack === 'right' || this.pack === 'bottom') {
            this.pack = 'end';
        }
        
        this.innerCt.setStyle({
            '-webkit-box-orient': this.orientation,
            '-webkit-box-direction': this.direction,
            '-webkit-box-pack': this.pack,
            '-webkit-box-align': this.align
        });

        if (target != this.innerCt) {
            width = target.getWidth(true);
            height = target.getHeight(true);
            if (width > 0) {
                this.innerCt.setWidth(width);
            }
            if (height > 0) {
                this.innerCt.setHeight(height);
            }
            
            this.innerCt.setSize(target.getWidth(true), target.getHeight(true));
        }

        this.handleBoxes(target);

        if (this.totalWidth) {
            this.innerCt.setWidth(Math.max(target.getWidth(true), this.totalWidth));
            var height = target.getHeight(true);
            if (height > 0) {
                this.innerCt.setHeight(height);
            }
        }

        if (this.totalHeight) {
            this.innerCt.setHeight(Math.max(target.getHeight(true), this.totalHeight));
            var width = target.getWidth(true);
            if (width > 0) {
                this.innerCt.setWidth(width);
            }
        }
    },

    renderItems : function(ct) {
        if (!this.innerCt) {
            if (this.owner.scrollEl) {
                this.innerCt = this.owner.scrollEl.addClass(this.innerCls);
            }
            else {
                this.innerCt = this.getTarget().createChild({
                    cls: this.innerCls
                });
            }
        }

        Ext.layout.BoxLayout.superclass.renderItems.call(this, ct, this.innerCt);
    }
});


Ext.layout.TYPES['hbox'] = Ext.layout.HBoxLayout = Ext.extend(Ext.layout.BoxLayout, {
    orientation: 'horizontal',

    handleBoxes : function(target) {
        var items = this.getLayoutItems(),
            ln = items.length,
            width, item, i, size;

        if (target === this.innerCt) {
            target.setWidth(target.parent().getWidth(true));
        }

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                item.el.setWidth(0);
                item.el.setStyle('-webkit-box-flex', item.flex);
            }
            else {
                item.doComponentLayout(item.width, item.height);
            }
        }

        this.totalWidth = 0;
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                width = item.el.getWidth();
                item.el.setStyle('-webkit-box-flex', null);
                item.doComponentLayout(width, item.height || undefined);
            }
            this.totalWidth += (item.el.getWidth() + item.el.getMargin('lr'));
        }
    }
});


Ext.layout.TYPES['vbox'] = Ext.layout.VBoxLayout = Ext.extend(Ext.layout.BoxLayout, {
    orientation: 'vertical',

    handleBoxes : function(target) {
        var items = this.getLayoutItems(),
            ln = items.length,
            item, i, size, height;

        if (target === this.innerCt) {
            target.setHeight(target.parent().getHeight(true));
        }

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                item.el.setHeight(0);
                item.el.setStyle('-webkit-box-flex', item.flex);
            }
            else {
                item.doComponentLayout(item.width, item.height);
            }
        }

        this.totalHeight = 0;
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                height = item.el.getHeight();
                item.el.setStyle('-webkit-box-flex', null);
                item.doComponentLayout(item.width || undefined, height);
            }
            this.totalHeight += (item.el.getHeight() + item.el.getMargin('tb'));
        }
    }
});

Ext.layout.FitLayout = Ext.extend(Ext.layout.ContainerLayout, {
    extraCls: 'x-fit-item',
    targetCls: 'x-layout-fit',
    type: 'fit',
    
    
    onLayout : function(owner, target) {            
        Ext.layout.FitLayout.superclass.onLayout.call(this, owner, target);
        if (owner.items.length > 0) {
            this.setItemBox(owner.items.items[0], this.getTargetBox());
        }
    },

    
    setItemBox : function(item, box) {
        if (item && box.height > 0) {
            box.width -= item.el.getMargin('lr');
            box.height -= item.el.getMargin('tb');
            item.setSize(box);
            item.setPosition(box);
        }
    }
});

Ext.layout.TYPES['fit'] = Ext.layout.FitLayout;



Ext.layout.CardLayout = Ext.extend(Ext.layout.FitLayout, {
    type: 'card',
    
    sizeAllCards: false,    
    hideInactive: true,
    layoutOnActivate: false,

    onLayout : function() {
        var activeItem = this.getActiveItem();
            
        Ext.layout.FitLayout.superclass.onLayout.apply(this, arguments);

        var items = this.getLayoutItems(), 
            ln = items.length,
            targetBox = this.getTargetBox(),
            i, item;
                                            
        if (this.sizeAllCards) {
            for (i = 0; i < ln; i++) {
                item = items[i];
                this.setItemBox(item, targetBox);
            }
        }
        else if (activeItem) {
            this.setItemBox(activeItem, targetBox);
        }

        if (!this.layedOut && activeItem) {
            if (activeItem.fireEvent('beforeactivate', activeItem) !== false) {
                activeItem.fireEvent('activate', activeItem);
            }
        }
    },

        
    getActiveItem : function() {
        if (!this.activeItem && this.owner) {
            this.activeItem = this.parseActiveItem(this.owner.activeItem);
        }
        
        if (this.activeItem && this.owner.items.items.indexOf(this.activeItem) != -1) {
            return this.activeItem;
        }
        
        return null;
    },
    
    
    parseActiveItem : function(item) {
        if (item && item.isComponent) {
            return item;
        }
        else if (typeof item == 'number' || item == undefined) {
            return this.getLayoutItems()[item || 0];
        }
        else {
            return this.owner.getComponent(item);
        }
    },

    
    configureItem: function(item, position) {
        Ext.layout.FitLayout.superclass.configureItem.call(this, item, position);
        if (this.hideInactive && this.activeItem !== item) {
            item.hide();
        }
        else {
            item.show();
        }
    },

    
    setActiveItem : function(newCard, animation) {
        var me = this,
            owner = me.owner,
            doc = Ext.getDoc(),
            oldCard = me.activeItem,
            newIndex;

        animation = (animation == undefined) ? owner.animation : animation;
        
        newCard = me.parseActiveItem(newCard);
        newIndex = owner.items.indexOf(newCard);
        
        
        if (newIndex == -1) {
            owner.add(newCard);
        }
        
        
        if (newCard && oldCard != newCard && owner.onBeforeCardSwitch(newCard, oldCard, newIndex, !!animation) !== false) {
            
            if (!newCard.rendered) {
                me.renderItem(newCard, owner.items.length, me.getTarget());
                me.configureItem(newCard, 0);
            }

            
            if (newCard.hidden) {
                newCard.show();             
            }

            
            if (!me.sizeAllCards) {
                me.setItemBox(newCard, me.getTargetBox());
            }

            
            if (me.layoutOnActivate) {
                newCard.doComponentLayout();
            }

            me.activeItem = newCard;   
                        
            
            if (newCard.fireEvent('beforeactivate', newCard, oldCard) === false) {
                return;
            }
            if (oldCard && oldCard.fireEvent('beforedeactivate', oldCard, newCard) === false) {
                return;
            }

            if (animation) {
                doc.on('click', Ext.emptyFn, me, {single: true, preventDefault: true});
                                               
                Ext.Anim.run(newCard, animation, {
                    out: false,
                    autoClear: true,
                    scope: me,
                    after: function() {
                        (function() {
                            doc.un('click', Ext.emptyFn, me);
                        }).defer(50, me);
                        
                        newCard.fireEvent('activate', newCard, oldCard);
                        
                        if (!oldCard) {
                            
                            
                            owner.onCardSwitch(newCard, oldCard, newIndex, true);
                        }
                    }                    
                });
                
                if (oldCard) {
                    Ext.Anim.run(oldCard, animation, {
                        out: true,
                        autoClear: true,
                        scope: me,
                        after: function() {
                            oldCard.fireEvent('deactivate', oldCard, newCard);
                            if (me.hideInactive && me.activeItem != oldCard) {
                                oldCard.hide();
                            }
                            
                            
                            
                            
                            owner.onCardSwitch(newCard, oldCard, newIndex, true);
                        }
                    });
                }
            }
            else {
                newCard.fireEvent('activate', newCard, oldCard);
                if (oldCard) {
                    oldCard.fireEvent('deactivate', oldCard, newCard); 
                    if (me.hideInactive) {
                        oldCard.hide();
                    }                    
                }
                owner.onCardSwitch(newCard, oldCard, newIndex, false);
            }
                  
            return newCard;
        }
        
        return false;
    },

    
    getNext : function(wrap) {
        var items = this.getLayoutItems(),
            index = items.indexOf(this.activeItem);
        return items[index+1] || (wrap ? items[0] : false);
    },

    
    next : function(anim, wrap) {
        return this.setActiveItem(this.getNext(wrap), anim);
    },

    
    getPrev : function(wrap) {
        var items = this.getLayoutItems(),
            index = items.indexOf(this.activeItem);
        return items[index-1] || (wrap ? items[items.length-1] : false);
    },

    
    prev : function(anim, wrap) {
        return this.setActiveItem(this.getPrev(wrap), anim);
    }
});

Ext.layout.TYPES['card'] = Ext.layout.CardLayout;

