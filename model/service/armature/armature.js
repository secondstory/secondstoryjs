steal.plugins('jquery/model/service/json_rest', 'ss/model').then(function($){
    
  SS.Model.service.armature = $.Model.service.jsonRest({
	  url : '/srv/'
  });

});
