package main

import (
	"context"
	"fmt"
	"os/exec"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// obtener info de la ram mediante el modulo_ram
func (a *App) Ram() string {
	// Comando a ejecutar
	cmd := exec.Command("cat", "/proc/modulo_ram")

	// Capturar la salida estándar y de error
	output, err := cmd.CombinedOutput()

	if err != nil {
		return fmt.Sprintf("Error al ejecutar el comando: %s", err)
	}

	// Imprimir la salida del comando
	return string(output)
}
