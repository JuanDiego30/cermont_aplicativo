$ErrorActionPreference = "SilentlyContinue"

Write-Host "🔍 INICIANDO VERIFICACIÓN COMPLETA (WINDOWS/POWERSHELL)" -ForegroundColor Cyan
Write-Host "======================================================"

$pass = 0
$fail = 0
$warn = 0

# 1. SEGURIDAD
Write-Host "`n🔐 AUDITORÍA DE SEGURIDAD" -ForegroundColor Yellow

# Env Validation
if (Select-String -Path "src/main.ts" -Pattern "validateEnv|ConfigModule") {
    Write-Host "  ✅ Validación ENV detectada" -ForegroundColor Green
    $pass++
}
else {
    Write-Host "  ❌ FALTA: Validación ENV en main.ts" -ForegroundColor Red
    $fail++
}

# Secrets - Ultra simplified pattern to avoid PowerShell parsing errors
$secrets = Select-String -Path "src/*.ts" -Pattern "password\s*[:=]|secret\s*[:=]" -Exclude "*.spec.ts", "*.test.ts"
if ($secrets.Count -eq 0) {
    Write-Host "  ✅ No hay secrets hardcodeados evidentes" -ForegroundColor Green
    $pass++
}
else {
    Write-Host "  ⚠️  Posibles secrets encontrados: $($secrets.Count)" -ForegroundColor Yellow
    $warn++
}

# Helmet
if (Select-String -Path "src/main.ts" -Pattern "helmet") {
    Write-Host "  ✅ Helmet configurado" -ForegroundColor Green
    $pass++
}
else {
    Write-Host "  ❌ FALTA: Helmet" -ForegroundColor Red
    $fail++
}

# CORS
if (Select-String -Path "src/main.ts" -Pattern "enableCors|cors") {
    Write-Host "  ✅ CORS configurado" -ForegroundColor Green
    $pass++
}
else {
    Write-Host "  ❌ FALTA: CORS" -ForegroundColor Red
    $fail++
}

# Rate Limiting
if (Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | Select-String -Pattern "Throttler|ThrottlerGuard|@Throttle") {
    Write-Host "  ✅ Rate Limiting detectado" -ForegroundColor Green
    $pass++
}
else {
    Write-Host "  ❌ FALTA: Rate Limiting" -ForegroundColor Red
    $fail++
}

# 2. ARQUITECTURA
Write-Host "`n🏗️  AUDITORÍA DE ARQUITECTURA" -ForegroundColor Yellow

$modules = @("auth", "ordenes", "usuarios", "dashboard", "email", "weather", "sync")
foreach ($mod in $modules) {
    $path = "src/modules/$mod"
    if (Test-Path $path) {
        $checkDomain = Test-Path "$path/domain"
        
        if ($checkDomain) {
            Write-Host "  ✅ $mod: Estructura DDD parcial/correcta" -ForegroundColor Green
            $pass++
        }
        else {
            Write-Host "  ⚠️  $mod: Sin capa domain explícita" -ForegroundColor Yellow
            $warn++
        }
    }
    else {
        Write-Host "  ⚠️  Módulo $mod no encontrado" -ForegroundColor DarkGray
    }
}

# 3. PERFORMANCE
Write-Host "`n⚡ AUDITORÍA DE PERFORMANCE" -ForegroundColor Yellow

# Indices
if (Test-Path "prisma/schema.prisma") {
    $indices = (Select-String -Path "prisma/schema.prisma" -Pattern "@@index").Count
    if ($indices -ge 5) {
        Write-Host "  ✅ Índices en DB: $indices" -ForegroundColor Green
        $pass++
    }
    else {
        Write-Host "  ⚠️  Pocos índices en DB: $indices" -ForegroundColor Yellow
        $warn++
    }
}

# Pagination
if (Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | Select-String -Pattern "skip|take|limit|page") {
    Write-Host "  ✅ Paginación detectada en código" -ForegroundColor Green
    $pass++
}
else {
    Write-Host "  ⚠️  Posible falta de paginación" -ForegroundColor Yellow
    $warn++
}

# Compression
if (Select-String -Path "src/main.ts" -Pattern "compression") {
    Write-Host "  ✅ Gzip Compression habilitada" -ForegroundColor Green
    $pass++
}
else {
    Write-Host "  ⚠️  Compression no detectada en main.ts" -ForegroundColor Yellow
    $warn++
}

# SUMMARY
Write-Host "`n======================================================"
Write-Host "📊 RESULTADO FINAL"
Write-Host "✅ PASSED: $pass" -ForegroundColor Green
Write-Host "⚠️  WARNINGS: $warn" -ForegroundColor Yellow
Write-Host "❌ FAILED: $fail" -ForegroundColor Red

if ($fail -eq 0) {
    Write-Host "`n🎉 AUDITORÍA APROBADA" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`n🚫 AUDITORÍA CON FALLOS BLOQUEANTES" -ForegroundColor Red
    exit 1
}
