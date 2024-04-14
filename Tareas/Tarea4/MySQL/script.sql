CREATE DATABASE tarea4;
use tarea4;

create table votos(
    id_voto INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name varchar(200),
    year varchar(200),
    album varchar(200),
    _rank varchar(200)
);
DROP TABLE votos;
SELECT * FROM votos;
DELETE FROM votos;