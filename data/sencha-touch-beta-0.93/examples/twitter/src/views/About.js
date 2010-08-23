/**
 * @class twitter.About
 * @extends Ext.Panel
 * Simple floating panel containing some about text
 */
twitter.About = Ext.extend(Ext.Panel, {
    width: 500,
    height: 400,
    floating: true,
    centered: true,
    modal: true,
    scroll: 'vertical',
    styleHtmlContent: true,
    
    dockedItems: [{
        dock: 'top',
        xtype: 'toolbar',
        title: 'About The Twitter App',
        items: [{
            text: 'Close',
            handler: function(){
                this.ownerCt.ownerCt.hide();
            }
        }]
    }],
    items: [{
        style: 'padding: 10px;',
        html: [
            '<p>The Twitter app is a simple demonstration of the Ext.data package.</p>',
            '<p>The left menu bar features a very simple DataView (see src/views/SearchBar.js) which uses',
            'a Store with a LocalStorageProxy to save recent searches locally. These then return when you refresh the page</p>',
            '<p>The central pane is also a DataView, this time using a Store which is bound to a ScriptTagProxy - see src/TwitterProxy.js.</p>',
            '<p>Finally, two simple Models are defined (see src/models/Tweet.js and src/models/Search.js). These are used by the TimeLine and',
            'the SearchBar respectively for saving and retrieving Tweets and saved Searches.</p>'
        ].join("")
    }]
});