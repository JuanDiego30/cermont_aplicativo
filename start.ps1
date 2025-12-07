#!/usr/bin/env powershell
# Script para inicializar y ejecutar Cermont

Write-Host "🚀 Iniciando Cermont..." -ForegroundColor Green
Write-Host ""

Write-Host "1️⃣  Preparando base de datos..." -ForegroundColor Cyan
Push-Location api

# Push schema
Write-Host "   - Sincronizando schema con BD..." -ForegroundColor Gray
npx prisma db push --skip-generate

# Seed datos de prueba
Write-Host "   - Creando datos de prueba..." -ForegroundColor Gray
npx prisma db seed

Pop-Location

Write-Host ""
Write-Host "2️⃣  Iniciando aplicación..." -ForegroundColor Cyan
Write-Host "   - Backend en: http://localhost:3001" -ForegroundColor Yellow
Write-Host "   - Frontend en: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

npm run dev
