const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;
app.use(cors({
  origin: '*' // Permite solicitudes desde cualquier origen
}));
app.use(bodyParser.json());

mongoose.connect('mongodb://35.193.21.119:27017/so1-proyecto2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión exitosa a la base de datos.');
}).catch(err => {
  console.error('Error de conexión a la base de datos:', err);
  process.exit(1);
});

  const Schema = mongoose.Schema;
  const esquema = new Schema({
    log: String
  });
  const Logs = mongoose.model('logs', esquema);

  app.get("/logs", async (req, res) => {
      try {
        const ultimosIngresos = await Logs.find().sort({ _id: -1 }).limit(20);
        res.json(ultimosIngresos);
      } catch (error) {
        res.status(500).json({ error: "Error al obtener los logs ingresados" });
      }
    });
    
  app.get("/", (req, res) => {
      res.send("Servidor Express funcionando correctamente.");
    });

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});