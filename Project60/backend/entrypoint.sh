#!/bin/bash

set -e

echo "=== 🚀 Starting Django Backend ==="

# Wait for database
echo "=== ⏳ Waiting for database connection ==="
python wait_for_db.py

# Make migrations
echo "=== 📦 Making migrations ==="
python manage.py makemigrations --noinput

# Apply migrations
echo "=== 🔄 Applying migrations ==="
python manage.py migrate --noinput

# Initialize test data
echo "=== 🧪 Initializing test data ==="
python manage.py init_data

# Start server
echo "=== 🌐 Starting Django server ==="
echo "=== ✅ Backend is ready at http://localhost:8000 ==="
exec python manage.py runserver 0.0.0.0:8000
