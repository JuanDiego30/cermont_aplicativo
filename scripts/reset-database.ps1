# ============================================
# Script PowerShell para resetear bases de datos PostgreSQL
# ============================================
# 
# Este script elimina las bases de datos cermont_db y cermont_fsm
# y crea una nueva base de datos cermont_fsm desde cero
#
# Uso:
#   .\scripts\reset-database.ps1
#
# Requisitos:
#   - PostgreSQL instalado y en PATH
#   - Usuario postgres con contraseña: admin
#   - Credenciales configuradas en pgpass o proporcionadas

param(
    [string]$User = "postgres",
    [string]$Password = "admin",
    [string]$Host = "localhost",
    [int]$Port = 5432,
    [string]$NewDatabase = "cermont_fsm"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reset de Bases de Datos PostgreSQL   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configurar variable de entorno para contraseña
$env:PGPASSWORD = $Password

# Función para ejecutar SQL
function Execute-SQL {
    param(
        [string]$SQL,
        [string]$Database = "postgres"
    )
    
    try {
        $result = psql -h $Host -p $Port -U $User -d $Database -c $SQL 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: $result" -ForegroundColor Red
            return $false
        }
        return $true
    }
    catch {
        Write-Host "Error ejecutando SQL: $_" -ForegroundColor Red
        return $false
    }
}

# Función para terminar conexiones activas
function Terminate-Connections {
    param([string]$DatabaseName)
    
    Write-Host "Terminando conexiones activas a $DatabaseName..." -ForegroundColor Yellow
    
    $terminateSQL = @"
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DatabaseName' AND pid <> pg_backend_pid();
"@
    
    Execute-SQL -SQL $terminateSQL | Out-Null
    Start-Sleep -Seconds 1
}

# Paso 1: Verificar conexión
Write-Host "1. Verificando conexión a PostgreSQL..." -ForegroundColor Yellow
$testConnection = Execute-SQL -SQL "SELECT version();"
if (-not $testConnection) {
    Write-Host "ERROR: No se pudo conectar a PostgreSQL" -ForegroundColor Red
    Write-Host "Verifica que PostgreSQL esté corriendo y las credenciales sean correctas" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Conexión exitosa" -ForegroundColor Green

# Paso 2: Listar bases de datos existentes
Write-Host "`n2. Bases de datos existentes:" -ForegroundColor Yellow
Execute-SQL -SQL "SELECT datname FROM pg_database WHERE datname LIKE 'cermont%';"

# Paso 3: Eliminar cermont_db
Write-Host "`n3. Eliminando base de datos cermont_db..." -ForegroundColor Yellow
Terminate-Connections -DatabaseName "cermont_db"
$dropCermontDb = Execute-SQL -SQL "DROP DATABASE IF EXISTS cermont_db;"
if ($dropCermontDb) {
    Write-Host "   ✓ Base de datos cermont_db eliminada" -ForegroundColor Green
}

# Paso 4: Eliminar cermont_fsm
Write-Host "`n4. Eliminando base de datos cermont_fsm..." -ForegroundColor Yellow
Terminate-Connections -DatabaseName "cermont_fsm"
$dropCermontFsm = Execute-SQL -SQL "DROP DATABASE IF EXISTS cermont_fsm;"
if ($dropCermontFsm) {
    Write-Host "   ✓ Base de datos cermont_fsm eliminada" -ForegroundColor Green
}

# Paso 5: Crear nueva base de datos
Write-Host "`n5. Creando nueva base de datos $NewDatabase..." -ForegroundColor Yellow
$createDB = Execute-SQL -SQL "CREATE DATABASE $NewDatabase OWNER postgres ENCODING 'UTF8';"
if ($createDB) {
    Write-Host "   ✓ Base de datos $NewDatabase creada" -ForegroundColor Green
}

# Paso 6: Conceder privilegios
Write-Host "`n6. Configurando privilegios..." -ForegroundColor Yellow
$grantPrivileges = Execute-SQL -SQL "GRANT ALL PRIVILEGES ON DATABASE $NewDatabase TO postgres;" -Database "postgres"
if ($grantPrivileges) {
    Write-Host "   ✓ Privilegios configurados" -ForegroundColor Green
}

# Paso 7: Verificar
Write-Host "`n7. Verificando bases de datos:" -ForegroundColor Yellow
Execute-SQL -SQL "SELECT datname, pg_size_pretty(pg_database_size(datname)) as size FROM pg_database WHERE datname LIKE 'cermont%';"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Reset completado exitosamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Base de datos lista: $NewDatabase" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Asegúrate de que apps/api/.env tenga:" -ForegroundColor White
Write-Host "   DATABASE_URL=`"postgresql://postgres:admin@localhost:5432/$NewDatabase`"" -ForegroundColor Cyan
Write-Host "2. Ejecuta: cd apps/api && pnpm prisma migrate dev --name init" -ForegroundColor White

# Limpiar variable de entorno
Remove-Item Env:\PGPASSWORD

