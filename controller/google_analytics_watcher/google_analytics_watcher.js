steal.plugins("jquery/controller/subscribe", "jquery/controller", "jquery/controller/history")
     .then(function($) {
     
  $.Controller.extend('SS.Controller.GoogleAnalyticsWatcher',
  {
  },
  {
    // Google analytics logging
    "history.** subscribe": function(event_name) {
      if (typeof _gaq !== "undefined") {
        var key = event_name.replace(/^history(\.*)/, '#/');
        _gaq.push(['_trackPageview', key]);
        
        //@steal-remove-start
        //steal.dev.log('Tracking link...');
        //@steal-remove-end
      }
    }
  }
  );
});
