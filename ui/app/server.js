import { createClient } from "redis";
import express from "express";
import cors from "cors";
const app = express();
const port = 3000;

app.use(cors()); // Middleware para habilitar CORS
app.use(express.json()); // Middleware para parsear JSON en el cuerpo de las solicitudes

// Configura Redis
const client = createClient({
  url: "redis://redis:6379/0",
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

client.on("connect", () => {
  console.log("Redis conectado");
});

// Nueva ruta para obtener datos de Redis para map.js
app.get("/tripPredict", async (req, res) => {
  try {
    const data = await client.get("tripPredict");
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log("Datos de Redis (tripPredict):", parsedData);
        res.send(JSON.stringify(parsedData))
      } catch (parseError) {
        console.error("Error al parsear JSON de Redis:", parseError);
        return res.status(500).send("Error al parsear datos de Redis");
      }
    } else {
      return res.status(404).send("Datos no encontrados en Redis");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error al obtener datos de Redis");
  }
});

app.post("/formData", async (req, res) => {
  const { startPoint, endPoint, passengerCount } = req.body;
  const formData = { startPoint, endPoint, passengerCount };

  try {
    await client.set("formData", JSON.stringify(formData));
    res.send("Datos del formulario guardados en Redis");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al guardar datos del formulario en Redis");
  }
});

const main = async () => {
  await client.connect();
  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });
};

main();
