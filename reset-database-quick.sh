#!/bin/bash
# reset-database-quick.sh
# Versión rápida usando Prisma Reset (sin confirmación)

set -e

echo "🗑️  Limpiando base de datos con Prisma Reset..."
echo "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos sin confirmación"
echo ""

cd apps/api

echo "📊 Ejecutando: npx prisma migrate reset --force"
npx prisma migrate reset --force

cd ../..

echo ""
echo "✅ ¡Base de datos limpiada y recreada!"
echo "💡 Puedes ver los datos con: cd apps/api && npx prisma studio"

