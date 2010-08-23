Ext.ns('sink', 'demos', 'Ext.ux');

Ext.ux.UniversalUI = Ext.extend(Ext.Panel, {
    fullscreen: true,
    layout: 'card',
    items: [{
        cls: 'launchscreen',
        html: '<div><img src="resources/img/sencha.png" width="210" height="291" /><h1>Welcome to Sencha Touch</h1><p>This is a comprehensive collection of our examples in an <br /> easy-to-navigate format. Each sample has a “view source” button which dynamically displays its associated code.<br /><br /><span>Sencha Touch &beta; (0.9)</span></p></div>'
    }],
    initComponent : function() {
        this.backButton = new Ext.Button({
            hidden: true,
            text: 'Back',
            ui: 'back',
            handler: this.onBackButtonTap,
            scope: this
        });

        this.navigationButton = new Ext.Button({
            hidden: Ext.platform.isPhone || Ext.orientation == 'landscape',
            text: 'Navigation',
            handler: this.onNavButtonTap,
            scope: this
        });
        
        this.navigationBar = new Ext.Toolbar({
            ui: 'dark',
            dock: 'top',
            title: this.title,
            items: [this.backButton, this.navigationButton].concat(this.buttons || [])
        });
        
        this.navigationPanel = new Ext.NestedList({
            items: this.navigationItems || [],
            dock: 'left',
            width: 250,
            height: 456,
            hidden: !Ext.platform.isPhone && Ext.orientation == 'portrait',
            toolbar: Ext.platform.isPhone ? this.navigationBar : null,
            listeners: {
                listchange: this.onListChange,
                scope: this
            }
        });
        
        this.dockedItems = this.dockedItems || [];
        this.dockedItems.unshift(this.navigationBar);
        
        if (!Ext.platform.isPhone && Ext.orientation == 'landscape') {
            this.dockedItems.unshift(this.navigationPanel);
        }
        else if (Ext.platform.isPhone) {
            this.items = this.items || [];
            this.items.unshift(this.navigationPanel);
        }
        
        this.addEvents('navigate');
        
        Ext.ux.UniversalUI.superclass.initComponent.call(this);
    },
    
    onListChange : function(list, item) {
        if (Ext.orientation == 'portrait' && !Ext.platform.isPhone && !item.items && !item.preventHide) {
            this.navigationPanel.hide();
        }
        
        if (item.card) {
            this.setCard(item.card, item.animation || 'slide');
            this.currentCard = item.card;
            if (item.text) {
                this.navigationBar.setTitle(item.text);
            }
            if (Ext.platform.isPhone) {
                this.backButton.show();
                this.navigationBar.doLayout();
            }
        }     
       
        this.fireEvent('navigate', this, item, list);
    },
    
    onNavButtonTap : function() {
        this.navigationPanel.showBy(this.navigationButton, 'fade');
    },
    
    onBackButtonTap : function() {
        this.setCard(this.navigationPanel, {type: 'slide', direction: 'right'});
        this.currentCard = this.navigationPanel;
        if (Ext.platform.isPhone) {
            this.backButton.hide();
            this.navigationBar.setTitle(this.title);
            this.navigationBar.doLayout();
        }
        this.fireEvent('navigate', this, this.navigationPanel.activeItem, this.navigationPanel);
    },
    
    onOrientationChange : function(orientation, w, h) {
        Ext.ux.UniversalUI.superclass.onOrientationChange.call(this, orientation, w, h);
        
        if (!Ext.platform.isPhone) {
            if (orientation == 'portrait') {
                this.removeDocked(this.navigationPanel, false);
                this.navigationPanel.hide();
                this.navigationPanel.setFloating(true);
                this.navigationButton.show();
            }
            else {                
                this.navigationPanel.setFloating(false);
                this.navigationPanel.show();
                this.navigationButton.hide();
                this.insertDocked(0, this.navigationPanel);                
            }

            this.doComponentLayout();
            this.navigationBar.doComponentLayout();
        }
    }
});

sink.Main = {
    init : function() {
        this.sourceButton = new Ext.Button({
            text: 'Source',
            ui: 'action',
            hidden: true,
            handler: this.onSourceButtonTap,
            scope: this
        });
        
        this.codeBox = new Ext.ux.CodeBox({scroll: false});
        
        var sourceConfig = {
            items: [this.codeBox],
            scroll: 'both'
        };

        if (!Ext.platform.isPhone) {
            Ext.apply(sourceConfig, {
                width: 500,
                height: 500,
                floating: true
            });
        }
                
        this.sourcePanel = new Ext.Panel(sourceConfig);
        
        this.ui = new Ext.ux.UniversalUI({
            title: Ext.platform.isPhone ? 'Sink' : 'Kitchen Sink',
            navigationItems: sink.Structure,
            buttons: [{xtype: 'spacer'}, this.sourceButton],
            listeners: {
                navigate : this.onNavigate,
                scope: this
            }
        });
    },
    
    onNavigate : function(ui, item) {
        if (item.source) {
            if (this.sourceButton.hidden) {
                this.sourceButton.show();
                ui.navigationBar.doComponentLayout();
            }
            
            Ext.Ajax.request({
                url: item.source,
                success: function(response) {
                    this.codeBox.setValue(Ext.htmlEncode(response.responseText));                   
                },
                scope: this
            });
        }
        else {
            this.codeBox.setValue('No source for this example.');
            this.sourceButton.hide();
            this.sourceActive = false;
            this.sourceButton.setText('Source');
            ui.navigationBar.doComponentLayout();
        }
    },
    
    onSourceButtonTap : function() {
        if (!Ext.platform.isPhone) {
            this.sourcePanel.showBy(this.sourceButton.el, 'fade');
        }
        else {
            if (this.sourceActive) {
                this.ui.setCard(this.ui.currentCard, Ext.platform.isAndroidOS ? false : 'flip');
                this.sourceActive = false;
                this.ui.navigationBar.setTitle(this.currentTitle);
                this.sourceButton.setText('Source');
            }
            else {
                this.ui.setCard(this.sourcePanel, Ext.platform.isAndroidOS ? false : 'flip');
                this.sourceActive = true;
                this.currentTitle = this.ui.navigationBar.title;
                this.ui.navigationBar.setTitle('Source');
                this.sourceButton.setText('Example');
            }
            this.ui.navigationBar.doLayout();
        }
        this.sourcePanel.scroller.scrollTo({x: 0, y: 0});
    }
};

Ext.setup({
    tabletStartupScreen: 'resources/img/tablet_startup.png',
    phoneStartupScreen: 'resources/img/phone_startup.png',
    icon: 'resources/img/icon.png',
    glossOnIcon: false,
    
    onReady: function() {
        sink.Main.init();
    }
});