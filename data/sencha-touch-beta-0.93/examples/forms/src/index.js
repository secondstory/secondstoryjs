Ext.setup({
    icon: 'icon.png',
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    glossOnIcon: false,
    onReady: function() {
        Ext.regModel('User', {
            fields: [
                {name: 'name',     type: 'string'},
                {name: 'password', type: 'password'},
                {name: 'email',    type: 'string'},
                {name: 'url',      type: 'string'},
                {name: 'rank',     type: 'string'},
                {name: 'value',    type: 'int'},
                {name: 'enable',   type: 'boolean'},
                {name: 'cool',     type: 'boolean'},
                {name: 'color',    type: 'string'},
                {name: 'team',     type: 'string'},
                {name: 'secret',   type: 'boolean'}
            ]
        });
        
         Ext.regModel('Ranks', {
            fields: [
                {name: 'rank',     type: 'string'},
                {name: 'title',    type: 'string'}
            ]
         });

        var ranksStore = new Ext.data.JsonStore({
           data : [
                { rank : 'master',  title : 'Master'},
                { rank : 'padawan', title : 'Student'},
                { rank : 'teacher', title : 'Instructor'},
                { rank : 'aid',     title : 'Assistant'}
           ],
           model : 'Ranks',
           autoLoad : true,
           autoDestroy : true
        });

        var formBase = {
            scroll: 'vertical',
            url   : 'postUser.php',
            standardSubmit : false,
            items: [
                {
                    xtype: 'fieldset',
                    title: 'Personal Info',
                    instructions: 'Please enter the information above.',
                    defaults: {
                        required: true,
                        labelAlign: 'left'
                    },
                    items: [{
                        xtype: 'textfield',
                        name : 'name',
                        label: 'Name',
                        autoCapitalize : false
                    }, {
                        xtype: 'passwordfield',
                        name : 'password',
                        label: 'Password'
                    }, {
                        xtype: 'textfield',
                        name : 'disabled',
                        label: 'Disabled',
                        disabled: true
                    }, {
                        xtype: 'emailfield',
                        name : 'email',
                        label: 'Email',
                        placeHolder: 'you@domain.com'
                    }, {
                        xtype: 'urlfield',
                        name : 'url',
                        label: 'Url',
                        placeHolder: 'http://google.com'
                    }, {
                        xtype: 'checkbox',
                        name : 'cool',
                        label: 'Cool'
                    }, {
                        xtype: 'spinnerfield',
                        name : 'spinner',
                        label: 'Spinner'
                    }, {
                        xtype: 'select',
                        name : 'rank',
                        label: 'Rank',
                        valueField : 'rank',
                        displayField : 'title',
                        store : ranksStore
                    }, {
                        xtype: 'hidden',
                        name : 'secret',
                        value: false
                    }, {
                        xtype : 'textarea',
                        name  : 'bio',
                        label : 'Bio',
                        maxLength : 60,
                        maxRows : 10
                    }, {
                        xtype: 'slider',
                        name : 'height',
                        label: 'Height'
                    }, {
                        xtype: 'toggle',
                        name : 'enable',
                        label: 'Security Mode'
                    }, {
                        xtype: 'radio',
                        name: 'team',
                        label: 'Red Team',
                        inputValue : 'redteam'
                    }, {
                        xtype: 'radio',
                        name: 'team',
                        label: 'Blue Team',
                        inputValue: 'blueteam'
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Favorite color',
                    defaults: { xtype: 'radio' },
                    items: [
                        { name : 'color', label: 'Red', inputValue : 'red' },
                        { name : 'color', label: 'Blue' , inputValue : 'blue'},
                        { name : 'color', label: 'Green' , checked : true, inputValue : 'green'},
                        { name : 'color', label: 'Purple' , inputValue : 'purple'}
                    ]
                }, {
                    xtype: 'fieldset',
                    title: 'HTML5',
                    items: [{
                        xtype: 'numberfield',
                        name: 'number',
                        label: 'Number',
                        maxValue : 20,
                        minValue : 2
                    }, {
                        xtype: 'emailfield',
                        name: 'email',
                        label: 'Email'
                    }, {
                        xtype: 'urlfield',
                        name: 'url',
                        label: 'URL'
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Single Select (in fieldset)',
                    items: [{
                        xtype: 'select',
                        name: 'options',
                        options: [
                            {text: 'This is just a big select',  value: '1'},
                            {text: '2', value: '2'}
                        ]
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Single Text (in fieldset)',
                    items: [{
                        xtype: 'textfield',
                        name: 'single_text'
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Single Toggle (in fieldset)',
                    items: [{
                        xtype: 'toggle',
                        name: 'single_toggle',
                        value : 1
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Single Slider (in fieldset)',
                    items: [{
                        xtype: 'slider',
                        name: 'single_slider',
                        value : 60
                    }]
                }
            ],
            listeners : {
                submit : function(form, result){
                    console.log('success', Ext.toArray(arguments));
                },
                exception : function(form, result){
                    console.log('failure', Ext.toArray(arguments));
                }
            },

            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        {
                            text: 'Load Model',
                            ui: 'round',
                            handler: function() {
                                formBase.user = Ext.ModelMgr.create({
                                    'name'    : 'Akura',
                                    'password': 'secret',
                                    'email'   : 'saru@extjs.com',
                                    'url'     : 'http://extjs.com',
                                    'single_slider': 20,
                                    'enable'  : 1,
                                    'cool'    : true,
                                    'team'    : 'redteam',
                                    'color'   : 'red',
                                    'rank'    : 'padawan',
                                    'secret'  : true,
                                    'bio'     : 'Learned the hard way !'
                                }, 'User');

                                form.loadModel(formBase.user);
                            }
                        },
                        {xtype: 'spacer'},
                        {
                            text: 'Reset',
                            handler: function() {
                                form.reset();
                            }
                        },
                        {
                            text: 'Save',
                            ui: 'action',
                            handler: function() {
                                if(formBase.user){
                                    form.updateModel(formBase.user, true);
                                }
                                form.submit({
                                    waitMsg : {message:'Submitting', cls : 'demos-loading'}
                                });
                            }
                        }
                    ]
                }
            ]
        };

        if (Ext.platform.isAndroidOS) {
            formBase.items.unshift({
                xtype: 'component',
                styleHtmlContent: true,
                html: '<span style="color: red">Forms on Android are currently under development. We are working hard to improve this in upcoming releases.</span>'
            });
        }

        if (Ext.platform.isPhone) {
            formBase.fullscreen = true;
        } else {
            Ext.apply(formBase, {
                autoRender: true,
                floating: true,
                modal: true,
                centered: true,
                hideOnMaskTap: false,
                height: 385,
                width: 480
            });
        }

        form = new Ext.form.FormPanel(formBase);
        form.show();
    }
});