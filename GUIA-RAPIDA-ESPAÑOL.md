# 🚀 Guía Rápida - Setup Completo Cermont

**Para Desarrollo Local y Producción en VPS Contabo**

---

## 🎯 QUÉ HE CREADO PARA TI

He creado un sistema completo de scripts y documentación para que puedas:

1. ✅ **Configurar el proyecto localmente** en minutos
2. ✅ **Limpiar archivos innecesarios** automáticamente
3. ✅ **Ejecutar migraciones** de forma segura
4. ✅ **Desplegar en producción** (VPS Contabo) paso a paso
5. ✅ **Diagnosticar problemas** rápidamente

---

## 📁 ARCHIVOS CREADOS

### Scripts de Setup

- ✅ `scripts/setup-local.ps1` - Configura todo para desarrollo local
- ✅ `scripts/setup-production.ps1` - Configura para producción
- ✅ `scripts/quick-start.ps1` - Setup completo automático (UN SOLO COMANDO)

### Scripts de Utilidades

- ✅ `scripts/auto-migrate.ps1` - Migraciones automáticas
- ✅ `scripts/cleanup-project.ps1` - Limpia archivos innecesarios
- ✅ `scripts/check-used-endpoints.ps1` - Verifica qué endpoints se usan
- ✅ `scripts/diagnose-project.ps1` - Diagnostica el estado del proyecto

### Documentación

- ✅ `README-SETUP.md` - Guía rápida de setup
- ✅ `docs/GUIA-DESPLIEGUE-CONTABO.md` - Guía completa para VPS Contabo

---

## 🏠 DESARROLLO LOCAL (EMPEZAR AQUÍ)

### Paso 1: Diagnóstico Inicial

Primero, verifica el estado actual de tu proyecto:

```powershell
.\scripts\diagnose-project.ps1
```

Esto te dirá qué está bien y qué necesita arreglarse.

### Paso 2: Quick Start (Recomendado)

**Ejecuta UN SOLO COMANDO** que hace TODO automáticamente:

```powershell
.\scripts\quick-start.ps1
```

Esto ejecutará:
- ✅ Instalación de dependencias
- ✅ Configuración de .env
- ✅ Inicio de PostgreSQL (Docker)
- ✅ Generación de Prisma
- ✅ Migraciones automáticas

**Si Docker no está disponible:**

```powershell
.\scripts\quick-start.ps1 -SkipDocker
```

Luego configura manualmente tu PostgreSQL.

### Paso 3: Verificar que Funcione

```powershell
# Iniciar aplicación
pnpm run dev
```

Abre tu navegador:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Swagger Docs: http://localhost:4000/docs
- Health Check: http://localhost:4000/api/health

---

## 🔄 MIGRACIONES AUTOMÁTICAS

### Desarrollo (crea nuevas migraciones si hay cambios)

```powershell
.\scripts\auto-migrate.ps1
```

### Producción (solo aplica migraciones existentes)

```powershell
.\scripts\auto-migrate.ps1 -Production
```

### Resetear base de datos (¡CUIDADO! Elimina todos los datos)

```powershell
.\scripts\auto-migrate.ps1 -Reset
```

### Con datos de prueba

```powershell
.\scripts\auto-migrate.ps1 -Seed
```

---

## 🧹 LIMPIEZA DEL PROYECTO

Elimina archivos temporales y de build:

```powershell
.\scripts\cleanup-project.ps1
```

Esto eliminará:
- ✅ Archivos .log temporales
- ✅ Directorios de build (dist, .next)
- ✅ Archivos de script temporales (clean_*.js, fix_*.js)
- ✅ Archivos de error temporales (*_errors.txt, build_log*.txt)

---

## 🌐 PRODUCCIÓN EN VPS CONTABO

### Paso 1: Preparar en Local

```powershell
.\scripts\setup-production.ps1
```

Te pedirá:
- URL de la base de datos PostgreSQL
- JWT_SECRET (o generará uno automáticamente)
- URL del frontend (tu dominio)

Esto creará `apps/api/.env.production` con toda la configuración.

### Paso 2: En el VPS

Sigue la guía completa: `docs/GUIA-DESPLIEGUE-CONTABO.md`

**Resumen rápido:**

1. **Conectarse al VPS:**
   ```bash
   ssh root@TU_IP_VPS
   ```

2. **Instalar dependencias:**
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # pnpm
   npm install -g pnpm
   
   # PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # PM2 (gestor de procesos)
   npm install -g pm2
   
   # Nginx (reverse proxy)
   sudo apt install -y nginx
   ```

3. **Subir código:**
   ```bash
   # Clonar o subir con rsync desde local
   git clone TU_REPO_URL cermont-app
   cd cermont-app
   ```

4. **Configurar variables:**
   ```bash
   cd apps/api
   cp .env.production .env
   nano .env  # Verificar que DATABASE_URL esté correcto
   ```

5. **Build y migraciones:**
   ```bash
   cd ~/cermont-app
   pnpm install
   pnpm run build:api
   pnpm run build:web
   
   cd apps/api
   pnpm prisma:generate
   pnpm prisma:migrate deploy
   ```

6. **Iniciar con PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **Configurar Nginx y SSL:**
   Ver `docs/GUIA-DESPLIEGUE-CONTABO.md` para configuración completa.

---

## 📝 VARIABLES DE ENTORNO IMPORTANTES

### Backend (apps/api/.env)

**Obligatorias:**
- `DATABASE_URL` - URL de PostgreSQL
- `JWT_SECRET` - Mínimo 32 caracteres (generado automáticamente en setup)
- `FRONTEND_URL` - URL del frontend (para CORS)

**Opcionales:**
- `PORT` - Puerto del API (default: 4000)
- `LOG_LEVEL` - debug, info, error (default: info)

### Frontend (apps/web/.env.local)

- `NEXT_PUBLIC_API_URL` - URL del backend API

---

## 🔍 VERIFICAR QUÉ ENDPOINTS SE USAN

Para ver qué rutas del backend están siendo usadas en el frontend:

```powershell
.\scripts\check-used-endpoints.ps1
```

Esto te mostrará:
- ✅ Endpoints usados en frontend
- ⚠️ Endpoints del backend NO usados
- ❌ Endpoints usados pero no encontrados en backend

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Diagnóstico Rápido

```powershell
.\scripts\diagnose-project.ps1
```

Esto te dirá exactamente qué está mal.

### Error: "DATABASE_URL is required"

```powershell
# Verifica que existe .env
Test-Path apps/api/.env

# Si no existe, crea uno
.\scripts\setup-local.ps1
```

### Error: "JWT_SECRET is required"

El JWT_SECRET debe tener al menos 32 caracteres. El script de setup genera uno automáticamente.

### Error 500 en endpoints

1. Verifica logs:
   ```powershell
   cd apps/api
   Get-Content logs\error-*.log -Tail 50
   ```

2. Verifica que las migraciones estén aplicadas:
   ```powershell
   .\scripts\auto-migrate.ps1
   ```

3. Verifica la conexión a la BD:
   ```powershell
   cd apps/api
   pnpm prisma:studio
   ```

### Frontend no conecta con backend

1. Verifica que el backend esté corriendo (puerto 4000)
2. Verifica `NEXT_PUBLIC_API_URL` en `apps/web/.env.local`
3. Revisa consola del navegador (F12)

### PostgreSQL no está corriendo

```powershell
# Iniciar con Docker
docker compose up -d db

# Verificar estado
docker compose ps
```

---

## ✅ CHECKLIST DE DESARROLLO LOCAL

- [ ] Node.js 18+ instalado
- [ ] pnpm instalado
- [ ] Docker Desktop instalado (para PostgreSQL)
- [ ] Ejecutado `.\scripts\quick-start.ps1`
- [ ] PostgreSQL corriendo (Docker o local)
- [ ] Backend saludable: http://localhost:4000/api/health
- [ ] Frontend accesible: http://localhost:3000
- [ ] Puedes iniciar sesión

---

## ✅ CHECKLIST DE PRODUCCIÓN

- [ ] VPS configurado
- [ ] Node.js, PostgreSQL, Nginx, PM2 instalados
- [ ] Base de datos creada
- [ ] Variables de entorno configuradas
- [ ] Build ejecutado
- [ ] Migraciones aplicadas
- [ ] PM2 corriendo
- [ ] Nginx configurado
- [ ] SSL configurado (Let's Encrypt)
- [ ] Dominio apuntando al VPS
- [ ] Aplicación accesible vía HTTPS

---

## 🎯 FLUJO RECOMENDADO

### Primera Vez (Desarrollo Local)

```powershell
# 1. Diagnóstico
.\scripts\diagnose-project.ps1

# 2. Quick Start (hace todo)
.\scripts\quick-start.ps1

# 3. Iniciar
pnpm run dev

# 4. Verificar
# Abrir http://localhost:3000
```

### Cuando Haya Cambios en la BD

```powershell
# Aplicar migraciones
.\scripts\auto-migrate.ps1
```

### Antes de Subir a Producción

```powershell
# 1. Limpiar proyecto
.\scripts\cleanup-project.ps1

# 2. Preparar producción
.\scripts\setup-production.ps1

# 3. Build
pnpm run build
```

### En el VPS

```bash
# 1. Subir código
git pull  # o rsync

# 2. Configurar .env
cp .env.production .env

# 3. Instalar y build
pnpm install
pnpm run build

# 4. Migraciones
cd apps/api
pnpm prisma:migrate deploy

# 5. Reiniciar
pm2 restart all
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- **Setup rápido**: `README-SETUP.md`
- **Despliegue VPS**: `docs/GUIA-DESPLIEGUE-CONTABO.md`
- **Análisis Laravel**: `docs/ANALISIS-MIGRACION-LARAVEL.md`
- **Documentación general**: `README.md`

---

## 💡 TIPS IMPORTANTES

1. **Siempre ejecuta diagnóstico primero**: `.\scripts\diagnose-project.ps1`
2. **Las migraciones en producción NO crean nuevas**: Solo aplican las existentes
3. **JWT_SECRET debe ser único y seguro**: El script lo genera automáticamente
4. **No subas .env a Git**: Ya está en .gitignore
5. **Guarda backups**: Especialmente antes de migraciones en producción

---

**¿Preguntas?** Revisa la documentación o ejecuta el diagnóstico para ver qué está mal.
