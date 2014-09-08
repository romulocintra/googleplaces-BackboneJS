define([
  'underscore',
  'backbone',
  'models/modelsmap'
], function(_, Backbone, MapModel){
  var PlacesCollection = Backbone.Collection.extend({
    
    model: MapModel,
   
  });
  return PlacesCollection;
});