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