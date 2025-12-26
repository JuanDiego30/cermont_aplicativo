# Script de Pruebas de Integración - Taskill Nivel 4
# Uso: .\scripts\test-integration.ps1

Write-Host "🧪 TASKILL NIVEL 4: Pruebas de Integración" -ForegroundColor Cyan
Write-Host ""

# Colores
$success = "✅"
$error = "❌"
$info = "ℹ️"

# Variables
$backendUrl = "http://localhost:4000"
$frontendUrl = "http://localhost:4200"
$apiUrl = "$backendUrl/api"

# Función para hacer requests
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
        }
    }
    catch {
        return @{
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode.value__
            Error = $_.Exception.Message
        }
    }
}

# TEST 1: Health Check
Write-Host "TEST 1: Health Check" -ForegroundColor Yellow
Write-Host "  Probando: GET $apiUrl/health" -ForegroundColor Gray

$health = Test-Endpoint -Method "GET" -Url "$apiUrl/health"

if ($health.Success) {
    Write-Host "  $success Health check OK (Status: $($health.StatusCode))" -ForegroundColor Green
    Write-Host "  Response: $($health.Content | ConvertTo-Json -Compress)" -ForegroundColor Gray
}
else {
    Write-Host "  $error Health check FALLÓ (Status: $($health.StatusCode))" -ForegroundColor Red
    Write-Host "  Error: $($health.Error)" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Backend no está corriendo o no responde. Inicia con: cd apps/api && pnpm start:dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# TEST 2: Proxy Check (si frontend está corriendo)
Write-Host "TEST 2: Proxy Check" -ForegroundColor Yellow
Write-Host "  Probando: GET $frontendUrl/api/health (proxy)" -ForegroundColor Gray

$proxyHealth = Test-Endpoint -Method "GET" -Url "$frontendUrl/api/health"

if ($proxyHealth.Success) {
    Write-Host "  $success Proxy funciona (Status: $($proxyHealth.StatusCode))" -ForegroundColor Green
}
else {
    Write-Host "  $error Proxy NO funciona (Status: $($proxyHealth.StatusCode))" -ForegroundColor Red
    Write-Host "  ℹ️  Frontend no está corriendo o proxy no está configurado" -ForegroundColor Yellow
    Write-Host "  Inicia con: cd apps/web && pnpm start" -ForegroundColor Yellow
}

Write-Host ""

# TEST 3: Auth Login (requiere credenciales)
Write-Host "TEST 3: Auth Login" -ForegroundColor Yellow
Write-Host "  Probando: POST $apiUrl/auth/login" -ForegroundColor Gray
Write-Host "  ℹ️  Este test requiere credenciales válidas" -ForegroundColor Yellow

$loginBody = @{
    email = "admin@cermont.com"
    password = "password123"
} | ConvertTo-Json

$login = Test-Endpoint -Method "POST" -Url "$apiUrl/auth/login" -Body $loginBody

if ($login.Success) {
    Write-Host "  $success Login OK (Status: $($login.StatusCode))" -ForegroundColor Green
    $token = $login.Content.token
    if ($token) {
        Write-Host "  $success Token recibido: $($token.Substring(0, 20))..." -ForegroundColor Green
        
        # TEST 4: Auth Me (con token)
        Write-Host ""
        Write-Host "TEST 4: Auth Me (con token)" -ForegroundColor Yellow
        Write-Host "  Probando: GET $apiUrl/auth/me" -ForegroundColor Gray
        
        $me = Test-Endpoint -Method "GET" -Url "$apiUrl/auth/me" -Headers @{
            "Authorization" = "Bearer $token"
        }
        
        if ($me.Success) {
            Write-Host "  $success Auth Me OK (Status: $($me.StatusCode))" -ForegroundColor Green
            Write-Host "  User: $($me.Content.email) - Role: $($me.Content.role)" -ForegroundColor Gray
        }
        else {
            Write-Host "  $error Auth Me FALLÓ (Status: $($me.StatusCode))" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  $error Token no recibido en respuesta" -ForegroundColor Red
    }
}
else {
    Write-Host "  $error Login FALLÓ (Status: $($login.StatusCode))" -ForegroundColor Red
    Write-Host "  Error: $($login.Error)" -ForegroundColor Red
    Write-Host "  ℹ️  Verifica credenciales o que el usuario exista en la BD" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Pruebas completadas" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Probar endpoints desde Angular (abrir http://localhost:4200)" -ForegroundColor Gray
Write-Host "  2. Verificar que los datos son reales (no mocks)" -ForegroundColor Gray
Write-Host "  3. Probar upload de evidencias" -ForegroundColor Gray
Write-Host "  4. Validar requisitos de PDFs" -ForegroundColor Gray

