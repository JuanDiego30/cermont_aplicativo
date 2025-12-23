# 🔄 RESET Y SEED DE BASE DE DATOS - DESARROLLO

## ⚠️ ADVERTENCIA

Este script **ELIMINARÁ TODOS LOS DATOS** de la base de datos. Solo usar en desarrollo.

---

## 🚀 Uso Rápido

### Opción 1: Script PowerShell (Recomendado)

```powershell
# Desde la raíz del proyecto
.\apps\api\scripts\reset-and-seed.ps1
```

### Opción 2: Comandos Manuales

```powershell
# 1. Ir al directorio de la API
cd apps/api

# 2. Resetear base de datos (elimina todo)
npx prisma migrate reset --force --skip-seed

# 3. Aplicar migraciones
npx prisma migrate deploy

# 4. Generar Prisma Client
npx prisma generate

# 5. Ejecutar seed
npx tsx prisma/seed.ts
```

### Opción 3: Usando npm scripts

```powershell
cd apps/api

# Resetear y seed en un comando
npx prisma migrate reset --force
# Esto ejecuta automáticamente el seed configurado en package.json
```

---

## 📋 Credenciales Creadas

Después de ejecutar el seed, tendrás:

### Usuario Administrador
- **Email:** `root@cermont.com`
- **Password:** `admin`
- **Rol:** `admin`
- **Estado:** Activo

### Usuarios Técnicos (5 usuarios)
- **Email:** `tecnico1@cermont.com` hasta `tecnico5@cermont.com`
- **Password:** `tecnico123456`
- **Rol:** `tecnico`
- **Estado:** Activo

---

## 🔍 Verificar que Funcionó

### 1. Verificar en pgAdmin

```sql
-- Ver usuarios creados
SELECT email, name, role, active 
FROM "User" 
WHERE email LIKE '%@cermont.com'
ORDER BY role, email;
```

### 2. Probar Login

Usa las credenciales:
- Email: `root@cermont.com`
- Password: `admin`

---

## 🛠️ Solución de Problemas

### Error: "DATABASE_URL not set"
- Verifica que existe el archivo `.env` en `apps/api/`
- Verifica que `DATABASE_URL` está configurada correctamente

### Error: "Cannot connect to database"
- Verifica que PostgreSQL está corriendo
- Verifica que la conexión en `DATABASE_URL` es correcta
- Verifica que el usuario de PostgreSQL tiene permisos

### Error: "Migration failed"
- Asegúrate de que todas las migraciones están en `apps/api/prisma/migrations/`
- Si hay conflictos, puedes hacer: `npx prisma migrate reset --force`

---

## 📝 Notas

- El seed usa `bcrypt` con 12 rounds (OWASP recomendado)
- Los usuarios se crean con `upsert`, así que si ya existen, se actualizan
- La contraseña del admin es `admin` (simple para desarrollo)
- En producción, usar contraseñas seguras

---

## ✅ Checklist

- [ ] PostgreSQL está corriendo
- [ ] `DATABASE_URL` está configurada en `.env`
- [ ] Ejecutaste el script de reset
- [ ] Puedes hacer login con `root@cermont.com` / `admin`

---

**Última actualización:** 2024-12-22

