# 🔍 Script de Diagnóstico - Verifica el estado del proyecto

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Diagnóstico del Proyecto     " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

$issues = @()
$warnings = @()
$success = @()

# ============================================
# 1. Verificar Node.js y pnpm
# ============================================
Write-Host "[1/8] Verificando herramientas..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $success += "✅ Node.js: $nodeVersion"
} catch {
    $issues += "❌ Node.js no está instalado"
}

try {
    $pnpmVersion = pnpm --version
    $success += "✅ pnpm: $pnpmVersion"
} catch {
    $issues += "❌ pnpm no está instalado (ejecuta: npm install -g pnpm)"
}

# ============================================
# 2. Verificar archivos de entorno
# ============================================
Write-Host "[2/8] Verificando configuración..." -ForegroundColor Yellow

if (Test-Path "apps/api/.env") {
    $envContent = Get-Content "apps/api/.env" -Raw
    if ($envContent -match "DATABASE_URL=") {
        $success += "✅ apps/api/.env existe y tiene DATABASE_URL"
    } else {
        $issues += "❌ apps/api/.env existe pero falta DATABASE_URL"
    }
    if ($envContent -match "JWT_SECRET=") {
        $jwtMatch = [regex]::Match($envContent, 'JWT_SECRET="([^"]+)"')
        if ($jwtMatch.Success -and $jwtMatch.Groups[1].Value.Length -ge 32) {
            $success += "✅ JWT_SECRET configurado y tiene longitud suficiente"
        } else {
            $issues += "❌ JWT_SECRET debe tener al menos 32 caracteres"
        }
    } else {
        $issues += "❌ Falta JWT_SECRET en apps/api/.env"
    }
} else {
    $issues += "❌ No existe apps/api/.env (ejecuta: .\scripts\setup-local.ps1)"
}

if (Test-Path "apps/web/.env.local") {
    $success += "✅ apps/web/.env.local existe"
} else {
    $warnings += "⚠️  apps/web/.env.local no existe (se creará automáticamente)"
}

# ============================================
# 3. Verificar dependencias
# ============================================
Write-Host "[3/8] Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    $success += "✅ node_modules existe (dependencias instaladas)"
} else {
    $issues += "❌ node_modules no existe (ejecuta: pnpm install)"
}

if (Test-Path "apps/api/node_modules") {
    $success += "✅ apps/api/node_modules existe"
} else {
    $issues += "❌ apps/api/node_modules no existe"
}

if (Test-Path "apps/web/node_modules") {
    $success += "✅ apps/web/node_modules existe"
} else {
    $issues += "❌ apps/web/node_modules no existe"
}

# ============================================
# 4. Verificar Prisma
# ============================================
Write-Host "[4/8] Verificando Prisma..." -ForegroundColor Yellow

if (Test-Path "apps/api/prisma/schema.prisma") {
    $success += "✅ schema.prisma existe"
    
    # Verificar si Prisma Client está generado
    if (Test-Path "apps/api/node_modules/.prisma/client") {
        $success += "✅ Prisma Client generado"
    } else {
        $warnings += "⚠️  Prisma Client no generado (ejecuta: cd apps/api && pnpm prisma:generate)"
    }
} else {
    $issues += "❌ No existe apps/api/prisma/schema.prisma"
}

# ============================================
# 5. Verificar migraciones
# ============================================
Write-Host "[5/8] Verificando migraciones..." -ForegroundColor Yellow

if (Test-Path "apps/api/prisma/migrations") {
    $migrations = Get-ChildItem "apps/api/prisma/migrations" -Directory
    if ($migrations.Count -gt 0) {
        $success += "✅ Existen $($migrations.Count) migración(es)"
    } else {
        $warnings += "⚠️  No hay migraciones (ejecuta: .\scripts\auto-migrate.ps1)"
    }
} else {
    $issues += "❌ Directorio de migraciones no existe"
}

# ============================================
# 6. Verificar Docker/PostgreSQL
# ============================================
Write-Host "[6/8] Verificando PostgreSQL..." -ForegroundColor Yellow

try {
    docker --version | Out-Null
    $containers = docker ps -a --filter "name=cermont-db" --format "{{.Names}}"
    if ($containers) {
        $running = docker ps --filter "name=cermont-db" --format "{{.Names}}"
        if ($running) {
            $success += "✅ PostgreSQL corriendo en Docker (cermont-db)"
        } else {
            $warnings += "⚠️  Contenedor cermont-db existe pero no está corriendo (ejecuta: docker compose up -d db)"
        }
    } else {
        $warnings += "⚠️  Contenedor cermont-db no existe (ejecuta: docker compose up -d db)"
    }
} catch {
    $warnings += "⚠️  Docker no está disponible o no está corriendo"
}

# ============================================
# 7. Verificar builds
# ============================================
Write-Host "[7/8] Verificando builds..." -ForegroundColor Yellow

if (Test-Path "apps/api/dist") {
    if (Test-Path "apps/api/dist/main.js") {
        $success += "✅ Backend compilado (apps/api/dist/main.js existe)"
    } else {
        $warnings += "⚠️  apps/api/dist existe pero falta main.js"
    }
} else {
    $warnings += "⚠️  Backend no compilado (para producción ejecuta: pnpm run build:api)"
}

if (Test-Path "apps/web/.next") {
    $success += "✅ Frontend compilado (apps/web/.next existe)"
} else {
    $warnings += "⚠️  Frontend no compilado (para producción ejecuta: pnpm run build:web)"
}

# ============================================
# 8. Verificar archivos innecesarios
# ============================================
Write-Host "[8/8] Verificando archivos temporales..." -ForegroundColor Yellow

$tempFiles = @(
    "clean_encoding_full.js",
    "clean_header.js",
    "clean_schema.js",
    "fix_encoding.js",
    "fix_schema_robust.js",
    "sanitize_schema.js",
    "api_build_errors.txt",
    "build_check.txt",
    "build_final.txt",
    "build_log*.txt",
    "gen_error.txt",
    "prisma_error.txt",
    "web_build_errors.txt"
)

$foundTempFiles = @()
foreach ($pattern in $tempFiles) {
    $files = Get-ChildItem -Path . -Filter $pattern -Recurse -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "\.git"
    }
    $foundTempFiles += $files
}

if ($foundTempFiles.Count -gt 0) {
    $warnings += "⚠️  Se encontraron $($foundTempFiles.Count) archivo(s) temporal(es) (ejecuta: .\scripts\cleanup-project.ps1)"
} else {
    $success += "✅ No se encontraron archivos temporales"
}

# ============================================
# RESUMEN
# ============================================
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  RESUMEN                       " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($success.Count -gt 0) {
    Write-Host "✅ CORRECTO ($($success.Count)):" -ForegroundColor Green
    foreach ($item in $success) {
        Write-Host "   $item" -ForegroundColor Gray
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  ADVERTENCIAS ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($item in $warnings) {
        Write-Host "   $item" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($issues.Count -gt 0) {
    Write-Host "❌ PROBLEMAS ($($issues.Count)):" -ForegroundColor Red
    foreach ($item in $issues) {
        Write-Host "   $item" -ForegroundColor Red
    }
    Write-Host ""
}

# Recomendaciones
Write-Host "📝 RECOMENDACIONES:" -ForegroundColor Cyan

if ($issues.Count -gt 0) {
    Write-Host ""
    Write-Host "🔧 Para solucionar problemas:" -ForegroundColor Yellow
    Write-Host "   1. Ejecuta: .\scripts\quick-start.ps1" -ForegroundColor White
    Write-Host "   2. O ejecuta: .\scripts\setup-local.ps1" -ForegroundColor White
    Write-Host ""
}

if ($warnings.Count -gt 0 -and $issues.Count -eq 0) {
    Write-Host ""
    Write-Host "✨ Tu proyecto está listo para desarrollo local" -ForegroundColor Green
    Write-Host "   Para iniciar: pnpm run dev" -ForegroundColor White
    Write-Host ""
}

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡Todo está perfecto! El proyecto está listo." -ForegroundColor Green
    Write-Host "   Para iniciar: pnpm run dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
