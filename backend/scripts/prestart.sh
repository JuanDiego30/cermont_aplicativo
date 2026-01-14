#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."

# Esperar a que PostgreSQL esté disponible
until nc -z ${DB_HOST:-db} ${DB_PORT:-5432}; do
  echo "⏳ Database not ready, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Ejecutar migraciones
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed si es necesario (solo en desarrollo o primera vez)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Running database seed..."
  npx tsx prisma/seed.ts
fi

echo "🚀 Starting Cermont API..."
exec node dist/main.js
