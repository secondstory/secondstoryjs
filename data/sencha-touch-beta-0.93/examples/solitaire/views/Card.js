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