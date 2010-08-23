/**
 * @class Ext.platform
 * @singleton
 *
 * Determines information about the current platform the application is running
 * on.
 */
Ext.platform = {
    /**
     * Returns true if the application is running on a webkit browser.
     * @return Boolean
     */
    isWebkit: /webkit/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on a phone.
     * @return {Boolean} true if the application is running on a phone.
     */
    isPhone: /android|iphone/i.test(Ext.userAgent) && !(/ipad/i.test(Ext.userAgent)),

    /**
     * Returns true if the application is running on an iPad.
     * @return {Boolean} true if the application is running on an iPad.
     */
    isTablet: /ipad/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on Chrome.
     * @return {Boolean} true if the application is running on Chrome.
     */
    isChrome: /chrome/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on the Android OS.
     * @return {Boolean} true if the application is running on a phone.
     */
    isAndroidOS: /android/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on the iPhone OS.
     * @return {Boolean} true if the application is running on a phone.
     */
    isIPhoneOS: /iphone|ipad/i.test(Ext.userAgent),

    /**
     * Returns true if the browser has the 'orientationchange' event.
     * @return {Boolean} true if the browser has the 'orientationchange' event.
     */
    hasOrientationChange: ('onorientationchange' in window),

    /**
     * Returns true if the browser has the 'ontouchstart' event.
      * @return {Boolean} true if the browser has the 'ontouchstart' event.
     */
    hasTouch: ('ontouchstart' in window)
};

