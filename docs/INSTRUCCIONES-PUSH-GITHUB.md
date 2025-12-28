# 🚀 INSTRUCCIONES FINALES - PUSH A GITHUB

## 📋 RESUMEN DE CAMBIOS

**Total Archivos Actualizados:** 4 archivos críticos  
**Total Líneas de Código:** ~800 líneas  
**Tiempo Implementación:** ~45 minutos  
**Complejidad:** Media  

---

## 📁 ARCHIVOS A ACTUALIZAR

### 1. `apps/api/prisma/schema.prisma` (CRÍTICO)
**Acción:** Reemplazar completamente  
**Tamaño:** ~300 líneas  
**Modelos Nuevos:** 8 (User, Orden, Ejecucion, Certificacion, Checklist, ChecklistItem, FormularioSubmission, AuditLog)  
**Enums Nuevos:** 3 (Role, UserStatus, OrderStatus)  

### 2. `apps/api/prisma/seed.ts` (CRÍTICO)
**Acción:** Crear archivo nuevo  
**Tamaño:** ~150 líneas  
**Usuarios Seed:** 5 (admin, supervisor, tecnico, cliente, test)  
**Dependencias:** bcrypt para hashing  

### 3. `apps/api/.env.example` (IMPORTANTE)
**Acción:** Actualizar/crear  
**Tamaño:** ~30 líneas  
**Variables Nuevas:** JWT_*, REDIS_*, VAPID_*  

### 4. `apps/api/package.json` (IMPORTANTE)
**Acción:** Agregar scripts y dependencias  
**Scripts Nuevos:**
```json
{
  "scripts": {
    "prisma:studio": "prisma studio",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset",
    "db:push": "prisma db push"
  }
}
```

**Dependencias Nuevas:**
```bash
npm install bcrypt @types/bcrypt
npm install web-push @types/web-push
npm install bullmq ioredis
```

---

## 📝 INSTRUCCIONES PASO A PASO

### FASE 1: PREPARACIÓN LOCAL (10 min)

**1.1 Clonar/Actualizar repositorio**
```bash
cd ~/tu-ruta/cermont_aplicativo
git status
git pull origin main
```

**1.2 Cambiar a rama de desarrollo**
```bash
git checkout -b fix/complete-prisma-auth-setup
```

---

### FASE 2: APLICAR CAMBIOS LOCALES (15 min)

**2.1 Crear nuevo schema.prisma**

```bash
# Backup del schema actual
cp apps/api/prisma/schema.prisma apps/api/prisma/schema.prisma.backup
```

**Copiar contenido del archivo "GUIA-CORRECCIONES-PASO-A-PASO.md" sección "ARCHIVO 1"**

```bash
# Verificar sintaxis
npx prisma validate
```

**2.2 Crear seed.ts**

```bash
# Crear archivo
cat > apps/api/prisma/seed.ts << 'EOF'
[CONTENIDO DEL SEED.TS DE GUIA-CORRECCIONES-PASO-A-PASO.md]
EOF
```

**2.3 Actualizar .env**

```bash
# Crear si no existe
cat > apps/api/.env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cermont"
JWT_SECRET="your_super_secret_key_cermont_2025"
JWT_EXPIRY="24h"
NODE_ENV="development"
API_PORT=4000
EOF
```

**2.4 Instalar dependencias**

```bash
cd apps/api
npm install bcrypt @types/bcrypt
npm install web-push @types/web-push
npm install bullmq ioredis
```

---

### FASE 3: TESTEAR LOCALMENTE (10 min)

**3.1 Crear migración**

```bash
npx prisma migrate dev --name init_auth_setup
```

**Resultado esperado:**
```
✔ Created migration folder ./prisma/migrations/[timestamp]_init_auth_setup
✔ Generated Prisma Client
✔ Created database seed file ./prisma/seed.ts
✔ Run `npx prisma migrate deploy` to deploy these migrations

✔ Deployed to the database
```

**3.2 Ejecutar seed**

```bash
npx prisma db seed
```

**Resultado esperado:**
```
✓ Seeding database...
🌱 Iniciando seed de base de datos...
✅ Tabla User limpiada
✅ Usuario admin creado: root@cermont.com
✅ Usuario supervisor creado: supervisor@cermont.com
✅ Usuario técnico creado: tecnico@cermont.com
✅ Usuario cliente creado: cliente@cermont.com
✅ Usuario test creado: test@cermont.com

✅ SEED COMPLETADO EXITOSAMENTE
```

**3.3 Verificar base de datos**

```bash
# Opción 1: Prisma Studio
npx prisma studio
# Navegar a http://localhost:5555
# Ver usuarios en tabla User

# Opción 2: psql
psql -U postgres -d cermont
SELECT email, role, status FROM "User";
```

**Resultado esperado:**
```
         email          |   role   | status
------------------------+----------+--------
 root@cermont.com       | ADMIN    | ACTIVE
 supervisor@cermont.com | SUPERVISOR | ACTIVE
 tecnico@cermont.com    | TECNICO  | ACTIVE
 cliente@cermont.com    | CLIENTE  | ACTIVE
 test@cermont.com       | USER     | ACTIVE
(5 rows)
```

**3.4 Testear endpoint login**

```bash
# Iniciar servidor
npm run start:dev

# En otra terminal
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@cermont.com",
    "password": "Cermont2025!"
  }'
```

**Resultado esperado:**
```json
{
  "statusCode": 200,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "...",
      "email": "root@cermont.com",
      "name": "Administrador Cermont",
      "role": "ADMIN"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### FASE 4: COMMIT A GIT (5 min)

**4.1 Revisar cambios**

```bash
git status
git diff apps/api/prisma/schema.prisma | head -50
```

**4.2 Agregar archivos**

```bash
git add apps/api/prisma/schema.prisma
git add apps/api/prisma/seed.ts
git add apps/api/.env.example
git add apps/api/package.json
git add apps/api/.gitignore
```

**4.3 Crear commit**

```bash
git commit -m "fix: complete prisma auth setup with seed and migrations

- Add complete User model with all required fields (id, email, password, name, phone, role, status, 2FA, audit fields)
- Create User enums: Role (ADMIN, SUPERVISOR, TECNICO, CLIENTE, USER), UserStatus (ACTIVE, INACTIVE, SUSPENDED, DELETED)
- Add related models: Orden, Ejecucion, Certificacion, Checklist, ChecklistItem, FormularioSubmission, AuditLog
- Implement comprehensive seed.ts with 5 test users (admin, supervisor, tecnico, cliente, test)
- All passwords hashed with bcrypt 10 rounds
- Add migration: init_auth_setup
- Update .env.example with all required variables
- Install dependencies: bcrypt, web-push, bullmq, ioredis
- Fixes: 401 Unauthorized error on login by providing valid users
- Adds: Database structure for scalability, 2FA support, audit logging, password reset flow
- Closes: Login failure issue #1

BREAKING CHANGE: Schema significantly improved, migration required
MIGRATION STEPS:
  1. npm install bcrypt @types/bcrypt web-push @types/web-push bullmq ioredis
  2. npx prisma migrate dev
  3. npx prisma db seed
  4. Test: curl -X POST http://localhost:4000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"root@cermont.com\",\"password\":\"Cermont2025!\"}'
"
```

**4.4 Verificar commit**

```bash
git log --oneline -5
```

---

### FASE 5: PUSH A GITHUB (5 min)

**5.1 Push a rama de feature**

```bash
git push origin fix/complete-prisma-auth-setup
```

**Resultado esperado:**
```
Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 4 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (8/8), 3.45 KiB | 1.15 MiB/s, done.
Total 8 (delta 4), reused 0 (delta 0)
remote: Resolving deltas: 100% (4/4), done.
...
To github.com:JuanDiego30/cermont_aplicativo.git
 * [new branch]      fix/complete-prisma-auth-setup -> fix/complete-prisma-auth-setup
```

**5.2 Crear Pull Request en GitHub**

1. Ir a: https://github.com/JuanDiego30/cermont_aplicativo
2. Click en "Compare & pull request"
3. Completar información:

**Título:**
```
fix: complete prisma auth setup with seed and error handling
```

**Descripción:**
```markdown
## Description
Complete Prisma ORM setup with proper schema, migrations, and seed data to fix 401 Unauthorized error on login.

## Changes
- ✅ Add complete User model with all required fields
- ✅ Create database enums (Role, UserStatus, OrderStatus)
- ✅ Implement seed.ts with 5 test users
- ✅ Add related models (Orden, Ejecucion, Certificacion, Checklist, etc.)
- ✅ Create initial migration
- ✅ Install missing dependencies (bcrypt, web-push, bullmq, ioredis)

## Fixes
- Closes: #1 (401 Unauthorized on login)
- User not found error resolved

## Testing
- ✅ Database migrations working
- ✅ Seed script successfully creates 5 users
- ✅ POST /api/auth/login returns 200 + JWT token
- ✅ Prisma Studio shows all users

## Checklist
- [x] Code follows style guidelines
- [x] Database migrations tested locally
- [x] Seed data verified in Prisma Studio
- [x] Login endpoint tested and working
- [x] No breaking changes to existing endpoints
```

**5.3 Review y Merge**

- Esperar CI/CD checks (si están configurados)
- Click "Merge pull request"
- Click "Confirm merge"
- Seleccionar "Delete branch"

**5.4 Sincronizar local con main**

```bash
git checkout main
git pull origin main
```

---

## ✅ VERIFICACIÓN FINAL

Después del push y merge:

```bash
# 1. En el repositorio (rama main)
git log --oneline -5

# 2. Verificar archivos en GitHub
# Ir a: github.com/JuanDiego30/cermont_aplicativo
# Navegar a apps/api/prisma/schema.prisma

# 3. Clonar en otra máquina para validar
rm -rf cermont_test
git clone https://github.com/JuanDiego30/cermont_aplicativo.git cermont_test
cd cermont_test/apps/api
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev

# 4. Testear en nueva máquina
curl -X POST http://localhost:4000/api/auth/login -d '{"email":"root@cermont.com","password":"Cermont2025!"}'
```

---

## 📊 RESULTADO FINAL

**En GitHub:**
```
✅ PR creado y mergeado
✅ 1 commit con cambios
✅ 4 archivos modificados/creados
✅ 0 archivos conflictivos
✅ CI/CD checks pasados
```

**En tu máquina:**
```
✅ Schema.prisma actualizado
✅ Seed.ts funcionando
✅ 5 usuarios en base de datos
✅ Login retorna JWT token
✅ Cambios en main branch
```

**Status:** 🟢 COMPLETADO EXITOSAMENTE

---

## 🔄 PRÓXIMOS PASOS

1. **FASE 4:** Integración Backend-Frontend
   - Conectar Angular con NestJS API
   - Implementar interceptor de JWT tokens
   - Testear flujo completo de autenticación

2. **FASE 5:** DevOps & Deploy
   - Crear Dockerfile
   - Setup CI/CD (GitHub Actions)
   - Deploy a staging/production

3. **FASE 6:** Testing & QA
   - Tests unitarios
   - Tests de integración
   - Tests E2E

---

**Estimado Total:** 45 minutos  
**Dificultad:** Media  
**Riesgo:** Bajo (cambios localizados en auth)  
**Beneficio:** Alto (login funcional + escalable)  

