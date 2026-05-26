@echo off
REM ============================================================================
REM Script de configuracion de Biome.js para el monorepo de Clermont
REM ============================================================================
REM Este script:
REM   1. Instala Biome.js como dependencia de desarrollo en el root
REM   2. Crea el archivo biome.json con configuracion inicial
REM   3. Agrega scripts de biome a todos los workspaces
REM ============================================================================

echo ============================================================
echo CONFIGURACION DE BIOME.JS PARA CLEMENTO
echo ============================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: No se encontró package.json en el directorio actual
    echo Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)

echo [1/5] Instalando Biome.js como dependencia de desarrollo...
call npm install --save-dev --save-exact @biomejs/biome
if errorlevel 1 (
    echo ERROR: Fallo al instalar Biome.js
    pause
    exit /b 1
)
echo Biome.js instalado correctamente.
echo.

echo [2/5] Generando configuracion inicial de biome.json...
if exist "biome.json" (
    echo Ya existe biome.json. Haciendo backup...
    copy biome.json biome.json.backup
)
npx @biomejs/biome init
if errorlevel 1 (
    echo ERROR: Fallo al inicializar Biome.js
    pause
    exit /b 1
)
echo biome.json creado correctamente.
echo.

echo [3/5] Configurando scripts en workspaces...
echo.

REM Agregar scripts a packages/config
if exist "packages\config\package.json" (
    echo Configurando @cermont/config...
    call npm pkg set scripts.lint="biome check ." scripts.lint:fix="biome check --write ." scripts.format="biome format ." scripts.format:fix="biome format --write ." --workspace=@cermont/config
)

REM Agregar scripts a packages/domain  
if exist "packages\domain\package.json" (
    echo Configurando @cermont/domain...
    call npm pkg set scripts.lint="biome check ." scripts.lint:fix="biome check --write ." scripts.format="biome format ." scripts.format:fix="biome format --write ." --workspace=@cermont/domain
)

REM Agregar scripts a packages/shared-types
if exist "packages\shared-types\package.json" (
    echo Configurando @cermont/shared-types...
    call npm pkg set scripts.lint="biome check ." scripts.lint:fix="biome check --write ." scripts.format="biome format ." scripts.format:fix="biome format --write ." --workspace=@cermont/shared-types
)

REM Agregar scripts a apps/backend
if exist "apps\backend\package.json" (
    echo Configurando backend...
    call npm pkg set scripts.lint="biome check ." scripts.lint:fix="biome check --write ." scripts.format="biome format ." scripts.format:fix="biome format --write ." --workspace=backend
)

REM Agregar scripts a apps/frontend
if exist "apps\frontend\package.json" (
    echo Configurando frontend...
    call npm pkg set scripts.lint="biome check ." scripts.lint:fix="biome check --write ." scripts.format="biome format ." scripts.format:fix="biome format --write ." --workspace=frontend
)

echo Scripts de biome agregados a todos los workspaces.
echo.

echo [4/5] Actualizando lint-staged en el root...
call npm pkg set lint-staged.apps="biome check --write" lint-staged.packages="biome check --write" 2>nul
echo lint-staged actualizado.
echo.

echo [5/5] Verificando la instalacion...
npx biome --version
if errorlevel 1 (
    echo ERROR: Biome no se ejecuto correctamente
    pause
    exit /b 1
)
echo.

echo ============================================================
echo CONFIGURACION COMPLETADA
echo ============================================================
echo.
echo Biome.js ha sido configurado correctamente.
echo.
echo Para verificar que todo funciona:
echo   npm run lint
echo.
echo Para formatear codigo:
echo   npm run format:fix
echo.
echo Documentacion: https://biomejs.dev/
echo ============================================================
pause