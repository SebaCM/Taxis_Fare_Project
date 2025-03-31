import json
import time
import redis
import settings
import pandas as pd
import pickle
from shapely.geometry import Point, Polygon
#from geopy.geocoders import Nominatim
from shapely import wkt
from shapely.geometry import Point
import openmeteo_requests
import requests_cache
from retry_requests import retry
from datetime import datetime
import googlemaps
from datetime import datetime
import pytz
# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)
taxi_zones = pd.read_csv('taxis_zone_geometry_official.csv')
taxi_zones['geometry'] = taxi_zones['geometry'].apply(wkt.loads)

# Connect to Redis and assign to variable `db`
db = redis.Redis(host=settings.REDIS_IP,
                 port=settings.REDIS_PORT, db=settings.REDIS_DB_ID)

api_key = "AIzaSyDnhBrF6rtcc0VS066RFF012bBd0sRJAJU"  # Replace with your actual API key

def get_google_coordenate(nombre_zona, api_key):
    """
    Obtiene la geometría de una zona de taxi de Google Maps.

    Args:
        nombre_zona: El nombre de la zona de taxi.
        api_key: La clave de la API de Google Maps.

    Returns:
        La geometría de la zona de taxi en formato GeoJSON.
    """
    gmaps = googlemaps.Client(key=api_key)
    geocode_result = gmaps.geocode(nombre_zona)
    location = geocode_result[0]['geometry']['location']
    lat = location['lat']
    lng = location['lng']
    return {
        "lat": lat,
        "lng": lng,
    }


# Check Redis connection
try:
    db.ping()
    print("Connected to Redis successfully!")
except redis.ConnectionError:
    print("Failed to connect to Redis.")

# Load models from pickle files
with open('xgb_fare.pkl', 'rb') as f:
    fare_model = pickle.load(f)
    print("Loaded fare model successfully.")

with open('duration_model.pkl', 'rb') as f:
    duration_model = pickle.load(f)
    print("Loaded duration model successfully.")

# Load taxi zones geometry data
#df_zones = pd.read_csv('taxis_zones_geometry.csv')
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

def encontrar_zona_taxi(taxi_zones, coord_x, coord_y):
    """Encuentra la zona de taxi en la que se encuentra una coordenada."""
    punto = Point(coord_x, coord_y)

    for index, row in taxi_zones.iterrows():
        if row["geometry"] and row["geometry"].contains(punto):
            return row["LocationID"]
    return None

def get_weather_data():
    """
    Fetches the current weather data for New York City.

    Returns:
        A dictionary containing the weather data.
    """
    ny_timezone = pytz.timezone('America/New_York')

    # Obtener la hora actual en Nueva York
    ny_time = datetime.now(ny_timezone)

    # Obtener la hora actual en formato ISO para buscar en los datos horarios
    current_hour = ny_time.strftime("%H")
    current_hour=int(current_hour)

    latitude = 40.7143
    longitude = -74.006
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "weather_code", "rain", "showers", "snowfall", "snow_depth"],
        "current_weather": True,
      	"current": ["weather_code", "is_day", "precipitation", "temperature_2m"],
        "timezone": "America/New_York"
    }
    response = openmeteo.weather_api(url, params=params)[0]
    current = response.Current()
    hourly = response.Hourly()
    current_temperature=current.Variables(3).Value()
    current_precipitation = current.Variables(2).Value()						
    current_weather_code = current.Variables(0).Value()
    current_is_day = current.Variables(1).Value()
    hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()[current_hour]
    hourly_rain = hourly.Variables(1).ValuesAsNumpy()[current_hour]
    hourly_showers = hourly.Variables(2).ValuesAsNumpy()[current_hour]
    hourly_snowfall = hourly.Variables(3).ValuesAsNumpy()[current_hour]
    hourly_snow_depth = hourly.Variables(4).ValuesAsNumpy()[current_hour]
    hourly_weather_code = hourly.Variables(5).ValuesAsNumpy()[current_hour]


    # Find the index of the current hour in the hourly data
    print(f"Weather data for New York City at {current_hour}: {current_weather_code}, {current_is_day}, {hourly_temperature_2m}, {hourly_rain}, {hourly_showers}, {hourly_snowfall}, {hourly_snow_depth}, {hourly_weather_code}")
    return {
        "rain": hourly_rain,
        "snowfall": hourly_snowfall,
        "weather_code": current_weather_code,
        "snow_depth": hourly_snow_depth,
        "is_day": current_is_day,
        "showers":hourly_showers,
        "temperature":current_temperature,
        "precipitation":current_precipitation
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
        result = db.brpop("predictionQueue", timeout=settings.SERVER_SLEEP)
        if result:
            queue_name, job_str = result
            job_data = json.loads(job_str.decode('utf-8'))
            job_id = job_data['id']
            form_data = job_data["formData"]
            #{id:numero, formData: {startPoint: "nombre de la zona", endPoint: "nombre de la zona", passengerCount: 1, duration: 0, distance: 0}}
                        
            print(f"Processing job ID: {job_id}")
            print(f"Job data: {form_data}")
        # Extract the necessary data from the job
            start_point = form_data["startPoint"]
            end_point = form_data["endPoint"]
            passenger_count = int(form_data["passengerCount"])
            duration = form_data["duration"]
            distance_km = form_data["distance"]
            distance_miles = distance_km * 0.621371  # Convert distance to miles

        # Get coordinates for start and end points
            start_coords = get_google_coordenate(start_point,api_key)
            end_coords = get_google_coordenate(end_point,api_key)

            if start_coords and end_coords:
            # Find LocationID for start and end points
                start_location_id = encontrar_zona_taxi(taxi_zones, start_coords["lng"], start_coords["lat"])
                end_location_id = encontrar_zona_taxi(taxi_zones, end_coords["lng"], end_coords["lat"])
                
                if start_location_id and end_location_id:
                # Get weather data for New York City
                   weather_data = get_weather_data()

                # Get current time details
                ny_timezone = pytz.timezone('America/New_York')

                # Obtener la hora actual en Nueva York
                ny_time = datetime.now(ny_timezone)
                hour = ny_time.hour
                month = ny_time.month
                day_of_week = ny_time.weekday()
    
                # Prepare features for prediction
                fare_features = [
                         distance_miles,  # trip_distance
                    1,  # payment_type (assuming 1 for simplicity)
                    weather_data["rain"],  # rain
                    weather_data["snowfall"],  # snowfall
                    passenger_count,  # passenger_count
                    weather_data["weather_code"],  # weather_code


                    weather_data["precipitation"], # precipitation (assuming 0 for simplicity)
                    hour,  # h
                    month,  # m
                    day_of_week,  # day_of_week
                    weather_data["is_day"] 
                ]
                duration_features = [
                    distance_miles,  # trip_distance
                    start_location_id,  # PULocationID
                    end_location_id,  # DOLocationID
                    weather_data["rain"],  # rain
                    weather_data["snowfall"],  # snowfall
                    weather_data["weather_code"],  # weather_code
                    weather_data["snow_depth"],  # snow_depth
                    hour,  # h
                    day_of_week,  # day_of_week
                    month,  # m
                    weather_data["is_day"]  # is_day
                ]
    
                    # Run predictions
                print(f"Running fare prediction with features: {fare_features}")
                fare_prediction = predict_fare(fare_features)
                print(f"Fare prediction: {fare_prediction}")
    
                print(f"Running duration prediction with features: {duration_features}")
                duration_prediction = predict_duration(duration_features)
                print(f"Duration prediction: {duration_prediction}")
    
                    # Prepare the output
                output ={job_id: {
                        "fare": round(float(fare_prediction * 10), 2),
                        "duration": round(float(duration_prediction * 10), 2)
                    }
                }
                    # Store the results on Redis using the original job ID as the key
                db.set("tripPredict", json.dumps(output))
                print(f"Stored prediction results in Redis: {output}")
            else:
                print("Error processing job data. Skipping...")
        # Sleep for a bit
        time.sleep(settings.SERVER_SLEEP)
         

if __name__ == "__main__":
    # Now launch process
    print("Launching ML service...")
    classify_process()
