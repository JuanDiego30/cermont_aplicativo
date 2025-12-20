# 🚀 Guía Rápida de Setup - Cermont

Esta guía te ayudará a configurar el proyecto para desarrollo local y producción.

---

## 🏠 DESARROLLO LOCAL

### Opción 1: Quick Start (Recomendado)

Ejecuta un solo comando que hace todo:

```powershell
.\scripts\quick-start.ps1
```

Esto ejecutará:
- ✅ Verificación de Node.js y pnpm
- ✅ Instalación de dependencias
- ✅ Configuración de .env
- ✅ Inicio de PostgreSQL (Docker)
- ✅ Generación de Prisma
- ✅ Migraciones automáticas

### Opción 2: Paso a Paso

#### 1. Setup inicial

```powershell
.\scripts\setup-local.ps1
```

#### 2. (Si Docker falló) Iniciar PostgreSQL manualmente

```powershell
docker compose up -d db
```

#### 3. Ejecutar migraciones

```powershell
.\scripts\auto-migrate.ps1
```

#### 4. (Opcional) Poblar base de datos con datos de prueba

```powershell
cd apps/api
pnpm prisma:seed
cd ../..
```

#### 5. Iniciar aplicación

```powershell
# Todo junto
pnpm run dev

# O por separado
pnpm run dev:api    # Backend en puerto 4000
pnpm run dev:web    # Frontend en puerto 3000
```

---

## 🌐 PRODUCCIÓN (VPS Contabo)

### 1. Preparar en local

```powershell
.\scripts\setup-production.ps1
```

Te pedirá:
- URL de la base de datos
- JWT_SECRET (o generará uno)
- URL del frontend

### 2. En el VPS

Sigue la guía completa en: `docs/GUIA-DESPLIEGUE-CONTABO.md`

Resumen rápido:
1. Instalar Node.js, PostgreSQL, Nginx, PM2
2. Subir código al VPS
3. Configurar .env
4. Build y migraciones
5. Iniciar con PM2
6. Configurar Nginx y SSL

---

## 🔧 SCRIPTS DISPONIBLES

### Setup

- `scripts/setup-local.ps1` - Configuración para desarrollo local
- `scripts/setup-production.ps1` - Configuración para producción
- `scripts/quick-start.ps1` - Setup completo automático

### Migraciones

- `scripts/auto-migrate.ps1` - Ejecuta migraciones automáticamente
  - `.\scripts\auto-migrate.ps1 -Production` - Para producción
  - `.\scripts\auto-migrate.ps1 -Reset` - Resetear BD (cuidado!)
  - `.\scripts\auto-migrate.ps1 -Seed` - Poblar con datos de prueba

### Utilidades

- `scripts/cleanup-project.ps1` - Limpia archivos innecesarios
- `scripts/check-used-endpoints.ps1` - Verifica qué endpoints se usan

---

## 📝 VARIABLES DE ENTORNO

### Backend (apps/api/.env)

**Mínimas requeridas:**

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://usuario:password@localhost:5432/cermont_db"
JWT_SECRET="tu-secret-de-al-menos-32-caracteres"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (apps/web/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🔍 VERIFICACIÓN

### Verificar que todo funcione

1. **Backend saludable:**
   ```
   http://localhost:4000/api/health
   ```

2. **Swagger documentación:**
   ```
   http://localhost:4000/docs
   ```

3. **Frontend:**
   ```
   http://localhost:3000
   ```

### Verificar base de datos

```powershell
cd apps/api
pnpm prisma:studio
```

Se abrirá Prisma Studio en el navegador donde puedes ver y editar datos.

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "DATABASE_URL is required"

- Verifica que existe `apps/api/.env`
- Verifica que `DATABASE_URL` esté configurado
- Ejecuta: `.\scripts\setup-local.ps1`

### Error: "JWT_SECRET is required"

- El JWT_SECRET debe tener al menos 32 caracteres
- Ejecuta: `.\scripts\setup-local.ps1` (genera uno automáticamente)

### Error: "Cannot connect to database"

- Verifica que PostgreSQL esté corriendo:
  ```powershell
  docker compose ps
  ```
- Si no está corriendo:
  ```powershell
  docker compose up -d db
  ```

### Error 500 en endpoints

- Revisa los logs:
  ```powershell
  cd apps/api
  Get-Content logs\error-*.log -Tail 50
  ```
- Verifica que las migraciones estén aplicadas:
  ```powershell
  .\scripts\auto-migrate.ps1
  ```

### Frontend no conecta con backend

- Verifica `NEXT_PUBLIC_API_URL` en `apps/web/.env.local`
- Verifica que el backend esté corriendo en el puerto correcto
- Revisa la consola del navegador (F12) para errores

---

## 📚 DOCUMENTACIÓN ADICIONAL

- `docs/GUIA-DESPLIEGUE-CONTABO.md` - Guía completa para VPS
- `README.md` - Documentación general del proyecto
- `docs/ANALISIS-MIGRACION-LARAVEL.md` - Análisis de migración

---

## ✅ CHECKLIST RÁPIDO

### Desarrollo Local

- [ ] Node.js 18+ instalado
- [ ] Docker Desktop instalado (para PostgreSQL)
- [ ] Ejecutado `.\scripts\quick-start.ps1`
- [ ] Backend corriendo (puerto 4000)
- [ ] Frontend corriendo (puerto 3000)
- [ ] Health check funciona: http://localhost:4000/api/health
- [ ] Puedes iniciar sesión en http://localhost:3000

### Producción

- [ ] VPS configurado
- [ ] PostgreSQL instalado y base de datos creada
- [ ] Variables de entorno configuradas
- [ ] Build ejecutado
- [ ] Migraciones aplicadas
- [ ] PM2 corriendo
- [ ] Nginx configurado
- [ ] SSL configurado
- [ ] Dominio apuntando al VPS

---

**¿Problemas?** Revisa la sección de solución de problemas o consulta los logs.
