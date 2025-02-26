from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests

app = FastAPI()

# Reemplaza con tu clave de API de Google Maps
API_KEY = "AIzaSyC8jdYcvQaFHdh0VvXtkZWz2t8PsH3hAnA"

class RouteRequest(BaseModel):
    origin: str
    destination: str

@app.post("/calculate_route")
async def calculate_route(request: RouteRequest):
    origin = request.origin
    destination = request.destination

    url = f'https://routes.googleapis.com/directions/v2:computeRoutes'
   # f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={API_KEY}"
    response = requests.get(url)
    route_data = response.json()

    if route_data['status'] == 'OK':
        # Extrae la información relevante de la respuesta de la API
        legs = route_data['routes'][0]['legs']
        distance = legs[0]['distance']['text']
        duration = legs[0]['duration']['text']

        return {"distance": distance, "duration": duration}
    else:
        raise HTTPException(status_code=500, detail=route_data['status'])