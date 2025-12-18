# Script para generar SDK cliente desde OpenAPI
# Uso: .\scripts\generate-sdk.ps1

param(
    [string]$ApiUrl = "http://localhost:4000/docs-json"
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Generando SDK cliente desde OpenAPI..." -ForegroundColor Yellow

# Directorio de salida
$OutputDir = "apps/web/src/lib/api-client"

# Crear directorio si no existe
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Opción 1: Exportar desde servidor corriendo
try {
    Write-Host "📥 Descargando spec desde $ApiUrl..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $ApiUrl -OutFile "openapi.json"
}
catch {
    Write-Host "⚠️ No se pudo descargar del servidor, intentando generar localmente..." -ForegroundColor Yellow
    
    # Opción 2: Generar desde script local
    Push-Location "apps/api"
    npm run openapi:export
    Pop-Location
    Move-Item -Path "apps/api/openapi.json" -Destination "openapi.json" -Force
}

# Verificar que existe openapi.json
if (-not (Test-Path "openapi.json")) {
    Write-Host "❌ Error: No se pudo generar openapi.json" -ForegroundColor Red
    exit 1
}

# Generar tipos TypeScript con openapi-typescript
Write-Host "📝 Generando tipos TypeScript..." -ForegroundColor Cyan
npx openapi-typescript openapi.json -o "$OutputDir/types.ts"

# Generar cliente fetch con openapi-fetch
Write-Host "🔧 Generando cliente fetch..." -ForegroundColor Cyan

# Crear archivo de cliente
$ClientContent = @'
/**
 * Cliente API generado automáticamente desde OpenAPI
 * 
 * NO EDITAR MANUALMENTE - Regenerar con: npm run sdk:generate
 * 
 * Uso:
 *   import { api } from '@/lib/api-client';
 *   const { data, error } = await api.GET('/api/ordenes');
 */
import createClient from 'openapi-fetch';
import type { paths } from './types';

// Cliente base con configuración
export const api = createClient<paths>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Cliente con autenticación
export function createAuthenticatedClient(token: string) {
    return createClient<paths>({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
}

// Helper para obtener token del storage
export function getAuthClient() {
    const token = typeof window !== 'undefined' 
        ? localStorage.getItem('accessToken') 
        : null;
    
    if (!token) {
        return api;
    }
    
    return createAuthenticatedClient(token);
}

// Re-exportar tipos útiles
export type { paths, components } from './types';
'@

Set-Content -Path "$OutputDir/index.ts" -Value $ClientContent

Write-Host "✅ SDK generado exitosamente en $OutputDir" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos generados:" -ForegroundColor Cyan
Get-ChildItem $OutputDir | ForEach-Object { Write-Host "  - $_" }
Write-Host ""
Write-Host "Uso en componentes:" -ForegroundColor Yellow
Write-Host '  import { api, getAuthClient } from "@/lib/api-client";'
Write-Host '  const { data } = await getAuthClient().GET("/api/ordenes");'
