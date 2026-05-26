#!/bin/bash
# scripts/generate-test-evidence.sh
# Genera evidencia de pruebas para el Anexo G del libro de grado

set -e

echo "=== CERMONT APLICATIVO — EVIDENCIA DE PRUEBAS ==="
echo "Fecha: $(date)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "OS: $(uname -s)"
echo "==========================================="

cd backend

echo ""
echo "--- Instalando dependencias ---"
npm install --silent

echo ""
echo "--- Ejecutando suite completa de pruebas (Vitest) ---"
npx vitest run --reporter=verbose 2>&1 | tee ../test-evidence.txt

echo ""
echo "--- Resumen de cobertura ---"
npx vitest run --coverage 2>&1 | tail -20 | tee -a ../test-evidence.txt

cd ..

echo ""
echo "✅ Evidencia guardada en: test-evidence.txt"
echo "   Incluir como Anexo G en el libro de grado."
