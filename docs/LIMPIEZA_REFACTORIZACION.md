# ?? GUÍA DE LIMPIEZA Y REFACTORIZACIÓN

## ?? ANTES DE EMPEZAR

Hacer backup de tu repositorio:
```bash
git stash
git branch backup-anterior
```

---

## ?? PASO 1: Eliminar node_modules de Raíz

```bash
cd C:\Users\camil\Downloads\Compressed\aplicativo_cermont_prueba\cermont_aplicativo

# Eliminar node_modules de raíz (es GRANDE)
rm -r node_modules
rm package-lock.json

# Verificar que estén limpios
ls -la | grep node_modules    # Debería estar vacío
```

---

## ?? PASO 2: Eliminar Archivos Innecesarios

### Eliminar Scripts Duplicados
```bash
# Estos son todos innecesarios (van a reemplazarse por scripts/dev.sh)
rm start-backend.ps1
rm start-dev.ps1
rm start-dev-fixed.ps1
rm start-dev.bat
rm start-frontend.ps1
rm dev.ps1
rm setup.ps1
rm setup.sh
```

### Eliminar Archivos Basura
```bash
# Scripts de prueba
rm test-login-fix.js
rm shared-types.ts

# Documentación temporal
rm CORRECCIONES_FINALES_COMPLETADAS.md
rm CORRECCION_FINAL_COMPLETADA.md
rm DEBUG_LOGIN_401.md
rm GUIA_DESARROLLO_CORRECTO.md
rm LOGIN_CORRECCION_COMPLETA.md
rm PROBLEMA_RESUELTO.md
rm SOLUCION_CONNECTION_REFUSED.md
rm SOLUCION_CORS_DEV_TUNNELS.md
rm SOLUCION_FINAL_LOGIN.md
rm SOLUCION_npm_run_dev_RAIZ.md
rm TESTS_COMPLETADOS_EXITOSAMENTE.md
rm INICIO_RAPIDO.md
```

---

## ?? PASO 3: Reorganizar Documentación

```bash
# Crear carpeta docs si no existe
mkdir -p docs

# Mover documentación relevante
# (Copiar y renombrar)
cp GUIA_DEPLOYMENT_VPS.md docs/DEPLOYMENT.md
cp ESTADO_FINAL_PROYECTO.md docs/STATUS.md
cp ANALISIS_ARQUITECTURA_COMPLETO.md docs/ARQUITECTURA.md

# Crear archivos de documentación faltantes
# (se crearán en PASO 5)

# Opcionalmente eliminar archivos viejos después de copiar
rm GUIA_DEPLOYMENT_VPS.md
rm ESTADO_FINAL_PROYECTO.md
rm ANALISIS_ARQUITECTURA_COMPLETO.md
```

---

## ?? PASO 4: Actualizar Package.json

(Esto ya debería estar hecho si aplicaste los cambios)

**Verificar que contiene:**
```json
{
  "name": "cermont-atg",
  "workspaces": ["backend", "frontend"],
  "scripts": {
    "dev": "npm run dev:all",
    "dev:backend": "npm run dev -w backend",
    "dev:frontend": "npm run dev -w frontend"
    // ... etc
  }
}
```

---

## ?? PASO 5: Crear Documentación Organizada

Ya está creada en el análisis. Verificar que existan:
- ? `README.md` (raíz) - DONE
- ? `docs/ARQUITECTURA.md` - DONE
- ? `docs/DEPLOYMENT.md` - DONE

Falta crear:
- `docs/API.md` - Documentación endpoints
- `docs/DESARROLLO.md` - Guía de desarrollo

---

## ?? PASO 6: Hacer Clean Install

```bash
# Aquí es donde cambia todo gracias a npm workspaces

# Instalar todo (backend + frontend en workspace)
npm install

# Esto debería:
# - Instalar backend/package.json
# - Instalar frontend/package.json  
# - NO crear node_modules en raíz (solo enlaces simbólicos)

# Verificar
ls -la | grep node_modules
# Debería mostrar: node_modules -> ../node_modules (symlink)

npm run setup  # Seed BD
```

---

## ? PASO 7: Probar Que Todo Funciona

### Test 1: Desarrollo
```bash
npm run dev

# Debería:
# - Iniciar Backend en puerto 5000
# - Iniciar Frontend en puerto 3000
# - Ambos sin errors

# Ctrl+C para detener
```

### Test 2: Backend independiente
```bash
npm run dev:backend

# Backend en puerto 5000
# Verificar: curl http://localhost:5000/api/auth/profile
```

### Test 3: Frontend independiente
```bash
npm run dev:frontend

# Frontend en puerto 3000
# Verificar: http://localhost:3000
```

### Test 4: Build
```bash
npm run build

# Compilar backend + frontend
# Debería completarse sin errores
```

---

## ??? PASO 8: Limpiar Ruido

```bash
# Eliminar archivos temporales de raíz
ls -la | grep -E "^\." | head -20

# Asegurar que .gitignore está correcto
cat .gitignore | grep node_modules
```

---

## ?? ANTES vs DESPUÉS

### ? ANTES (ACTUAL)
```
Raíz:
- 28+ archivos .md
- 8 scripts .ps1/.sh
- package.json (como backend)
- node_modules/ (500MB+)
- scripts/ con archivos innecesarios
- .env.example
- shared-types.ts
- test-login-fix.js

Total: ~50 archivos + node_modules = CAOS
```

### ? DESPUÉS (LIMPIO)
```
Raíz:
- README.md (1 único)
- package.json (coordinador workspaces)
- .gitignore
- scripts/
  ??? dev.sh
  ??? prod.sh
  ??? setup.sh
- docs/
  ??? ARQUITECTURA.md
  ??? DEPLOYMENT.md
  ??? API.md
  ??? STATUS.md
- backend/
- frontend/
- node_modules/ (symlink)

Total: ~15 archivos bien organizados = ORDEN
```

---

## ?? CHECKLIST FINAL

- [ ] Backup hecho (`git branch backup-anterior`)
- [ ] node_modules eliminados de raíz
- [ ] Scripts duplicados eliminados
- [ ] Documentación temporal eliminada
- [ ] Documentación reorganizada en docs/
- [ ] package.json actualizado
- [ ] npm install ejecutado
- [ ] npm run dev funciona ?
- [ ] npm run dev:backend funciona ?
- [ ] npm run dev:frontend funciona ?
- [ ] npm run build funciona ?
- [ ] Git limpio (sin archivos innecesarios)
- [ ] .gitignore actualizado

---

## ?? SI ALGO SALE MAL

```bash
# Rollback total
git checkout .
git clean -fd

# O restaurar desde backup
git checkout backup-anterior
```

---

## ?? PRÓXIMOS PASOS

1. ? Limpiar arquitectura (este paso)
2. ?? Crear GitHub Actions CI/CD
3. ?? Configurar Docker
4. ?? Deploy a VPS con Nginx + PM2
5. ?? Configurar monitoring

---

**Tiempo estimado**: 30 minutos
**Dificultad**: Baja
**Impacto**: ALTO ??
