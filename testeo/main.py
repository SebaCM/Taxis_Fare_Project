import openmeteo_requests
from js import document


# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important to assign them correctly below

openmeteo = openmeteo_requests.Client()

# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important to assign them correctly below
url = "https://api.open-meteo.com/v1/forecast"
params = {
	"latitude": 52.52,
	"longitude": 13.41,
	"hourly": "temperature_2m",
	"current": "weather_code"
}
responses = openmeteo.weather_api(url, params=params)

# Fetch the weather data
current = responses[0].Current()

current_weather_code = current.Variables(0).Value()
# Map weather codes to image filenames
weather_images = {
    0: "soleado.jpeg",
    1: "lloviendo_sol.jpeg",
    2: "lloviendo.jpeg",
    3: "nieve.jpeg",
    4: "viento.jpeg"
}

# Get the image filename based on the weather code
image_filename = weather_images.get(current_weather_code, "default.jpeg")

# Update the image source in the HTML using PyScript's document API
weather_icon = document.getElementById("weather-icon")
weather_icon.src = f"./{image_filename}"
