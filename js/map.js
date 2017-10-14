//Global Variables
var selectedapn;
var selectedaddress;
var within500 = [];
var sensitive_count = 0;
var hazardous_count = 0;
var hazardous_data = {type: 'FeatureCollection', features: []};
var sensitive_data = {type: 'FeatureCollection', features: []};
//The following functions load and parse google sheet feeds to the map    
//URL Paths for Google Sheet feeds
var hazardous_epadata = 'https://spreadsheets.google.com/feeds/list/1TWeq0ytlYlKa-yGB9t_6gMAJg3pOobgEjXlWJJ4RFpI/1/public/basic?alt=json'; //Pulls in feed from EPA List
var sensitive_lms = 'https://spreadsheets.google.com/feeds/list/1RRYPfj5Eh_vu4kN5nWb2GUGVKZQL_gFgCPHAmdRaDTo/1/public/basic?alt=json'; //Pulls in feed from LMS County List


//Loads mapbox map, linked to mapstyle psr_v5
mapboxgl.accessToken = 'pk.eyJ1IjoiaGhwc3JsYSIsImEiOiJjaW1sanhqa3kwNmdidHZtMHEyZ2VrdHV4In0.JSLojS72jB2OWG5NN82ysw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hhpsrla/cj7rai1ewdtfa2rl54tznh7bs',
    zoom: 11,
    minZoom: 9,
    center: [-118.2751, 33.9843] //Centers in middle of both community plans
});

//Creates an empty feature for highlighting a selected parcel
map.on('load', function () {
    "use strict";
//Adds scale
    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial'
    }));
//Mirror source for parcel select
    map.addSource("source-select", {
        type: "vector",
        url: "mapbox://hhpsrla.15h6g9hd"
    });
    map.addLayer({
        'id': 'userselectedparcel',
        'type': 'fill',
        'source': 'source-select',
        "source-layer": 'assessor_2015_3-1iiqao',
        'paint': {
            'fill-color': '#708090',
            'fill-opacity': 0.8
        },
        "filter": ['==', 'ain', ""]
    });

//Empty layer for generated 500ft buffer
    map.addSource("500ftsource", {type: "geojson", data: 0});
    map.addLayer({
        'id': '500ftbuffer',
        'type': 'line',
        'source': '500ftsource',
        'paint': {
            'line-color': '#708090',
            'line-width': 2
        }
    });
    
//Mirror source for hover over parcel
    map.addSource("source-hover", {
        type: "vector",
        url: "mapbox://hhpsrla.15h6g9hd"
    });
    map.addLayer({
        'id': 'hoverparcel',
        'type': 'fill',
        'source': 'source-hover',
        "source-layer": 'assessor_2015_3-1iiqao',
        'paint': {
            'fill-color': '#708090',
            'fill-opacity': 0.8
        },
        "filter": ['==', 'ain', ""]
    });


//Function to load and parse Hazardous Uses to an Array
    $.getJSON(hazardous_epadata, function (hazardous) {
        var highlightparcels = [];//Array to fill with APN from feed to highlight by color
    //This function parses the Google JSON and pushes into a geojson
        hazardous.feed.entry.forEach(function (d) {
            var splitfields = d.content.$t.split(', '),
                fields = {};
            fields.AIN = d.title.$t;
            $.each(splitfields, function (key, value) {
                var split = value.split(': ');
                fields[split[0]] = split[1];
            });
            hazardous_data.features.push({
                type: "Feature",
                apn: d.title.$t,
                properties: fields
            });
            highlightparcels.push(String(d.title.$t));//Pushes to array for filtering mapbox vectortiles
        });
        map.setFilter('industrial_uses_low', ['in', 'ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 9-14
        map.setFilter('industrial_uses', ['in', 'ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 14-22
    
    });

//Function to load and parse Sensitive Uses to an Array
    $.getJSON(sensitive_lms, function (sensitive) {
        var highlightparcels = [];//Array to fill with APN from feed to highlight by color
    //This function parses the JSON and pushes into the geojson
        sensitive.feed.entry.forEach(function (d) {
            var splitfields = d.content.$t.split(', '),
                fields = {};
            fields.AIN = d.title.$t;
            $.each(splitfields, function (key, value) {
                var split = value.split(': ');
                fields[split[0]] = split[1];
            });
            sensitive_data.features.push({
                type: "Feature",
                apn: d.title.$t,
                properties: fields
            });
            highlightparcels.push(String(d.title.$t));//Pushes to array for filtering mapbox vectortile
        });
        map.setFilter('sensitive_uses_low', ['in', 'ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 9-14
        map.setFilter('sensitive_uses', ['in', 'ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 14-22
      
    });

//Function to select parcel, create buffer and fill contents from that parcel
    map.on('click', "assessor_3", function (e) {
    //Highlight selected parcel upon click
        var feature = e.features[0];
        map.setFilter("userselectedparcel", ["==", 'ain', feature.properties.ain]);
    //Fits parcel in map view
        map.fitBounds([[
            feature.properties.xmin,
            feature.properties.ymin
        ], [
            feature.properties.xmax,
            feature.properties.ymax
        ]]);
        map.once('moveend', function (e) {map.areTilesLoaded(withinlist(feature)); });
    });
 
    
//Function to highlight parcel for user selection
// When the user moves their mouse over the layer, we'll update the filter in
// the hover layer to only show the matching feature, thus making a hover effect.
// Modified code from github issue on hover performance, http://bit.ly/2ychTW6
    map.on("mousemove", "assessor_3", function (e) {
        map.getCanvas().style.cursor = 'pointer';
        map.setFilter("hoverparcel", ["==", 'ain', e.features[0].properties.ain]);
    });

    // Reset the state-fills-hover layer's filter when the mouse leaves the layer.
    map.on("mouseleave", "assessor_3", function () {
        map.setFilter("hoverparcel", ["==", 'ain', ""]);
    });
   
    
//Function to generate 500ft buffer after tiles loaded and mapview set
//Performs turf boolean functions to pull content
    var withinlist = function (parcel) {
    //Generates 500ft buffer
        var buffer500 = turf.buffer(parcel, 0.094697, 'miles');
        map.getSource('500ftsource').setData(buffer500);
    //
        //Creates an empty array to fill with parcels within 500ft of user selected buffer
		within500 = [];
        var geom = turf.getGeom(buffer500), //Gets the geometry of the user selected parcel
            queryfeatures = map.queryRenderedFeatures({ layers: ['assessor_3'] }); //Gets a list of features rendered in the current view of the map
    //Turf Function to loop through each parcel in the current view of the map if it crosses or is contained by the user selected buffer
        $.each(queryfeatures, function (queryfeature, value) {
            var checkgeomtype = turf.getGeomType(value);
            if (checkgeomtype === "Polygon") { var featuregeom = turf.getGeom(value);
                var checkcontain = turf.booleanContains(geom, featuregeom);
                var checkoverlap = turf.booleanOverlap(geom, featuregeom);
                if (checkcontain === true) {within500.push(String(value.properties.ain)); }
                if (checkoverlap === true) {within500.push(String(value.properties.ain)); } }
        });
        within500 = jQuery.unique(within500);
        map.setFilter("within500ft", ['in', 'ain'].concat(within500));
        //console.log(within500);
        loadlist(within500, parcel);
    };

//Function to load information panel with content
    var loadlist = function (within500ft, parcel) {
            $("#mapresults_list").empty();
            $("button#mapresults").trigger("click")
            $("div#info_500ftbuffer").empty();
			hazardous_count = 0;
			sensitive_count = 0;
			//$("#info_selected").load("./html/propertyinfo.html")
			//console.log(parcel);
			
			console.log(parcel);
			$("button#mapresults").trigger("click");
        
            $.each(hazardous_data.features, function (queryfeature, value) {
                var inlist = $.inArray(value.properties.AIN, within500ft);
                if (inlist >= 0) {
                    var siccode;
                    if (typeof value.properties.siccoded !== 'undefined') {
                        siccode = value.properties.siccoded;
                    } else {siccode = "Facilty"; }
                    $("div#info_500ftbuffer").append(
                        "<div class='epa_locations' onclick='togglelist(this)' onmouseover='highlightparcel(" + value.properties.AIN + ")'><img src='img/hazicon.png'><span>" + siccode + "</span>" +
                            "<div class='sublist'><p class='usetitle'>Name: " + value.properties.primaryna +
                            "<p>Address: " + value.properties.locationa +
                            "<p>It is reported to the: " + value.properties.pgmsysac +
                            "<p>Source: EPA Data" +
                            "<p><a href=" + value.properties.frsfacil + ">EPA Page Link</a></p>" +
                            "<p id='openform'>Is this information correct?</p></div></div>"
                    );
					hazardous_count = hazardous_count + 1;
        
                }
            });
    
            $.each(sensitive_data.features, function (queryfeature, value) {
                var inlist = $.inArray(value.properties.AIN, within500ft);
                if (inlist >= 0) {
                    var siccode;
                    if (typeof value.properties.cat2 !== 'undefined') {
                        siccode = value.properties.cat2;
                    } else {siccode = "Sensitive Use"; }
                    $("div#info_500ftbuffer").append(
                        "<div class='lms_locations' onclick='togglelist(this)' onmouseover='highlightparcel(" + value.properties.AIN + ")'><img src='img/sensicon.png'><span>" + value.properties.cat2 + "</span>"
                            + "<div class='sublist'><p class='usetitle'>Name: " + value.properties.name +
                            "<p>Address: " + value.properties.addrln1 +
                            "<p>Description: " + value.properties.descriptio +
                            "<p>Source: LACOUNTY Points of Interest (LMS Data)</div></div>"
                    );
        			sensitive_count = sensitive_count + 1;
					console.log(sensitive_count);
                }
            });
		getselectedparcel(parcel);
        };

});

//Load selected parcel information
var getselectedparcel = function(parcel){
	var countuses = 0
	$.each(hazardous_data.features, function (queryfeature, value) {
		if (value.properties.AIN==parcel.properties.ain){
			countuses = countuses + 1;
		}
	});
	$.each(sensitive_data.features, function (queryfeature, value) {
		if (value.properties.AIN==parcel.properties.ain){
			countuses = countuses + 1;
		}
	});
	getstreetview(parcel);
	console.log(within500)
	$("#mapresults_list").append(
		"<div class='parcel_selected'>This " + parcel.properties["2015p_Gene"] + " property has " + countuses + " uses.</div>"+
		"<div class='parcel_selected_form' onclick='fillform()'>If this is incorrect, click here to help us update our data.</div>"+
		"<div class='parcel_selected'>Within 500ft there are " +within500.length+ " properties with </div>"+
		"<div class='parcel_uses'><img src='img/why500ft-17.png'><span>" +sensitive_count+ " sensitive uses</span></div>"+
		"<div class='parcel_uses'><img src='img/haz/haz_mfg.png'><span>" +hazardous_count+ " hazardous uses</span></div>"
	);
};

//Loads sensitive and hazardous data


//Get google streetview return html for image load
var getstreetview = function(parcel){
	var getcentroid = turf.centroid(parcel);
	/*var imagecheck = $.getJSON("https://maps.googleapis.com/maps/api/streetview/metadata?size=400x200&location=" + getcentroid.geometry.coordinates[1] + "," + getcentroid.geometry.coordinates[0] + "&key=AIzaSyCu4adL3bWUY41EXY7rxMrhGaOJ9AvWibE",function(data){ 
		console.log(data);
		return data.status;
	});
	console.log(imagecheck);
	if (imagecheck.status=='ZERO_RESULTS'){
		$("#mapresults_list").html("<div class='mapresults_googlestreetview'><div class='mapresults_nogoogleimage'><div class='mapresults_address'>123 Main St</div></div>");
	} else {*/
	
	$("#mapresults_list").append("<div class='mapresults_googlestreetview'><img id='googlestreetview' src='https://maps.googleapis.com/maps/api/streetview?size=400x200&location=" + getcentroid.geometry.coordinates[1] + "," + getcentroid.geometry.coordinates[0] + "&key=AIzaSyCu4adL3bWUY41EXY7rxMrhGaOJ9AvWibE'><div class='mapresults_address'>123 Main St</div></div>");
}

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
var togglelist = function (e) {
        $(e).find('.sublist').slideToggle();
    };

var highlightparcel = function (parcel) {
        map.setFilter('highlightparcel', ['==', 'ain', String(parcel)]);
    };

var toggleform = function(formdata) {
        $(document).click(function () {
            $("#toggle").toggle("slide");
        });
    };

$("#openform").click(function () {
    $("#gform").slideDown();
});
