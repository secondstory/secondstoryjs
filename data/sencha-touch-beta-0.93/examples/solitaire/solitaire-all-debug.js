/*
Copyright(c) 2010 Sencha Inc.
licensing@sencha.com
http://www.sencha.com/touchlicense
*/

/**
 * @class Ext.View
 * @extends Object
 */
Ext.View = Ext.extend(Object, {
    /**
     * @type {Boolean}
     * Set to true for all Ext.View's.
     */
    isView: true,
    
    /**
     * @cfg {String} name
     */
    
    /**
     * @cfg {String} xtype
     */
    
    /**
     * @cfg {Array} events
     */
    
    /**
     * @cfg {Array} items
     */
    
    /**
     * @cfg {Array} dockedItems
     */
    
    constructor : function(config) {
        this.config = config || {};
        
        if(!config.name) {
            throw 'Every View needs to have a name defined';
        }

        this.xtype = 'x-view-' + config.name;
        
        this.id = this.name = config.name;
        Ext.ViewManager.register(this);
    },
    
    /**
     * This method will return an instance of our generated class. If the class
     * has not been generated yet (when this is the first instance you get),
     * this method will generate it on the fly for you.
     * @return {Ext.Component} An instance of our generated class
     */
    getInstance : function(config) {
        if(!this.cls) {
            this.generate();
        }
        return new this.cls(config);
    },
    
    /**
     * @private
     * This method generates a new Component class on the fly, based on the configuration
     * of the view. The generated class will extend the xtype of the top level component
     * in the view configuration.
     * @return {Class} The generated class.
     */
    generate : function() {
        if(this.cls) {
            return;
        }
        
        var config      = this.config,
            // By default we will extend Ext.Container
            extend      = Ext.Panel,
            // We are going to have a collection of all the primitive
            // and all the complex options in the config
            primitives  = this.primitives = [],
            complex     = this.complex    = [],
            methods     = this.methods    = [],
            events      = null,
            references  = [],
            key, value, i, ln, o;
        
        // If an xtype is specified, we want our new class to extand the class
        // assosiated with that xtype           
        if(config.xtype) {
            extend = Ext.ComponentMgr.types[config.xtype] || extend;
            delete config.xtype;
        }
        
        // We also add the ability to dynamically add new events to the component
        if(config.events) {
            events = config.events;
            events = Ext.isArray(events) ? events : [events];
            delete config.events;
        }

        this.references = [];
        
        // Get all the name references
        if(config.items) {
            this.references = references = this.references.concat(this.prepareItems(config.items));
        }

        // Get all the name references for docked items
        if(config.dockedItems) {
            this.references = references = this.references.concat(this.prepareItems(config.dockedItems));
        }
                        
        // Lets loop over all the keys and values of our view config
        // and handle special cases. Also make a mapping of all the
        // primitive and complex config options.
        for(key in config) {
            value = config[key];
                        
            if(Ext.isPrimitive(value)) {
                primitives.push({
                    key: key,
                    value: value
                });
            }
            else if(Ext.isFunction(value)) {
                methods.push({
                    key: key,
                    value: value
                });
            }
            else {
                complex.push({
                    key: key,
                    value: value
                });
            }
        }        
        
        var prototype = {
            initComponent : function() {
                // assign all the complex items
                var i, ln, o;
                for(i = 0, ln = complex.length; i < ln; i++) {
                    o = complex[i];
                    this[o.key] = o.value;
                }
                
                if(events) {
                    this.addEvents.apply(this, events);
                }

                extend.prototype.initComponent.call(this);  

                this.addReferences(references);
                
                if (this.init) {
                    this.init();
                }
            },
            
            afterRender : function() {
                extend.prototype.afterRender.apply(this, arguments);
                
                if (this.setup) {
                    this.setup();
                }
            },
            
            addReferences : function(references) {
                var ln = references.length,
                    x, y, cmp, path, ref, o, name;
                
                this.refs = this.refs || {};
                
                for(x = 0; x < ln; x++) {
                    ref = references[x];
                    path = ref.path.split('|');
                    
                    // Get a reference to the actual instance of this item
                    cmp = Ext.getCmp(ref.id);
                    name = ref.name;
                    
                    cmp.viewPath = ref.path;
                    
                    // Store the reference on the view component
                    this.refs[name] = cmp;
                    
                    // In this case we also have to put a ref on the subcomponent
                    if(path.length > 1) {
                        for(y = 1; y < path.length; y++) {
                            ref = this.refs[path[y-1]];
                            if(!ref.refs) {
                                ref.refs = {};
                            }
                            ref.refs[name] = cmp;
                        }
                    }
                }
            },
            
            get : function(name) {
                return this.refs[name] || null;
            }
        };

        // Apply all the primitive types to the prototype
        for(i = 0, ln = primitives.length; i < ln; i++) {
            o = primitives[i];
            prototype[o.key] = o.value;
        }
        
        // Add all the methods defined in the view to the prototype
        for(i = 0, ln = methods.length; i < ln; i++) {
            o = methods[i];
            prototype[o.key] = o.value;
        }

        prototype.isView = true;
        prototype.xtype = this.xtype;
        prototype.name = this.name;
                            
        this.cls = Ext.extend(extend, prototype);
        Ext.reg(this.xtype, this.cls);
        
        return this.cls;
    },
    
    /**
     * Loops over an items collection recursively and gets all the name references. Also makes
     * sure all items have an xtype and a name.
     * @return {Array} An array containing reference paths to each item in this items collection
     */
    prepareItems : function(items, chain) {
        // Make sure items is an array to handle items: {} case
        items = Ext.isObject(items) ? [items] : items;
        chain = chain || '';
        
        var ln          = items.length,
            references  = [],
            i, item, ref, view;
            
        for(i = 0; i < ln; i++) {
            item = items[i];
            
            // If this item is another view, we are only going to make a reference
            // the the view. This way we avoid name collisions
            if(item.view) {
                view = Ext.isString(item.view) ? Ext.getView(item.view) : item.view;
                // In order for this xtype to work, we actually have to generate the cls on this view
                if(!view.cls) {
                    view.generate();
                }
                item.xtype = view.xtype;
                item.name = view.name;
                delete item.view;
            }
            
            // We need a name on each item to make sure we can make reference chains
            if(!item.name) {
                item.name = Ext.id(item, (item.xtype || 'comp') + '-');
            }
            else {
                // Make sure every item gets an id
                Ext.id(item, item.name + '-');
            }

            // We want to append the name of this item to the reference chain
            ref = chain ? (chain + '|' + item.name) : item.name;

            // Add the item to the references collection
            references.push({
                path: ref,
                id  : item.id,
                name: item.name
            });
                                                
            // We want to make this a recursive process
            if(item.items) {                
                // Concatenate all the descendents references
                references = references.concat(this.prepareItems(item.items, ref));
            }
            
            // We want to make this a recursive process
            if(item.dockedItems) {                
                // Concatenate all the descendents references
                references = references.concat(this.prepareItems(item.dockedItems, ref));
            }
        }
        
        return references;
    }
});

// should be refactored to use AbstractManager.
/**
 * @class Ext.ViewManager
 * @singleton
 */
Ext.ViewManager = function() {
    var all = new Ext.util.MixedCollection();
    
    return {
        /**
         * Registers a component.
         * @param {Ext.Component} c The component
         */
        register : function(c) {
            all.add(c);
        },

        /**
         * Unregisters a component.
         * @param {Ext.Component} c The component
         */
        unregister : function(c) {
            all.remove(c);
        },

        /**
         * Returns a component by {@link Ext.Component#id id}.
         * For additional details see {@link Ext.util.MixedCollection#get}.
         * @param {String} id The component {@link Ext.Component#id id}
         * @return Ext.Component The Component, <code>undefined</code> if not found, or <code>null</code> if a
         * Class was found.
         */
        get : function(name) {
            return all.get(name);
        },

        /**
         * The MixedCollection used internally for the component cache. An example usage may be subscribing to
         * events on the MixedCollection to monitor addition or removal.  Read-only.
         * @type {MixedCollection}
         */
        all : all,

        /**
         * Creates a new Component from the specified config object using the
         * config object's {@link Ext.component#xtype xtype} to determine the class to instantiate.
         * @param {Object} config A configuration object for the Component you wish to create.
         * @param {Constructor} defaultType The constructor to provide the default Component type if
         * the config object does not contain a <code>xtype</code>. (Optional if the config contains a <code>xtype</code>).
         * @return {Ext.Component} The newly instantiated Component.
         */
        create : function(config, defaultType) {
            return config.render ? config : new all[config.xtype || defaultType](config);
        }
    };
}();

/**
 * Retrieves a view by name via the Ext.ViewManager.
 */
Ext.getView = Ext.ViewManager.get;
/**
 * @class Ext.Controller
 * @extends Ext.util.Observable
 *
 */
Ext.Controller = Ext.extend(Ext.util.Observable, {
    /**
     * @cfg {Array} events
     * An array of event names.
     */
    
    /**
     * @constructor
     * @param {Object} config 
     */
    constructor : function(config) {
        config = config || {};
        
        if(config.events) {
            this.addEvents.apply(this, config.events);
            delete config.events;
        }
        
        Ext.apply(this, config);

        Ext.Controller.superclass.constructor.call(this);
        
        this.views = {};
    },
    
    /**
     * Gets an instance of a view by name
     * @param {String} name
     */
    getViewInstance : function(name) {
        if(name.isView) {
            if(!this.views[name.name]) {
                this.views[name.name] = name;
            }
            return name;
        } else if(Ext.isString(name) && !this.views[name]) {
            this.views[name] = Ext.getView(name).getInstance();
            return this.views[name];
        }
        return false;
    },
    
    /**
     * In your controller actions, you call this method to start
     * controlling parts of a view.
     */
    control : function(view, actions, itemName) {
        view = this.getViewInstance(view);
        
        if (!view) {
            return;
        }      
                
        var item = itemName ? view.refs[itemName] : view,
            key, value, name, child, listener;
        
        if (!item) {
            throw "No item called " + itemName + " found inside the " + view.name + " view.";
        }        

        for (key in actions) {
            value = actions[key];
                        
            // If it is an object, it can either be a listener with a handler defined
            // in which case the key is the event name, or it can be an object containing
            // listener(s), in which case key will be the items name
            if (Ext.isObject(value) && !value.fn) {
                this.control(view, value, key);
            }
            else {
                // Now hopefully we can be sure that key is an event name. We will loop over all
                // child items and enable bubbling for this event
                if (item.refs) {
                    for(name in item.refs) {
                        child = item.refs[name];
                        if (child.isObservable && child.events[key]) {
                            child.enableBubble(key);
                        }
                    }
                }

                if (!value.fn) {
                    listener = {};
                    listener[key] = value;
                    listener[key].scope = this;
                }
                else {
                    listener = value;
                    if(listener.scope === undefined) {
                        listener.scope = this;
                    }
                }

                // Finally we bind the listener on this item
                item.addListener(listener);
            }
        }
       
        return view;
    }
});
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
Ext.ns('Solitaire');

Ext.onReady(function() {
    var loadingMask = Ext.get('loading-mask');    
    
    Solitaire.Index.index();
    loadingMask.addClass(Ext.orientation);
    
    (function() {
        loadingMask.addClass('fadeout');
        
        (function() {
            loadingMask.remove();
        }).defer(1050);
    }).defer(1000);
});

Solitaire.Index = new Ext.Controller({
    /**
     * @property localStorageKey
     * @type String
     * The key under which the ID of the saved game most recently played is store in localStorage
     */
    localStorageKey: 'solitaireRecentGameId',
    
    index : function() {
        var view = this.view = this.control('board');
        
        this.deck = view.get('deck');
        this.deal = view.get('deal');
        
        this.deck.on('draw', function() {
            if (!this.dealTopCard()) {
                this.replenishDeck(true);
            }
        }, this);
        
        view.get('newGameButton').el.on({
            scope: this,
            tap  : this.startNewGame
        });
        
        this.mover = new Solitaire.Mover();
        
        this.gameStore = new Ext.data.Store({
            proxy: new Ext.data.LocalStorageProxy({
                id: 'solitaire-games'
            }),
            model: 'Game',
            autoLoad: false,
            
            listeners: {
                scope: this,
                datachanged: function(store, game) {
                    if (this.game) {                        
                        this.updateMoveCount(this.game.get('moves'));
                    }
                }
            }
        });
        
        this.gameStore.read({
            scope: this,
            callback: function(records, operation, successful) {
                if (records.length == 0) {
                    this.startNewGame(false);
                    this.revealTopCards.defer(1000, this);
                } else {
                    //load the most recent game
                    var gameId = localStorage.getItem(this.localStorageKey);
                    
                    var game = this.gameStore.data.find(function(record) {
                        return record.getId() == gameId;
                    });
                    
                    try {
                        this.loadGame(game || records[records.length - 1]);
                    } catch(e) {
                        this.showLostGame();
                    }
                }
            }
        });
        
        //save the game every time a card is dropped
        var mgr = Ext.util.Observable.observe(Solitaire.Stack);
        mgr.on({
            scope  : this,
            dropped: function(e, stack, cards, mover) {
                mover.oldStack.revealTopCard.defer(250, mover.oldStack);

                mover.stack.el.setXY(cards[0].el.getX(), cards[0].el.getY());
                mover.needsRepair = false;
                
                this.moveToStack({
                    newStack: stack,
                    duration: 300
                });
            }
        });
        
        Ext.getBody().on('doubletap', this.onDoubleTap, this);
        
        var me = this;
        setInterval(function() {
            me.updateTimer();
        }, 1000);
        
        return view;
    },
    
    /**
     * @private
     * If the saved game was corrupted, tell the user and have them start a new game
     */
    showLostGame: function() {
        var panel = new Ext.Panel({
            floating: true,
            centered: true,
            modal   : true,
            title   : "Saved game corrupted",
            height  : 165,
            width   : 320,
            
            styleHtmlContent: true,
            
            items: [{
                style: 'padding: 10px;',
                html : "Sorry, we couldn't restore your last game :("
            }],
            
            dockedItems: [
                {
                    dock : 'top',
                    xtype: 'toolbar',
                    title: 'Saved game corrupted'
                },
                {
                    dock : 'bottom',
                    xtype: 'toolbar',
                    items: [
                        {
                            text: 'New Game',
                            scope  : this,
                            handler: function() {
                                localStorage.clear();
                                this.startNewGame();
                                
                                panel.hide();
                            }
                        }
                    ]
                }
            ]
        });
        
        panel.show();
    },
    
    /**
     * Creates a new Game instance and loads it
     * @param {Boolean} revealTop True to automatically reveal the top cards. Defaults to true. If set
     * to false, be sure to reveal the top cards elsewhere.
     */
    startNewGame: function(revealTop) {
        var cards;
        
        //if there is already a game loaded, reuse the cards
        if (this.game) {
            cards = this.game.cards.items;
            
            for (var i = 0, length = cards.length; i < length; i++) {
                cards[i].unreveal();
            }
            
            var game  = Ext.ModelMgr.create({cards: cards}, 'Game');
        } else {
            var game = Ext.ModelMgr.create({}, "Game"),
                cards = game.cards.items;
        }
        
        game.shuffle();
        game.shuffle();
        
        var view  = this.view,
            deck  = this.deck,
            index = 0,
            i, j, k, stack,
            stackCount = 7;
        
        for (i = 1; i <= stackCount; i++) {
            stack = view.get('stack' + i);
            
            for (j = 0; j < i; j++) {
                cards[index].stack_id = stack.id;
                cards[index].position = j;
                index++;
            }
        }
        
        for (k = index; k < 52; k++) {
            cards[k].stack_id = deck.id;
            cards[k].position = k - index;
        }
        
        game.set('created_at', +(new Date()));
        game.set('moves', 0);
        game.set('time', 0);
        
        this.loadGame(game);
        
        if (revealTop !== false) {
            this.revealTopCards();
        }
        
        this.gameStore.add(game);
    },
    
    /**
     * @private
     * Reveals the top card on each stack
     */
    revealTopCards: function() {
        var stackCount = 7,
            stack, i;
        
        for (i = 1; i <= stackCount; i++) {
            stack = this.view.get('stack' + i);
            
            stack.revealTopCard.defer(500 + (i*60), stack);
        }
    },
    
    /**
     * Loads a game instance
     * @param {Game} game The game to load
     */
    loadGame: function(game) {
        this.clearStacks(false);
        
        var view  = this.view,
            deck  = this.deck,
            deal  = this.deal,
            cards = game.cards.items,
            count = cards.length,
            index = 0,
            i, stackId, card,
            stackCount = 7,
            stackCards = {};
        
        for (i = 0; i < count; i++) {
            card = cards[i];
            stackId = card.stack_id;
            
            stackCards[stackId] = stackCards[stackId] || [];
            
            if (card.position != undefined) {
                stackCards[stackId][card.position] = card;
            } else {
                stackCards[stackId].push(card);
            }
        }
        
        for (stackId in stackCards) {
            view.get(stackId).add(stackCards[stackId]);
        }
        
        Solitaire.StackManager.all.each(function(stack) {
            stack.doLayout();
        }, this);
        
        deck.doLayout();
        this.view.doLayout();
        
        this.game = game;
        localStorage.removeItem(this.localStorageKey);
        localStorage.setItem(this.localStorageKey, game.getId());
        this.updateMoveCount(game.get('moves'));
    },
    
    /**
     * @private
     * Clears all stacks of their cards
     * @param {Boolean} layout True to call doLayout on each stack (defaults to false)
     */
    clearStacks: function(layout) {
        var stackCount = 7,
            suitStacks = 4,
            stack, i,
            view = this.view,
            deal = this.deal,
            deck = this.deck;
        
        for (i = 1; i <= stackCount; i++) {
            view.get('stack' + i).removeAll(false);
            view.get('stack' + i).doLayout();
        }
        
        for (i = 1; i <= suitStacks; i++) {
            view.get('suitstack' + i).removeAll(false);
            view.get('suitstack' + i).doLayout();
        }
        
        deck.removeAll();
        deal.removeAll();
        
        if (layout) {
            deck.doLayout();
            deal.doLayout();
        }
    },
    
    /**
     * Opens a modal dialog showing all saved games in progress
     */
    showSavedGames: function() {
        if (!this.saved) {
            var store = this.gameStore;
            
            var saved    = this.saved = new Solitaire.Games(),
                gameList = saved.gameList;
            
            saved.on({
                scope: this,
                clearButtonTap: function() {
                    store.remove(store.data.items);
                    store.sync();

                    localStorage.clear.defer(100, localStorage);
                }
            });
            
            gameList.on({
                scope: this,
                render: function() {
                    gameList.el.on({
                        scope: this,
                        click: function(e, node, item, options) {
                            var item = e.getTarget(gameList.itemSelector, gameList.getTemplateTarget());

                            if (item) {
                                var index = gameList.indexOf(item);

                                gameList.select(index);
                            }
                        }
                    });                    
                },
                selectionchange: function() {
                    var game = gameList.getSelectedRecords()[0];
                    
                    if (game) {
                        this.loadGame(game);
                        this.saved.hide();
                    }
                }
            });
            
            gameList.bindStore(store);
        }
        
        this.saved.show('pop');
    },
    
    /**
     * @private
     * Moves a card from the Deck to the Deal, animated
     * @param {Solitaire.Card} card The card to move
     */
    moveToDeal: function(card) {
        if (this.blockMoveToDeal) {
            return;
        }
        
        this.blockMoveToDeal = true;
        
        var deal = this.deal,
            deck = this.deck;
        
        //FIXME: This is a hack to make the animated card flip work properly. When the card is inside the 
        //deck and we try to move it, its z-index is lower than the cards in the deal so it flips under the 
        //deal instead of over it. We move it up a level to fix this. This is brittle, especially the hard-
        //coded 12px below
        deck.el.parent().insertFirst(card.el);
        card.el.setX(12);
        
        (function() {
            card.reveal();
            card.el.addClass('x-solitaire-card-move');            
        }).defer(5, this);

        (function() {
            this.blockMoveToDeal = false;
            
            card.el.removeClass('x-solitaire-card-move');
            
            deal.add(card);
            deck.doLayout();
            deal.doLayout();
        }).defer(500, this);
    },
    
    /**
     * Performs an animated move of a card from its current stack to another
     * @param {Solitaire.Card} card The card to move
     * @param {Solitaire.Stack} stack The new stack
     * @param {Number} duration The animation duration. Defaults to 500
     * @param {Function} callback A callback function to call after the animated move has completed
     * @param {Object} scope Scope for the callback function to be executed in
     */
    moveToStack: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            duration: 500,
            oldStack: this.mover.stack,
            saveGame: true
        });
        
        var newStack  = options.newStack,
            oldStack  = options.oldStack,    
            cards     = oldStack.getCards(),
            firstCard = cards[0],
            cardCount = cards.length;

        var me         = this,
            mover      = this.mover,
            cardEl     = firstCard.el,
            cardBox    = cardEl.getPageBox(),
            stackBox   = newStack.el.getPageBox(),
            cardHeight = 24,
            deltaX     = stackBox.left - cardBox.left,
            deltaY     = stackBox.top - cardBox.top;
        
        if (!(newStack instanceof Solitaire.SuitStack)) {
            deltaY += (cardHeight * newStack.items.length);
        }
        
        //take the cards out of the old container
        for (i = 0; i < cardCount; i++) {
            var card = cards[i];
            
            oldStack.remove(card, false);
            
            //only need to lay out once
            if (i == cardCount - 1) {     
                oldStack.doLayout();
            }
        }
        
        mover.moveStarted();
        new Ext.Anim({
            from: {
                '-webkit-transform': 'translate3d(0px, 0px, 0px)'
            },
            to: {
                '-webkit-transform': 'translate3d(' + deltaX + 'px, ' + deltaY + 'px, 0px)'
            },
            duration: options.duration,
            after: function() {
                newStack.add(cards);
                newStack.doLayout();
                
                mover.moveFinished();
                
                if (options.saveGame) {
                    (function() {
                        var game  = me.game,
                            moves = game.get('moves') + 1;

                        game.dirty = true;
                        game.set('moves', moves);

                        me.gameStore.sync();
                        me.updateMoveCount(moves);
                    }).defer(50, me);
                }
            }
        }).run(oldStack.el);
    },
    
    /**
     * @private
     * Moves the top card on the Deck to the Deal
     * @return {Boolean} True if a card could be dealt, false otherwise
     */
    dealTopCard: function() {
        var card = this.deck.getTopCard();
        
        if (card) {
            this.moveToDeal(card);
        }
        
        return !!card;
    },
    
    /**
     * @private
     * Moves all cards from the Deal to the Deck
     * @param {Boolean} dealTop True to deal the top card after replenishing (defaults to false)
     */
    replenishDeck: function(dealTop) {
        var deal   = this.deal,
            deck   = this.deck,
            cards  = deal.getCards(),
            length = cards.length,
            i, card;
        
        for (i = length - 1; i >= 0; i--) {
            card = cards[i];
            
            deck.add(card);
            card.unreveal();
        }
        
        deck.doLayout();
        deal.doLayout();
        
        if (dealTop) {
            this.dealTopCard.defer(50, this);
        }
    },
    
    /**
     * @private
     * Updates the status bar move count
     * @param {Number} moves The number of moves
     */
    updateMoveCount: function(moves) {
        var text = String.format("{0} {1}", moves, +moves == 1 ? 'Move' : 'Moves');
            
        this.view.get('moves').update(text);
    },
    
    /**
     * @private
     * Increments the current game timer. Should be called every second
     */
    updateTimer: function() {
        var game = this.game;
        
        if (!game) {
            return;
        }
        
        var time = game.get('time') + 1,
            mins = Math.floor(time / 60),
            secs = time % 60,
            text = String.format("{0}:{1}", mins, secs > 9 ? secs : '0' + secs);
        
        game.set('time', time);
        
        // return;
        if (!this.mover.dragging) {
            this.view.get('time').update(text, false);
        }
    },
    
    /**
     * @private
     * Attached to the global double tap listener, finds the tapped card and tries to move it to the best
     * destination location.
     */
    onDoubleTap: function(e) {
        var cardEl = Ext.get(e.getTarget('.x-solitaire-card')),
            card;
        
        if (cardEl) {
            card = Ext.ComponentMgr.get(cardEl.id);
            
            if (card && card.revealed) {
                var mover     = this.mover,
                    oldStack  = card.ownerCt,
                    isTopCard = card === oldStack.getTopCard(),
                    newStack  = this.findTargetStack(card),
                    cardEl    = card.el,
                    cardX     = cardEl.getX(),
                    cardY     = cardEl.getY();
                
                if (isTopCard && newStack) {                    
                    mover.loadCards([card]);
                    oldStack.revealTopCard.defer(550, oldStack);
                    
                    mover.stack.el.setXY(cardX, cardY);                    
                    mover.needsRepair = false;
                    
                    this.moveToStack({
                        newStack: newStack
                    });
                }             
            }
        }
    },
    
    /**
     * @private
     * Finds the best target stack that can currently accept a given card
     * @param {Solitaire.Card} card The card
     * @return {Solitaire.Stack|null} The stack
     */
    findTargetStack: function(card) {
        var stacks = Solitaire.StackManager.all.items,
            length = stacks.length,
            stack, i;
        
        for (i = 1; i <= 4; i++) {
            stack = this.view.get('suitstack' + i);
            
            if (stack != card.ownerCt && stack.canDrop(card)) {
                return stack;
            }
        }
    },
    
    /**
     * @private
     * Attempts to automatically complete the game by moving one eligible card at a time
     */
    autoComplete: function() {
        var mover  = this.mover,
            stacks = [],
            length = 7,
            me     = this;
        
        //gather the stacks
        for (i = 0; i < length; i++) {
            stacks.push(this.view.get('stack' + (i + 1)));
        }
        
        //finds the lowest value card in any stack
        var findLowest = function() {
            var lowest, current, j;
            
            for (j = 0; j < length; j++) {
                current = stacks[j].getTopCard();
                
                if (!lowest || (current && current.value < lowest.value)) {
                    lowest = current;
                }
            }
            
            return lowest;
        };
        
        var moveNext = function() {
            var nextCard = findLowest();
            
            if (nextCard) {
                var cardEl = nextCard.el,
                    cardX  = cardEl.getX(),
                    cardY  = cardEl.getY(),
                    stack  = me.findTargetStack(nextCard);
                
                if (stack) {
                    mover.loadCards([nextCard]);

                    mover.stack.el.setXY(cardX, cardY);                    
                    mover.needsRepair = false;

                    me.moveToStack({
                        newStack: stack,
                        saveGame: false,
                        duration: 250
                    });

                    moveNext.defer(300, me);
                }
            }
        };
        
        moveNext();
    }
});
/**
 * @class Solitaire.Game
 * @extends Ext.util.Observable
 * Represents a single Game of Solitaire, tracks the cards and detects game completion
 */
Solitaire.Game = Ext.extend(Ext.util.Observable, {
    constructor: function(config) {
        Solitaire.Game.superclass.constructor.call(this, config);
        
        /**
         * @property cards
         * @type Ext.util.MixedCollection
         * Stores all of the Cards in this Deck
         */
        this.cards = new Ext.util.MixedCollection();
        
        this.createCards();
    },
    
    /**
     * @private
     * Moves all cards to their initial positions
     */
    distributeCards: function() {
        
    },
    
    /**
     * Returns the completion status of this game
     * @return {Boolean} True if all cards have been placed onto their suit stacks
     */
    isComplete: function() {
        
    },
    
    /**
     * @private
     * Used to serialize game state so that it can be saved and resumed later
     * @return {Object} A serializable object representing the current state of the game and location of each card
     */
    getState: function() {
        
    },
    
    /**
     * @private
     * Applys a state object as generated by {@link getState}, updating the score and moving the cards to the correct positions
     * @param {Object} state The state object
     */
    applyState: function(state) {
        
    },
    
    /**
     * @private
     * Creates an instance of each card in a standard deck
     */
    createCards: function() {
        var suits  = Solitaire.Card.SUITS,
            values = Solitaire.Card.VALUES,
            slen   = suits.length,
            vlen   = values.length,
            i, j;
        
        for (i = 0; i < slen; i++) {
            for (j = 0; j < vlen; j++) {
                this.cards.add(new Solitaire.Card({
                    suit : suits[i],
                    value: values[j]
                }));
            }
        }
        
        this.shuffle();
        this.shuffle();
    },
    
    /**
     * Shuffles the pack the specified number of times
     */
    shuffle: function() {
        var cards = this.cards.items,
            count = cards.length,
            order = {},
            i, j;
        
        //here we construct and array of indexes and sort it randomly, before passing this off to MixedCollection's reorder
        var arr = [];
        for (i = 0; i < count; i++) {
            arr.push(i);
        }
        
        arr.sort(function() {
            return Math.round(Math.random())-0.5;
        });
        
        for (j = 0; j < count; j++) {
            order[j] = arr[j];
        }
        
        this.cards.suspendEvents(true);
        this.cards.reorder(order);
        this.cards.resumeEvents(true);
    }
    
});
/**
 * @class Solitaire.StackLayout
 * @extends Ext.layout.ContainerLayout
 * Lays out the cards in a stack such that the top of each card is visible
 */
Solitaire.StackLayout = Ext.extend(Ext.layout.ContainerLayout, {
    innerCls : 'solitaire-stack-inner x-solitaire-target',
    
    padding: "",
    
    /**
     * @property topOffset
     * @type Number
     * The number of pixels each card will be moved down by on the stack. Defaults to 0
     */
    topOffset: 0,
    
    /**
     * @property leftOffset
     * @type Number
     * The number of pixels each card will be moved left by on the stack. Defaults to 0
     */
    leftOffset: 0,

    onLayout: function(items, target) {
        Solitaire.StackLayout.superclass.onLayout.apply(this, arguments);
        
        var owner  = this.owner,
            items  = owner.getCards(),
            length = items.length,
            i, card;
        
        for (i = 0; i < length; i++) {
            card = items[i];
            
            card.setPosition(i * this.leftOffset, i * this.topOffset);
            
            //this makes sure that the cards are in the correct order in the DOM
            owner.el.dom.insertBefore(card.el.dom, i);
        }
    },
    
    // private
    renderItems : function(ct, target) {
        if (!this.innerCt) {
            // the innerCt prevents wrapping and shuffling while the container is resizing
            this.innerCt = target.createChild({cls:this.innerCls});
            this.padding = Ext.Element.parseBox(this.padding);
        }
        
        Solitaire.StackLayout.superclass.renderItems.call(this, ct, this.innerCt);
    }
});

Ext.layout.TYPES['stack'] = Solitaire.StackLayout;
Solitaire.StackManager = new Ext.AbstractManager({
    typeName: 'stack'
});
Ext.regModel('Game', {
    fields: [
        {name: 'id',         type: 'int'},
        {name: 'moves',      type: 'int'},
        {name: 'time',       type: 'int'},
        {name: 'complete',   type: 'boolean'},
        {
            name: 'created_at', 
            type: 'date',
            encode: function(value) {
                return +(value);
            },
            decode: function(value) {
                return new Date(value);
            }
        },
        {
            name: 'cards', 
            type: 'string',
            encode: function(value, instance) {
                var cards  = instance.cards.items,
                    length = cards.length,
                    data   = [],
                    i, card;
                
                for (i = 0; i < length; i++) {
                    card = cards[i];
                    
                    data.push({
                        value   : card.value,
                        suit    : card.suit,
                        revealed: card.revealed,
                        stack_id: card.ownerCt.id,
                        position: card.ownerCt.items.items.indexOf(card)
                    });
                }
                
                return Ext.encode(data);
            },
            decode: function(encoded) {
                return Ext.decode(encoded);
            }
        }
    ],
    
    /**
     * @constructor
     * Sets up the cards collection. TODO: This should be a hasMany association instead
     */
    constructor: function() {
        Ext.data.Model.prototype.constructor.apply(this, arguments);
        
        /**
         * @property cards
         * @type Ext.util.MixedCollection
         * Stores all of the Cards in this Deck
         */
        this.cards = new Ext.util.MixedCollection();
        
        var savedCards = this.get('cards');
        if (Ext.isArray(savedCards)) {
            var length = savedCards.length,
                i;
            
            for (i = 0; i < length; i++) {
                if (savedCards[i] instanceof Solitaire.Card) {
                    this.cards.add(savedCards[i]);
                } else {
                    this.cards.add(new Solitaire.Card(savedCards[i]));                
                }
            }
        } else {
            this.createCards();
        }
    },
    
    /**
     * @private
     * Creates an instance of each card in a standard deck
     * FIXME: This is a horrible algorithm and should be replaced with something better
     */
    createCards: function() {
        var suits  = Solitaire.Card.SUITS,
            values = Solitaire.Card.VALUES,
            slen   = suits.length,
            vlen   = values.length,
            i, j;
        
        for (i = 0; i < slen; i++) {
            for (j = 0; j < vlen; j++) {
                this.cards.add(new Solitaire.Card({
                    suit : suits[i],
                    value: values[j]
                }));
            }
        }
        
        this.shuffle();
        this.shuffle();
    },
    
    /**
     * Shuffles the pack the specified number of times
     */
    shuffle: function() {
        var cards = this.cards,
            count = cards.items.length,
            order = {},
            i, j;
        
        //here we construct and array of indexes and sort it randomly, before passing this off to MixedCollection's reorder
        var arr = [];
        for (i = 0; i < count; i++) {
            arr.push(i);
        }
        
        arr.sort(function() {
            return Math.round(Math.random())-0.5;
        });
        
        for (j = 0; j < count; j++) {
            order[j] = arr[j];
        }
        
        cards.suspendEvents(true);
        cards.reorder(order);
        cards.resumeEvents(true);
    }
});
/**
 * @class Solitaire.Stack
 * @extends Ext.Container
 * Represents a stack of cards
 */
Solitaire.Stack = Ext.extend(Ext.Container, {
    autoDestroy: false,
    
    // name: 'stack',
    layout: {
        type: 'stack',
        topOffset: 24
    },
    
    cls: 'x-solitaire-stack',
    
    /**
     * @property isDroppable
     * @type Boolean
     * True to allow cards to be dropped on this Stack (see {@link canDrop}). Defaults to true.
     */
    isDroppable: true,
    
    /**
     * @property hasHolder
     * @type Boolean
     * True to add a holder element as the first item in the container. Defaults to true
     */
    hasHolder: false,
    
    initComponent: function() {
        this.addEvents(
          /**
           * @event dropped
           * Fires whenever cards are dropped onto this stack
           * @param {Solitaire.Stack} stack The Stack
           * @param {Array} cards The array of cards that were dropped
           */
          'dropped',
          
          /**
           * @event moved
           * Fires whenever a card has been moved to this stack (the dropped event will also fire if moved via drag)
           * @param {Solitaire.Stack} stack This Stack
           * @param {Array} cards The array of cards that were moved
           */
          'moved'
        );
        
        if (this.hasHolder) {
            this.items = [{
                xtype: 'component',
                cls  : 'x-solitaire-target'
            }];            
        }
        
        this.id = this.name;
        
        Solitaire.Stack.superclass.initComponent.apply(this, arguments);
        
        Solitaire.StackManager.register(this);
    },
    
    /**
     * Returns true if the given card can be dropped on this stack at the moment. The basic implementation
     * accepts a card of the opposite suit color where the value is 1 lower than the current top card. If 
     * there is no current top card, kings will be accepted.
     * @param {Solitaire.Mover} mover The mover stack
     * @return {Boolean} True if the drop is allowed
     */
    canDrop: function(mover) {
        var card    = mover instanceof Solitaire.Card ? mover : mover.getBottomCard(),
            topCard = this.getTopCard();
        
        if (!card) {
            return;
        }
        
        if (topCard) {
            var rightValue = card.value == (topCard.value - 1),
                rightSuit  = card.isRed() != topCard.isRed(),
                sameCard   = card === topCard;
            
            return sameCard || (rightValue && rightSuit);
        } else {
            //king
            return card.value == 13;
        }
    },
    
    /**
     * Returns the card currently on the top of the stack, or null if the stack is empty
     * @return {Solitaire.Card|null} The card
     */
    getTopCard: function() {
        var card = this.items.last();
        
        return card instanceof Solitaire.Card ? card : null;
    },
    
    /**
     * Returns the card currently on the top of the stack, or null if the stack is empty
     * @return {Solitaire.Card|null} The card
     */
    getBottomCard: function() {
        var card = this.items.first();
        
        return card instanceof Solitaire.Card ? card : null;
    },
    
    /**
     * @private
     * Called when a card has been removed from this stack
     * @param {Solitaire.Card} card The card that was removed
     */
    onCardRemoved: function(card) {
        this.revealTopCard();
    },
    
    /**
     * Reveals the topmost card
     */
    revealTopCard: function() {
        // console.log('revealing ' + this.id);
        var topCard = this.getTopCard();
        
        // console.log(topCard);
        if (topCard) {
            topCard.reveal();
        }
    },
    
    /**
     * Returns all of the cards in this stack
     * @return {Array} The cards
     */
    getCards : function() {
        var items  = this.items && this.items.items || [],
            cards  = [],
            length = items.length,
            i;
        
        for (i = 0; i < length; i++) {
            if (items[i] instanceof Solitaire.Card) {
                cards.push(items[i]);
            }
        }
        
        return cards;
    },
    
    /**
     * @private
     * Removes all cards in the stack
     * @param {Boolean} layout True to force a layout after removing the cards
     */
    removeAllCards: function(layout) {
        var cards = this.getCards(),
            count = cards.length,
            i;
        
        for (i = 0; i < count; i++) {
            this.remove(cards[i]);
        }
        
        if (layout) {
            this.doLayout();
        }
    },
    
    /**
     * @private
     * Sets up the drop target on this stack
     */
    onRender: function() {
        Solitaire.Stack.superclass.onRender.apply(this, arguments);
        
        if (this.isDroppable && this.droppable == undefined) {
            this.droppable = new Ext.util.Droppable(this.el, {
                listeners: {
                    scope: this,
                    drop: function(droppable, draggable, e) {
                        var stack = draggable.stack;

                        if (this.canDrop(stack)) {
                            this.fireEvent('dropped', e, this, stack.getCards(), draggable);
                        }
                    }
                }
            });            
        }
    }
});

Ext.reg('stack', Solitaire.Stack);
/**
 * @class Solitaire.SuitStack
 * @extends Solitaire.Stack
 * 
 */
Solitaire.SuitStack = Ext.extend(Solitaire.Stack, {
    layout: 'stack',
    
    /**
     * Allows an ace to be dropped if there are no cards on the suit stack yet, otherwise
     * ensures that the card is the same suit and one greater in value
     */
    canDrop: function(mover) {
        var card    = mover instanceof Solitaire.Card ? mover : mover.getBottomCard(),
            topCard = this.getTopCard();
        
        if (!card) {
            return;
        }
        
        if (topCard) {
            var rightValue = card.value == (topCard.value + 1),
                rightSuit  = card.suit == topCard.suit,
                sameCard   = card === topCard;
            
            return sameCard || (rightValue && rightSuit);
        } else {
            //ace
            return card.value == 1;
        }
    },
    
    onCardRemoved: Ext.emptyFn,
    
    /**
     * Returns true if an entire suit of cards is present in this SuitStack
     * @return {Boolean} true if complete
     */
    isComplete: function() {
        return this.items.last().value == 13;
    }
});

Ext.reg('suitstack', Solitaire.SuitStack);
/**
 * @class Solitaire.Board
 * @extends Ext.Container
 * Container for the Deck and Stacks
 */
Solitaire.Board = new Ext.View({
    name: 'board',
    fullscreen: true,
    cls: 'x-solitaire-board',
    id: 'board',
    
    dockedItems: [
        {
            name : 'footer',
            xtype: 'toolbar',
            dock : 'bottom',
            height: 38,
            align: 'bottom',
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    name: 'newGameButton',
                    text: 'New&nbsp;Game'
                },
                {xtype: 'spacer'},
                {
                    xtype: 'component',
                    name : 'moves',
                    html : '1 Move',
                    cls  : 'x-solitaire-moves',
                    width: 75
                },
                {xtype: 'spacer', width: 60},
                {
                    xtype: 'component',
                    name : 'time',
                    html : '0:00',
                    cls  : 'x-solitaire-time',
                    width: 45
                },
                {xtype: 'spacer', width: 10}
            ]
        }
    ],    
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
        {
            height: 12
        },
        {
            height: 200,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            xtype: 'container',
            defaults: {
                xtype: 'component'
            },
            items: [
                {width: 12},
                {xtype: 'deck', name: 'deck'},
                {xtype: 'deal', name: 'deal'},
                {flex: 5},
                {xtype: 'suitstack', name: 'suitstack1'},
                {flex: 1},
                {xtype: 'suitstack', name: 'suitstack2'},
                {flex: 1},
                {xtype: 'suitstack', name: 'suitstack3'},
                {flex: 1},
                {xtype: 'suitstack', name: 'suitstack4'},
                {width: 12}
            ]
        },
        {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            xtype: 'container',
            defaults: {
                xtype: 'component'
            },
            height: 500,
            items: [
                {width: 12},
                {xtype: 'stack', name: 'stack1'},
                {flex: 1},
                {xtype: 'stack', name: 'stack2'},
                {flex: 1},
                {xtype: 'stack', name: 'stack3'},
                {flex: 1},
                {xtype: 'stack', name: 'stack4'},
                {flex: 1},
                {xtype: 'stack', name: 'stack5'},
                {flex: 1},
                {xtype: 'stack', name: 'stack6'},
                {flex: 1},
                {xtype: 'stack', name: 'stack7'},
                {width: 12}
            ]
        }
    ]
});
/**
 * @class Solitaire.Card
 * @extends Ext.Component
 * Represents a single card in the game
 */
Solitaire.Card = Ext.extend(Ext.Component, {
    cls: 'x-solitaire-card',
    
    suitPrefix: 'x-solitaire-suit-',
    valuePrefix: 'x-solitaire-value-',
    
    /**
     * @property revealed
     * @type Boolean
     * True if the card's face has been revealed yet. Read only, starts off false
     */
    revealed: false,
    
    /**
     * @property revealCls
     * @type String
     * The CSS class to add to the card when revealed
     */
    revealCls: 'revealed',
    
    constructor: function(config) {
        this.id = "ext-card-" + Ext.id();
        
        Solitaire.Card.superclass.constructor.apply(this, arguments);
    },
    
    //inherit docs
    onRender: function(ct) {
        this.el = ct.createChild({
            cls: this.cls + ' x-solitaire-card-' + this.getColor() + " " + (this.revealed ? this.revealCls : ''),
            id: this.id,
            cn: [
                {
                    cls: 'x-solitaire-card-face x-solitaire-card-face-front',
                    cn : [
                        {
                            tag : 'span',
                            html: this.getFaceText(),
                            cls : 'x-solitaire-card-value x-solitaire-card-value-top'
                        },
                        {
                            tag : 'span',
                            html: this.getFaceText(),
                            cls : 'x-solitaire-card-value x-solitaire-card-value-bottom'
                        }
                    ]
                },
                {
                    cls: 'x-solitaire-card-face x-solitaire-card-face-back'
                }
            ]
        });
        
        Solitaire.Card.superclass.onRender.apply(this, arguments);
        
        this.addCardStyles();
    },
    
    /**
     * Returns true if the card is even
     */
    isEven: function() {
        return this.value % 2 == 0;
    },
    
    /**
     * Returns true if the card is odd
     */
    isOdd: function() {
        return this.value % 2 == 1;
    },
    
    /**
     * Returns true if the card is from a red suit
     */
    isRed: function() {
        return this.suit == 'hearts' || this.suit == 'diamonds';
    },
    
    /**
     * Returns true if the card is from a black suit
     */
    isBlack: function() {
        return this.suit == 'clubs' || this.suit == 'spades';
    },
    
    /**
     * Returns this card's suit color
     * @return {String} 'red' or 'black'
     */
    getColor: function() {
        return this.isRed() ? 'red' : 'black';
    },
    
    /**
     * Reveals the card by adding a CSS class to it
     */
    reveal: function() {
        if (!this.revealed) {
            this.el.addClass(this.revealCls);
            
            this.revealed = true;
        }
    },
    
    /**
     * Unreveals the card by removing the reveal CSS class to it
     */
    unreveal: function() {
        if (this.revealed) {
            this.el.removeClass(this.revealCls);
            
            this.revealed = false;
        }
    },
    
    moveBy: function(x, y) {
        this.el.addClass('x-solitaire-card-move');
    },
    
    /**
     * @private
     * Returns the number or letter associated with this card
     * @return {String} The face text
     */
    getFaceText: function() {
        var mapping = {
            1 : 'A',
            11: 'J',
            12: 'Q',
            13: 'K'
        };
        
        return mapping[this.value] || this.value;
    },
    
    /**
     * @private
     * Hack, will be removed later
     */
    addCardStyles: function() {
        //FIXME: this throws an exception for some unknown reason :/
        // var el = Ext.get(this.el).child('div.x-solitaire-card-face-front');
        var el = Ext.get(this.el.dom.childNodes[0]);
        
        var suitOffsets = {
            'clubs'   : 108,
            'diamonds': 216,
            'spades'  : 324,
            'hearts'  : 432
        };
        
        // el.applyStyles({
        //     'background-position': String.format("{0}px", -suitOffsets[this.suit])
        // });
        
        el.addClass(String.format("{0}{1} {2}{3}", this.suitPrefix, this.suit, this.valuePrefix, this.value));
    }
});

Solitaire.Card.SUITS  = ['hearts', 'diamonds', 'clubs', 'spades'];
Solitaire.Card.VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
/**
 * @class Solitaire.Deck
 * @extends Ext.Container
 * Represents a deck of cards
 */
Solitaire.Deck = Ext.extend(Solitaire.Stack, {
    isDroppable: false,
    
    cls   : 'x-solitaire-deck',
    width : 130,
    layout: 'stack',
    
    constructor: function() {
        this.addEvents(
            /**
             * @event draw
             * Fires when the user wishes to draw card(s) from the deck
             * @param {Solitaire.Deck} deck The Deck instance
             */
            'draw'
        );
      
        Solitaire.Deck.superclass.constructor.apply(this, arguments);
    },
    
    //inherit docs, sets up event listeners
    onRender: function() {
        Solitaire.Deck.superclass.onRender.apply(this, arguments);
        
        var fireDraw = function() {
            this.fireEvent('draw', this);
        };
        
        this.el.on({
            scope: this,
            click: fireDraw,
            tap  : fireDraw
        });
    },
    
    //inherit docs
    canDrop: function() {
        return false;
    }
});

Ext.reg('deck', Solitaire.Deck);
/**
 * @class Solitaire.Deal
 * @extends Solitaire.Stack
 * Displays the card or cards that have just been dealt
 */
Solitaire.Deal = Ext.extend(Solitaire.Stack, {
    isDroppable: false,
    
    autoEl: {
        tag: 'div',
        cls: 'x-solitaire-deal'
    },
    
    layout: {
        type: 'stack',
        leftOffset: 0
    },
    
    width: 135,
    
    //inherit docs
    canDrop: function() {
        return false;
    }
});

Ext.reg('deal', Solitaire.Deal);
/**
 * @class Solitaire.Mover
 * @extends Solitaire.Stack
 * Draggable Stack 
 */
Solitaire.Mover = Ext.extend(Ext.util.Draggable, {
    dragCls: '',
    threshold: 3,
    
    /**
     * If the mover is currently repairing after an invalid drop, this points to the stack that is being repaired to
     * @property repairStack
     * @type Solitaire.Stack
     */
    repairStack: undefined,
    
    /**
     * True if the mover should repair its internal stack to its start position (i.e. the drop is invalid)
     * @property needsRepair
     * @type Boolean
     */
    needsRepair: false,
    
    /**
     * True if any of the stack in the mover are currently being moved
     * @property moving
     * @type Boolean
     */
    moving: false,
    
    constructor: function(el, config) {
        config = config || {};
        
        this.stack = this.createStack();
        
        Ext.applyIf(config, {
            proxy: this.stack.el,
            constrain: false
        });
        
        Solitaire.Mover.superclass.constructor.call(this, Ext.getBody(), config);
    },
    
    /**
     * @private
     * Creates a new stack, renders it and updates the proxy el
     * @return {Solitaire.Stack} The new stack
     */
    createStack: function() {
        var stack = new Solitaire.Stack({
            cls: 'x-solitaire-mover',
            id : 'mover-stack-' + Ext.id(),
            
            isDroppable: false,
            
            canDrop: function() {
                return false;
            }
        });
        
        stack.render(Ext.getBody());
        stack.setPosition(-200, -200);
        
        this.proxy = stack.el;
        
        return stack;
    },
    
    /**
     * @private
     * Destroys the current floating stack
     */
    destroyStack: function() {
        if (this.stack) {
            this.stack.destroy();
        }
        
        delete this.stack;
    },
    
    /**
     * Loads the given cards into the internal stack
     * @param {Array} cards The cards
     */
    loadCards: function(cards) {
        if (!this.stack) {
            this.stack = this.createStack();
        }
        
        this.stack.add(cards);
        this.stack.doLayout();
    },
    
    onTouchMove: function(e) {
        //ignore clicks/drags on the deck
        if (e.getTarget('.x-solitaire-deck')) {
            return;
        } else {
            return Solitaire.Mover.superclass.onTouchMove.apply(this, arguments);
        }
    },
    
    /**
     * 
     */
    onDragStart: function(e) {
        var cards = this.getCards(e, false);
        
        if (!this.stack) {
            this.stack = this.createStack();
        }
        
        if (cards.length > 0) {
            var cardX = Ext.fly(cards[0].el).getX(),
                cardY = Ext.fly(cards[0].el).getY();
            
            this.stack.setPosition(cardX, cardY);
            this.needsRepair = true;
        }
        
        Solitaire.Mover.superclass.onDragStart.apply(this, arguments);
        
        if (cards.length > 0) {
            this.loadCards(cards);
        }
    },
    
    /**
     * @private
     * Returns any cards still in the mover to their previous stack
     */
    onTouchEnd: function(e) {
        Solitaire.Mover.superclass.onTouchEnd.apply(this, arguments);
        
        if (this.needsRepair) {
            var me         = this,
                stack      = this.stack,
                cards      = stack.getCards(),
                firstCard  = cards[0];
            
            if (!firstCard) {
                this.moveFinished();
                return;
            }
            
            var me         = this,
                cardX      = firstCard.el.getX(),
                cardY      = firstCard.el.getY(),
                oldStack   = this.oldStack,
                deltaX     = oldStack.el.getX() - stack.el.getX(),
                deltaY     = oldStack.el.getY() - stack.el.getY(),
                cardHeight = 24;
            
            this.repairStack = oldStack;
            
            if (oldStack.id != 'deal') {                
                deltaY += cardHeight * oldStack.items.length;
            }
            
            this.moveStarted();
            new Ext.Anim({
                from: {
                    '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                },
                to: {
                    '-webkit-transform': 'translate3d(' + deltaX + 'px, ' + deltaY + 'px, 0px)'
                },
                duration: 500,
                after: function() {
                    oldStack.add(cards);
                    oldStack.doLayout();
                    
                    me.moveFinished();
                    
                    delete me.repairStack;
                }
            }).run(stack.el);
        }
        
        this.needsRepair = false;
    },
    
    /**
     * Sets the internal moving flag to true
     */
    moveStarted: function() {
        this.moving = true;
        this.disable();
    },
    
    /**
     * Sets the internal moving flag to false
     */
    moveFinished: function() {
        this.moving = false;
        this.enable();
        
        this.destroyStack();
    },
    
    /**
     * @private
     */
    isMoving: function() {
        return this.moving === true;
    },
    
    /**
     * @private
     * Returns one or more cards based on an event. Finds the targetted card and optionally returns any
     * other cards sitting on top of it
     * @param {Event} e The event object
     * @return {Array} The cards
     */
    getCards: function(e) {
        var cardEl = e.getTarget('.x-solitaire-card'),
            cards  = [],
            card, i, cardX, cardY;

        if (cardEl) {
            card = Ext.ComponentMgr.get(cardEl.id);
            
            //can't drag a card that hasn't been revealed yet, and can't drag any cards from the stack that is
            //currently being repaired to, otherwise you could pull the second card out from under the first
            if (!card.revealed || this.dragging || this.moving || this.repairStack) {
                return [];
            }
            
            this.oldStack = card.ownerCt;
        }
        
        if (cardEl) {
            //get the touched card and all those sitting on it
            var oldStackCards  = this.oldStack.getCards(),
                length = oldStackCards.length,
                found  = false;

            for (i = 0; i < length; i++) {
                if (oldStackCards[i] == card) {
                    found = true;
                }

                if (found) {                
                    cards.push(oldStackCards[i]);
                }
            }
        }
        
        return cards;
    }
});

/**
 * @class Solitaire.Games
 * @extends Ext.Panel
 * Modal window showing all saved games currently in progress
 */
Solitaire.Games = Ext.extend(Ext.Panel, {
    xtype: 'panel',
    name: 'games',
    modal: true,
    centered: true,
    floating: true,
    height: 400,
    width: 500,
    
    constructor: function(config) {
        this.addEvents(
          /**
           * @event clearButtonTap
           * Fires when the clear button is tapped
           * @param {Solitaire.Games} gamesView The games window
           */
          'clearButtonTap'
        );
        
        Solitaire.Games.superclass.constructor.call(this, config);
    },
    
    initComponent: function() {
        this.gameList = new Ext.DataView({
            name : 'gameList',
            itemSelector: 'div.savedGame',
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="savedGame">',
                        '<h3>Game {id} - started {[this.formatDate(values.created_at)]}</h3>',
                        'Moves: {moves}, time: {time}, complete: {[values.complete ? "yes" : "no"]}',
                    '</div>',
                '</tpl>',
                {
                    formatDate: function(date) {
                        if (typeof date == 'number') {
                            date = new Date(date);
                        }

                        return String.format("{0}/{1}/{2}", date.getDate(), date.getMonth() + 1, date.getFullYear());
                    }
                }
            ),

            emptyText: 'No games'
        });
        
        this.items = [this.gameList];
        
        this.dockedItems = [
            {
                dock : 'top',
                xtype: 'toolbar',
                title: 'Saved Games'
            },
            {
                dock: 'bottom',
                xtype: 'toolbar',
                items: [
                    {
                        text: 'Clear',
                        name: 'clearButton',
                        scope: this,
                        handler: function() {
                            this.fireEvent('clearButtonTap', this);
                        }
                    },
                    {
                        xtype: 'spacer'
                    },
                    {
                        text: 'Close',
                        name: 'closeButton',
                        scope: this,
                        handler: function() {
                            this.hide();
                        }
                    }
                ]
            }
        ];
 
        Solitaire.Games.superclass.initComponent.apply(this, arguments);
    },
    
    cls: 'x-solitaire-modal'
});
