#!/bin/bash

# ⚡ AUDITORÍA DE PERFORMANCE
# Ejecutar: bash scripts/audit-performance.sh

echo "⚡ INICIANDO AUDITORÍA DE PERFORMANCE"
echo "====================================="

PASS=0
WARN=0

# 1. VERIFICAR ÍNDICES EN BD
echo ""
echo "1️⃣  VERIFICANDO ÍNDICES EN BD..."
if [ -f "prisma/schema.prisma" ]; then
    INDICES=$(grep -c "@@index" prisma/schema.prisma 2>/dev/null || echo "0")
    echo "   Índices encontrados: $INDICES"
    if [ "$INDICES" -ge 8 ]; then
        echo "✅ Índices adecuados"
        ((PASS++))
    else
        echo "⚠️  Pocos índices"
        ((WARN++))
    fi
else
    echo "⚠️  schema.prisma no encontrado"
    ((WARN++))
fi

# 2. VERIFICAR INCLUDES (N+1)
echo ""
echo "2️⃣  VERIFICANDO N+1 QUERIES..."
INCLUDES=$(grep -rE "include:|select:" src/ --include="*.ts" 2>/dev/null | wc -l)
if [ "$INCLUDES" -ge 5 ]; then
    echo "✅ Include/select usados ($INCLUDES casos)"
    ((PASS++))
else
    echo "⚠️  Pocos includes ($INCLUDES)"
    ((WARN++))
fi

# 3. VERIFICAR CACHÉ
echo ""
echo "3️⃣  VERIFICANDO CACHÉ..."
if grep -rE "CacheModule|CacheInterceptor|@Cache" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Caché implementado"
    ((PASS++))
else
    echo "⚠️  Caché no detectado"
    ((WARN++))
fi

# 4. VERIFICAR PAGINACIÓN
echo ""
echo "4️⃣  VERIFICANDO PAGINACIÓN..."
PAGINATION=$(grep -rE "skip|take|limit|page" src/ --include="*.ts" 2>/dev/null | wc -l)
if [ "$PAGINATION" -ge 5 ]; then
    echo "✅ Paginación implementada"
    ((PASS++))
else
    echo "⚠️  Paginación insuficiente"
    ((WARN++))
fi

# 5. VERIFICAR COMPRESSION
echo ""
echo "5️⃣  VERIFICANDO COMPRESSION..."
if grep -r "compression" src/main.ts > /dev/null 2>&1; then
    echo "✅ Compression habilitado"
    ((PASS++))
else
    echo "⚠️  Compression no detectado"
    ((WARN++))
fi

echo ""
echo "====================================="
echo "📊 RESULTADO: $PASS ✅ / $WARN ⚠️"
echo "====================================="
