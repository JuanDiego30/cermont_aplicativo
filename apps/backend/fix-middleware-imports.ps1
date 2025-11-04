# Script para reparar imports vacíos en middleware
# Basado en patrones comunes y estructura del proyecto

$commonImports = @{
    'asyncHandler' = "import { asyncHandler } from '../utils/asyncHandler';"
    'errorResponse' = "import { errorResponse } from '../utils/response';"
    'successResponse' = "import { successResponse } from '../utils/response';"
    'HTTP_STATUS' = "import { HTTP_STATUS } from '../utils/constants';"
    'ROLES' = "import { ROLES } from '../utils/constants';"
    'logger' = "import { logger } from '../utils/logger';"
    'AppError' = "import { AppError } from '../utils/AppError';"
    'verifyAccessToken' = "import { verifyAccessToken } from '../config/jwt';"
    'BlacklistedToken' = "import BlacklistedToken from '../models/BlacklistedToken';"
    'User' = "import User from '../models/User';"
    'cacheService' = "import cacheService from '../services/cache.service';"
    'rateLimit' = "import rateLimit from 'express-rate-limit';"
}

$middlewareFiles = @(
    'auth.ts',
    'authorize.ts',
    'cacheMiddleware.ts',
    'checkBlacklist.ts',
    'errorHandler.ts',
    'httpsRedirect.ts',
    'notFound.ts',
    'rateLimiter.ts',
    'rbac.ts',
    'sanitize.ts',
    'validate.ts',
    'validateRequest.ts'
)

foreach ($file in $middlewareFiles) {
    $path = "src/middleware/$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Detectar qué imports necesita basándose en el uso
        $needed = @()
        
        if ($content -match 'asyncHandler') { $needed += $commonImports['asyncHandler'] }
        if ($content -match 'errorResponse') { $needed += $commonImports['errorResponse'] }
        if ($content -match 'successResponse') { $needed += $commonImports['successResponse'] }
        if ($content -match 'HTTP_STATUS') { $needed += $commonImports['HTTP_STATUS'] }
        if ($content -match 'ROLES\[|ROLES\.') { $needed += $commonImports['ROLES'] }
        if ($content -match 'logger\.') { $needed += $commonImports['logger'] }
        if ($content -match 'AppError|new.*Error') { $needed += $commonImports['AppError'] }
        if ($content -match 'verifyAccessToken') { $needed += $commonImports['verifyAccessToken'] }
        if ($content -match 'BlacklistedToken') { $needed += $commonImports['BlacklistedToken'] }
        if ($content -match 'User\.') { $needed += $commonImports['User'] }
        if ($content -match 'cacheService') { $needed += $commonImports['cacheService'] }
        if ($content -match 'rateLimit') { $needed += $commonImports['rateLimit'] }
        
        # Eliminar imports vacíos
        $content = $content -replace "import\s+\{[^}]*\}\s+from\s+'';?\r?\n?", ""
        $content = $content -replace "import\s+\w+\s+from\s+'';?\r?\n?", ""
        
        # Agregar imports necesarios al inicio después del comentario de documentación
        if ($needed.Count -gt 0) {
            # Encontrar el final del comentario de bloque
            if ($content -match '(?s)^(/\*\*.*?\*/\s*)') {
                $docComment = $Matches[1]
                $rest = $content.Substring($docComment.Length)
                
                # Eliminar imports existentes del resto
                $rest = $rest -replace "^import\s+.*?;\r?\n", ""
                
                # Construir nuevos imports
                $importsBlock = ($needed | Sort-Object -Unique) -join "`n"
                $content = $docComment + "`n" + $importsBlock + "`n`n" + $rest.TrimStart()
            }
        }
        
        Set-Content -Path $path -Value $content -NoNewline
        Write-Host "Reparado $file - $($needed.Count) imports"
    }
}

Write-Host "Reparación completada"
