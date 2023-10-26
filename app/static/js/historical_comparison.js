var capitals = JSON.parse(`{{ us_capitals | tojson | safe }}`);
var historical_data = JSON.parse(`{{ historical | tojson | safe }}`);
// instantiate map
var map = L.map('map').setView([37.8, -96], 4);

let weatherData = {}
let fetchPromises = []; // Array to store fetch promises

// get data for each capital city
for (let city in capitals) {
    let current = capitals[city]
    let stateName = current["name"]
    var lat = current["latitude"]
    var lon = current["longitude"]
    const fetchPromise = fetch(`/get_openweather?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            // Add the data to the dictionary
            weatherData[stateName] = {};
            weatherData[stateName]["currentTemp"] = data["main"]["temp"];
            let today = getDateToday();
            weatherData[stateName]["historicalTemp"] = (historical_data[stateName][today]).toFixed(2);
            weatherData[stateName]["ratio"] = (weatherData[stateName]["currentTemp"] / weatherData[stateName]["historicalTemp"]).toFixed(2);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    fetchPromises.push(fetchPromise); // Add the fetch promise to the array
}
;

Promise.all(fetchPromises)
    .then(() => {
        console.log(weatherData);
        // setup base map
        var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // add temperature data to geometry
        statesData.features.forEach((feature) => {
            const stateName = feature.properties.name;
            if (weatherData.hasOwnProperty(stateName)) {
                feature.properties["temperatures"] = weatherData[stateName]
            }
            else{
                feature.properties["temperatures"] = {};
                feature.properties["temperatures"]["curentTemp"] = undefined;
                feature.properties["temperatures"]["historicalTemp"] = undefined;
                feature.properties["temperatures"]["ratio"] = undefined;
            }
        });
        // add weather data and interactivity to map
        geojson = L.geoJson(statesData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);

    });

function getDateToday(){
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth()+1;
    // Format!
    if(day<10)
        day='0'+day;
    if(month<10)
        month='0'+month;
    let formatted = month+'-'+day;
    return formatted;
}

function getColor(val) {
    return val >= 1.5 ? '#800026' :
        val >= 1.4 ? '#BD0026' :
            val >= 1.3 ? '#E31A1C' :
                val >= 1.2 ? '#FC4E2A' :
                    val >= 1.1 ? '#FD8D3C' :
                        val >= 1 ? '#FEB24C' :
                            val >= .9 ? '#FED976' :
                                val >= .8 ? '#FFEDA0' :
                                '#f5e7b6';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.temperatures.ratio),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    info.update(layer.feature.properties);
    layer.bringToFront();
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// setup info display
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class info
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>US Temperatures</h4>' + (props ?
        '<b>' + props.name + '</b><br />'  + props.temperatures.ratio + ''
        + '</b><br />' + 'Current: ' + props.temperatures.currentTemp + ' °F'
        + '</b><br />' + 'Historical: ' + props.temperatures.historicalTemp + ' °F'
        : 'Hover over a state');
};

info.addTo(map);


// setup legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = ['below', 0.8, .9, 1, 1.1, 1.2, 1.3, 1.4, 1.5],
        labels = [];

    // generate a label with a colored square for each temp interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

//setup title card
var title = L.control();
title.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'title'); // create a div with a class info
    div.innerHTML = '<h2>Current Temperature Compared to Historical Baseline</h2>'
    return div
}
title.addTo(map);

//setup extra info
var details = L.control({position: 'bottomleft'});
details.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info'); // create a div with a class info
    div.innerHTML = '<h4>Baseline is calculated as the average temperature on this date from 1950 to 1980.</h4>' +
        '<h4>' + 'Since the baseline is taken as the average of the daily min and max temps, the time of day will have a strong effect.' + '</h4>'
    return div
}
details.addTo(map);