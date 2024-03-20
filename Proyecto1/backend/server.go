package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strconv"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/rs/cors"
)

func main() {
	createTables()
	go insertar()
	mux := http.NewServeMux()
	mux.HandleFunc("/api/ram", func(w http.ResponseWriter, r *http.Request) {
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
	mux.HandleFunc("/api/cpu", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Comando a ejecutar
		cmd := exec.Command("mpstat", "1", "1")
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
		idleStr := fields[10]

		// Convertir el valor de idle CPU a un número flotante
		idle, err := strconv.ParseFloat(idleStr, 64)
		if err != nil {
			fmt.Println("Error al convertir el valor de idle CPU:", err)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(`{"datos": {"uso":%f,"libre":%f}}`, 100-idle, idle)))
	})

	mux.HandleFunc("/api/hist", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		datos := obtenerDatos()
		datosJSON, err := json.Marshal(datos)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "Error al convertir los datos a JSON"}`))
			return
		}
		w.Write([]byte(fmt.Sprintf(`{"datos": %s}`, string(datosJSON))))
	})

	mux.HandleFunc("/api/procesos", func(w http.ResponseWriter, r *http.Request) {
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

	mux.HandleFunc("/api/nuevo", func(w http.ResponseWriter, r *http.Request) {
		// Crear un nuevo proceso con un comando de espera
		cmd := exec.Command("sleep", "infinity")
		err := cmd.Start()
		if err != nil {
			fmt.Print(err)
			http.Error(w, "Error al iniciar el proceso", http.StatusInternalServerError)
			return
		}

		// Obtener el comando con PID
		process := cmd

		fmt.Fprintf(w, `{"pid":%d}`, process.Process.Pid)
	})

	mux.HandleFunc("/api/parar", func(w http.ResponseWriter, r *http.Request) {
		pidStr := r.URL.Query().Get("pid")
		if pidStr == "" {
			http.Error(w, "Se requiere el parámetro 'pid'", http.StatusBadRequest)
			return
		}

		pid, err := strconv.Atoi(pidStr)
		if err != nil {
			http.Error(w, "El parámetro 'pid' debe ser un número entero", http.StatusBadRequest)
			return
		}

		// Enviar señal SIGSTOP al proceso con el PID proporcionado
		cmd := exec.Command("kill", "-SIGSTOP", strconv.Itoa(pid))
		err = cmd.Run()
		if err != nil {
			http.Error(w, fmt.Sprintf("Error al detener el proceso con PID %d", pid), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, `{"mensaje":"Proceso con PID %d detenido"}`, pid)
	})

	mux.HandleFunc("/api/resumir", func(w http.ResponseWriter, r *http.Request) {
		pidStr := r.URL.Query().Get("pid")
		if pidStr == "" {
			http.Error(w, "Se requiere el parámetro 'pid'", http.StatusBadRequest)
			return
		}

		pid, err := strconv.Atoi(pidStr)
		if err != nil {
			http.Error(w, "El parámetro 'pid' debe ser un número entero", http.StatusBadRequest)
			return
		}

		// Enviar señal SIGCONT al proceso con el PID proporcionado
		cmd := exec.Command("kill", "-SIGCONT", strconv.Itoa(pid))
		err = cmd.Run()
		if err != nil {
			http.Error(w, fmt.Sprintf("Error al reanudar el proceso con PID %d", pid), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, `{"mensaje":"Proceso con PID %d reanudado"}`, pid)
	})

	mux.HandleFunc("/api/matar", func(w http.ResponseWriter, r *http.Request) {
		pidStr := r.URL.Query().Get("pid")
		if pidStr == "" {
			http.Error(w, "Se requiere el parámetro 'pid'", http.StatusBadRequest)
			return
		}

		pid, err := strconv.Atoi(pidStr)
		if err != nil {
			http.Error(w, "El parámetro 'pid' debe ser un número entero", http.StatusBadRequest)
			return
		}

		// Enviar señal SIGCONT al proceso con el PID proporcionado
		cmd := exec.Command("kill", "-9", strconv.Itoa(pid))
		err = cmd.Run()
		if err != nil {
			http.Error(w, fmt.Sprintf("Error al intentar terminar el proceso con PID %d", pid), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, `{"mensaje":"Proceso con PID %d ha terminado"}`, pid)
	})

	fmt.Println("Servidor corriendo en el puerto 5000")
	handler := cors.Default().Handler(mux)
	log.Fatal(http.ListenAndServe(":5000", handler))
}

func nuevaConexion() (db *sql.DB, e error) {
	USER := "root"
	PASS := "password"
	HOST := "tcp(mysql:3306)"
	DB := "so1_proyecto1"
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@%s/%s", USER, PASS, HOST, DB))
	if err != nil {
		fmt.Println("ERROR:", err)
		return nil, err
	}
	fmt.Println("Conexión exitosa")
	return db, nil
}

func createTables() (e error) {
	db, err := nuevaConexion()
	if err != nil {
		return err
	}
	defer db.Close()

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS usage_data (
		id INT AUTO_INCREMENT PRIMARY KEY,
		fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		ram FLOAT,
		cpu FLOAT
	);`)
	if err != nil {
		fmt.Println("Error al crear la tabla:", err)
		return err
	}
	_, err = db.Exec("TRUNCATE TABLE usage_data;")
	if err != nil {
		fmt.Println("Error al truncar la tabla:", err)
		return err
	}
	return nil
}

func insertar() (e error) {
	db, err := nuevaConexion()
	if err != nil {
		return err
	}
	defer db.Close()
	// Canal que envía un valor en intervalos regulares
	ticker := time.Tick(3 * time.Second)

	// Loop infinito que se ejecuta en el intervalo de tiempo
	for {
		select {
		case <-ticker:
			cmd := exec.Command("cat", "/proc/ram_so1_1s2024")

			// Capturar la salida estándar y de error
			output, err := cmd.CombinedOutput()

			if err != nil {
				fmt.Printf("Error al ejecutar el comando1: %s", err)
				return err
			}

			var ram map[string]interface{}
			err2 := json.Unmarshal([]byte(output), &ram)
			if err2 != nil {
				fmt.Println("Error al decodificar JSON:", err2)
				return
			}

			// Comando a ejecutar
			cmd2 := exec.Command("mpstat", "1", "1")
			// Capturar la salida estándar y de error
			output2, err3 := cmd2.CombinedOutput()

			if err3 != nil {
				fmt.Printf("Error al ejecutar el comando2: %s", err3)
				return err3
			}
			// Convertir la salida a una cadena
			outputStr := string(output2)
			lines := strings.Split(outputStr, "\n")
			fields := strings.Fields(lines[3])
			idleStr := fields[10]

			// Convertir el valor de idle CPU a un número flotante
			cpu, err := strconv.ParseFloat(idleStr, 64)
			if err != nil {
				fmt.Println("Error al convertir el valor de idle CPU:", err)
				return err
			}

			// Preparamos para prevenir inyecciones SQL
			command_sql, err := db.Prepare("INSERT INTO usage_data (cpu, ram) VALUES(?, ?)")
			if err != nil {
				return err
			}
			defer command_sql.Close()

			ramValue, ok := ram["porcentaje"].(float64)
			if !ok {
				return fmt.Errorf("error al convertir el valor de ram")
			}

			// Ejecutar sentencia, un valor por cada '?'
			_, err = command_sql.Exec(float32(100-cpu), float32(ramValue))
			if err != nil {
				return err
			}
		}
	}
}

func obtenerDatos() map[string]interface{} {
	db, err := nuevaConexion()
	if err != nil {
		return nil
	}
	defer db.Close()

	rows, err := db.Query("SELECT ram, cpu FROM usage_data ORDER BY id DESC LIMIT 10;")
	if err != nil {
		fmt.Println("Error al obtener los datos:", err)
		return nil
	}
	defer rows.Close()
	var rams []float32
	var cpus []float32
	for rows.Next() {
		var ram float32
		var cpu float32
		err = rows.Scan(&ram, &cpu)
		if err != nil {
			fmt.Println("Error al escanear:", err)
			return nil
		}
		rams = append(rams, ram)
		cpus = append(cpus, cpu)
	}
	datos := map[string]interface{}{
		"ram": rams,
		"cpu": cpus,
	}
	return datos
}
