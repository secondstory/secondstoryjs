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