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