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