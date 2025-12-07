# 🚀 INSTRUCCIONES PARA INICIAR LA APLICACIÓN

## ¿Dónde ejecuto `npm run dev`?

**Respuesta corta:** 
```bash
# Desde la RAÍZ del proyecto (donde está este archivo)
npm run dev
```

---

## 📍 Puertos y URLs

| Componente | Puerto | URL | Descripción |
|-----------|--------|-----|-------------|
| **Frontend** | 3000 | http://localhost:3000 | Aplicación web Next.js |
| **Backend API** | 3001 | http://localhost:3001/api | API REST Express |
| **Prisma Studio** | 5555 | http://localhost:5555 | UI para gestionar BD (opcional) |

---

## 🎯 Formas de Ejecutar

### ✅ Opción 1: RECOMENDADA - Ambas simultáneamente desde raíz

```bash
# Desde la carpeta raíz (c:\Users\camil\Downloads\Compressed\aplicativo_cermont_prueba\cermont_aplicativo)
npm run dev
```

**Resultado:**
- ✅ Backend inicia en puerto 3001
- ✅ Frontend inicia en puerto 3000
- ✅ Ambas se ejecutan en paralelo en la MISMA terminal

---

### ✅ Opción 2: Terminales Separadas

**Terminal 1 - Backend:**
```bash
cd api
npm run dev
# Backend en: http://localhost:3001/api
```

**Terminal 2 - Frontend:**
```bash
cd web
npm run dev
# Frontend en: http://localhost:3000
```

---

### ✅ Opción 3: Solo uno

```bash
# Solo backend
npm run dev:api

# Solo frontend
npm run dev:web
```

---

## 🔧 Configuración Previa (Si es Primera Vez)

### 1. Variables de Entorno

#### Backend (api/.env) - Debe existir:
```
DATABASE_URL="postgresql://user:password@localhost:5432/cermont_db"
JWT_SECRET="tu_secret_key_aqui"
JWT_REFRESH_SECRET="tu_refresh_secret_aqui"
API_PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

#### Frontend (web/.env.local) - Debe existir:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Base de Datos

```bash
cd api

# Push schema a la BD (crear tablas)
npx prisma db push

# Opcional: llenar con datos de prueba
npx prisma db seed
```

### 3. Instalar Dependencias (Si aún no está hecho)

```bash
# Backend
cd api
npm install
cd ..

# Frontend
cd web
npm install
cd ..

# Root (para concurrently)
npm install
```

---

## 📊 Estructura del Proyecto

```
cermont_aplicativo/
├── api/                    # Backend Express + Prisma
│   ├── src/               # Código fuente
│   ├── prisma/            # Esquema de BD
│   ├── package.json
│   └── .env              # Variables de entorno
│
├── web/                    # Frontend Next.js
│   ├── src/               # Código React
│   ├── package.json
│   └── .env.local         # Variables de entorno
│
├── package.json           # Scripts raíz
├── .gitignore             # Archivos ignorados en git
└── README.md              # Documentación completa
```

---

## 🚨 Solución de Problemas

### Error: "Cannot find module 'concurrently'"
```bash
# Instalar en la raíz
npm install
```

### Error: "ECONNREFUSED" en frontend
- Verificar que backend está corriendo en puerto 3001
- Revisar `web/.env.local` con URL correcta

### Error: "Database connection failed"
- Verificar PostgreSQL está running
- Verificar `DATABASE_URL` en `api/.env`
- Ejecutar `npx prisma db push`

### Puertos ocupados
```bash
# Windows - ver qué usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Cambiar puerto si necesario (en package.json o scripts)
```

---

## ✨ Scripts Adicionales

### Desde la raíz:
```bash
npm run build              # Compilar ambos
npm run build:api         # Solo backend
npm run build:web         # Solo frontend

npm run lint              # Linting ambos
npm run lint:api
npm run lint:web

npm run test              # Tests ambos
npm run test:api
npm run test:web

npm run prisma:studio     # Abrir Prisma Studio (UI BD)
npm run prisma:migrate    # Crear migrations
```

---

## 🎓 Primeros Pasos

1. **Asegurar configuración (api/.env, web/.env.local)**
2. **Ejecutar: `npm run dev` desde la raíz**
3. **Esperar a que ambos inicien (10-30 segundos)**
4. **Acceder:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001/api

---

## 📚 Información General

- **Repositorio:** https://github.com/JuanDiego30/cermont_aplicativo.git
- **Frontend:** Next.js 16.0.7 con React 19
- **Backend:** Express 4.21 con Prisma 6.19
- **BD:** PostgreSQL
- **Estado:** Refactorizado y limpio ✅

**¡Listo para usar!** 🎉
