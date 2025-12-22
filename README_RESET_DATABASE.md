# 🗑️ Scripts para Limpiar y Recrear Base de Datos PostgreSQL

Este directorio contiene scripts para limpiar y recrear completamente la base de datos PostgreSQL del proyecto Cermont.

## 📋 Scripts Disponibles

### 1. **reset-database.sh** (Linux/Mac/Git Bash)
Script completo con confirmación paso a paso.

**Uso:**
```bash
chmod +x reset-database.sh
./reset-database.sh
```

### 2. **reset-database.ps1** (Windows PowerShell)
Versión PowerShell del script completo.

**Uso:**
```powershell
.\reset-database.ps1
```

### 3. **reset-database-quick.sh** (Linux/Mac/Git Bash)
Versión rápida usando `prisma migrate reset` (sin confirmación).

**Uso:**
```bash
chmod +x reset-database-quick.sh
./reset-database-quick.sh
```

### 4. **reset-database-quick.ps1** (Windows PowerShell)
Versión rápida PowerShell.

**Uso:**
```powershell
.\reset-database-quick.ps1
```

---

## ⚠️ ADVERTENCIA

**Estos scripts eliminarán TODOS los datos de la base de datos `cermont_fsm`.**

Asegúrate de:
- ✅ Hacer backup si necesitas conservar datos
- ✅ Estar en el entorno de desarrollo (no producción)
- ✅ Tener PostgreSQL corriendo
- ✅ Tener las credenciales correctas en `.env`

---

## 🔧 Configuración

### Variables de Base de Datos

Los scripts usan estas variables por defecto:
- **Host:** `localhost`
- **Puerto:** `5432`
- **Usuario:** `postgres`
- **Contraseña:** `admin`
- **Base de datos:** `cermont_fsm`

### Personalizar Configuración

Edita los scripts y cambia estas variables al inicio:

**Bash:**
```bash
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="admin"
DB_NAME="cermont_fsm"
```

**PowerShell:**
```powershell
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_USER = "postgres"
$DB_PASSWORD = "admin"
$DB_NAME = "cermont_fsm"
```

---

## 📊 Qué Hacen los Scripts

### Scripts Completos (reset-database.*)

1. **Eliminan** la base de datos existente
2. **Crean** una nueva base de datos vacía
3. **Limpian** migraciones anteriores
4. **Limpian** Prisma Client generado
5. **Generan** nuevo Prisma Client
6. **Crean** nueva migración inicial
7. **Ejecutan** seed (datos iniciales)

### Scripts Rápidos (reset-database-quick.*)

1. Ejecutan `npx prisma migrate reset --force`
   - Esto hace todo lo anterior en un solo comando

---

## 🚀 Uso Recomendado

### Para Desarrollo Diario

Usa el script rápido:
```bash
# Linux/Mac/Git Bash
./reset-database-quick.sh

# Windows PowerShell
.\reset-database-quick.ps1
```

### Para Debugging o Problemas

Usa el script completo para ver cada paso:
```bash
# Linux/Mac/Git Bash
./reset-database.sh

# Windows PowerShell
.\reset-database.ps1
```

---

## 🛠️ Troubleshooting

### Error: "database is being accessed by other users"

**Solución:**
```bash
# Forzar desconexión de usuarios activos
psql -h localhost -U postgres -c "
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'cermont_fsm'
  AND pid <> pg_backend_pid();
" postgres
```

### Error: "password authentication failed"

Verifica que la contraseña en `.env` sea correcta:
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/cermont_fsm?schema=public"
```

### Error: "psql: command not found"

**Windows:**
- Asegúrate de tener PostgreSQL instalado
- Agrega PostgreSQL al PATH:
  ```
  C:\Program Files\PostgreSQL\15\bin
  ```

**Linux/Mac:**
```bash
# Instalar PostgreSQL
sudo apt-get install postgresql-client  # Ubuntu/Debian
brew install postgresql                  # Mac
```

### Error: "npx: command not found"

Asegúrate de tener Node.js y npm instalados:
```bash
node --version
npm --version
```

---

## ✅ Verificar que Funcionó

### 1. Ver tablas creadas
```bash
psql -h localhost -U postgres -d cermont_fsm -c "\dt"
```

### 2. Abrir Prisma Studio
```bash
cd apps/api
npx prisma studio
```

### 3. Verificar migraciones
```bash
cd apps/api
npx prisma migrate status
```

---

## 📝 Notas

- Los scripts asumen que estás en la **raíz del proyecto**
- Los scripts usan `apps/api` como ruta del módulo API
- El seed se ejecuta automáticamente si está configurado en `package.json`
- Los scripts limpian migraciones anteriores para empezar desde cero

---

## 🔗 Comandos Manuales Alternativos

Si prefieres ejecutar manualmente:

```bash
# Opción más rápida (todo en uno)
cd apps/api
npx prisma migrate reset --force
cd ../..
```

O paso a paso:

```bash
# 1. Eliminar y recrear BD
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS cermont_fsm;" postgres
psql -h localhost -U postgres -c "CREATE DATABASE cermont_fsm OWNER postgres;" postgres

# 2. Limpiar y regenerar
cd apps/api
rm -rf prisma/migrations/*
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
```

---

**¿Necesitas ayuda?** Revisa los logs de error o consulta la documentación de Prisma: https://www.prisma.io/docs

