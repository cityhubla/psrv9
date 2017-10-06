//Global Variables
var selectedapn;
var selectedaddress;
var hazardous_data={type: 'FeatureCollection',features: []};
var sensitive_data={type: 'FeatureCollection',features: []};

//Loads mapbox map, linked to mapstyle psr_v5
mapboxgl.accessToken = 'pk.eyJ1IjoiaGhwc3JsYSIsImEiOiJjaW1sanhqa3kwNmdidHZtMHEyZ2VrdHV4In0.JSLojS72jB2OWG5NN82ysw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hhpsrla/cj7rai1ewdtfa2rl54tznh7bs',
    zoom: 9,
    minZoom:9,
    center: [-118.2751, 33.9843], //Centers in middle of both community plans
    hash:true
});    

//The following functions load and parse google sheet feeds to the map    
//URL Paths for Google Sheet feeds
var hazardous_epadata = 'https://spreadsheets.google.com/feeds/list/1TWeq0ytlYlKa-yGB9t_6gMAJg3pOobgEjXlWJJ4RFpI/1/public/basic?alt=json'; //Pulls in feed from EPA List
var sensitive_lms ='https://spreadsheets.google.com/feeds/list/1RRYPfj5Eh_vu4kN5nWb2GUGVKZQL_gFgCPHAmdRaDTo/1/public/basic?alt=json'; //Pulls in feed from LMS County List

//Function to load and parse Hazardous Uses to an Array
$.getJSON(hazardous_epadata, function(hazardous) {
    var highlightparcels=[];//Array to fill with APN from feed to highlight by color
    //This function parses the Google JSON and pushes into a geojson
    hazardous.feed.entry.forEach(function(d) {
        var splitfields = d.content.$t.split(', ');
        var fields = {};
        fields["AIN"]=d.title.$t
        $.each(splitfields, function(key, value){
            var split = value.split(': ');
            fields[split[0]]=split[1]
               });
    hazardous_data.features.push({
        type: "Feature",
        apn: d.title.$t,
        properties: fields
    }); 
    highlightparcels.push(String(d.title.$t));//Pushes to array for filtering mapbox vectortiles
    });
    map.setFilter('industrial_uses_low',['in','ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 9-14
    map.setFilter('industrial_uses',['in','ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 14-22
    
});

//Function to load and parse Sensitive Uses to an Array
$.getJSON(sensitive_lms, function(sensitive) {
    var highlightparcels=[];//Array to fill with APN from feed to highlight by color
    //This function parses the JSON and pushes into the geojson
    sensitive.feed.entry.forEach(function(d) {
        var splitfields = d.content.$t.split(', ');
        var fields = {};
        fields["AIN"]=d.title.$t
        $.each(splitfields, function(key, value){
            var split = value.split(': ');
            fields[split[0]]=split[1]
               });
    sensitive_data.features.push({
        type: "Feature",
        apn: d.title.$t,
        properties: fields
    });    
    highlightparcels.push(String(d.title.$t));//Pushes to array for filtering mapbox vectortile
    });
      map.setFilter('sensitive_uses_low',['in','ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 9-14
      map.setFilter('sensitive_uses',['in','ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 14-22
      
}); 

//Function to create a buffer and border around user selected parcel(polygon) 
map.on('click', function (e) {
    $("#info_selected").empty();//Clears property info
    $("#info_500ftbuffer").empty();//Clears property info
    var features = map.queryRenderedFeatures(e.point, { layers: ['assessor_3'] });
    var feature = features[0];
    //console.log(feature.properties.ain); //Log for selected parcel
     map.setFilter('buffer500',['==','ain',String(feature.properties.ain)]); //Generates 500ft buffer around selected parcel
     map.setFilter('selectedparcel',['==','ain',String(feature.properties.ain)]); //Generates border around selected parcel
     map.fitBounds([[
        feature.properties["xmin"],
        feature.properties["ymin"]
    ], [
        feature.properties["xmax"],
        feature.properties["ymax"]
    ]]);
    var parcelpost = map.querySourceFeatures('composite',{
        sourceLayer:'buffer500geojson',
        filter: ['==','ain',String(feature.properties.ain)]
        });
    
    var parcelinfo = map.querySourceFeatures('composite',{
    sourceLayer:'assessor_2015_3-1iiqao',
    filter: ['==','ain',String(feature.properties.ain)]
    });
    map.on('moveend', function(e){map.areTilesLoaded(withinlist(parcelinfo[0]))});
    selectedapn = parcelinfo[0].properties.ain; //Sets global variable
    //Function to pull selected parcel into to infopanel
    $("#info_selected").append(
        "This "+parcelinfo[0].properties['2015p_Gene']+" property has a "+parcelinfo[0].properties['2015p_Spec']+" use")
});
    
//Function with turf.js to find points within polygon (locations within parcel buffer)
var withinlist_dep = function(parcel){
    console.log(parcel);
    console.log
}

var withinlist = function(parcel){
    var within500 = []; //Creates an empty array to fill with parcels within 500ft of user selected buffer
    var debugprop = [];
    var buffer500 = turf.buffer(parcel, 0.094697, 'miles');
    var geom = turf.getGeom(buffer500); //Gets the geometry of the user selected parcel
    var queryfeatures = map.queryRenderedFeatures({ layers: ['assessor_3'] }); //Gets a list of features rendered in the current view of the map
    //console.log(queryfeatures);
    //Turf Function to loop through each parcel in the current view of the map if it crosses or is contained by the user selected buffer
    $.each(queryfeatures, function(queryfeature, value){
        debugprop.push(String(value.properties.ain));
        var checkgeomtype = turf.getGeomType(value);
        //var featuregeom = 0
        if (checkgeomtype == "Polygon"){ var featuregeom = turf.getGeom(value);
        var checkcontain = turf.booleanContains(geom,featuregeom);
        var checkoverlap = turf.booleanOverlap(geom,featuregeom);
            if (checkcontain == true){within500.push(String(value.properties.ain))}
            if (checkoverlap == true){within500.push(String(value.properties.ain))};}
    })
    within500 = jQuery.unique(within500);
    //console.log(within500);
    map.setFilter("within500ft", ['in','ain'].concat(within500));
    //map.setFilter("hoverparcel", ['in','ain'].concat(debugprop));
    loadlist(within500);
    
    /*map.addLayer({
        'id': 'test',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': geom
            }
        },
        'layout': {},
        'paint': {
            'fill-color': '#088',
            'fill-opacity': 0.8
        }
    });*/
}

//Function to run Hazardous List
var loadlist = function(within500ft){
    $.each(hazardous_data.features, function(queryfeature, value){
        var inlist = $.inArray(value.properties.AIN, within500ft);
        if (inlist >= 0) {
               var siccode;
                if(typeof value.properties.siccoded!= 'undefined'){
                siccode = value.properties.siccoded;
                }else {siccode = "Facilty";}
            $("#info_500ftbuffer").append(
                    "<div class='epa_locations' onclick='togglelist(this)' onmouseover='highlightparcel("+value.properties.AIN+")'><img src='img/hazicon.png'><span>"+siccode+"</span>"+
                    "<div class='sublist'><p class='usetitle'>Name: "+value.properties.primaryna+
                    "<p>Address: "+value.properties.locationa+
                    "<p>It is reported to the: "+value.properties.pgmsysac+
                    "<p>Source: EPA Data"+
                    "<p><a href="+value.properties.frsfacil+">EPA Page Link</a></p>"+
                    "<p id='openform'>Is this information correct?</p></div></div>");
        
        }
    })
    
    $.each(sensitive_data.features, function(queryfeature, value){
        var inlist = $.inArray(value.properties.AIN, within500ft);
        if (inlist >= 0) {
            var siccode;
            if(typeof value.properties.cat2!= 'undefined'){
            siccode = value.properties.cat2;
            }else {siccode = "Sensitive Use";}
            $("#info_500ftbuffer").append(
                    "<div class='lms_locations' onclick='togglelist(this)' onmouseover='highlightparcel("+value.properties.AIN+")'><img src='img/sensicon.png'><span>"+value.properties.cat2+"</span>"
                    +"<div class='sublist'><p class='usetitle'>Name: "+value.properties.name+
                    "<p>Address: "+value.properties.addrln1+
                    "<p>Description: "+value.properties.descriptio+
                    "<p>Source: LACOUNTY Points of Interest (LMS Data)</div></div>"); ;
        
        }
    })
}
    

map.on('mousemove', "assessor_3", function (e) {
    var features = map.queryRenderedFeatures(e.point, {layers: ["assessor_3"]});
    
    if (!features.length) {
          return;
    }
    // console.log(features[0].properties);
    if (features.length) {
            map.setFilter("hoverparcel", ['==','ain',String(e.features[0].properties.ain)]);
    } else {
            map.setFilter("hoverparcel", ['==','ain',""]);
        }
    //map.setFilter('hoverparcel',['==','ain',String(e.features[0].properties.ain)]); //Generates border around hovered parcel
    map.getCanvas().style.cursor = 'pointer';
});
    // Reset the route-hover layer's filter when the mouse leaves the map
    map.on("mouseout", function() {
        map.setFilter("hoverparcel", ['==','ain',""]);
    });


/*/Functions to change mouse curser to a pointer when user hovers over a parcel to select
map.on('mousemove', "assessor_3", function (e) {
    map.setFilter('hoverparcel',['==','ain',String(e.features[0].properties.ain)]); //Generates border around hovered parcel
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', "assessor_3", function (e) {
    map.setFilter('hoverparcel',['==','ain',""]); //Removes border around hovered parcel
    map.getCanvas().style.cursor = '';
});*/

//Adds a geocoder
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    placeholder:"Enter your address to find what's nearby",
    proximity:{longitude:-118.2517,latitude:34.0545}
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map))

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//Adds point to Map from geocoder results
map.on('load', function() {
    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    map.addLayer({
        "id": "point",
        "source": "single-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
        }
    });

    // Listen for the `geocoder.input` event that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    geocoder.on('result', function(ev) {
        map.getSource('single-point').setData(ev.result.geometry);
        
    });
});


//Function to Toggle List and slide
var togglelist = function(e) {
$(e).find('.sublist').slideToggle();
}

var highlightparcel = function(parcel){   
map.setFilter('highlightparcel',['==','ain',String(parcel)]);
}

var toggleform = function(formdata){
$( document ).click(function() {
  $( "#toggle" ).toggle( "slide" );
});
}

$("#openform").click(function() {
    //console.log("test");
  $( "#gform" ).slideDown();
});
