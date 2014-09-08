require.config({
  
 

  paths: {

    'jquery': 'vendor/jquery/dist/jquery',
    'underscore': 'vendor/underscore-amd/underscore',
    'backbone': 'vendor/backbone-amd/backbone',
    'mustache': 'vendor/mustache/mustache',
    'bootstrap' :'//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min',
    'async':'vendor/requirejs-plugins/src/async'
  },

  shim : {
        "bootstrap" : { "deps" :['jquery'] }
    },
});


requirejs(['mapservice']);