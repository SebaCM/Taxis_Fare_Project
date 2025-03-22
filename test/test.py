import unittest
import redis
import os
import json

# Get Redis connection details from environment variables (set by Docker Compose)
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")  # Default to localhost if not set
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
REDIS_DB = int(os.environ.get("REDIS_DB", 0))

db = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
def REDIS_FUNCION():

     print("DENTRO DE LA FUNCION")
     try:
        # Intenta conectar a Redis
         db = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)

        # Intenta ejecutar un comando simple (PING)
         response = db.ping()

         if response:
             print("Conexión a Redis exitosa.")
             output = {"fare": 31, "duration": 50}
             db.set("tripPredict", json.dumps(output))
         else:
             print("No se recibió respuesta de Redis.")

     except redis.exceptions.ConnectionError as e:
         print(f"Error de conexión a Redis: {e}")
     except redis.exceptions.AuthenticationError as e:
         print(f"Error de autenticación de Redis: {e}")
     except Exception as e:
         print(f"Ocurrió un error inesperado: {e}")

REDIS_FUNCION()
