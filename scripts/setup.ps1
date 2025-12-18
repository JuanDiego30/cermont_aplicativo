# 🔧 Script de Setup - CERMONT Aplicativo
# Ejecutar después de clonar el repositorio

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CERMONT - Setup Automatico    " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "[1/6] Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js no esta instalado" -ForegroundColor Red
    Write-Host "Instalar desde: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Instalar dependencias root
Write-Host ""
Write-Host "[2/6] Instalando dependencias root..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la instalacion de dependencias root" -ForegroundColor Red
    exit 1
}
Write-Host "  Dependencias root instaladas" -ForegroundColor Green

# Instalar dependencias API
Write-Host ""
Write-Host "[3/6] Instalando dependencias API (NestJS)..." -ForegroundColor Yellow
Set-Location apps/api
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la instalacion de dependencias API" -ForegroundColor Red
    exit 1
}
Write-Host "  Dependencias API instaladas" -ForegroundColor Green

# Instalar dependencias Web
Write-Host ""
Write-Host "[4/6] Instalando dependencias Web (Next.js)..." -ForegroundColor Yellow
Set-Location ../web
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la instalacion de dependencias Web" -ForegroundColor Red
    exit 1
}
Write-Host "  Dependencias Web instaladas" -ForegroundColor Green

# Volver al root
Set-Location ../..

# Verificar archivo .env
Write-Host ""
Write-Host "[5/6] Verificando configuracion .env..." -ForegroundColor Yellow
if (-not (Test-Path "apps/api/.env")) {
    Write-Host "  Creando archivo .env de ejemplo..." -ForegroundColor Yellow
    @"
# DATABASE
DATABASE_URL="postgresql://user:password@localhost:5432/cermont?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# API
PORT=4000
NODE_ENV=development

# FRONTEND URL
FRONTEND_URL="http://localhost:3000"

# GOOGLE OAUTH (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:4000/auth/google/callback"

# WEATHER API (Optional - Open-Meteo is free and doesn't require key)
# OPENWEATHER_API_KEY=""
"@ | Out-File -FilePath "apps/api/.env" -Encoding UTF8
    Write-Host "  Archivo .env creado" -ForegroundColor Green
    Write-Host "  IMPORTANTE: Edita apps/api/.env con tu DATABASE_URL" -ForegroundColor Yellow
}
else {
    Write-Host "  Archivo .env existente encontrado" -ForegroundColor Green
}

# Auditoría de seguridad
Write-Host ""
Write-Host "[6/6] Ejecutando auditoria de seguridad..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=== API ===" -ForegroundColor Cyan
Set-Location apps/api
npm audit 2>$null
Set-Location ../..
Write-Host ""
Write-Host "=== WEB ===" -ForegroundColor Cyan
Set-Location apps/web
npm audit 2>$null
Set-Location ../..

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Setup completado exitosamente " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Editar apps/api/.env con tu DATABASE_URL" -ForegroundColor White
Write-Host "  2. Ejecutar migraciones: cd apps/api && npx prisma migrate dev" -ForegroundColor White
Write-Host "  3. (Opcional) Seed: cd apps/api && npm run seed" -ForegroundColor White
Write-Host "  4. Iniciar desarrollo: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Documentacion API: http://localhost:4000/api" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
