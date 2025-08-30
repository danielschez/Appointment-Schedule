#!/usr/bin/env bash
# build.sh

# Salir si hay errores
set -o errexit

# Mostrar información de debug
echo "=== BUILD SCRIPT DEBUG ==="
echo "Current directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Contents of current directory:"
ls -la

# Instala dependencias
echo "=== INSTALLING DEPENDENCIES ==="
pip install -r barber/requirements.txt

# Cambiar al directorio del proyecto Django
cd barber

echo "=== DJANGO PROJECT DIRECTORY ==="
echo "Current directory: $(pwd)"
echo "Contents:"
ls -la

# Ejecutar migraciones
echo "=== RUNNING MIGRATIONS ==="
python manage.py migrate

# Recolectar archivos estáticos para producción
echo "=== COLLECTING STATIC FILES ==="
python manage.py collectstatic --noinput --verbosity=2

# Mostrar lo que se recopiló
echo "=== STATIC FILES COLLECTED ==="
if [ -d "staticfiles" ]; then
    echo "staticfiles directory exists"
    ls -la staticfiles/
    if [ -d "staticfiles/admin" ]; then
        echo "admin static files found:"
        ls -la staticfiles/admin/
    else
        echo "ERROR: admin static files not found!"
    fi
else
    echo "ERROR: staticfiles directory not created!"
fi

echo "=== BUILD COMPLETE ==="