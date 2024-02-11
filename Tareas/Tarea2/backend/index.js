const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json({ limit: '15mb' }))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
mongoose.connect('mongodb://MongoDB:27017/Tarea2');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conexión exitosa a MongoDB');
});

const Foto = mongoose.model('fotos', {
  imagen: String,
  fecha: Date,
});

app.post('/nuevaFoto', async (req, res) => {
  const { imagen, fecha } = req.body;
  console.log(imagen, fecha);
  try {
    await Foto.create({ imagen, fecha})
    res.status(201).json({ mensaje: 'Foto guardada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al guardar la foto' });
  }
});

app.listen(5000, () => {
  console.log(`Servidor corriendo en el puerto 5000`);
});
