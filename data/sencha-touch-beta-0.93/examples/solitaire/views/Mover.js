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
