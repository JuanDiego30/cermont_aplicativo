# ?? GUÍA RÁPIDA - EMPEZAR A USAR EL PROYECTO

## ¡Felicitaciones! Tu proyecto está 100% refactorizado

La refactorización de arquitectura monorepo se completó exitosamente. Aquí está todo lo que necesitas saber para empezar.

---

## ?? Estado Actual

```
? npm workspaces configurado
? Backend compilado (tsc exitoso)
? Frontend listo (caché limpio)
? BD seedeada (5 usuarios de prueba)
? Tests pasando (3/3 auth tests)
? Documentación organizada
```

---

## ?? INICIO RÁPIDO (5 minutos)

### Paso 1: Verificar Instalación
```bash
# Confirmar que todo está instalado
npm run type-check

# Debería mostrar:
# ? No TypeScript errors
```

### Paso 2: Iniciar Desarrollo
```bash
# Inicia Backend + Frontend simultáneamente
npm run dev
```

Verás:
```
? Backend en puerto 5000
? Frontend en puerto 3000
? Backend escuchando en http://localhost:5000
? Frontend compilado
```

### Paso 3: Acceder a la App
```
Abre navegador: http://localhost:3000/login
```

### Paso 4: Iniciar Sesión
```
Email: admin@cermont.com
Password: Admin123!
```

---

## ?? COMANDOS ÚTILES

### Desarrollo
```bash
npm run dev              # Backend + Frontend (recomendado)
npm run dev:backend     # Solo Backend (debug)
npm run dev:frontend    # Solo Frontend (debug)
```

### Compilación
```bash
npm run build           # Compilar todo
npm run build:backend   # Solo Backend
npm run build:frontend  # Solo Frontend
```

### Testing
```bash
npm run test            # Ejecutar tests
npm run test:watch      # Watch mode
```

### Base de Datos
```bash
npm run db:seed         # Cargar datos de prueba
npm run db:reset        # Resetear BD
npm run db:studio       # Abrir Prisma Studio
```

### Utilidades
```bash
npm run lint            # Linter
npm run format          # Prettier
npm run type-check      # TypeScript check
```

---

## ?? Estructura del Proyecto

```
cermont-atg/
??? backend/             ? API Express.js
?   ??? src/
?       ??? app.ts      (configuración)
?       ??? server.ts   (entrada)
?       ??? domain/     (lógica de negocio)
?       ??? infra/      (BD, HTTP)
?       ??? shared/     (utilidades)
?
??? frontend/            ? Next.js 16
?   ??? app/
?       ??? login/      (login page)
?       ??? dashboard/  (main app)
?       ??? layout.tsx
?
??? docs/               ? Documentación
?   ??? DEPLOYMENT.md  (VPS)
?   ??? ARQUITECTURA.md (diseño)
?   ??? STATUS.md      (estado)
?
??? scripts/           ? Utilidades
    ??? dev.sh, prod.sh
```

---

## ?? Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| `root@cermont.com` | `Root123!` | ROOT |
| `admin@cermont.com` | `Admin123!` | ADMIN |
| `coordinador@cermont.com` | `Coord123!` | COORDINADOR |
| `test@cermont.com` | `Test1234!` | OPERARIO |

---

## ?? URLs Disponibles

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Aplicación web |
| API | http://localhost:5000/api | Backend API |
| Login | http://localhost:3000/login | Página de login |
| Dashboard | http://localhost:3000/dashboard | Panel principal |

---

## ?? Troubleshooting

### "npm run dev falla"
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json backend/node_modules frontend/node_modules
npm install
npm run dev
```

### "CORS error"
```bash
# Backend .env correcto
cat backend/.env | grep CORS_ORIGIN
# Debe ser: CORS_ORIGIN=http://localhost:3000
```

### "BD no funciona"
```bash
# Resetear BD
npm run db:reset
npm run db:seed
```

### "Frontend no compila"
```bash
# Limpiar caché de Next.js
cd frontend && rm -rf .next && npm run dev
```

---

## ?? Documentación Completa

- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Cómo deployar a VPS
- **[ARQUITECTURA.md](./docs/ARQUITECTURA.md)** - Diseño del sistema
- **[README.md](./README.md)** - Guía general del proyecto

---

## ? Características Principales

? **Gestión de Órdenes** - Crear, asignar y seguir órdenes de trabajo
? **Dashboard Ejecutivo** - KPIs en tiempo real  
? **Reportes** - Generación automática de PDF
? **Autenticación** - JWT + roles RBAC
? **Offline First** - Funciona sin internet
? **Seguridad** - Encriptación, CORS, rate limiting

---

## ?? Ciclo de Desarrollo

### 1. Desarrollo Local
```bash
npm run dev
# Edita código
# Hot reload automático
```

### 2. Testing
```bash
npm run test            # Ejecutar una vez
npm run test:watch     # Modo watch
```

### 3. Compilación
```bash
npm run build
# Genera dist/ y .next/
```

### 4. Deployment
```bash
# Ver: docs/DEPLOYMENT.md
npm start              # Producción local
# O deploy a VPS con PM2
```

---

## ?? Tips Profesionales

1. **Usa npm workspaces**
   ```bash
   npm run dev -w backend    # Solo backend
   npm run dev -w frontend   # Solo frontend
   ```

2. **Debugging**
   ```bash
   # Backend
   cd backend && npm run dev:raw    # Sin preflight check

   # Frontend  
   # Abre DevTools (F12)
   ```

3. **Performance**
   ```bash
   # Compilación incremental
   npm run type-check           # Rápido
   npm run build                # Completo
   ```

---

## ?? Próximos Pasos

### Esta Semana
1. ? Ejecuta `npm run dev` y prueba la app
2. ? Login con `admin@cermont.com`
3. ? Explora el dashboard
4. ? Lee docs/ARQUITECTURA.md

### Próxima Semana
1. Crear órdenes de trabajo
2. Probar funcionalidad offline
3. Generar reportes

### Producción
1. Ver docs/DEPLOYMENT.md
2. Configurar DNS y SSL
3. Deploy a VPS con PM2 + Nginx

---

## ?? Soporte

Si algo falla:
1. Revisa troubleshooting arriba ?
2. Lee los documentos en `docs/`
3. Ejecuta: `npm run type-check` (detecta errores)

---

## ?? ¡Listo!

```bash
npm run dev
# Abre http://localhost:3000/login
# ¡A disfrutar de tu aplicación! ??
```

---

**Actualizado**: 2024-11-17  
**Status**: ?? Listo para usar  
**Rama**: main / chore/purge-backend
