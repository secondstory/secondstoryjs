/**
 * @class Ext.Map
 * @extends Ext.Component
 *
 * <p>Wraps a Google Map in an Ext.Component.<br/>
 * http://code.google.com/apis/maps/documentation/v3/introduction.html</p>
 *
 * <p>To use this component you must include an additional JavaScript file from
 * Google.</p>
 *
 * <pre><code>
&lt;script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"&gt;&lt/script&gt;</code></pre>
 *
 * An example of using the Map component:
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    items: [{
        xtype: 'map',
        getLocation: true
    }
});</code></pre>
 * @xtype map
 */
Ext.Map = Ext.extend(Ext.Component, {

    /**
     * @constructor
     * @param {Object} config
     * Create a new Ext.Map
     */

    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to the Maps's element (defaults to <code>'x-map'</code>).
     */
    baseCls: 'x-map',

    /**
     * @cfg {Boolean} getLocation
     * Pass in true to center the map based on the geolocation coordinates.
     */
    getLocation: false,

    /**
     * @cfg {Object} mapOptions
     * MapOptions as specified by the Google Documentation:
     * http://code.google.com/apis/maps/documentation/v3/reference.html
     */

    /**
     * @type {google.maps.Map}
     * The wrapped map.
     */
    map: null,

    /**
     * @type {Ext.util.GeoLocation}
     */
    geo: null,

    maskMap: false,


    initComponent : function() {
        this.mapOptions = this.mapOptions || {};

        Ext.Map.superclass.initComponent.call(this);

        if (this.getLocation) {
            this.geo = new Ext.util.GeoLocation();
            this.geo.on('update', this.onGeoUpdate, this);
        }
        else {
            this.on({
                afterrender: this.update,
                activate: this.onUpdate,
                scope: this,
                single: true
            });
        }
    },

    onGeoUpdate : function(coords) {
        if (coords) {
            this.mapOptions.center = new google.maps.LatLng(coords.latitude, coords.longitude);
        }

        if (this.rendered) {
            this.update();
        }
        else {
            this.on('activate', this.onUpdate, this, {single: true});
        }
    },

    onUpdate : function(map, e, options) {
        this.update(options.data || null);
    },

    update : function(data) {
        var geocoder;

        if (Ext.platform.isTablet && Ext.platform.isIPhoneOS) {
            Ext.apply(this.mapOptions, {
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.ZOOM_PAN
                }
            });
        }

        Ext.applyIf(this.mapOptions, {
            center: new google.maps.LatLng(37.381592,-122.135672), // Palo Alto
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        if (!this.hidden && this.rendered) {

            if (this.maskMap && !this.mask) {
                this.el.mask();
                this.mask=true;
            }

            if (this.map && this.el && this.el.dom && this.el.dom.firstChild) {
                Ext.fly(this.el.dom.firstChild).remove();
            }
            this.map = new google.maps.Map(this.el.dom, this.mapOptions);
        }
        else {
            this.on('activate', this.onUpdate, this, {single: true, data: data});
        }
    }
});

Ext.reg('map', Ext.Map);