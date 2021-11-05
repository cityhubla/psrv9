//Global Variables
var selectedapn;
var selectedaddress;
var within500 = [];
var sensitive_count = 0;
var hazardous_count = 0;
var hazardous_data = { type: 'FeatureCollection', features: [] };
var sensitive_data = { type: 'FeatureCollection', features: [] };

//The following functions load and parse google sheet feeds to the map    
//URL Paths for Google Sheet feeds
var hazardous_epadata = 'https://spreadsheets.google.com/feeds/list/1TWeq0ytlYlKa-yGB9t_6gMAJg3pOobgEjXlWJJ4RFpI/1/public/basic?alt=json'; //Pulls in feed from EPA List

var sensitive_lms = 'https://spreadsheets.google.com/feeds/list/1RRYPfj5Eh_vu4kN5nWb2GUGVKZQL_gFgCPHAmdRaDTo/1/public/basic?alt=json'; //Pulls in feed from LMS County List

var hazardous_epadata_v4 = './js/hazardous_epadata.json'
var sensitive_lms_v4 = './js/sensitive_lms.json'


var datacsv = Papa.parse('./js/hazardous_epadata_v1.csv', {
    download: true,
    complete: function (results) {
        console.log(results.data);
    }
});

//Browser Check
//Issues surrounding webgl memory leaks with iOS Safari, this checks and returns mobile safari or default options
var browser_zoom,
    browser_minzoom,
    browser_cachesize
function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        browser_zoom = 15;
        browser_minzoom = 14;
        browser_cachesize = 4;
        $(".apple_warning").show();
    } else {
        browser_zoom = 11;
        browser_minzoom = 11;
        browser_cachesize = null;
    }
}

getMobileOperatingSystem();


//Loads mapbox map, linked to mapstyle psr_v5
mapboxgl.accessToken = 'pk.eyJ1IjoiaGhwc3JsYSIsImEiOiJjaW1sanhqa3kwNmdidHZtMHEyZ2VrdHV4In0.JSLojS72jB2OWG5NN82ysw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hhpsrla/ckvlnzwa84bk015qlbnjkxecq',
    // style: 'mapbox://styles/hhpsrla/cj8sbyvutcchh2ro1ksxzd8id', //psr_v9A style
    center: [-118.2751, 33.9843],//Centers in middle of both community plans
    zoom: browser_zoom,
    maxBounds: [[-118.5802, 33.7326], [-117.9199, 34.1274]],
    minZoom: browser_minzoom,
    maxTileCacheSize: browser_cachesize
});

//Creates an empty feature for highlighting a selected parcel
map.on('load', function () {
    "use strict";
    //Adds scale
    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial'
    }));

    //Mirror source for parcel select source (hpsrla.83hukeln), layer (assessor_2017geojson)
    map.addSource("source-select", {
        type: "vector",
        url: "mapbox://hhpsrla.83hukeln"
    });
    map.addLayer({
        'id': 'userselectedparcel',
        'type': 'fill',
        'source': 'source-select',
        "source-layer": 'assessor_2017geojson',
        'paint': {
            'fill-color': '#708090',
            'fill-opacity': 0.8
        },
        "filter": ['==', 'ain', ""]
    });

    //Empty layer for generated 500ft buffer
    map.addSource("500ftsource", { type: "geojson", data: 0 });
    map.addLayer({
        'id': '500ftbuffer',
        'type': 'line',
        'source': '500ftsource',
        'paint': {
            'line-color': '#000',
            'line-width': 2.5,
            'line-dasharray': [3, 2]
        }
    });

    //Mirror source for hover over parcel
    map.addSource("source-hover", {
        type: "vector",
        url: "mapbox://hhpsrla.83hukeln"
    });
    map.addLayer({
        'id': 'hoverparcel',
        'type': 'fill',
        'source': 'source-hover',
        "source-layer": 'assessor_2017geojson',
        'paint': {
            'fill-color': '#708090',
            'fill-opacity': 0.8
        },
        "filter": ['==', 'ain', ""]
    });

    //Function to load and parse Hazardous Uses to an Array
    Papa.parse('./js/hazardous_epadata.csv', {
        download: true,
        header: true,
        complete: function (hazardous) {
            
            var highlightparcels = [];//Array to fill with APN from feed to highlight by color
            //This function parses the Google JSON and pushes into a geojson
            hazardous.data.forEach(function (d) {
                // var splitfields = d.content.$t.split(', '),
                //     fields = {};
                // fields.AIN = d.title.$t;
                // $.each(splitfields, function (key, value) {
                //     var split = value.split(': ');
                //     fields[split[0]] = split[1];
                // });
                hazardous_data.features.push({
                    type: "Feature",
                    apn: d.ain,
                    properties: d
                });
                highlightparcels.push(String(d.ain));//Pushes to array for filtering mapbox vectortiles
            });
            map.setFilter('industrial_uses_low', ['in', 'ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 9-14
            map.setFilter('industrial_uses', ['in', 'ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 14-22
        }
    });

    //Function to load and parse Sensitive Uses to an Array
    Papa.parse('./js/sensitive_lms.csv', {
        download: true,
        header: true,
        complete: function (sensitive) {
            
            var highlightparcels = [];//Array to fill with APN from feed to highlight by color
            //This function parses the Google JSON and pushes into a geojson
            sensitive.data.forEach(function (d) {
                sensitive_data.features.push({
                    type: "Feature",
                    apn: d.ain,
                    properties: d
                });
                highlightparcels.push(String(d.ain));//Pushes to array for filtering mapbox vectortiles
            });
            map.setFilter('sensitive_uses_low', ['in', 'ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 9-14
            map.setFilter('sensitive_uses', ['in', 'ain'].concat(highlightparcels));//This highlights the parcels from zoom levels 14-22
        }
    });


    //Function to select parcel, create buffer and fill contents from that parcel
    map.on('click', "assessor_3", function (e) {
        //$("#mapresults_list").empty().load("./html/parcelinfo.html");	
        reset_mapinfo();
        //Highlight selected parcel upon click
        var feature = e.features[0];
        map.setFilter("userselectedparcel", ["==", 'ain', feature.properties.ain]);
        map.setFilter('highlightparcel', ['==', 'ain', ""]);
        //Fits parcel in map view
        map.fitBounds([[
            feature.properties.xmin,
            feature.properties.ymin
        ], [
            feature.properties.xmax,
            feature.properties.ymax
        ]]);
        map.once('moveend', function (e) { map.areTilesLoaded(withinlist(feature)); });
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
            if (checkgeomtype === "Polygon") {
                var featuregeom = turf.getGeom(value);
                var checkcontain = turf.booleanContains(geom, featuregeom);
                var checkoverlap = turf.booleanOverlap(geom, featuregeom);
                if (checkcontain === true) { within500.push(String(value.properties.ain)); }
                if (checkoverlap === true) { within500.push(String(value.properties.ain)); }
            }
        });
        within500 = jQuery.unique(within500);
        map.setFilter("within500ft", ['in', 'ain'].concat(within500));

        loadlist(within500, parcel);
    };

    //Function to load information panel with content
    var loadlist = function (within500ft, parcel) {

        $("button#mapresults").trigger("click")
        $(".info_500ftbuffer").empty();
        hazardous_count = 0;
        sensitive_count = 0;

        $("button#mapresults").trigger("click");

        $.each(hazardous_data.features, function (queryfeature, value) {
            var inlist = $.inArray(value.properties.ain, within500ft);
            if (inlist >= 0) {
                var siccode;
                if (value.properties.SIC_CODE_D != "") {
                    siccode = value.properties.SIC_CODE_D;
                } else {
                    siccode = "Facilty";
                }
                $("div#hazardous_resultlist").append(
                    "<div class='epa_locations' onclick='togglelist(this)' onmouseover='highlightparcel(" + value.properties.ain + ")'><img src='img/pulldown_hazardous.png'><span>" + siccode + "</span>" +
                    "<div class='sublist'><p class='usetitle'>Name: " + value.properties.PRIMARY_NA +
                    "<p>Address: " + value.properties.LOCATION_A +
                    "<p>It is reported to the: " + value.properties.PGM_SYS_AC +
                    "<p><a href=" + value.properties.FRS_FACILI + " target='_blank'>Source: EPA Data</a></p>"
                );
                hazardous_count = hazardous_count + 1;
            }
        });

        $.each(sensitive_data.features, function (queryfeature, value) {
            var inlist = $.inArray(value.properties.ain, within500ft);
            if (inlist >= 0) {
                var siccode;
                if (typeof value.properties.cat2 !== 'undefined') {
                    siccode = value.properties.cat2;
                } else { siccode = "Sensitive Use"; }
                $("div#sensitive_resultlist").append(
                    "<div class='lms_locations' onclick='togglelist(this)' onmouseover='highlightparcel(" + value.properties.ain + ")'><img src='img/pulldown_sensitive.png'><span>" + value.properties.cat2 + "</span>"
                    + "<div class='sublist'><p class='usetitle'>Name: " + value.properties.Name +
                    "<p>Address: " + value.properties.addrln1 +
                    "<p>Description: " + value.properties.descriptio +
                    "<p>Source: LACOUNTY Points of Interest (LMS Data)</div></div>"
                );
                sensitive_count = sensitive_count + 1;
            }
        });
        getselectedparcel(parcel);
    };

});

//Load selected parcel information
var getselectedparcel = function (parcel) {
    var countuses = 0
    $.each(hazardous_data.features, function (queryfeature, value) {
        if (value.properties.ain == parcel.properties.ain) {
            countuses = countuses + 1;
        }
    });
    $.each(sensitive_data.features, function (queryfeature, value) {
        if (value.properties.ain == parcel.properties.ain) {
            countuses = countuses + 1;
        }
    });
    getstreetview(parcel);
    $(".assessorid").empty().html(parcel.properties.AIN);
    $("div#parcel_selected_1").empty().html("This " + parcel.properties["2015p_Gene"] + " property has " + countuses + " uses.");
    $("div#parcel_selected_2").empty().html("If this is incorrect, click here to help us update our data.");
    $("div#parcel_selected_3").empty().html("Within 500ft there are " + within500.length + " properties with ");
    $("div#parcel_selected_4A").empty().html("<img src='img/why500ft-17.png'><span>" + sensitive_count + " sensitive uses</span>");
    $("div#parcel_selected_5A").empty().html("<img src='img/haz/haz_mfg.png'><span>" + hazardous_count + " hazardous uses</span>");
};



//Get google streetview return html for image load
var getstreetview = function (parcel) {
    var getcentroid = turf.centroid(parcel);
    var address = [];
    if (parcel.properties['2015p_Prop'] != null) {
        address = parcel.properties['2015p_Prop'].split(/( LOS ANGELES CA )/);
    } else { address[0] = "" }

    //console.log(address);
    /*var imagecheck = $.getJSON("https://maps.googleapis.com/maps/api/streetview/metadata?size=400x200&location=" + getcentroid.geometry.coordinates[1] + "," + getcentroid.geometry.coordinates[0] + "&key=AIzaSyCu4adL3bWUY41EXY7rxMrhGaOJ9AvWibE",function(data){ 
        console.log(data);
        return data.status;
    });
    console.log(imagecheck);
    if (imagecheck.status=='ZERO_RESULTS'){
        $("#mapresults_list").html("<div class='mapresults_googlestreetview'><div class='mapresults_nogoogleimage'><div class='mapresults_address'>123 Main St</div></div>");
    } else {*/

    $("div#mapresults_googlestreetview").empty().html("<img id='googlestreetview' src='https://maps.googleapis.com/maps/api/streetview?size=400x200&location=" + getcentroid.geometry.coordinates[1] + "," + getcentroid.geometry.coordinates[0] + "&key=AIzaSyCu4adL3bWUY41EXY7rxMrhGaOJ9AvWibE'><div class='mapresults_address'>" + address[0] + "</div>");
}

//Adds a geocoder
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    placeholder: "Enter your address to find what's nearby",
    proximity: { longitude: -118.2517, latitude: 34.0545 }
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map))

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//Adds point to Map from geocoder results
map.on('load', function () {
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
    geocoder.on('result', function (ev) {
        map.getSource('single-point').setData(ev.result.geometry);

    });
});

var toggle_result = function (selection) {
    $('div#' + selection).slideToggle();

};

//Function to Toggle List and slide
var togglelist = function (e) {
    if ($(e).find('.sublist').is(":visible")) {
        $('.sublist').slideUp();
    } else if ($('.sublist').is(":visible")) {
        $('.sublist').slideUp();
        $(e).find('.sublist').slideDown();
    } else { $(e).find('.sublist').slideDown(); }


};

var highlightparcel = function (parcel) {
    map.setFilter('highlightparcel', ['==', 'ain', String(parcel)]);
};

var toggleform = function (formdata) {
    $(document).click(function () {
        $("#toggle").toggle("slide");
    });
};

$("#openform").click(function () {
    $("#gform").slideDown();
});

var reset_mapinfo = function () {
    $("#sensitive_resultlist").hide();
    $("#hazardous_resultlist").hide();
}