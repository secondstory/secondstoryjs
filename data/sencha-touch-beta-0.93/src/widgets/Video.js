/**
 * @class Ext.Video
 * @extends Ext.Media
 *
 * Provides a simple Container for HTML5 Video.
 *
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    items: [{
        floating: true,
        x: 600,
        y: 300,
        width: 175,
        height: 98,
        xtype: 'video',
        url: "porsche911.mov",
        poster: 'porsche.png'
    }]
});</code></pre>
 * @xtype video
 */
Ext.Video = Ext.extend(Ext.Media, {
    /**
     * @constructor
     * @param {Object} config
     * Create a new Video Panel.
     */

    /**
     * @cfg {String} url
     * Location of the video to play. This should be in H.264 format and in a
     * .mov file format.
     */

    /**
     * @cfg {String} poster
     * Location of a poster image to be shown before showing the video.
     */
    poster: '',
    
    // private
    cmpCls: 'x-video',

    afterRender : function() {
        Ext.Video.superclass.afterRender.call(this);
        if (this.poster) {
            this.media.hide();
            this.ghost = this.el.createChild({
                cls: 'x-video-ghost',
                style: 'width: 100%; height: 100%; background: #000 url(' + this.poster + ') center center no-repeat; -webkit-background-size: 100% auto;'
            });
            this.ghost.on('tap', this.onGhostTap, this, {single: true});
        }
    },
    
    onGhostTap: function(){
        this.media.show();
        this.ghost.hide();
        this.play();
    },
    
    // private
    getConfiguration: function(){
        return {
            tag: 'video',
            width: '100%',
            height: '100%'
        };
    }    
});

Ext.reg('video', Ext.Video);