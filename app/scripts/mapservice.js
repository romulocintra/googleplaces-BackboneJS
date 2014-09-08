//---------------------------------------
    // The Application
    // ---------------
    //  Module Definitions with Requires JS (Better for big scalable APPS)
    //---------------------------------------


define(['jquery',
       'underscore',
       'backbone',
       'mustache', 
       'collections/collectionsmap',
       'bootstrap',
        'async!http://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&sensor=true&key=AIzaSyDbnea4iwHpXDh_ZodFdXTMt7LYevhmXN8'],
        function ($, _, Backbone, Mustache, PlacesCollection) {
 

        //---------------------------------------
        // "Global" Vars
        //---------------------------------------

    var place;
    var service;
    var collection = new PlacesCollection();
    var input = /** @type {HTMLInputElement} */
    (
    document.getElementById('autocomplete'));
    var landing = /** @type {HTMLInputElement} */
    (
    document.getElementById('showresults'));
    var autocomplete;


    //---------------------------------------
    // The AppView
    // ---------------
    //  The view that is first initiated and have the core and listener 
    //  for the autocomplete and the google maps (places) Apis
    //---------------------------------------
    var AppView = Backbone.View.extend({

        //---------------------------------------
        //   _initialize_autocomplete 
        //    Trigger Autocomple Box and the Callback to Select the Kind of Input  autocompleted or Regular text
        //---------------------------------------
       
        _initialize_autocomplete: function () {

            autocomplete = new google.maps.places.Autocomplete(input);
            google.maps.event.addListener(autocomplete, 'place_changed', this._onPlaceChanged);

        },

      
        //---------------------------------------
        //  _onPlaceChanged
        //   This Function handles the majority of the process 
        //
        //    1. If the Input is based in autocomplete choice 
        //    It send direct request to Nearby Search Google Maps Api. 
        //   
        //    2. If the input is based in a typed value will use textsearch Google Maps Api
        //    else will show Not working
        //---------------------------------------
       
        _onPlaceChanged: function () {


            if (autocomplete.getPlace()) {

                place = autocomplete.getPlace();
                if (place.geometry) { 
                    collection.reset();
                    this._onNearbySearch(place);

                } else {
                    collection.reset();
                    place = input.value;
                    this._onTextSearch(place);

                }

            } else {
                autocomplete.placeholder = 'NOT WORKING';
            }
        },

        //---------------------------------------
        //  _onNearbySearch 
        // Send PLaces to Parser 
        // When is used nearby search the adress already comes 
        // with adress_components and we only need to parse them and present
        //---------------------------------------
        _onNearbySearch: function (place) {
            //console.log(place);
           this._parseSearchResults(place);
        },

        //---------------------------------------
        //  _onTextSearch 
        //  Trigger a search based on typed text eg. "Starbucks Berlin"  
        //---------------------------------------
        _onTextSearch: function (place) {
            var fake = new google.maps.LatLng(-33.8665433, 151.1956316);
            var request = {
                location: fake,
                radius: '500',
                query: place
            };

            service = new google.maps.places.PlacesService(landing);
            service.textSearch(request, this._textSearchcallback);
            //console.log(service.PlacesServiceStatus);
        }, 
        

         //---------------------------------------
         //   _onSearchDetails:
         //   Get specific details like adress_components from the place using the reference parameter
         //---------------------------------------


               _onSearchDetails: function (refer) {
            //console.log(refer);

            var request = {
                reference: refer,
            };


            service = new google.maps.places.PlacesService(landing);
            service.getDetails(request, this._searchDetailsCallback);

        },


        //--------------------------------------

        // CALLBACK FUNCTIONS 
        
        //---------------------------------------
        //  Callback funtion from  _onTextSearch that process the results finding the reference of every
        //  single result , after that we need to acess the the  adress_components array and we use the reference that comes
        //   with result to find the specific adress details
        //---------------------------------------
        
        _textSearchcallback: function (results, status) {

            if (status == google.maps.places.PlacesServiceStatus.OK) {
                //console.log(results.length);
                for (var i = 0; i < results.length; i++) {
                    var places = results[i];
                    refer = results[i].reference;
                    this._onSearchDetails(refer);
                    //console.log(results[i]); 
                }


            }

        },

        //---------------------------------------
        // _searchDetailsCallback: 
        // Send results to parser after confirm the status of request
        //---------------------------------------
    

        _searchDetailsCallback: function (place, status) {

            if (status == google.maps.places.PlacesServiceStatus.OK) { 
                       
                  this._parseSearchResults(place);
               }
        },
         

         //-----------------------------------------------
         // PARSE AND RENDER

         //---------------------------------------
        // _parseSearchResults:
        //  Parse results and add them to collections 
        //---------------------------------------
      


    _parseSearchResults : function (place) {

                var arrAddress = place.address_components;
                var itemRoute = '';
                var itemLocality = '';
                var itemPcode = '';
                var itemSnumber = '';
                var placestore = [];
                //console.log(place.address_components.length);
                for (var i = 0; i < place.address_components.length; i++) {
                    switch (place.address_components[i].types[0]) {
                    case "route":
                        //console.log(place.address_components[i].long_name);
                        itemRoute = place.address_components[i].long_name;
                        break;
                    case "street_number":
                        //console.log(place.address_components[i].long_name);
                        itemSnumber = place.address_components[i].long_name;
                        break;

                    case "locality":
                        //console.log(place.address_components[i].long_name);
                        itemLocality = place.address_components[i].long_name;
                        break;


                    case "postal_code":
                        //console.log(place.address_components[i].long_name);
                        itemPcode = place.address_components[i].long_name;
                        break;

                    }

                }
                placestore = {
                    name: place.name,
                    route: itemRoute,
                    street_number: itemSnumber,
                    locality: itemLocality,
                    postal_code: itemPcode,

                },



                collection.add(placestore);
                //console.log(collection.models);  
    },





        //---------------------------------------
        // Render Table that initiates the table view
        //---------------------------------------
        _render_table: function () {

            var ViewNew = new TableView;
            ViewNew.render();
        },



        initialize: function () {

            //Use underscore to bind functions and acess this 
            _.bindAll(this, '_parseSearchResults', '_render_table', '_onSearchDetails', '_searchDetailsCallback', '_onPlaceChanged', '_onNearbySearch', '_initialize_autocomplete', '_textSearchcallback');

            this._initialize_autocomplete();
            collection.on("add", this._render_table);
         
        }

    });

    //TABLE VIEW
    var TableView = Backbone.View.extend({
           render: function () {
            var tt = collection.toJSON();
            var table = {
                rows: tt,

            };


    var template = '<table class="table table-condensed"><thead><tr><th>Name:</th><th>Street ,Number </th><th>Zip Code</th><th>City</th></tr></thead><tbody>{{#rows}}<tr><td>{{name}}</td><td>{{route}} {{street_number}}</td><td>{{postal_code}}</td><td>{{locality}}</td></tr>{{/rows}}</tbody></table>';
   
            var html = Mustache.to_html(template, table);
            
            $('#showresults2').html(html);





        }
    })


    $(function () {
        App = new AppView();
    });




});