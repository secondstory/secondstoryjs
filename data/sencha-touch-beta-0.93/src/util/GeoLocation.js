/**
 * @class Ext.util.GeoLocation
 * @extends Ext.util.Observable
 *
 * Provides a cross-browser wrapper around the W3C Geolocation Spec.
 * http://dev.w3.org/geo/api/spec-source.html
 */
Ext.util.GeoLocation = Ext.extend(Ext.util.Observable, {
    /**
     * @type Object
     * Latitude and Longitude Coordinates
     * An object with the following properties:
     * <ul>
     * <li>latitude</li>
     * <li>longitude</li>
     * <li>original - The original browser location object.</li>
     * </ul>
     */
    coords: null,

    /**
     * @type Boolean
     * Determines whether the browser has GeoLocation or not.
     */
    hasGeoLocation: false,

    /**
     * @cfg {Boolean} autoUpdate
     * When set to true, continually monitor the location of the device
     * and fire update events. (Defaults to true.)
     */
    autoUpdate: true,

    /**
     * @constructor
     * @param config {Object}
     */
    constructor : function(config) {
        config = config || {};
        Ext.apply(this, config);

        this.hasGeoLocation = !!navigator.geolocation;

        /**
         * @event update
         * @param {Cooridinates} coord A coordinate object as defined by the coords property. Will return false if geolocation is disabled or denied access.
         * @param {Ext.util.GeoLocation} this
         */
        this.addEvents('beforeupdate','update');

        Ext.util.GeoLocation.superclass.constructor.call(this);

        if (this.autoUpdate) {
            this.updateLocation();
        }
    },

    /**
     * Returns cached coordinates, and updates if there are no cached coords yet.
     */
    getLocation : function(callback, scope) {
        var me = this;
        if (me.hasGeoLocation && !me.coords) {
            me.updateLocation(callback, scope);
        }
        else if (me.hasGeoLocation && callback) {
            setTimeout(function() {
                callback.call(scope || me, me.coords, me);
            }, 0);
        }
        else if (callback) {
            setTimeout(function() {
                callback.call(scope || me, null, me);
            }, 0);
        }
    },

    /**
     * Forces an update of the coords.
     */
    updateLocation : function(callback, scope) {
        var me = this;
        if (me.hasGeoLocation) {
            me.fireEvent('beforeupdate', me);
            navigator.geolocation.getCurrentPosition(function(position) {
                me.coords = me.parseCoords(position);
                if (callback) {
                    callback.call(scope || me, me.coords, me);
                }
                me.fireEvent('update', me.coords, me);
            });
        }
        else {
            setTimeout(function() {
                if (callback) {
                    callback.call(scope || me, null, me);
                }
                me.fireEvent('update', false, me);
            }, 0);
        }
    },

    // @private
    parseCoords : function(location) {
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            original: location
        };
    }
});
