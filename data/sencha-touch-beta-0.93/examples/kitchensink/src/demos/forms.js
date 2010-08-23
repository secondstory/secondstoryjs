demos.Forms = new Ext.form.FormPanel({
    scroll: 'vertical',
    items: [{
        xtype: 'fieldset',
        title: 'Personal Info',
        instructions: 'Please enter the information above.',
        items: [{
            xtype: 'textfield',
            name: 'name',
            label: 'Name'
        },
        {
            xtype: 'passwordfield',
            name: 'password',
            label: 'Password'
        },
        {
            xtype: 'emailfield',
            name: 'email',
            label: 'Email',
            placeholder: 'you@domain.com'
        },
        {
            xtype: 'urlfield',
            name: 'url',
            label: 'Url',
            placeholder: 'http://google.com'
        },
        {
            xtype: 'checkbox',
            name: 'cool',
            label: 'Cool'
        },
        {
            xtype: 'select',
            name: 'rank',
            label: 'Rank',
            options: [{
                text: 'Master',
                value: 'master'
            },
            {
                text: 'Student',
                value: 'padawan'
            }]
        },
        {
            xtype: 'hidden',
            name: 'secret',
            value: false
        },
        {
            xtype: 'textarea',
            name: 'bio',
            label: 'Bio'
        }]
    },
    {
        xtype: 'fieldset',
        title: 'Favorite color',
        defaults: {
            xtype: 'radio'
        },
        items: [{
            name: 'color',
            label: 'Red'
        },
        {
            name: 'color',
            label: 'Blue'
        },
        {
            name: 'color',
            label: 'Green'
        },
        {
            name: 'color',
            label: 'Purple'
        }]
    },
    {
        xtype: 'slider',
        name: 'value',
        label: 'Value'
    },
    {
        xtype: 'toggle',
        name: 'enable',
        label: 'Enable'
    }]
});

if (Ext.platform.isAndroidOS) {
    demos.Forms.insert(0, {
        xtype: 'component',
        styleHtmlContent: true,
        html: '<span style="color: red">Forms on Android are currently under development. We are working hard to improve this in upcoming releases.</span>'
    });
}