Ext.ns('Solitaire');

Ext.onReady(function() {
    var loadingMask = Ext.get('loading-mask');    
    
    Solitaire.Index.index();
    loadingMask.addClass(Ext.orientation);
    
    (function() {
        loadingMask.addClass('fadeout');
        
        (function() {
            loadingMask.remove();
        }).defer(1050);
    }).defer(1000);
});
