#!/usr/bin/env bash
# build.sh

# Salir si hay errores
set -o errexit

# Instala dependencias (si Render no lo hace automáticamente)
pip install -r requirements.txt

# Ejecutar migraciones
python barber/manage.py migrate

# Recolectar archivos estáticos para producción
python barber/manage.py collectstatic --noinput
