#!/bin/bash

# 📊 MÉTRICAS FINALES
# Ejecutar: bash scripts/metrics.sh

echo "📊 MÉTRICAS FINALES CERMONT"
echo "==========================="
echo ""

# Build check
echo "🔨 BUILD STATUS:"
if pnpm exec tsc --noEmit > /dev/null 2>&1; then
    echo "   ✅ TypeScript compila sin errores"
else
    echo "   ❌ Errores de compilación"
fi

# Test count
echo ""
echo "🧪 TESTS:"
TEST_FILES=$(find src -name "*.spec.ts" 2>/dev/null | wc -l)
E2E_FILES=$(find test -name "*.e2e-spec.ts" 2>/dev/null | wc -l)
echo "   📁 Tests unitarios: $TEST_FILES archivos"
echo "   📁 Tests E2E: $E2E_FILES archivos"

# Module count
echo ""
echo "📦 MÓDULOS:"
MODULES=$(find src/modules -maxdepth 1 -type d 2>/dev/null | wc -l)
echo "   Total: $((MODULES - 1)) módulos"

# DTO count
echo ""
echo "📝 DOCUMENTACIÓN:"
DTO_COUNT=$(find src -name "*.dto.ts" 2>/dev/null | wc -l)
README_COUNT=$(find src/modules -name "README.md" 2>/dev/null | wc -l)
echo "   DTOs: $DTO_COUNT"
echo "   READMEs: $README_COUNT"

# Index count
echo ""
echo "🗄️  BASE DE DATOS:"
if [ -f "prisma/schema.prisma" ]; then
    INDICES=$(grep -c "@@index" prisma/schema.prisma 2>/dev/null || echo "0")
    MODELS=$(grep -c "^model " prisma/schema.prisma 2>/dev/null || echo "0")
    echo "   Modelos: $MODELS"
    echo "   Índices: $INDICES"
fi

echo ""
echo "==========================="
echo "📋 RESUMEN"
echo "==========================="
echo ""
echo "Para ejecutar tests: pnpm test:cov"
echo "Para ver Swagger: http://localhost:3000/api/docs"
echo ""
