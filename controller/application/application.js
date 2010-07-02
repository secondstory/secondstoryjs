steal.plugins("ss/controller")
     .then(function($) {
     
  SS.Controller.extend('SS.Controller.Application',
  {
    hasActiveElement : document.activeElement || false
  },
  {    
    'a click': function(element, event) {
      if ($(element).is("[rel=internal]")) {
        return true;
      }
    
      /*if(is_right_click(event)) {
        event.preventDefault();
        return false;
      }*/

      //@steal-remove-start
      //steal.dev.log('HIJACKED LINK!');
      //@steal-remove-end
      
      // if the link goes outside the site, let browser handle it
      /*if (element.hostname !== window.location.hostname) { 
        return;
      }

      // if the link goes to an audio clip or video, let browser handle it
      if (element.pathname.search(/[.](mp3|flv|mov)$/) !== -1) { 
        return;
      }*/
      
      // otherwise, hijack it and pass it over to the router
      event.preventDefault();
      this.routeTo($(element).attr("href"));
    }
  }
  );

});
