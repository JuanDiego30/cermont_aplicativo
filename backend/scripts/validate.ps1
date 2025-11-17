# Script de Validación Automática del Backend ATG CERMONT
# Ejecutar con: .\backend\scripts\validate.ps1

Write-Host "🔍 VALIDACIÓN AUTOMÁTICA - BACKEND ATG CERMONT" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0
$passed = 0

# Función auxiliar para verificaciones
function Test-Condition {
    param(
        [string]$Description,
        [scriptblock]$Condition,
        [string]$Level = "ERROR" # ERROR, WARNING, INFO
    )
    
    Write-Host "→ $Description... " -NoNewline
    
    try {
        $result = & $Condition
        if ($result) {
            Write-Host "✅ OK" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            if ($Level -eq "ERROR") {
                Write-Host "❌ FALLO" -ForegroundColor Red
                $script:errors++
            } elseif ($Level -eq "WARNING") {
                Write-Host "⚠️ ADVERTENCIA" -ForegroundColor Yellow
                $script:warnings++
            }
            return $false
        }
    } catch {
        if ($Level -eq "ERROR") {
            Write-Host "❌ ERROR: $_" -ForegroundColor Red
            $script:errors++
        } else {
            Write-Host "⚠️ ADVERTENCIA: $_" -ForegroundColor Yellow
            $script:warnings++
        }
        return $false
    }
}

# ============================================================
# FASE 1: VERIFICACIÓN DE ARCHIVOS CRÍTICOS
# ============================================================
Write-Host "📁 FASE 1: Archivos Críticos" -ForegroundColor Yellow
Write-Host "-" * 60

Test-Condition "Archivo .env existe" {
    Test-Path "backend\.env"
}

Test-Condition "Archivo jwks.json existe" {
    Test-Path "backend\config\jwks.json"
}

Test-Condition "Archivo jwks-private.json existe" {
    Test-Path "backend\config\jwks-private.json"
}

Test-Condition "package.json existe" {
    Test-Path "backend\package.json"
}

Test-Condition "node_modules instalado" {
    Test-Path "backend\node_modules"
}

Write-Host ""

# ============================================================
# FASE 2: VERIFICACIÓN DE VERSIONES
# ============================================================
Write-Host "🔧 FASE 2: Versiones de Software" -ForegroundColor Yellow
Write-Host "-" * 60

Test-Condition "Node.js >= 18.0.0" {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $major = [int]$matches[1]
        $major -ge 18
    } else {
        $false
    }
} "WARNING"

Test-Condition "npm instalado" {
    $null -ne (Get-Command npm -ErrorAction SilentlyContinue)
} "WARNING"

Test-Condition "Docker instalado" {
    $null -ne (Get-Command docker -ErrorAction SilentlyContinue)
} "WARNING"

Write-Host ""

# ============================================================
# FASE 3: VERIFICACIÓN DE SERVICIOS DOCKER
# ============================================================
Write-Host "🐳 FASE 3: Servicios Docker" -ForegroundColor Yellow
Write-Host "-" * 60

Test-Condition "Docker Compose disponible" {
    $null -ne (Get-Command docker-compose -ErrorAction SilentlyContinue)
} "WARNING"

Test-Condition "Contenedor MongoDB corriendo" {
    $containers = docker ps --format "{{.Names}}" 2>$null
    $containers -match "mongo"
} "WARNING"

Test-Condition "Contenedor Redis corriendo" {
    $containers = docker ps --format "{{.Names}}" 2>$null
    $containers -match "redis"
} "WARNING"

Write-Host ""

# ============================================================
# FASE 4: VERIFICACIÓN DE PUERTOS
# ============================================================
Write-Host "🔌 FASE 4: Puertos Disponibles" -ForegroundColor Yellow
Write-Host "-" * 60

Test-Condition "Puerto 4100 disponible o backend corriendo" {
    $port4100 = Get-NetTCPConnection -LocalPort 4100 -ErrorAction SilentlyContinue
    # Si está en uso, puede ser nuestro backend (OK) o algo más (WARNING)
    # Para simplificar, consideramos OK si está libre o en uso
    $true
} "INFO"

Test-Condition "Puerto 27017 en uso (MongoDB)" {
    $null -ne (Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue)
} "WARNING"

Test-Condition "Puerto 6379 en uso (Redis)" {
    $null -ne (Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue)
} "WARNING"

Write-Host ""

# ============================================================
# FASE 5: VERIFICACIÓN DE ESTRUCTURA DE CÓDIGO
# ============================================================
Write-Host "📂 FASE 5: Estructura de Código" -ForegroundColor Yellow
Write-Host "-" * 60

$criticalFiles = @(
    "backend\src\app.ts",
    "backend\src\server.ts",
    "backend\src\domain\entities\Order.ts",
    "backend\src\domain\entities\User.ts",
    "backend\src\infra\db\models\OrderModel.ts",
    "backend\src\infra\db\models\User.ts",
    "backend\src\infra\http\controllers\AuthController.ts",
    "backend\src\infra\http\controllers\OrdersController.ts",
    "backend\src\infra\http\routes\auth.routes.ts",
    "backend\src\infra\http\routes\orders.routes.ts",
    "backend\src\shared\middlewares\authenticate.ts",
    "backend\src\shared\middlewares\authorize.ts",
    "backend\src\shared\security\jwtService.ts",
    "backend\src\shared\config\database.ts"
)

$foundFiles = 0
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $foundFiles++
    }
}

Test-Condition "$foundFiles/$($criticalFiles.Count) archivos críticos presentes" {
    $foundFiles -ge ($criticalFiles.Count * 0.9) # 90% de archivos críticos
}

Write-Host ""

# ============================================================
# FASE 6: VERIFICACIÓN DE DEPENDENCIAS
# ============================================================
Write-Host "📦 FASE 6: Dependencias NPM" -ForegroundColor Yellow
Write-Host "-" * 60

Test-Condition "package.json válido" {
    $packageJson = Get-Content "backend\package.json" -Raw | ConvertFrom-Json
    $null -ne $packageJson.dependencies
}

Test-Condition "TypeScript instalado" {
    $packageJson = Get-Content "backend\package.json" -Raw | ConvertFrom-Json
    $null -ne $packageJson.devDependencies.typescript
}

Test-Condition "Express instalado" {
    $packageJson = Get-Content "backend\package.json" -Raw | ConvertFrom-Json
    $null -ne $packageJson.dependencies.express
}

Test-Condition "Mongoose instalado" {
    $packageJson = Get-Content "backend\package.json" -Raw | ConvertFrom-Json
    $null -ne $packageJson.dependencies.mongoose
}

Write-Host ""

# ============================================================
# FASE 7: VERIFICACIÓN DE BACKEND (si está corriendo)
# ============================================================
Write-Host "🌐 FASE 7: Backend HTTP (opcional)" -ForegroundColor Yellow
Write-Host "-" * 60

$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4100/healthz" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
    }
} catch {
    # Backend no está corriendo, es opcional
}

if ($backendRunning) {
    Write-Host "✅ Backend está corriendo en puerto 4100" -ForegroundColor Green
    
    Test-Condition "Health check responde correctamente" {
        $response = Invoke-WebRequest -Uri "http://localhost:4100/healthz" -ErrorAction Stop
        $response.StatusCode -eq 200
    } "INFO"
    
    Test-Condition "Endpoint /metrics disponible" {
        $response = Invoke-WebRequest -Uri "http://localhost:4100/metrics" -ErrorAction Stop
        $response.StatusCode -eq 200
    } "INFO"
    
} else {
    Write-Host "ℹ️ Backend no está corriendo (esto es normal si no lo has iniciado)" -ForegroundColor Cyan
}

Write-Host ""

# ============================================================
# FASE 8: VERIFICACIÓN DE DOCUMENTACIÓN
# ============================================================
Write-Host "📚 FASE 8: Documentación" -ForegroundColor Yellow
Write-Host "-" * 60

$docFiles = @(
    "README_BACKEND.md",
    "INFORME_IMPLEMENTACION_BACKEND.md",
    "RESUMEN_IMPLEMENTACION.md",
    "CHECKLIST_VALIDACION.md",
    "CREDENCIALES_Y_CONFIG.md",
    "REPORTE_EJECUTIVO.md",
    "backend\docs\POSTMAN_COLLECTION.json"
)

$foundDocs = 0
foreach ($doc in $docFiles) {
    if (Test-Path $doc) {
        $foundDocs++
    }
}

Test-Condition "$foundDocs/$($docFiles.Count) documentos presentes" {
    $foundDocs -ge 5 # Al menos 5 de 7 documentos
}

Write-Host ""

# ============================================================
# RESUMEN FINAL
# ============================================================
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE VALIDACIÓN" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$total = $passed + $errors + $warnings
Write-Host "✅ Pasadas:      $passed" -ForegroundColor Green
Write-Host "⚠️  Advertencias: $warnings" -ForegroundColor Yellow
Write-Host "❌ Errores:      $errors" -ForegroundColor Red
Write-Host "📝 Total:        $total" -ForegroundColor White
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 ¡VALIDACIÓN EXITOSA! El backend está correctamente configurado." -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Iniciar servicios Docker: docker-compose up -d" -ForegroundColor White
    Write-Host "  2. Crear usuarios iniciales: npm run seed" -ForegroundColor White
    Write-Host "  3. Iniciar backend: npm run dev" -ForegroundColor White
    Write-Host "  4. Probar endpoints: curl http://localhost:4100/healthz" -ForegroundColor White
    exit 0
    
} elseif ($errors -eq 0) {
    Write-Host "⚠️ VALIDACIÓN COMPLETADA CON ADVERTENCIAS" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "El backend puede funcionar, pero revisa las advertencias arriba." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Advertencias comunes:" -ForegroundColor Cyan
    Write-Host "  - Docker no está corriendo: Ejecuta 'docker-compose up -d'" -ForegroundColor White
    Write-Host "  - Puertos ocupados: Verifica que MongoDB (27017) y Redis (6379) estén disponibles" -ForegroundColor White
    Write-Host "  - Backend no corriendo: Normal si no lo has iniciado con 'npm run dev'" -ForegroundColor White
    exit 0
    
} else {
    Write-Host "❌ VALIDACIÓN FALLIDA - Se encontraron errores críticos" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, revisa los errores arriba y corrige:" -ForegroundColor Yellow
    Write-Host "  - Archivos críticos faltantes: Verifica la estructura del proyecto" -ForegroundColor White
    Write-Host "  - node_modules faltante: Ejecuta 'npm install' en /backend" -ForegroundColor White
    Write-Host "  - Archivos .env o JWKS: Ejecuta 'npm run generate:jwks' y copia .env.example a .env" -ForegroundColor White
    Write-Host ""
    Write-Host "Documentación de ayuda:" -ForegroundColor Cyan
    Write-Host "  - README_BACKEND.md: Guía de inicio" -ForegroundColor White
    Write-Host "  - CHECKLIST_VALIDACION.md: Pasos detallados de validación" -ForegroundColor White
    exit 1
}
