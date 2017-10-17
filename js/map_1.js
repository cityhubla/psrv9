mapboxgl.accessToken = 'pk.eyJ1IjoiaGhwc3JsYSIsImEiOiJjaW1sanhqa3kwNmdidHZtMHEyZ2VrdHV4In0.JSLojS72jB2OWG5NN82ysw';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
    center: [-74.50, 40], // starting position [lng, lat]
    zoom: 9 // starting zoom
});