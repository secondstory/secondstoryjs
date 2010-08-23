/**
 * @class Solitaire.Board
 * @extends Ext.Container
 * Container for the Deck and Stacks
 */
Solitaire.Board = new Ext.View({
    name: 'board',
    fullscreen: true,
    cls: 'x-solitaire-board',
    id: 'board',
    
    dockedItems: [
        {
            name : 'footer',
            xtype: 'toolbar',
            dock : 'bottom',
            height: 38,
            align: 'bottom',
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    name: 'newGameButton',
                    text: 'New&nbsp;Game'
                },
                {xtype: 'spacer'},
                {
                    xtype: 'component',
                    name : 'moves',
                    html : '1 Move',
                    cls  : 'x-solitaire-moves',
                    width: 75
                },
                {xtype: 'spacer', width: 60},
                {
                    xtype: 'component',
                    name : 'time',
                    html : '0:00',
                    cls  : 'x-solitaire-time',
                    width: 45
                },
                {xtype: 'spacer', width: 10}
            ]
        }
    ],    
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
        {
            height: 12
        },
        {
            height: 200,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            xtype: 'container',
            defaults: {
                xtype: 'component'
            },
            items: [
                {width: 12},
                {xtype: 'deck', name: 'deck'},
                {xtype: 'deal', name: 'deal'},
                {flex: 5},
                {xtype: 'suitstack', name: 'suitstack1'},
                {flex: 1},
                {xtype: 'suitstack', name: 'suitstack2'},
                {flex: 1},
                {xtype: 'suitstack', name: 'suitstack3'},
                {flex: 1},
                {xtype: 'suitstack', name: 'suitstack4'},
                {width: 12}
            ]
        },
        {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            xtype: 'container',
            defaults: {
                xtype: 'component'
            },
            height: 500,
            items: [
                {width: 12},
                {xtype: 'stack', name: 'stack1'},
                {flex: 1},
                {xtype: 'stack', name: 'stack2'},
                {flex: 1},
                {xtype: 'stack', name: 'stack3'},
                {flex: 1},
                {xtype: 'stack', name: 'stack4'},
                {flex: 1},
                {xtype: 'stack', name: 'stack5'},
                {flex: 1},
                {xtype: 'stack', name: 'stack6'},
                {flex: 1},
                {xtype: 'stack', name: 'stack7'},
                {width: 12}
            ]
        }
    ]
});