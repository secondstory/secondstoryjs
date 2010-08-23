Ext.regModel('Tweet', {
    fields: [
        {name: 'id',                type: 'int'},
        {name: 'profile_image_url', type: 'string'},
        {name: 'from_user',         type: 'string'},
        {name: 'text',              type: 'string'}
    ]
});