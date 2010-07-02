//@steal-remove-start
steal({ path: 'resources/debug.js', ignore: true });
//@steal-remove-end

steal.plugins('jquery/view/ejs')
     .plugins('ss/router',
              'ss/model',
              'ss/controller/autoloading',
              'ss/controller/opaque_states_watcher',
              //'ss/controller/google_analytics_watcher',
              'ss/controller')
     //.plugins('ss/controller/application')
     
