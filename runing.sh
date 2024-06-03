#!/bin/bash

# Muestra un mensaje en la consola
echo "Sistema en marcha"

# Ejecuta main.js con Node.js
node main.js &

# Espera unos segundos para asegurarse de que el servidor esté en marcha
sleep 3

# Abre la URL en el navegador predeterminado
xdg-open http://localhost:3000/

# Para macOS, usa:
# open http://localhost:3000/

# Para Windows (Git Bash), usa:
# start http://localhost:3000/
