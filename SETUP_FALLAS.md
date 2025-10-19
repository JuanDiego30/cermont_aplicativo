# Guía de Setup y Prueba - Catálogo de Fallas

## ✅ Checklist de Configuración

### 1. Variables de Entorno

Necesitas crear un archivo `.env` en la **raíz del proyecto** con:

```env
# Supabase (obtén estos valores del dashboard de Supabase)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Backend
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

# Frontend (crea también .env.local en la raíz)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 2. Base de Datos

Debes ejecutar la migración SQL en tu base de datos Supabase:

**Opción A - Desde Supabase Dashboard:**
1. Ve a tu proyecto en https://supabase.com
2. Entra a "SQL Editor"
3. Copia y pega el contenido de `backend/database/migrations/20251018_add_fallas.sql`
4. Ejecuta el script (clic en "Run")

**Opción B - Desde consola local (si tienes psql configurado):**
```powershell
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f backend/database/migrations/20251018_add_fallas.sql
```

### 3. Instalación de Dependencias

Si es la primera vez, ejecuta:

```powershell
npm install
```

---

## 🚀 Cómo Levantar el Proyecto

### Opción 1: Levantar todo junto (recomendado)

```powershell
npm run dev:all
```

Esto levanta:
- Frontend en http://localhost:3000
- Backend en http://localhost:4000

### Opción 2: Levantar por separado

**Terminal 1 - Frontend:**
```powershell
npm run dev
```

**Terminal 2 - Backend:**
```powershell
npm run backend:dev
```

---

## 🧪 Cómo Probar el Catálogo de Fallas

### Paso 1: Verificar que el Backend está funcionando

Abre en tu navegador:
```
http://localhost:4000/health
```

Deberías ver algo como:
```json
{
  "status": "ok",
  "service": "cermont-backend",
  "time": "2025-10-18T..."
}
```

### Paso 2: Probar el endpoint de fallas

Abre en tu navegador (o usa Postman):
```
http://localhost:4000/failures
```

**Nota:** Necesitas estar autenticado. Si ves error 401, primero inicia sesión en el frontend.

### Paso 3: Crear una orden con fallas (desde el Frontend)

1. Abre http://localhost:3000
2. Inicia sesión (si no tienes usuario, créalo desde `/autenticacion/registro`)
3. Ve a "Nueva Orden": http://localhost:3000/ordenes/nueva
4. Llena el formulario:
   - Cliente ID
   - Tipo de equipo (ej: CCTV)
   - Al seleccionar el tipo de equipo, verás las fallas disponibles
   - **Marca una o varias fallas** (ej: "CCTV-001: Cámara sin señal")
   - Completa el resto del formulario
5. Crea la orden

### Paso 4: Ver las fallas en el detalle de la orden

1. Te redirigirá automáticamente al detalle de la orden
2. O ve manualmente a: http://localhost:3000/ordenes/[ID_DE_LA_ORDEN]
3. Verás varias pestañas: "Información General", **"Fallas (X)"**, "Evidencias", etc.
4. Haz clic en la pestaña **"Fallas"**
5. Deberías ver las fallas que seleccionaste:
   ```
   [CCTV-001] Cámara sin señal
   ALTA • CCTV
   Pérdida total de video en cámara
   ```

---

## 🔍 Verificación de Integración

### ✅ Verificar que todo esté conectado:

**Backend → Base de datos:**
- El backend se conecta correctamente si no ves errores de "SUPABASE_URL" al levantarlo
- Las tablas `fallas` y `orden_fallas` existen en tu base

**Frontend → Backend:**
- El frontend se conecta al backend si `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` está en `.env.local`
- Puedes verificar en la consola del navegador (F12 → Network) al cargar fallas

**Flujo completo:**
1. Crear orden → llama a `POST /orders`
2. Seleccionar fallas → llama a `POST /failures/assign`
3. Ver detalle → llama a `GET /failures/by-order/:ordenId`

---

## ❌ Problemas Comunes

### Error: "Missing script: backend:dev"
**Solución:** Ya lo arreglamos, pero asegúrate de tener la versión actualizada de `package.json`

### Error: "Variables de entorno faltantes: SUPABASE_URL"
**Solución:** Crea el archivo `.env` en la raíz con las credenciales de Supabase

### Error 401 al llamar a `/failures`
**Solución:** Necesitas estar autenticado. Inicia sesión primero en el frontend

### No veo fallas al crear la orden
**Solución:** 
1. Verifica que aplicaste la migración SQL
2. Verifica que el backend esté levantado
3. Revisa la consola del navegador (F12) para ver errores

### Las fallas no se muestran en el detalle
**Solución:**
1. Verifica que seleccionaste fallas al crear la orden
2. Verifica que el backend esté levantado
3. Abre la consola del navegador y busca errores en la pestaña Network

---

## 📋 Estado Actual de Implementación

### ✅ Completado:
- ✅ Tabla `fallas` en base de datos
- ✅ Tabla `orden_fallas` (relación N:M)
- ✅ Backend: CRUD de fallas (`/failures`)
- ✅ Backend: Asociar fallas a órdenes (`POST /failures/assign`)
- ✅ Backend: Listar fallas por orden (`GET /failures/by-order/:ordenId`)
- ✅ Frontend: Cliente API para fallas
- ✅ Frontend: Selector de fallas en formulario de orden
- ✅ Frontend: Pestaña "Fallas" en detalle de orden

### 🚧 Pendiente (próximos pasos):
- ⏳ Vista de administración de fallas (crear/editar/eliminar)
- ⏳ Plantillas de procedimientos vinculadas a fallas
- ⏳ Reporte PDF con fallas incluidas

---

## 🎯 Siguiente Paso

Una vez que verifiques que el catálogo de fallas funciona correctamente, continuaremos con:
1. **Vista de administración** para gestionar el catálogo de fallas
2. **Plantillas de procedimientos** asociadas a fallas
3. **Reporte PDF** que incluya las fallas detectadas

---

¿Necesitas ayuda con algún paso específico? ¡Avísame!
