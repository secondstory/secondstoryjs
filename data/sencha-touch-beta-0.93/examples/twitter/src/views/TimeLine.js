/**
* @class twitter.TimeLine
* @extends Ext.DataView
* Simple Twitter timeline component
*/
twitter.TimeLine = Ext.extend(Ext.DataView, {
    cls: 'timeline',
    scroll: false,

    tpl: [
    '<tpl for=".">',
        '<div class="tweet">',
            '<img src="{profile_image_url}" />',
            '<div class="x-tweetanchor"></div>',
                '<div class="tweet-bubble">',
                    '<div class="tweet-content">',
                        '<h2>{from_user}</h2>',
                        '<p>{text}</p><strong></strong>',
                        '<span class="posted">{created_at}</span>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>',
    '</tpl>'
    ].join(''),

    itemSelector: 'div.tweet',
    emptyText   : '<p style="padding: 10px">No tweets found matching that search</p>',

    initComponent: function() {
        this.store = new Ext.data.Store({
            proxy: 'twitter',
            autoLoad: false,

            model: "Tweet"
        });

        twitter.TimeLine.superclass.initComponent.apply(this, arguments);
    }    
});

Ext.reg('timeline', twitter.TimeLine);