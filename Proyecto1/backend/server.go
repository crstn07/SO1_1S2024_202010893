package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/rs/cors"
	"github.com/go-sql-driver/mysql"
)

func main() {
	fmt.Println("Sistemas Operativos 1 - Tarea 1")
	mux := http.NewServeMux()
	mux.HandleFunc("/data", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"datos": "Cristian Daniel Pereira Tezagüic - 202010893"}`))
	})

	fmt.Println("Servidor corriendo en el puerto 5000")
	handler := cors.Default().Handler(mux)
	log.Fatal(http.ListenAndServe(":5000", handler))
}

func obtenerBaseDeDatos() (db *sql.DB, e error) {
	usuario := "root"
	pass := "root"
	//host := "tcp(192.168.148.245:3306)"
	host := "tcp(34.28.194.124:3306)"
	nombreBaseDeDatos := "dbp2"
	// Debe tener la forma usuario:contraseña@host/nombreBaseDeDatos
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@%s/%s", usuario, pass, host, nombreBaseDeDatos))
	if err != nil {
		return nil, err
	}
	return db, nil
}

func insertar(ram float64, cpu float64, procesos string) (e error) {
	db, err := obtenerBaseDeDatos()
	if err != nil {
		return err
	}
	defer db.Close()

	// Preparamos para prevenir inyecciones SQL
	sentenciaPreparada, err := db.Prepare("INSERT INTO Data (cpu, ram, procesos) VALUES(?, ?, ?)")
	if err != nil {
		return err
	}
	defer sentenciaPreparada.Close()
	// Ejecutar sentencia, un valor por cada '?'
	_, err = sentenciaPreparada.Exec(int(cpu), int(ram), procesos)
	if err != nil {
		return err
	}
	return nil
}