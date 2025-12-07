# 🚀 Guía de Configuración - CERMONT

## ✅ Cambios Realizados

### 1. **Archivos de Imagen (Favicon & Logo)**
- ✓ `public/favicon.ico` - Icono con fondo redondo azul-verde
- ✓ `public/apple-touch-icon.png` - Icono para Apple (180x180px)
- ✓ `public/logo.svg` - Logo vectorial con fondo redondo

### 2. **Variables de Entorno**
- ✓ Agregada `JWT_REFRESH_SECRET` en `api/.env`
- ✓ Actualizado `web/layout.tsx` para mostrar favicons

### 3. **Datos de Prueba**
- ✓ Creado `api/prisma/seed.ts` con usuarios de prueba

---

## 🔧 Pasos para Iniciar

### 1️⃣ Configurar Base de Datos

```bash
cd api

# Empujar schema a PostgreSQL
npx prisma db push

# Crear usuarios de prueba
npx prisma db seed
```

**Usuarios creados:**
- **Admin:** `root@cermont.com` / `admin123456`
- **Técnico:** `tecnico@cermont.com` / `tecnico123456`

### 2️⃣ Ejecutar la Aplicación

```bash
# Desde la raíz del proyecto
npm run dev

# Esto inicia:
# - Backend en: http://localhost:3001
# - Frontend en: http://localhost:3000
```

### 3️⃣ Acceder a la Aplicación

- **URL Principal:** http://localhost:3000
- **API:** http://localhost:3001/api
- **Prisma Studio:** `npm run prisma:studio` (puerto 5555)

---

## 🔐 Credenciales de Prueba

| Usuario | Email | Contraseña | Rol |
|---------|-------|-----------|-----|
| Admin | `root@cermont.com` | `admin123456` | Admin |
| Técnico | `tecnico@cermont.com` | `tecnico123456` | Técnico |

---

## 📝 Scripts Disponibles

### Desde la Raíz

```bash
npm run dev              # Inicia frontend + backend
npm run dev:api         # Solo backend
npm run dev:web         # Solo frontend
npm run build           # Compila ambos
npm run create-icons    # Regenera favicon.ico y logo.svg
npm run prisma:studio   # Abre UI de base de datos
npm run prisma:migrate  # Crear nueva migración
```

### Backend Específicamente

```bash
cd api

npm run dev             # Desarrollo con hot-reload
npm run build           # Compilar a JS
npm start               # Ejecutar producción
npm run db:seed         # Crear datos de prueba
npm run db:studio       # Prisma Studio
npm run lint            # ESLint
npm run test            # Tests
```

### Frontend Específicamente

```bash
cd web

npm run dev             # Next.js desarrollo
npm run build           # Build optimizado
npm start               # Ejecutar build
npm run lint            # ESLint
```

---

## 🎨 Personalizar Iconos

Si quieres regenerar los iconos con colores diferentes:

```bash
# Editar create-icons.py con nuevos colores
npm run create-icons
```

Los iconos se generarán en `public/`:
- `favicon.ico` (múltiples tamaños)
- `apple-touch-icon.png` (180x180)
- `logo.svg` (vectorial)

---

## 🐛 Solución de Problemas

### Error: "DATABASE_URL: Required"
```bash
# Asegurar que api/.env existe con:
DATABASE_URL="postgresql://user:password@localhost:5432/cermont_db"
# O usar SQLite:
DATABASE_URL="file:./dev.db"
```

### Error: "jwt_refresh_secret: Required"
✓ **RESUELTO** - Ya agregado en `api/.env`

### Error: "Cannot connect to database"
```bash
# 1. Verificar PostgreSQL está corriendo
# 2. Ejecutar:
npx prisma db push

# 3. Luego seed:
npx prisma db seed
```

### Error: "Cross origin request detected"
✓ Es solo una advertencia de Next.js, no afecta funcionamiento

---

## 📊 Estructura de Directorios

```
cermont_aplicativo/
├── api/                          # Backend
│   ├── src/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts              # ✨ Nuevo: Crear usuarios
│   ├── .env                      # ✨ Actualizado: JWT_REFRESH_SECRET
│   └── package.json
│
├── web/                          # Frontend
│   ├── src/app/
│   │   └── layout.tsx            # ✨ Actualizado: iconos
│   ├── .env.local
│   └── package.json
│
├── public/                       # ✨ Nuevos archivos
│   ├── favicon.ico              # Icono 16x32x48x64
│   ├── apple-touch-icon.png     # Icono Apple 180x180
│   └── logo.svg                 # Logo vectorial
│
├── create-icons.py              # ✨ Script para regenerar iconos
├── package.json                 # ✨ Agregado: npm run create-icons
└── .gitignore
```

---

## ✨ Próximos Pasos

1. ✅ Ejecutar `npm run dev`
2. ✅ Ir a http://localhost:3000
3. ✅ Ingresar con `root@cermont.com` / `admin123456`
4. ✅ ¡Empezar a usar Cermont!

---

## 📞 Contacto

Cualquier problema, contacta al equipo de desarrollo.

**¡Feliz desarrollo! 🚀**
