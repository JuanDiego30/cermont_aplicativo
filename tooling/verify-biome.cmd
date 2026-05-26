@echo off
REM ============================================================================
REM Script de verificacion de Biome.js para el monorepo de Clermont
REM ============================================================================
REM Este script:
REM   1. Verifica que Biome este instalado
REM   2. Verifica la configuracion de biome.json
REM   3. Verifica que los scripts existan en cada workspace
REM   4. Ejecuta una verificacion de lint en cada workspace
REM ============================================================================

echo ============================================================
echo VERIFICACION DE BIOME.JS PARA CLEMENTO
echo ============================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: No se encontro package.json en el directorio actual
    echo Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)

set ERRORS=0
set WARNINGS=0

echo [1/7] Verificando version de Biome.js...
npx biome --version
if errorlevel 1 (
    echo ERROR: Biome.js no esta instalado
    set /a ERRORS+=1
) else (
    echo Biome.js detectado correctamente
)
echo.

echo [2/7] Verificando archivo de configuracion biome.json...
if not exist "biome.json" (
    echo ERROR: biome.json no existe
    set /a ERRORS+=1
) else (
    echo biome.json encontrado
)
echo.

echo [3/7] Verificando configuracion de lint-staged en package.json...
findstr /C:"biome check --write" package.json >nul
if errorlevel 1 (
    echo ERROR: lint-staged no esta configurado con biome
    set /a ERRORS+=1
) else (
    echo lint-staged configurado correctamente
)
echo.

echo [4/7] Verificando scripts en workspaces...

REM Verificar packages/config
if exist "packages\config\package.json" (
    echo Verificando @cermont/config...
    findstr /C:"biome check" packages\config\package.json >nul
    if errorlevel 1 (
        echo   ERROR: @cermont/config no tiene scripts de biome
        set /a ERRORS+=1
    ) else (
        echo   OK: @cermont/config tiene scripts de biome
    )
)

REM Verificar packages/domain
if exist "packages\domain\package.json" (
    echo Verificando @cermont/domain...
    findstr /C:"biome check" packages\domain\package.json >nul
    if errorlevel 1 (
        echo   ERROR: @cermont/domain no tiene scripts de biome
        set /a ERRORS+=1
    ) else (
        echo   OK: @cermont/domain tiene scripts de biome
    )
)

REM Verificar packages/shared-types
if exist "packages\shared-types\package.json" (
    echo Verificando @cermont/shared-types...
    findstr /C:"biome check" packages\shared-types\package.json >nul
    if errorlevel 1 (
        echo   ERROR: @cermont/shared-types no tiene scripts de biome
        set /a ERRORS+=1
    ) else (
        echo   OK: @cermont/shared-types tiene scripts de biome
    )
)

REM Verificar apps/backend
if exist "apps\backend\package.json" (
    echo Verificando backend...
    findstr /C:"biome check" apps\backend\package.json >nul
    if errorlevel 1 (
        echo   ERROR: backend no tiene scripts de biome
        set /a ERRORS+=1
    ) else (
        echo   OK: backend tiene scripts de biome
    )
)

REM Verificar apps/frontend
if exist "apps\frontend\package.json" (
    echo Verificando frontend...
    findstr /C:"biome check" apps\frontend\package.json >nul
    if errorlevel 1 (
        echo   ERROR: frontend no tiene scripts de biome
        set /a ERRORS+=1
    ) else (
        echo   OK: frontend tiene scripts de biome
    )
)

echo.

echo [5/7] Ejecutando biome check en el root...
npx biome check . --no-errors-on-matched-files
if errorlevel 1 (
    echo ADVERTENCIA: biome check encontro errores
    set /a WARNINGS+=1
) else (
    echo biome check OK en el root
)
echo.

echo [6/7] Verificando configuracion de ESLint (duplicacion)...
if exist "apps\backend\eslint.config.mjs" (
    echo ADVERTENCIA: eslint.config.mjs existe en apps/backend
    set /a WARNINGS+=1
)
if exist "apps\frontend\eslint.config.mjs" (
    echo ADVERTENCIA: eslint.config.mjs existe en apps/frontend
    set /a WARNINGS+=1
)
if exist "packages\shared-types\eslint.config.mjs" (
    echo ADVERTENCIA: eslint.config.mjs existe en packages/shared-types
    set /a WARNINGS+=1
)
echo.

echo [7/7] Verificando ESLint en devDependencies (duplicacion)...
findstr /C:"eslint" package.json >nul
if not errorlevel 1 (
    echo ADVERTENCIA: ESLint esta en devDependencies del root
    set /a WARNINGS+=1
)
echo.

echo ============================================================
echo RESULTADO DE VERIFICACION
echo ============================================================
echo.
echo Errores: %ERRORS%
echo Advertencias: %WARNINGS%
echo.

if %ERRORS% GTR 0 (
    echo FALLA: Se detectaron errores
    echo.
    echo Ejecuta setup-biome.cmd para corregir
    pause
    exit /b 1
) else if %WARNINGS% GTR 0 (
    echo ADVERTENCIAS: Se detectaron advertencias
    echo.
    echo Considera remover ESLint manualmente:
    echo   npm uninstall eslint @typescript-eslint/eslint-plugin typescript-eslint
    echo.
) else (
    echo EXITO: Biome.js configurado correctamente
    echo.
    echo No se detectaron errores ni advertencias
)

echo.
echo Documentacion: https://biomejs.dev/
echo Guias:
echo   - https://biomejs.dev/guides/migrate-eslint-prettier/
echo   - https://biomejs.dev/guides/configure-biome/
echo ============================================================
pause