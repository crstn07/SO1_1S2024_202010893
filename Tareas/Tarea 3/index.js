const Redis = require('ioredis');

const conexion = new Redis({
  host: '10.157.244.219',
  port: 6379,
  connectTimeout: 5000,
});

function Publicar() {
  conexion.publish('test', JSON.stringify({ msg: "Hola a todos" }))
    .then(() => {
      console.log('Mensaje publicado correctamente.');
    })
    .catch(err => {
      console.error('Error al publicar el mensaje:', err);
    });
}

setInterval(Publicar, 3000);
