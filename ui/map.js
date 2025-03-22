
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
      fetch('/api/tripPredict') // Usamos 'node_redis' como hostname
        .then((response) => response.json())
        .then((data) => {
          // Actualiza los elementos HTML con los datos recibidos
          document.getElementById('trip_fare').innerHTML = `<b>    Predicted fare $</b> ${data.fare}`;
          document.getElementById('trip_duration').innerHTML = `<b>    Predicted Time</b> ${data.duration}min`;;
          // ... (actualiza otros elementos según sea necesario) ...
        })
        .catch((error) => console.error('Error al obtener datos del mapa:', error));
    }
    function sendFormDataToRedis(distance,duration) {
        // Obtiene los datos del formulario
        const startPoint = document.getElementById('Start Point-formbuilder-1').value;
        const endPoint = document.getElementById('End point-formbuilder-1').value;
        const passengerCount = document.getElementById('Number-formbuilder-1').value;
      
        // Envía los datos al servidor Node.js
        fetch('/api/formData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ startPoint, endPoint, passengerCount,distance,duration }),
        })
          .then((response) => response.text())
          .then((data) => console.log(data))
          .catch((error) => console.error('Error al enviar datos del formulario:', error));
      }

      document.addEventListener('DOMContentLoaded', function() {
        const submitButton = document.getElementById('submitButton');
    
        submitButton.addEventListener('click', async function(event) {
            event.preventDefault();
    
            const startPoint = document.getElementById('Start Point-formbuilder-1').value;
            const endPoint = document.getElementById('End point-formbuilder-1').value;
    
            if (!startPoint || !endPoint) {
                alert("Por favor, introduce tanto el punto de origen como el de destino.");
                return;
            }
    
            try {
                const routeData = await calculateAndDisplayRoute(startPoint, endPoint);
                sendFormDataToRedis(routeData.distance, routeData.duration);
                getPredict();
            } catch (error) {
                alert(error);
            }
        });
    });

 async function calculateAndDisplayRoute(origin, destination) {
    return new Promise((resolve, reject) => {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: origin }, (resultsOrigin, statusOrigin) => {
            if (statusOrigin === "OK") {
                const originLatLng = resultsOrigin[0].geometry.location;

                geocoder.geocode({ address: destination }, (resultsDestination, statusDestination) => {
                    if (statusDestination === "OK") {
                        const destinationLatLng = resultsDestination[0].geometry.location;

                        if (isWithinNYC(originLatLng) && isWithinNYC(destinationLatLng)) {
                            map = new google.maps.Map(document.getElementById("map"), {
                                zoom: 12,
                                center: { lat: 40.7128, lng: -74.0060 },
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
                                        resolve({ distance: distance, duration: duration });
                                    } else {
                                        reject("No se encontraron rutas: " + status);
                                    }
                                }
                            );
                        } else {
                            reject("Uno o ambos puntos están fuera de la ciudad de Nueva York.");
                        }
                    } else {
                        reject("No se pudo geocodificar el punto de destino.");
                    }
                });
            } else {
                reject("No se pudo geocodificar el punto de origen.");
            }
        });
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

        const day_nigth = {
            0: "Night",
            1: "Day"
        }
            const options = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false };
            const formatter = new Intl.DateTimeFormat([], options);
            hour = formatter.format(new Date());
            indice=((parseInt(hour.substring(0,2)))).toFixed(0);
            console.log(indice);
            document.getElementById('time').textContent = formatter.format(new Date())
            document.getElementById('weather-icon').src = `${weatherConditions[data.current_weather.weathercode][day_nigth[data.current_weather.is_day]].image}`;
            document.getElementById('temperature').textContent = `${data.current_weather.temperature}°C`;    
            document.getElementById('weather-condition').textContent = `${weatherConditions[data.current_weather.weathercode][day_nigth[data.current_weather.is_day]].description}`; 
            document.getElementById('wind-speed').textContent = `${data.current_weather.windspeed} km/h`;
            document.getElementById('humidity').textContent = `${data.hourly.relative_humidity_2m[indice]}%`;
            document.getElementById('sunshine').textContent = `${day_nigth[data.current_weather.is_day]}`;

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }


}
const weatherConditions = {
    "0": {
        "Day": {
            "description": "Sunny",
            "image": "http://openweathermap.org/img/wn/01d@2x.png"
        },
        "Night": {
            "description": "Clear",
            "image": "http://openweathermap.org/img/wn/01n@2x.png"
        }
    },
    "1": {
        "Day": {
            "description": "Mainly Sunny",
            "image": "http://openweathermap.org/img/wn/01d@2x.png"
        },
        "Night": {
            "description": "Mainly Clear",
            "image": "http://openweathermap.org/img/wn/01n@2x.png"
        }
    },
    "2": {
        "Day": {
            "description": "Partly Cloudy",
            "image": "http://openweathermap.org/img/wn/02d@2x.png"
        },
        "Night": {
            "description": "Partly Cloudy",
            "image": "http://openweathermap.org/img/wn/02n@2x.png"
        }
    },
    "3": {
        "Day": {
            "description": "Cloudy",
            "image": "http://openweathermap.org/img/wn/03d@2x.png"
        },
        "Night": {
            "description": "Cloudy",
            "image": "http://openweathermap.org/img/wn/03n@2x.png"
        }
    },
    "45": {
        "Day": {
            "description": "Foggy",
            "image": "http://openweathermap.org/img/wn/50d@2x.png"
        },
        "Night": {
            "description": "Foggy",
            "image": "http://openweathermap.org/img/wn/50n@2x.png"
        }
    },
    "48": {
        "Day": {
            "description": "Rime Fog",
            "image": "http://openweathermap.org/img/wn/50d@2x.png"
        },
        "Night": {
            "description": "Rime Fog",
            "image": "http://openweathermap.org/img/wn/50n@2x.png"
        }
    },
    "51": {
        "Day": {
            "description": "Light Drizzle",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "Night": {
            "description": "Light Drizzle",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "53": {
        "Day": {
            "description": "Drizzle",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "Night": {
            "description": "Drizzle",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "55": {
        "Day": {
            "description": "Heavy Drizzle",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "Night": {
            "description": "Heavy Drizzle",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "56": {
        "Day": {
            "description": "Light Freezing Drizzle",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "Night": {
            "description": "Light Freezing Drizzle",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "57": {
        "Day": {
            "description": "Freezing Drizzle",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "Night": {
            "description": "Freezing Drizzle",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "61": {
        "Day": {
            "description": "Light Rain",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "Night": {
            "description": "Light Rain",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "63": {
        "Day": {
            "description": "Rain",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "Night": {
            "description": "Rain",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "65": {
        "Day": {
            "description": "Heavy Rain",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "Night": {
            "description": "Heavy Rain",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "66": {
        "Day": {
            "description": "Light Freezing Rain",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "Night": {
            "description": "Light Freezing Rain",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "67": {
        "Day": {
            "description": "Freezing Rain",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "Night": {
            "description": "Freezing Rain",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "71": {
        "Day": {
            "description": "Light Snow",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "Night": {
            "description": "Light Snow",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "73": {
        "Day": {
            "description": "Snow",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "Night": {
            "description": "Snow",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "75": {
        "Day": {
            "description": "Heavy Snow",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "Night": {
            "description": "Heavy Snow",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "77": {
        "Day": {
            "description": "Snow Grains",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "Night": {
            "description": "Snow Grains",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "80": {
        "Day": {
            "description": "Light Showers",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "Night": {
            "description": "Light Showers",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "81": {
        "Day": {
            "description": "Showers",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "Night": {
            "description": "Showers",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "82": {
        "Day": {
            "description": "Heavy Showers",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "Night": {
            "description": "Heavy Showers",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "85": {
        "Day": {
            "description": "Light Snow Showers",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "Night": {
            "description": "Light Snow Showers",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "86": {
        "Day": {
            "description": "Snow Showers",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "Night": {
            "description": "Snow Showers",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "95": {
        "Day": {
            "description": "Thunderstorm",
            "image": "http://openweathermap.org/img/wn/11d@2x.png"
        },
        "Night": {
            "description": "Thunderstorm",
            "image": "http://openweathermap.org/img/wn/11n@2x.png"
        }
    },
    "96": {
        "Day": {
            "description": "Light Thunderstorms With Hail",
            "image": "http://openweathermap.org/img/wn/11d@2x.png"
        },
        "Night": {
            "description": "Light Thunderstorms With Hail",
            "image": "http://openweathermap.org/img/wn/11n@2x.png"
        }
    },
    "99": {
        "Day": {
            "description": "Thunderstorm With Hail",
            "image": "http://openweathermap.org/img/wn/11d@2x.png"
        },
        "Night": {
            "description": "Thunderstorm With Hail",
            "image": "http://openweathermap.org/img/wn/11n@2x.png"
        }
    }
};

getWeatherData();