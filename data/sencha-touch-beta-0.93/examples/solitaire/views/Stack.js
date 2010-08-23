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