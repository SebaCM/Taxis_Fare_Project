
let map; // Declara la variable map fuera de initMap
let directionsRenderer;
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: 40.7128, lng: -74.0060 }, // Centro en Nueva York
    });
    const trafficLayer = new google.maps.TrafficLayer();

      trafficLayer.setMap(map);
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        });

    }
    
    function getPredict() {
      fetch('http://node_redis:3000/tripPredict') // Usamos 'node_redis' como hostname
        .then((response) => response.json())
        .then((data) => {
          // Actualiza los elementos HTML con los datos recibidos
          document.getElementById('trip_fare').textContent = `$ ${data.fare}`;
          document.getElementById('trip_duartion').textContent = `Time ${data.duration} min`;
          // ... (actualiza otros elementos según sea necesario) ...
        })
        .catch((error) => console.error('Error al obtener datos del mapa:', error));
    }
    function sendFormDataToRedis() {
        // Obtiene los datos del formulario
        const startPoint = document.getElementById('Start Point-formbuilder-1').value;
        const endPoint = document.getElementById('End point-formbuilder-1').value;
        const passengerCount = document.getElementById('Number-formbuilder-1').value;
      
        // Envía los datos al servidor Node.js
        fetch('http://node_redis:3000/formData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ startPoint, endPoint, passengerCount }),
        })
          .then((response) => response.text())
          .then((data) => console.log(data))
          .catch((error) => console.error('Error al enviar datos del formulario:', error));
      }

document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submitButton');

    submitButton.addEventListener('click', function(event) {
        event.preventDefault(); // Evita el envío automático del formulario

        const startPoint = document.getElementById('Start Point-formbuilder-1').value;
        const endPoint = document.getElementById('End point-formbuilder-1').value;

        if (!startPoint || !endPoint) {
            alert("Por favor, introduce tanto el punto de origen como el de destino.");
            return;
        }

        calculateAndDisplayRoute(startPoint, endPoint);
        sendFormDataToRedis();
        getPredict()

    });
});

function calculateAndDisplayRoute(origin, destination) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: origin }, (resultsOrigin, statusOrigin) => {
        if (statusOrigin === "OK") {
            const originLatLng = resultsOrigin[0].geometry.location;

            geocoder.geocode({ address: destination }, (resultsDestination, statusDestination) => {
                if (statusDestination === "OK") {
                    const destinationLatLng = resultsDestination[0].geometry.location;

                    // Verificar si ambos puntos están en Nueva York
                    if (isWithinNYC(originLatLng) && isWithinNYC(destinationLatLng)) {
                        map = new google.maps.Map(document.getElementById("map"), {
                            zoom: 12,
                            center: { lat: 40.7128, lng: -74.0060 }, // Centro en Nueva York
                        });
                        const trafficLayer = new google.maps.TrafficLayer();
                    
                          trafficLayer.setMap(map);
                          const directionsRenderer = new google.maps.DirectionsRenderer({
                            map: map,
                            });
                        const directionsService = new google.maps.DirectionsService();
                        directionsService.route(
                            {
                                origin: originLatLng,
                                destination: destinationLatLng,
                                travelMode: google.maps.TravelMode.DRIVING,
                                drivingOptions: {
                                    departureTime: new Date(),
                                    trafficModel: google.maps.TrafficModel.BEST_GUESS,
                                },
                            },
                            (response, status) => {
                                if (status === "OK") {
                                    directionsRenderer.setDirections(response);
                                    const route = response.routes[0];
                                    const distance = route.legs[0].distance.value / 1000;
                                    const duration = route.legs[0].duration.text;
                                    alert(`Distancia: ${distance}km\nTiempo estimado: ${duration}`);
                                } else {
                                    window.alert("No se encontraron rutas: " + status);
                                }
                            }
                        );
                    } else {
                        alert("Uno o ambos puntos están fuera de la ciudad de Nueva York.");
                    }
                } else {
                    alert("No se pudo geocodificar el punto de destino.");
                }
            });
        } else {
            alert("No se pudo geocodificar el punto de origen.");
        }
    });
  }

function isWithinNYC(latLng) {
    // Definir los límites aproximados de Nueva York (puedes ajustarlos según sea necesario)
    const nyBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(40.4774, -74.2591), // Esquina suroeste
        new google.maps.LatLng(40.9176, -73.7004)  // Esquina noreste
    );

    return nyBounds.contains(latLng);
}
async function getWeatherData() {
    try {
        const latitude = 40.7143; // Example latitude (NY)
        const longitude = -74.006; // Example longitude (NY)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current_weather=true&hourly=relative_humidity_2m`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Process the weather data here
        // Access the current weather code
        console.log("Current weather code: ", data.current_weather.weathercode);
        //Access the hourly temperatures
        console.log("Hourly temperatures: ", data.hourly.temperature_2m);
        const weather_images = {
            0: "soleado.jpeg",
            1: "lloviendo_sol.jpeg",
            2: "lloviendo.jpeg",
            3: "nieve.jpeg",
            4: "viento.jpeg"
        }
        const weather_conditions = {
            0: "Sunny",
            1: "Sunny Rainy",
            2: "Rainning",
            3: "Snowing",
            4: "Winding"
        }
            const options = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false };
            const formatter = new Intl.DateTimeFormat([], options);
            hour = formatter.format(new Date());
            indice=((parseInt(hour.substring(0,2))*60+parseInt(hour.substring(3,5)))/15).toFixed(0);
            console.log(indice);
            document.getElementById('time').textContent = formatter.format(new Date())
            document.getElementById('weather-icon').src = `images/${weather_images[data.current_weather.weathercode]}`;
            document.getElementById('temperature').textContent = `${data.current_weather.temperature}°C`;    
            document.getElementById('weather-condition').textContent = `${weather_conditions[data.current_weather.weathercode]}`;     
            document.getElementById('wind-speed').textContent = `${data.current_weather.windspeed} km/h`;
            document.getElementById('humidity').textContent = `${data.hourly.relative_humidity_2m[indice]}%`;

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }


}

getWeatherData();