Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    
    onReady: function() {
        var tapHandler = function(button, event) {
            var txt = "User tapped the '" + button.text + "' button.";
            Ext.getCmp('toolbartxt').update(txt);
        };

        var buttonsGroup1 = [{
            text: 'Back',
            ui: 'back',
            handler: tapHandler
        }, {
            text: 'Default',
            handler: tapHandler
        }, {
            text: 'Round',
            ui: 'round',
            handler: tapHandler
        }];

        var buttonsGroup2 = [{
            xtype: 'splitbutton',
            activeButton: 0,
            items: [{
                text: 'Option 1',
                handler: tapHandler
            }, {
                text: 'Option 2',
                handler: tapHandler
            }, {
                text: 'Option 3',
                handler: tapHandler
            }]    
        }];

        var buttonsGroup3 = [{
            text: 'Action',
            ui: 'action',
            handler: tapHandler
        }, {
            text: 'Forward',
            ui: 'forward',
            handler: tapHandler
        }];

        if (Ext.platform.isTablet) {
            buttonsGroup1.push({xtype: 'spacer'});
            buttonsGroup2.push({xtype: 'spacer'});

            var dockedItems = [{
                xtype: 'toolbar',
                // dock this toolbar at the bottom
                ui: 'dark',
                dock: 'top',
                items: buttonsGroup1.concat(buttonsGroup2).concat(buttonsGroup3)
            }, {
                xtype: 'toolbar',
                // dock this toolbar at the bottom
                ui: 'light',
                dock: 'bottom',
                items: buttonsGroup1.concat(buttonsGroup2).concat(buttonsGroup3)
            }];
        }
        else {
            var dockedItems = [{
                xtype: 'toolbar',
                ui: 'light',
                items: buttonsGroup1,
                dock: 'top'
            }, {
                xtype: 'toolbar',
                ui: 'dark',
                items: buttonsGroup2,
                dock: 'top'
            }, {
                xtype: 'toolbar',
                ui: 'metal',
                items: buttonsGroup3,
                dock: 'top'
            }];
        }

        new Ext.Panel({
            id: 'toolbartxt',
            html: 'Pick a button, any button. <br /><small>By using SASS, all of the buttons on this screen can be restyled dynamically. The only images used are masks.</small>',
            fullscreen: true,
            dockedItems: dockedItems
        });
    }
});
