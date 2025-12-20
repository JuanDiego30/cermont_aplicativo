# 🔍 Script para verificar qué endpoints están siendo usados
# Analiza el frontend para ver qué rutas del backend se usan

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Análisis de Endpoints        " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Buscar todas las llamadas a apiClient en el frontend
Write-Host "🔍 Buscando llamadas a la API en el frontend..." -ForegroundColor Yellow

$apiCalls = @()

# Buscar en archivos TypeScript/TSX
$files = Get-ChildItem -Path "apps/web/src" -Include *.ts,*.tsx -Recurse | Where-Object {
    $_.FullName -notmatch "node_modules"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Buscar patrones como apiClient.get('/ruta'), apiClient.post('/ruta'), etc.
        $matches = [regex]::Matches($content, "apiClient\.(get|post|patch|put|delete)\s*\(\s*['""]([^'""]+)['""]")
        foreach ($match in $matches) {
            $method = $match.Groups[1].Value.ToUpper()
            $endpoint = $match.Groups[2].Value
            $apiCalls += [PSCustomObject]@{
                File = $file.FullName.Replace((Get-Location).Path + "\", "")
                Method = $method
                Endpoint = $endpoint
            }
        }
        
        # Buscar también en archivos .api.ts que usan apiClient
        if ($file.Name -match "\.api\.ts$") {
            $matches = [regex]::Matches($content, "['""](/[^'""]+)['""]")
            foreach ($match in $matches) {
                $endpoint = $match.Groups[1].Value
                if ($endpoint -match "^/") {
                    $apiCalls += [PSCustomObject]@{
                        File = $file.FullName.Replace((Get-Location).Path + "\", "")
                        Method = "GET"
                        Endpoint = $endpoint
                    }
                }
            }
        }
    }
}

# Agrupar por endpoint
$grouped = $apiCalls | Group-Object Endpoint | Sort-Object Count -Descending

Write-Host ""
Write-Host "📊 Endpoints encontrados en el frontend:" -ForegroundColor Cyan
Write-Host ""

$endpointsUsed = @()
foreach ($group in $grouped) {
    $endpoint = $group.Name
    $count = $group.Count
    $files = ($group.Group | Select-Object -First 3 -ExpandProperty File) -join ", "
    
    Write-Host "  ✅ $endpoint" -ForegroundColor Green
    Write-Host "     Usado en $count lugar(es): $files" -ForegroundColor Gray
    $endpointsUsed += $endpoint
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Green
Write-Host "  Resumen                      " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Total de endpoints únicos usados: $($endpointsUsed.Count)" -ForegroundColor Cyan
Write-Host ""

# Buscar controladores en el backend
Write-Host "🔍 Buscando endpoints definidos en el backend..." -ForegroundColor Yellow

$backendEndpoints = @()
$controllerFiles = Get-ChildItem -Path "apps/api/src" -Include *.controller.ts -Recurse

foreach ($file in $controllerFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Buscar decoradores @Get, @Post, etc.
        $matches = [regex]::Matches($content, "@(Get|Post|Patch|Put|Delete)\s*\(['""]?([^'""\)]+)['""]?\)")
        foreach ($match in $matches) {
            $method = $match.Groups[1].Value.ToUpper()
            $route = $match.Groups[2].Value
            
            # Obtener el prefijo del controlador
            $controllerMatch = [regex]::Match($content, "@Controller\s*\(['""]([^'""]+)['""]\)")
            $prefix = if ($controllerMatch.Success) { $controllerMatch.Groups[1].Value } else { "" }
            
            $fullPath = if ($prefix) { "/$prefix$route" } else { $route }
            if (-not $fullPath.StartsWith("/")) { $fullPath = "/$fullPath" }
            
            $backendEndpoints += [PSCustomObject]@{
                File = $file.Name
                Method = $method
                Endpoint = $fullPath
            }
        }
    }
}

Write-Host ""
Write-Host "📊 Endpoints definidos en el backend:" -ForegroundColor Cyan
Write-Host "Total: $($backendEndpoints.Count)" -ForegroundColor White
Write-Host ""

# Comparar
$backendEndpointPaths = $backendEndpoints | Select-Object -ExpandProperty Endpoint -Unique
$unusedEndpoints = $backendEndpointPaths | Where-Object { $_ -notin $endpointsUsed }
$missingEndpoints = $endpointsUsed | Where-Object { $_ -notin $backendEndpointPaths }

Write-Host "================================" -ForegroundColor Yellow
Write-Host "  Análisis de Uso              " -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""

if ($unusedEndpoints.Count -gt 0) {
    Write-Host "⚠️  Endpoints del backend NO usados en frontend ($($unusedEndpoints.Count)):" -ForegroundColor Yellow
    foreach ($ep in $unusedEndpoints | Select-Object -First 10) {
        Write-Host "   - $ep" -ForegroundColor Gray
    }
    if ($unusedEndpoints.Count -gt 10) {
        Write-Host "   ... y $($unusedEndpoints.Count - 10) más" -ForegroundColor Gray
    }
    Write-Host ""
}

if ($missingEndpoints.Count -gt 0) {
    Write-Host "❌ Endpoints usados en frontend pero NO encontrados en backend:" -ForegroundColor Red
    foreach ($ep in $missingEndpoints) {
        Write-Host "   - $ep" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "✅ Endpoints correctamente conectados: $($endpointsUsed.Count - $missingEndpoints.Count)" -ForegroundColor Green
Write-Host ""
