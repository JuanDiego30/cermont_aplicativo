#!/usr/bin/env bash
# Script para inicializar y ejecutar Cermont

echo "🚀 Iniciando Cermont..."
echo ""

# Verificar si es Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    echo "📍 Sistema: Windows"
    CD_CMD="cd"
else
    echo "📍 Sistema: Unix/Linux"
    CD_CMD="cd"
fi

echo ""
echo "1️⃣  Preparando base de datos..."
cd api

# Push schema
npx prisma db push --skip-generate

# Seed datos de prueba
npx prisma db seed

cd ..

echo ""
echo "2️⃣  Iniciando aplicación..."
npm run dev
