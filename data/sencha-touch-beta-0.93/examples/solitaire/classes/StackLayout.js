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