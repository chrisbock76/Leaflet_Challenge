// Store our API endpoint inside queryUrl - used to collect weekly earthquake data from USGS
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  //console.log(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.mag + "</h3> <h2>" + feature.properties.place +
      "</h2><hr><p>" + new Date(feature.properties.time) + "</p>");
      //"<hr><h3>" + earthquakeData.properties.mag + "</h3");
  }

  // define the radius of the circle based on eq magnitude
  function getRadius(magnitude) {
    return magnitude * 15000;
  }

  // Circle color defined by eq magnitude 
  function circleColor(magnitude) {
    switch (true) {
        case magnitude>5:
            return "red";
        case magnitude>=4:
            return "orangered";
        case magnitude>=3:
            return "orange";
        case magnitude>=2:
            return "yellow";
        case magnitude>=1:
            return "greenyellow";
        case magnitude>=0:
            return "green";   
        default:
            return "silver";
    }
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, layer) {
      return L.circle(layer, {
        radius: getRadius(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 0.5
      });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define satellite map
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      38.6270, -90.1994
    ],
    zoom: 5,
    layers: [satelliteMap, earthquakes]
  });

  // color function for the earthquake magitude for the legend
  // function getColor(d) {
  //   return d > 5 ? "red" :
  //          d > 4 ? "orange" :
  //          d > 3 ? "yellow" :
  //          d > 2 ? "green" :
  //          d > 1 ? "blue" :
  //                   "silver";
  // }; 
 
  // create legend
  var legend = L.control({position: "bottomright"});

  // layer control added, insert div with class legend
  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "info legend"),
      //Make a list of the hex code values of the colors used in getcolors
      mags = ["#008000", "#ADFF2F", "#FFFF00", "#FFA500", "#FF4500", "#FF0000" ],
      //List of labels for each of the different magnitude values
      labels = ["0-1","1-2","2-3","3-4","4-5","5+"]; 
    // loop through the length of the mags list and add each color to the legend

    // loop through our mags intervals and add each colored square to the legend
    for (var i = 0; i < mags.length; i++) {
        div.innerHTML +=
           '<i style="background:' + mags[i] + '"></i> ' +
           labels[i] + '<br>';
    }
    return div; 
  };

  // add legend to map
  legend.addTo(myMap);

  }