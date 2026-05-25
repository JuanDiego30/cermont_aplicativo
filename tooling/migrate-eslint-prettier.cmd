@echo off
REM ============================================================================
REM Script de migracion de ESLint y Prettier a Biome.js para el monorepo de Clermont
REM ============================================================================
REM Este script:
REM   1. Migra la configuracion de ESLint a Biome
REM   2. Migra la configuracion de Prettier a Biome
REM   3. Actualiza el archivo biome.json con las reglas migradas
REM ============================================================================

echo ============================================================
echo MIGRACION DE ESLINT/PRETTIER A BIOME.JS
echo ============================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: No se encontro package.json en el directorio actual
    echo Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)

REM Verificar que Biome esta instalado
if not exist "node_modules\@biomejs\biome" (
    echo ERROR: Biome.js no esta instalado
    echo Ejecuta primero: setup-biome.cmd
    pause
    exit /b 1
)

echo [1/6] Respaldando configuracion actual...
if exist "biome.json" (
    copy biome.json biome.json.migrate.backup
)
echo Backup guardado en biome.json.migrate.backup
echo.

echo [2/6] Migrando configuracion de ESLint (root)...
npx @biomejs/biome migrate eslint --write
if errorlevel 1 (
    echo Advertencia: No se pudo migrar configuracion de ESLint del root
    echo El archivo eslint.config.mjs no existe o tiene un formato no compatible
) else (
    echo Configuracion de ESLint migrada correctamente
)
echo.

echo [3/6] Probando migracion en apps/backend...
if exist "apps\backend\eslint.config.mjs" (
    cd apps\backend
    npx @biomejs/biome migrate eslint --write
    cd ..\..
)
echo.

echo [4/6] Probando migracion en apps/frontend...
if exist "apps\frontend\eslint.config.mjs" (
    cd apps\frontend
    npx @biomejs/biome migrate eslint --write
    cd ..\..
)
echo.

echo [5/6] Probando migracion en packages/shared-types...
if exist "packages\shared-types\eslint.config.mjs" (
    cd packages\shared-types
    npx @biomejs/biome migrate eslint --write
    cd ..\..
)
echo.

echo [6/6] Migrando configuracion de Prettier...
npx @biomejs/biome migrate prettier --write
if errorlevel 1 (
    echo Advertencia: No se pudo migrar configuracion de Prettier
) else (
    echo Configuracion de Prettier migrada correctamente
)
echo.

echo ============================================================
echo MIGRACION COMPLETADA
echo ============================================================
echo.
echo La configuracion de ESLint y Prettier ha sido migrada a Biome.js
echo.
echo Ejecuta para verificar:
echo   npm run lint
echo.
echo Si hay errores,revisa biome.json y ajusta manualmente
echo Guia: https://biomejs.dev/guides/migrate-eslint-prettier/
echo ============================================================
pause