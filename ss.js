//@steal-remove-start
steal({ path: 'resources/debug.js', ignore: true });
//@steal-remove-end

steal.plugins('jquery/view/ejs')
     .plugins('ss/router',
              'ss/model',
              'ss/controller/autoloading',
              'ss/controller/map_states_to_class',
              //'ss/controller/google_analytics_watcher',
              'ss/controller')
     //.plugins('ss/controller/application')
     
