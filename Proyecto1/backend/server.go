package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strconv"
	"strings"

	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/ram", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Comando a ejecutar
		cmd := exec.Command("cat", "/proc/ram_so1_1s2024")

		// Capturar la salida estándar y de error
		output, err := cmd.CombinedOutput()

		if err != nil {
			//return fmt.Sprintf("Error al ejecutar el comando: %s", err)
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "Error al ejecutar el comando"}`))
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(`{"datos": %s}`, string(output))))
	})
	//mpstat | awk '{print $12}' | sed 's/'%idle'//g' | sed -z 's/\n//g'
	mux.HandleFunc("/cpu", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Comando a ejecutar
		//cmd := exec.Command("mpstat", "", "|", "awk", "'{print $12}'", "|", "sed", "'s/'%idle'//g'", "|", "sed", "-z", "'s/\n//g'")
		cmd := exec.Command("mpstat", "-P", "0", "1", "1")
		// Capturar la salida estándar y de error
		output, err := cmd.CombinedOutput()

		if err != nil {
			//return fmt.Sprintf("Error al ejecutar el comando: %s", err)
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "Error al ejecutar el comando"}`))
			return
		}
		// Convertir la salida a una cadena
		outputStr := string(output)

		// Dividir la salida en líneas
		lines := strings.Split(outputStr, "\n")

		// Dividir la línea en campos
		fields := strings.Fields(lines[3])

		// Recuperar el valor de idle CPU (en la columna 12)
		idleStr := fields[11]

		// Convertir el valor de idle CPU a un número flotante
		idle, err := strconv.ParseFloat(idleStr, 64)
		if err != nil {
			fmt.Println("Error al convertir el valor de idle CPU:", err)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(`{"datos": {"uso":%f,"libre":%f}}`, 100-idle, idle)))
	})

	mux.HandleFunc("/procesos", func(w http.ResponseWriter, r *http.Request) {
		// Comando a ejecutar
		cmd := exec.Command("cat", "/proc/cpu_so1_1s2024")

		// Capturar la salida estándar y de error
		output, err := cmd.CombinedOutput()
		w.Header().Set("Content-Type", "application/json")

		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "Error al ejecutar el comando"}`))
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(`{"datos": %s}`, string(output))))
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
