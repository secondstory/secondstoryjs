/**
 * @class Ext.Audio
 * @extends Ext.Media
 *
 * Provides a simple container for HTML5 Audio.
 * Recommended types: Uncompressed WAV and AIF audio, MP3 audio, and AAC-LC or HE-AAC audio
 *
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    items: [{
        xtype: 'audio',
        url: "who-goingmobile.mp3"
    }]
});</code></pre>
 * @xtype audio
 */
Ext.Audio = Ext.extend(Ext.Media, {
    /**
     * @constructor
     * @param {Object} config
     * Create a new Audio container.
     */

    /**
     * @cfg {String} url
     * Location of the audio to play.
     */

    cmpCls: 'x-audio',
    
    // @private
    onActivate: function(){
        Ext.Audio.superclass.onActivate.call(this);
        if (Ext.platform.isPhone) {
            this.media.show();
        }    
    },
    
    // @private
    onDeactivate: function(){
        Ext.Audio.superclass.onDeactivate.call(this);
        if (Ext.platform.isPhone) {
            this.media.hide();
        }
    },
    
    // @private
    getConfiguration: function(){
        var hidden = !this.enableControls;
        if (Ext.platform.isPhone) {
            return {
                tag: 'embed',
                type: 'audio/mpeg',
                target: 'myself',
                controls: 'true',
                hidden: hidden
            };
        } else {
            return {
                tag: 'audio',
                hidden: hidden
            };
        }    
    }
});

Ext.reg('audio', Ext.Audio);