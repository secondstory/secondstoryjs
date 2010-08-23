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