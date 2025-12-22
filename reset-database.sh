#!/bin/bash
# reset-database.sh
# Script para limpiar y recrear base de datos PostgreSQL + Prisma

set -e  # Detener en caso de error

echo "🗑️  Limpiando base de datos PostgreSQL..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables de configuración
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="admin"
DB_NAME="cermont_fsm"

echo "${YELLOW}⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos${NC}"
echo "${YELLOW}Base de datos: ${DB_NAME}${NC}"
read -p "¿Estás seguro? (escribe 'SI' para confirmar): " confirmacion

if [ "$confirmacion" != "SI" ]; then
    echo "${RED}❌ Operación cancelada${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}📊 Paso 1: Eliminando base de datos existente...${NC}"

# Eliminar base de datos (si existe)
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres 2>/dev/null || echo "Base de datos no existe o ya fue eliminada"

echo "${GREEN}✅ Base de datos eliminada${NC}"

echo ""
echo "${YELLOW}📊 Paso 2: Creando nueva base de datos...${NC}"

# Crear nueva base de datos
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" postgres

echo "${GREEN}✅ Base de datos creada${NC}"

echo ""
echo "${YELLOW}📊 Paso 3: Limpiando archivos de migración anteriores...${NC}"

# Limpiar carpeta de migraciones (mantener carpeta)
if [ -d "apps/api/prisma/migrations" ]; then
    rm -rf apps/api/prisma/migrations/*
    echo "${GREEN}✅ Migraciones anteriores eliminadas${NC}"
else
    mkdir -p apps/api/prisma/migrations
    echo "${GREEN}✅ Carpeta de migraciones creada${NC}"
fi

echo ""
echo "${YELLOW}📊 Paso 4: Limpiando archivos generados de Prisma...${NC}"

# Limpiar Prisma Client generado
rm -rf apps/api/node_modules/.prisma 2>/dev/null || true
rm -rf node_modules/.prisma 2>/dev/null || true

echo "${GREEN}✅ Archivos Prisma Client eliminados${NC}"

echo ""
echo "${YELLOW}📊 Paso 5: Generando nuevo Prisma Client...${NC}"

# Generar Prisma Client
cd apps/api && npx prisma generate && cd ../..

echo "${GREEN}✅ Prisma Client generado${NC}"

echo ""
echo "${YELLOW}📊 Paso 6: Creando nueva migración inicial...${NC}"

# Crear migración inicial
cd apps/api && npx prisma migrate dev --name init --skip-seed && cd ../..

echo "${GREEN}✅ Migración inicial creada y aplicada${NC}"

echo ""
echo "${YELLOW}📊 Paso 7: Ejecutando seed (datos iniciales)...${NC}"

# Ejecutar seed (si existe)
if grep -q "\"prisma\"" apps/api/package.json && grep -q "seed" apps/api/package.json; then
    cd apps/api && npx prisma db seed && cd ../..
    echo "${GREEN}✅ Seed ejecutado${NC}"
else
    echo "${YELLOW}⚠️  No se encontró configuración de seed, omitiendo...${NC}"
fi

echo ""
echo "${GREEN}🎉 ¡Base de datos limpiada y recreada exitosamente!${NC}"
echo ""
echo "📋 Resumen:"
echo "  - Base de datos: ${DB_NAME}"
echo "  - Host: ${DB_HOST}:${DB_PORT}"
echo "  - Usuario: ${DB_USER}"
echo ""
echo "${YELLOW}💡 Puedes ver los datos con: cd apps/api && npx prisma studio${NC}"

