steal.plugins('jquery/model/list')
     .then("//steal/generate/inflector", function($) {
   
	$.Model.List.extend("SS.Model.List", {
	});
});
