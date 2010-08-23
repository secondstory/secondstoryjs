Ext.MessageBoxWindow = Ext.extend(Ext.Panel, {
    // hide it by offsets on initial render.
    x: -1000,
    y: -1000,
    
    hideOnMaskTap: false,
    modal: true,
    floating: true,
    height: 200,
    width: 300,
    
    layout: 'card',
    
    buttonText: {
        ok: 'Ok',
        cancel: 'Cancel',
        yes: 'Yes',
        no: 'No'
    },
    
    titleText: {
        confirm: 'Confirm',
        prompt: 'Prompt',
        wait: 'Loading...',
        alert: 'Attention'
    },
    
    makeButton: function(btn) {
        return new Ext.Button({
//            baseCls: 'x-button',
            handler: this.btnCallback.createDelegate(this, [btn]),
            scope: this,
            text: this.buttonText[btn],
            hidden: true
        });
    },
        
    btnCallback: function(btn) {
        var value, field;
        if (this.type == 'prompt') {
            if (this.multiline) {
                field = this.textAreaCard;
            } else {
                field = this.textFieldCard;
            }
            value = field.getValue();
            field.reset();
        }
        this.userCallback(btn, value);
    },
    
    initComponent: function() {
        this.topTb = new Ext.Toolbar({
            dock: 'top',
            title: ''
        });
        
        this.okBtn = this.makeButton('ok');
        this.cancelBtn = this.makeButton('cancel');
        this.yesBtn = this.makeButton('yes');
        this.noBtn = this.makeButton('no');
        
        this.bottomTb = new Ext.Toolbar({
            dock: 'bottom',
            items: [
                this.cancelBtn,
                this.noBtn,
                {xtype: 'component', flex: 1},
                this.okBtn,
                this.yesBtn
            ]
        });
        this.dockedItems = [this.topTb, this.bottomTb];
        
        
        this.textCard = new Ext.Component({
            styleHtmlContent: true
        });
        this.textFieldCard = new Ext.form.TextField();
        this.textAreaCard = new Ext.form.TextArea();
        this.items = [this.textCard, this.textFieldCard, this.textAreaCard];
        
        Ext.MessageBoxWindow.superclass.initComponent.call(this);

    },
    
    afterRender: function() {
        Ext.MessageBoxWindow.superclass.afterRender.apply(this, arguments);
        // hide the Panel via offsets.
        this.getVisibilityEl().setDisplayMode(Ext.Element.OFFSETS);
    },
    
    reconfigure: function(type, cfg) {
        cfg = cfg || {};
        this.type = type;
        if (!this.rendered) {
            this.render(Ext.getBody());
        }
        
        // wrap the user callback
        this.userCallback = (cfg.callback || Ext.emptyFn).createDelegate(cfg.scope || window);
        
        var okCancelMth, yesNoMth, card;
        switch (type) {
            case 'confirm':
                okCancelMth = 'hide';
                yesNoMth = 'show';
                this.textCard.update(cfg.text);
                this.getLayout().setActiveItem(this.textCard);                
                break;
            case 'prompt':
                okCancelMth = 'show';
                yesNoMth = 'hide';
                this.multiline = cfg.multiline;
                if (cfg.multiline) {
                    this.getLayout().setActiveItem(this.textAreaCard);
                } else {
                    this.getLayout().setActiveItem(this.textFieldCard);
                }
                break;
            case 'wait':
                okCancelMth = 'hide';
                yesNoMth = 'hide';
                this.textCard.update(cfg.text);
                this.getLayout().setActiveItem(this.textCard);                
                break;
            case 'alert':
                okCancelMth = 'hide';
                yesNoMth = 'hide';
                this.textCard.update(cfg.text);
                this.getLayout().setActiveItem(this.textCard);
                break;
        }
        if (okCancelMth == 'hide' && yesNoMth == 'hide' && this.type !== 'alert') {
            this.bottomTb.hide();
        } else {
            this.bottomTb.show();
        }
        this.yesBtn[yesNoMth]();
        this.noBtn[yesNoMth]();
        this.okBtn[this.type == 'alert' ? 'show' : okCancelMth]();
        this.cancelBtn[okCancelMth]();        
        this.bottomTb.doLayout();        
        this.topTb.setTitle(cfg.title || this.titleText[type]);
    },
    
    showType: function(type, cfg) {
        this.reconfigure(type, cfg);
        this.setCentered(true, true);
        this.show();
        return this;
    },
    
    confirm: function(cfg) {
        return this.showType('confirm', cfg);
    },
    prompt: function(cfg) {
        return this.showType('prompt', cfg);
    },
    wait: function(cfg) {
        return this.showType('wait', cfg);
    },
    alert: function(cfg) {
        return this.showType('alert', cfg);
    }
});
Ext.MessageBox = new Ext.MessageBoxWindow();

Geo.Util = {
    openUrl: function(url) {
        Ext.MessageBox.confirm({
            text: 'This link will open in an external browser window. Would you like to continue?',
            callback: function(btn) {
                if (btn == 'yes' && Ext.platform.isAndroidOS) {
                    Ext.MessageBox.hide();
                    window.open(url, "_new");
                } else if (btn == 'no') {
                    Ext.MessageBox.hide();
                }
            }
        });
        if (!Ext.platform.isAndroidOS) {
            var link = '<a href="' + url + '" target="_new" onclick="Ext.MessageBox.hide()">Yes</a>';
            Ext.MessageBox.yesBtn.setText(link);
        }
    }
};