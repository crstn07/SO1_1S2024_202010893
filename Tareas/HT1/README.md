## Link del Vídeo
[https://youtu.be/dRHXvKxqkjY](https://youtu.be/dRHXvKxqkjY "Vídeo")

## Comandos Utilizados
### Para el módulo
```sh
cd ./modulo                 # Cambiar a la carpeta modulo
make all                    # Compilar archivos
sudo insmod modulo_ram.ko   # Instalar el modulo
sudo dmesg                  # Mostrar los mensajes de entrada y salida del módulo
make clean                  # Eliminar los archivos compilados
cd /proc                    # Cambiar a la carpeta proc
ls -lh                      # Listar los módulos
cat modulo_ram.ko           # Leer el archivo
sudo rmmod modulo_ram.ko    # Eliminar el módulo
```

### Para ejecutar el programa
```sh
cd ./myproject              # Cambiar a la carpeta del proyecto
wails build                 # Compilar el proyecto
./build/bin/HT1-202010893   # Ejecutar el programa
```