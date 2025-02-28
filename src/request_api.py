from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx

app = FastAPI()

# Reemplaza con tu clave de API de Google Maps
API_KEY = "AIzaSyDnhBrF6rtcc0VS066RFF012bBd0sRJAJU"

class RouteRequest(BaseModel):
    origin: str
    destination: str

@app.post("/calculate_route")
async def calculate_route(request: RouteRequest):
    origin = request.origin
    destination = request.destination

    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={API_KEY}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        route_data = response.json()

    if 'status' in route_data and route_data['status'] == 'OK':
        # Extrae la información relevante de la respuesta de la API
        legs = route_data['routes'][0]['legs']
        distance = legs[0]['distance']['text']
        duration = legs[0]['duration']['text']

        return {"distance": distance, "duration": duration}
    else:
        error_message = route_data.get('error_message', 'Unknown error')
        raise HTTPException(status_code=500, detail=error_message)