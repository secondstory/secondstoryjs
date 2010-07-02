steal.plugins("jquery/controller/view", 
              "ss/controller/state_machine", 
              "ss/router").then(function($) {
  SS.Controller.StateMachine.extend('SS.Controller',
  {
  },
  {    
    updateClassString: function(prefix, newValue, endValue) {
      var oldString = this.element[0].className,
          r         = new RegExp("(" + prefix + "\\d+)");
      
      newString = oldString.replace(r, '');
      newString += ' ' + prefix + newValue;
      
      newString = newString.replace(prefix + "First", "");
      if (newValue == 0) {
        newString += ' ' + prefix + 'First';
      }
      
      newString = newString.replace(prefix + "Last", "");
      if (newValue === endValue) {
        newString += ' ' + prefix + 'Last';
      }
      
      this.element[0].className = newString.replace(/(\s+)/g, " ");
    },
    
    currentParams: function() {
      return SS.Router.currentParams;
    },
    
    routeTo: function(uri) {
      SS.Router.routeTo(uri);
    }
  }
  );
})
