const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configura Redis
const client = redis.createClient({
  host: 'redis',
  port: 6379,
});

client.on('connect', () => {
  console.log('Redis conectado');
});

client.on('error', (err) => {
    console.log('Redis Error ' + err);
});

app.use(bodyParser.json());
app.use(express.static('ui')); // Sirve tus archivos HTML/JS

// ... (tus rutas existentes) ...

// Nueva ruta para obtener datos de Redis para map.js
app.get('/tripPredict', (req, res) => {
  client.get('tripPredict', (err, data) => { // Asumiendo que 'mapData' es la clave en Redis
    if (err) {
      console.error(err);
      res.status(500).send('Error al obtener datos de Redis');
    } else {
      if (data) {
        res.json(JSON.parse(data));
      } else {
        res.status(404).send('Datos no encontrados en Redis');
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

app.post('/formData', (req, res) => {
    const { startPoint, endPoint, passengerCount } = req.body;
    const formData = { startPoint, endPoint, passengerCount };
  
    client.set('formData', JSON.stringify(formData), (err, reply) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error al guardar datos del formulario en Redis');
      } else {
        res.send('Datos del formulario guardados en Redis');
      }
    });
  });