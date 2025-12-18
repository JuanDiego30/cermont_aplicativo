#!/bin/bash

# 🏗️ AUDITORÍA DE ARQUITECTURA DDD
# Ejecutar: bash scripts/audit-architecture.sh

echo "🏗️  INICIANDO AUDITORÍA DE ARQUITECTURA"
echo "======================================"

MODULES=("auth" "ordenes" "usuarios" "dashboard" "email" "weather" "sync" "reportes")
PASS=0
WARN=0

for MODULE in "${MODULES[@]}"; do
    echo ""
    echo "📦 Verificando módulo: $MODULE"
    
    MODULE_PATH="src/modules/$MODULE"
    
    if [ ! -d "$MODULE_PATH" ]; then
        echo "  ⚠️  Módulo $MODULE no encontrado"
        ((WARN++))
        continue
    fi
    
    # Verificar Domain
    if [ -d "$MODULE_PATH/domain" ]; then
        echo "  ✅ Domain/"
        ((PASS++))
    else
        echo "  ⚠️  Sin Domain/"
        ((WARN++))
    fi
    
    # Verificar Application
    if [ -d "$MODULE_PATH/application" ]; then
        echo "  ✅ Application/"
        ((PASS++))
    else
        echo "  ⚠️  Sin Application/"
        ((WARN++))
    fi
    
    # Verificar Infrastructure
    if [ -d "$MODULE_PATH/infrastructure" ]; then
        echo "  ✅ Infrastructure/"
        ((PASS++))
    else
        echo "  ⚠️  Sin Infrastructure/"
        ((WARN++))
    fi
    
    # Verificar README
    if [ -f "$MODULE_PATH/README.md" ]; then
        echo "  ✅ README.md"
        ((PASS++))
    else
        echo "  ⚠️  Sin README.md"
        ((WARN++))
    fi
done

echo ""
echo "======================================"
echo "📊 RESULTADO: $PASS ✅ / $WARN ⚠️"
echo "======================================"
