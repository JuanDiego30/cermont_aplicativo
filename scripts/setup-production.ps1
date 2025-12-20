# 🚀 Script de Setup PRODUCCIÓN - CERMONT Aplicativo
# Configura todo para producción (VPS Contabo)

param(
    [Parameter(Mandatory=$false)]
    [string]$DatabaseUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$JwtSecret,
    
    [Parameter(Mandatory=$false)]
    [string]$FrontendUrl = "https://tu-dominio.com",
    
    [Parameter(Mandatory=$false)]
    [string]$Port = "4000"
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CERMONT - Setup PRODUCCIÓN   " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# ============================================
# 1. Verificar Node.js y pnpm
# ============================================
Write-Host "[1/6] Verificando Node.js y pnpm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
    
    # Verificar pnpm
    $pnpmVersion = pnpm --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ⚠️  pnpm no encontrado, instalando..." -ForegroundColor Yellow
        npm install -g pnpm
    }
    Write-Host "  ✅ pnpm: $(pnpm --version)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Node.js no está instalado" -ForegroundColor Red
    exit 1
}

# ============================================
# 2. Solicitar información de producción
# ============================================
Write-Host ""
Write-Host "[2/6] Configurando variables de producción..." -ForegroundColor Yellow

if (-not $DatabaseUrl) {
    Write-Host ""
    Write-Host "📝 Ingresa la URL de tu base de datos PostgreSQL:" -ForegroundColor Cyan
    Write-Host "   Ejemplo: postgresql://usuario:password@host:5432/cermont_db" -ForegroundColor Gray
    $DatabaseUrl = Read-Host "DATABASE_URL"
}

if (-not $JwtSecret) {
    Write-Host ""
    Write-Host "📝 Generando JWT_SECRET seguro..." -ForegroundColor Cyan
    # Generar secret seguro de 64 caracteres
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    Write-Host "  ✅ JWT_SECRET generado (64 caracteres)" -ForegroundColor Green
    Write-Host "  ⚠️  IMPORTANTE: Guarda este secret de forma segura" -ForegroundColor Yellow
    Write-Host "  Secret: $jwtSecret" -ForegroundColor Cyan
    Write-Host ""
    $confirmSecret = Read-Host "¿Deseas usar este secret? (S/N)"
    if ($confirmSecret -ne "S" -and $confirmSecret -ne "s") {
        $jwtSecret = Read-Host "Ingresa tu propio JWT_SECRET (mínimo 32 caracteres)"
    }
}

# ============================================
# 3. Crear archivo .env de producción
# ============================================
Write-Host ""
Write-Host "[3/6] Creando archivo .env de producción..." -ForegroundColor Yellow

$apiEnvPath = "apps/api/.env.production"
$envContent = @"
# ============================================
# CONFIGURACIÓN PRODUCCIÓN
# ============================================
NODE_ENV=production
PORT=$Port

# Base de Datos
DATABASE_URL="$DatabaseUrl"

# JWT Authentication
JWT_SECRET="$jwtSecret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Frontend URL (para CORS)
FRONTEND_URL="$FrontendUrl"

# Logging (solo errores en producción)
LOG_LEVEL=error

# Seguridad
TRUST_PROXY=true
"@

$envContent | Out-File -FilePath $apiEnvPath -Encoding UTF8 -NoNewline
Write-Host "  ✅ Archivo .env.production creado" -ForegroundColor Green

# ============================================
# 4. Instalar dependencias de producción
# ============================================
Write-Host ""
Write-Host "[4/6] Instalando dependencias de producción..." -ForegroundColor Yellow
try {
    pnpm install --prod=false
    Write-Host "  ✅ Dependencias instaladas" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Falló la instalación" -ForegroundColor Red
    exit 1
}

# ============================================
# 5. Build del proyecto
# ============================================
Write-Host ""
Write-Host "[5/6] Compilando proyecto para producción..." -ForegroundColor Yellow
try {
    Write-Host "  Compilando backend..." -ForegroundColor Cyan
    pnpm run build:api
    
    Write-Host "  Compilando frontend..." -ForegroundColor Cyan
    pnpm run build:web
    
    Write-Host "  ✅ Build completado" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Falló el build" -ForegroundColor Red
    exit 1
}

# ============================================
# 6. Generar cliente Prisma
# ============================================
Write-Host ""
Write-Host "[6/6] Generando cliente Prisma..." -ForegroundColor Yellow
try {
    Set-Location apps/api
    pnpm prisma:generate
    Set-Location ../..
    Write-Host "  ✅ Cliente Prisma generado" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Advertencia al generar Prisma" -ForegroundColor Yellow
    Set-Location ../..
}

# ============================================
# RESUMEN
# ============================================
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Setup PRODUCCIÓN completado   " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 IMPORTANTE - Próximos pasos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verifica que la base de datos esté accesible desde tu VPS" -ForegroundColor White
Write-Host ""
Write-Host "2. Aplica migraciones en producción:" -ForegroundColor White
Write-Host "   cd apps/api" -ForegroundColor Cyan
Write-Host "   cp .env.production .env" -ForegroundColor Cyan
Write-Host "   pnpm prisma:migrate deploy" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Inicia la aplicación:" -ForegroundColor White
Write-Host "   pnpm run start:api  # Backend" -ForegroundColor Cyan
Write-Host "   pnpm run start:web  # Frontend" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. O usa PM2 para producción:" -ForegroundColor White
Write-Host "   pm2 start apps/api/dist/main.js --name cermont-api" -ForegroundColor Cyan
Write-Host "   pm2 start apps/web/server.js --name cermont-web" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔒 SEGURIDAD:" -ForegroundColor Yellow
Write-Host "   - Archivo .env.production contiene secretos sensibles" -ForegroundColor Yellow
Write-Host "   - NO lo subas a Git (.gitignore debería ignorarlo)" -ForegroundColor Yellow
Write-Host "   - Mantén el JWT_SECRET seguro" -ForegroundColor Yellow
Write-Host ""
