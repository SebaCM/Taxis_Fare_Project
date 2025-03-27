import { createClient } from "redis";
import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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

app.get("/tripPredict", async (req, res) => {
  console.log("query params:", req.query.id); // Log the query parameters for debugging
  const id = req.query.id; // Get the ID from the query parameters
  console.log("ID:", id); // Log the ID for debugging
  console.log("ID:", req.query["id"]); // Log the ID for debugging
  if (!id) {
    return res.status(400).send("ID is required");
  }

  try {
    const data = await client.get("tripPredict");
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log("Parsed data:", parsedData); // Log the parsed data for debugging
        if (id) { // Check if the requested ID exists in the parsed data
          res.send(JSON.stringify(parsedData[id])); // Send back only the data for the requested ID

        } else {
          return res.status(404).send("Prediction data not found for the given ID.");
        }
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
  
  const id = Object.keys(req.body)[0];
  const formData = req.body[id];
  const idnome = req.body[id].id; // Assuming idnome is a property of formData

  if (!id || !formData) {
    return res.status(400).send("ID and form data are required");
  }
  console.log("Value of 'id' before lPush:", idnome);

  try {
    // Add the job to the Redis list
    
    await client.lPush("predictionQueue", JSON.stringify({ id: idnome, formData: formData }));
    console.log("Job added to the prediction queue:", { idnome, formData });
    res.send("Job added to the prediction queue.");
  } catch (err) {
    console.error("Error adding job to queue:", err);
    res.status(500).send("Error adding job to the prediction queue.");
  }
});

const main = async () => {
  await client.connect();
  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });
};

main();