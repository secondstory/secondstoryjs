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