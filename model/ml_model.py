import json
import os
import time
import numpy as np
import redis
import settings
import pandas as pd
import pickle
from shapely.geometry import Point, Polygon
from geopy.geocoders import Nominatim
from shapely import wkt
from shapely.geometry import Point
import openmeteo_requests
import requests_cache
from retry_requests import retry
from datetime import datetime

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# Connect to Redis and assign to variable `db`
db = redis.Redis(host=settings.REDIS_IP,
                 port=settings.REDIS_PORT, db=settings.REDIS_DB_ID)

# Check Redis connection
try:
    db.ping()
    print("Connected to Redis successfully!")
except redis.ConnectionError:
    print("Failed to connect to Redis.")

# Load models from pickle files
with open('fare_model.pkl', 'rb') as f:
    fare_model = pickle.load(f)
    print("Loaded fare model successfully.")

with open('duration_model.pkl', 'rb') as f:
    duration_model = pickle.load(f)
    print("Loaded duration model successfully.")

# Load taxi zones geometry data
df_zones = pd.read_csv('taxis_zones_geometry.csv')
print("Loaded taxi zones geometry data successfully.")

def predict_fare(features):
    """
    Predict the fare amount using the loaded model.
    """
    return fare_model.predict([features])[0]

def predict_duration(features):
    """
    Predict the trip duration using the loaded model.
    """
    return duration_model.predict([features])[0]

def encontrar_zona_taxi(coord_x, coord_y):
    """
    Encuentra la zona de taxi en la que se encuentra una coordenada.
    """
    point = Point(coord_x, coord_y)
    print(f"Finding taxi zone for coordinates: {coord_x}, {coord_y}")
    for index, row in df_zones.iterrows():
        try:
            polygon = wkt.loads(row['geometry'])
            if polygon.contains(point):
                print(f"Found LocationID: {row['LocationID']} for coordinates: {coord_x}, {coord_y}")
                return row["LocationID"]  # Exit the loop if found
        except Exception as e:
            print(f"Error processing polygon: {e}")
            continue
    print(f"No LocationID found for coordinates: {coord_x}, {coord_y}")
    return None

def get_coordinates(location_name):
    """
    Translates a location name into latitude and longitude coordinates.

    Args:
        location_name: The name of the location (e.g., "Empire State Building").

    Returns:
        A tuple containing the latitude and longitude coordinates, or None if the 
        location is not found.
    """
    geolocator = Nominatim(user_agent="my_geocoder")  # Provide a user agent
    location = geolocator.geocode(location_name)
    if location:
        print(f"Coordinates for {location_name}: {location.latitude}, {location.longitude}")
        return location.longitude, location.latitude 
    else:
        print(f"Coordinates not found for {location_name}")
        return None

def get_weather_data():
    """
    Fetches the current weather data for New York City.

    Returns:
        A dictionary containing the weather data.
    """
    latitude = 40.7143
    longitude = -74.006
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "weather_code", "rain", "showers", "snowfall", "snow_depth"],
        "current_weather": True,
        "timezone": "America/New_York"
    }
    response = openmeteo.weather_api(url, params=params)[0]
    current_weather = response.current_weather
    hourly_data = response.hourly

    # Get current time details
    current_time = datetime.now()
    current_hour = current_time.strftime("%Y-%m-%dT%H:00")

    # Find the index of the current hour in the hourly data
    if current_hour in hourly_data["time"]:
        index = hourly_data["time"].index(current_hour)
    else:
        index = 0  # Default to the first hour if current hour is not found

    print(f"Weather data for New York City at {current_hour}: {current_weather}")
    return {
        "rain": hourly_data["rain"][index],
        "snowfall": hourly_data["snowfall"][index],
        "weather_code": hourly_data["weather_code"][index],
        "snow_depth": hourly_data["snow_depth"][index],
        "is_day": current_weather.is_day
    }

def classify_process():
    """
    Loop indefinitely asking Redis for new jobs.
    When a new job arrives, takes it from the Redis queue, uses the loaded ML
    model to get predictions and stores the results back in Redis using
    the original job ID so other services can see it was processed and access
    the results.
    """
    while True:
        # Take a new job from Redis
        print("Waiting for new job...")
        job_data = db.brpop(settings.REDIS_QUEUE)[1]
        job_data = json.loads(job_data.decode('utf-8'))
        print(f"Received job data: {job_data}")

        # Extract the necessary data from the job
        form_data = job_data["formData"]
        start_point = form_data["startPoint"]
        end_point = form_data["endPoint"]
        passenger_count = int(form_data["passengerCount"])
        duration = form_data["duration"]
        distance_km = form_data["distance"]
        distance_miles = distance_km * 0.621371  # Convert distance to miles

        # Get coordinates for start and end points
        start_coords = get_coordinates(start_point)
        end_coords = get_coordinates(end_point)

        if start_coords and end_coords:
            # Find LocationID for start and end points
            start_location_id = encontrar_zona_taxi(start_coords[0], start_coords[1])
            end_location_id = encontrar_zona_taxi(end_coords[0], end_coords[1])

            if start_location_id and end_location_id:
                # Get weather data for New York City
                weather_data = get_weather_data()

                # Get current time details
                current_time = datetime.now()
                hour = current_time.hour
                month = current_time.month
                day_of_week = current_time.weekday()

                # Prepare features for prediction
                fare_features = [
                    distance_miles, duration, hour, month, day_of_week,
                    weather_data["rain"], weather_data["snowfall"],
                    weather_data["weather_code"], weather_data["is_day"]
                ]
                duration_features = [
                    start_location_id, end_location_id, distance_miles, weather_data["rain"],
                    weather_data["snowfall"], weather_data["weather_code"], weather_data["snow_depth"],
                    duration, hour, day_of_week, month, weather_data["is_day"]
                ]

                # Run predictions
                print(f"Running fare prediction with features: {fare_features}")
                fare_prediction = predict_fare(fare_features)
                print(f"Fare prediction: {fare_prediction}")

                print(f"Running duration prediction with features: {duration_features}")
                duration_prediction = predict_duration(duration_features)
                print(f"Duration prediction: {duration_prediction}")

                # Prepare the output
                output = {
                    "fare": fare_prediction,
                    "duration": duration_prediction
                }

                # Store the results on Redis using the original job ID as the key
                db.set("tripPredict", json.dumps(output))
                print(f"Stored prediction results in Redis: {output}")

        # Sleep for a bit
        time.sleep(settings.SERVER_SLEEP)

if __name__ == "__main__":
    # Now launch process
    print("Launching ML service...")
    classify_process()
