# ✅ Configuración Completa - Backend y Frontend

## 📋 Estado Actual

### ✅ Completado

1. **Backend `.env`** - Actualizado a PostgreSQL
   - ✅ `DATABASE_URL` configurado para PostgreSQL
   - ✅ `JWT_SECRET` configurado
   - ✅ Variables de entorno válidas

2. **Frontend `.env.local`** - Creado
   - ✅ `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
   - ✅ `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

---

## 🔄 Próximos Pasos

### Paso 1: Instalar Dependencias (si no están instaladas)

```bash
# Desde la raíz del proyecto
pnpm install
```

### Paso 2: Generar Prisma Client

```bash
cd apps/api
pnpm prisma generate
```

### Paso 3: Crear Base de Datos (si no existe)

Desde pgAdmin o psql:

```sql
-- Conectar a PostgreSQL
-- Crear base de datos si no existe
CREATE DATABASE cermont_fsm
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

O ejecutar el script de reset:
```powershell
.\scripts\reset-database.ps1
```

### Paso 4: Ejecutar Migraciones

```bash
cd apps/api
pnpm prisma migrate dev --name init_postgresql
```

### Paso 5: Iniciar Aplicación

```bash
# Desde la raíz del proyecto
pnpm run dev
```

---

## 🔍 Verificación

### Backend

1. **Verificar variables de entorno:**
   ```bash
   cd apps/api
   cat .env | grep DATABASE_URL
   ```

2. **Verificar Prisma Client:**
   ```bash
   pnpm prisma generate
   ```

3. **Verificar conexión a BD:**
   ```bash
   pnpm prisma db pull
   ```

### Frontend

1. **Verificar variables de entorno:**
   ```bash
   cd apps/web
   cat .env.local
   ```

2. **Verificar que el frontend pueda conectarse al backend:**
   - Abrir `http://localhost:3000`
   - Verificar en consola del navegador que no haya errores de conexión

---

## 📊 Configuración de Archivos

### `apps/api/.env`

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/cermont_fsm?connect_timeout=10&sslmode=prefer"
JWT_SECRET="dev-secret-key-change-in-production-12345678901234567890123456789012"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"
LOG_LEVEL="debug"
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL is required"

- Verificar que `apps/api/.env` existe
- Verificar que `DATABASE_URL` está configurado correctamente
- Reiniciar el servidor

### Error: "Connection refused" o "database does not exist"

1. Verificar que PostgreSQL esté corriendo
2. Verificar que la base de datos `cermont_fsm` existe
3. Verificar credenciales en `DATABASE_URL`

### Error: "Prisma Client not generated"

```bash
cd apps/api
pnpm prisma generate
```

### Error: Frontend no se conecta al backend

1. Verificar que el backend esté corriendo en `http://localhost:4000`
2. Verificar `NEXT_PUBLIC_API_URL` en `apps/web/.env.local`
3. Verificar CORS en el backend

---

## ✅ Checklist Final

- [x] Backend `.env` configurado con PostgreSQL
- [x] Frontend `.env.local` creado
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Prisma Client generado (`pnpm prisma generate`)
- [ ] Base de datos `cermont_fsm` creada
- [ ] Migraciones ejecutadas (`pnpm prisma migrate dev`)
- [ ] Backend iniciando correctamente (`pnpm run dev`)
- [ ] Frontend conectándose al backend

---

**¡Listo para continuar con el desarrollo!** 🚀

