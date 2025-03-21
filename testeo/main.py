import pyscript
import openmeteo_requests
import requests_cache
from retry_requests import retry
from js import document

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# Define the URL and parameters for the API request
url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": 52.52,
    "longitude": 13.41,
    "current_weather": True
}

# Fetch the weather data
response = openmeteo.weather_api(url, params=params)[0]
current_weather_code = response.current_weather.weather_code

# Map weather codes to image filenames
weather_images = {
    0: "soleado.jpeg",
    1: "lloviendo_sol.jpeg",
    2: "lloviendo.jpeg",
    3: "nieve.jpeg",
    4: "viento.jpeg"
}

# Get the image filename based on the weather code
image_filename = weather_images.get(current_weather_code, "soleado.jpeg")

# Update the image source in the HTML using PyScript's document API
weather_icon = document.getElementById("weather-icon")
weather_icon.src=f"images/{image_filename}"