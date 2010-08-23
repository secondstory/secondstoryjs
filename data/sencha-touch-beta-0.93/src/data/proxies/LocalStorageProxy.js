/**
 * @class Ext.data.LocalStorageProxy
 * @extends Ext.data.WebStorageProxy
 * <p>Proxy which uses HTML5 local storage as its data storage/retrieval mechanism.
 * If this proxy is used in a browser where local storage is not supported, the constructor will throw an error. 
 * A local storage proxy requires a unique ID which is used as a key in which all record data are stored in the
 * local storage object.</p>
 * <p>It's important to supply this unique ID as it cannot be reliably determined otherwise. If no id is provided
 * but the attached store has a storeId, the storeId will be used. If neither option is presented the proxy will
 * throw an error.</p>
 * <p>Proxies are almost always used with a {@link Ext.data.Store store}:<p>
<pre><code>
new Ext.data.Store({
    proxy: {
        type: 'localstorage',
        id  : 'myProxyKey'
    }
});
</code></pre>
 * <p>Alternatively you can instantiate the Proxy directly:</p>
<pre><code>
new Ext.data.LocalStorageProxy({
    id  : 'myOtherProxyKey'
});
</code></pre>
 */
Ext.data.LocalStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    //inherit docs
    getStorageObject: function() {
        return localStorage;
    }
});

Ext.data.ProxyMgr.registerType('localstorage', Ext.data.LocalStorageProxy);