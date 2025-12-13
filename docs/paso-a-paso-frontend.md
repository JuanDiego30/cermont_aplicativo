# 🚀 PASO A PASO - IMPLEMENTAR CORRECCIONES FRONTEND

## FASE 1: PREPARACIÓN (5 minutos)

### Paso 1.1: Hacer backup
```bash
cd apps/web
cp -r src src.backup.$(date +%s)
echo "✅ Backup creado"
```

### Paso 1.2: Limpiar cache
```bash
rm -rf .next node_modules/.cache
echo "✅ Cache limpio"
```

---

## FASE 2: ACTUALIZAR AUTH STORE (10 minutos)

### Paso 2.1: Reemplazar `auth.store.ts`

**Ubicación**: `apps/web/src/stores/auth.store.ts`

**Acciones**:
1. Abrir archivo
2. Reemplazar TODO el contenido con el código de SOLUCIÓN 2
3. Guardar

**Cambios clave**:
- ✅ Agregar `persist` middleware de Zustand
- ✅ Guardar token en localStorage
- ✅ Método `clearAuth()` para logout
- ✅ Crear hook `useAuth()`

---

## FASE 3: ACTUALIZAR API CLIENT (15 minutos)

### Paso 3.1: Reemplazar `api-client.ts`

**Ubicación**: `apps/web/src/lib/api-client.ts`

**Acciones**:
1. Abrir archivo
2. Reemplazar TODO el contenido con el código de SOLUCIÓN 1
3. Guardar

**Cambios clave**:
- ✅ `withCredentials: true` para cookies
- ✅ Interceptor de REQUEST: agregar token en header `Authorization`
- ✅ Interceptor de RESPONSE: manejar 401 y refrescar token
- ✅ Método `upload()` para archivos

### Paso 3.2: Verificar imports
```bash
grep -r "from '@/lib/api'" apps/web/src/
# Debería encontrar refs a api-client o api que re-exporta api-client
```

---

## FASE 4: ACTUALIZAR HOOKS (10 minutos)

### Paso 4.1: Reemplazar `useDashboard.ts`

**Ubicación**: `apps/web/src/hooks/useDashboard.ts`

**Acciones**:
1. Abrir archivo
2. Reemplazar TODO con el código de SOLUCIÓN 3
3. Guardar

**Cambios clave**:
- ✅ Usar `useAuth()` para obtener token
- ✅ Validar `token` antes de hacer query
- ✅ `enabled: isAuthenticated && !!token`
- ✅ Manejar 401 errors correctamente

### Paso 4.2: Actualizar otros hooks similares

**Buscar todos los hooks que usan API**:
```bash
grep -l "useQuery\|useMutation" apps/web/src/hooks/*.ts
```

Para cada uno:
1. Agregar validación de token
2. Agregar `enabled: isAuthenticated`
3. Usar nuevo apiClient

---

## FASE 5: ACTUALIZAR PÁGINAS (15 minutos)

### Paso 5.1: Corregir Login

**Ubicación**: `apps/web/src/features/auth/login/page.tsx` o `apps/web/src/app/(auth)/login/page.tsx`

**Acciones**:
1. Abrir archivo
2. Reemplazar con código de SOLUCIÓN 4
3. Cambiar rutas según tu estructura

**Cambios clave**:
- ✅ Importar `authStore` y destructurar `{ setUser, setToken }`
- ✅ En respuesta de login: `setToken(response.data.access_token)`
- ✅ Guardar usuario también: `setUser(response.data.user)`
- ✅ Redirigir a `/dashboard` después

### Paso 5.2: Buscar y reemplazar todos los login antiguos
```bash
find apps/web/src -name "*login*" -type f | grep -E "\.(tsx?|jsx?)$"
```

---

## FASE 6: CREAR COMPONENTES PROTEGIDOS (10 minutos)

### Paso 6.1: Crear `ProtectedRoute.tsx`

**Ubicación**: `apps/web/src/components/ProtectedRoute.tsx`

**Crear archivo nuevo** con código de SOLUCIÓN 6

**Cambios clave**:
- ✅ Verificar `isAuthenticated && !!token`
- ✅ Si no, redirigir a `/auth/login`
- ✅ Mostrar loading mientras verifica

### Paso 6.2: Crear hook `useRequireAuth`

**Ubicación**: `apps/web/src/hooks/useRequireAuth.ts`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth.store';

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, token, router]);

  return { isAuthenticated, token };
}
```

---

## FASE 7: ACTUALIZAR LAYOUTS (10 minutos)

### Paso 7.1: Proteger layout del dashboard

**Ubicación**: `apps/web/src/app/(dashboard)/layout.tsx` o similar

**Reemplazar con**:
```typescript
'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {/* Tu contenido de layout aquí */}
      {children}
    </ProtectedRoute>
  );
}
```

### Paso 7.2: Actualizar Providers

**Ubicación**: `apps/web/src/app/providers.tsx`

Reemplazar con código de SOLUCIÓN 5

---

## FASE 8: VERIFICACIÓN (5 minutos)

### Paso 8.1: Verificar estructura
```bash
# Verificar que todos los archivos existían
ls -la apps/web/src/lib/api-client.ts
ls -la apps/web/src/stores/auth.store.ts
ls -la apps/web/src/hooks/useDashboard.ts
ls -la apps/web/src/components/ProtectedRoute.tsx
```

### Paso 8.2: Buscar errores de TypeScript
```bash
cd apps/web
npx tsc --noEmit 2>&1 | head -50
```

### Paso 8.3: Buscar errores de imports
```bash
grep -r "from '@/stores/auth.store'" apps/web/src/ | wc -l
echo "Debería haber al menos 5 imports"
```

---

## FASE 9: ACTUALIZAR .env (5 minutos)

### Paso 9.1: Verificar NEXT_PUBLIC_API_URL

**Ubicación**: `apps/web/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Si no existe, crear:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > apps/web/.env.local
```

---

## FASE 10: REINICIAR Y TESTEAR (10 minutos)

### Paso 10.1: Parar servidor (si está corriendo)
```bash
# Presionar Ctrl+C en la terminal donde corre Next.js
```

### Paso 10.2: Limpiar cache
```bash
cd apps/web
rm -rf .next
rm -rf node_modules/.cache
```

### Paso 10.3: Instalar dependencias (si es necesario)
```bash
npm install
```

### Paso 10.4: Reiniciar frontend
```bash
cd apps/web
npm run dev
```

### Paso 10.5: Verificar que inicia sin errores
```bash
# Debería ver:
# ▲ Next.js 15.0.0
# - Local: http://localhost:3000
```

---

## FASE 11: TESTS FUNCIONALES (15 minutos)

### Test 1: Login

**Pasos**:
1. Abrir http://localhost:3000/auth/login
2. Ingresar credenciales válidas:
   - Email: `admin@cermont.com`
   - Password: `password123`
3. Presionar "Iniciar Sesión"

**Verificar**:
- ✅ Redirige a `/dashboard`
- ✅ No hay errores en console
- ✅ DevTools → Application → localStorage tiene `auth-storage`

### Test 2: Token en Headers

**Pasos**:
1. En dashboard, abrir DevTools → Network
2. Actualizar página (F5)
3. Buscar petición a `/api/dashboard/metricas`

**Verificar**:
- ✅ Status 200 (no 401)
- ✅ Headers → Authorization: `Bearer eyJ...`
- ✅ En Response: datos de métricas

### Test 3: Logout

**Pasos**:
1. Hacer click en logout/perfil
2. Selectores "Cerrar Sesión"

**Verificar**:
- ✅ Limpia localStorage
- ✅ Redirige a `/auth/login`
- ✅ localStorage no tiene `auth-storage`

### Test 4: Token Expirado

**Pasos**:
1. En DevTools → Application → localStorage
2. Editar `auth-storage` y cambiar token a algo inválido
3. Actualizar página (F5)

**Verificar**:
- ✅ Intenta refrescar token
- ✅ Si refresh falla, redirige a login
- ✅ No hay errores infinitos

---

## FASE 12: BÚSQUEDA DE ERRORES COMUNES

### Error: "Cannot find module '@/lib/api-client'"
**Solución**:
```bash
# Verificar que el archivo existe
ls apps/web/src/lib/api-client.ts

# Verificar que tsconfig.json tiene alias
grep '"@' apps/web/tsconfig.json
```

### Error: "authStore.getState is not a function"
**Solución**:
```typescript
// ❌ WRONG
const token = authStore.token;

// ✅ CORRECT
const { token } = authStore.getState();
// O dentro de componente:
const { token } = useAuth();
```

### Error: "401 Unauthorized still happening"
**Verificar**:
```bash
# 1. Backend está corriendo?
curl http://localhost:3001/api/health

# 2. Token es válido?
# En DevTools console:
localStorage.getItem('auth-storage')

# 3. CORS está bien?
# Backend debe tener credentials: true en CORS
```

### Error: "Module HMR update error"
**Solución**:
```bash
# Simplemente reiniciar:
# Ctrl+C y luego npm run dev
```

---

## CHECKLIST FINAL

### Archivos modificados
- [ ] ✅ `apps/web/src/stores/auth.store.ts`
- [ ] ✅ `apps/web/src/lib/api-client.ts`
- [ ] ✅ `apps/web/src/hooks/useDashboard.ts`
- [ ] ✅ `apps/web/src/features/auth/login/page.tsx`
- [ ] ✅ `apps/web/src/app/providers.tsx`
- [ ] ✅ `apps/web/src/components/ProtectedRoute.tsx`
- [ ] ✅ `apps/web/src/app/(dashboard)/layout.tsx`

### Funcionalidad verificada
- [ ] ✅ Login funciona
- [ ] ✅ Token se guarda en localStorage
- [ ] ✅ Dashboard carga sin 401 errors
- [ ] ✅ Token en headers Authorization
- [ ] ✅ Cookies se envían (withCredentials: true)
- [ ] ✅ Peticiones a API funcionan
- [ ] ✅ Logout limpia todo
- [ ] ✅ Redireccionamientos funcionan

### Errores resueltos
- [ ] ✅ 401 Unauthorized
- [ ] ✅ 400 Bad Request en /auth/refresh
- [ ] ✅ Module HMR update error
- [ ] ✅ No hay token en peticiones

---

## 📞 PRÓXIMOS PASOS

Cuando todos los tests pasen:

1. **Testear todos los módulos**
   - Órdenes
   - Ejecución
   - Evidencias
   - Dashboard
   - Cierre administrativo

2. **Implementar el resto de features**
   - Checklists
   - Kits
   - HES
   - Mapa meteorológico

3. **Agregar tests unitarios**
   - Tests para api-client
   - Tests para auth store
   - Tests para componentes protegidos

4. **Performance**
   - React Query caching
   - Image optimization
   - Bundle size analysis

---

**Total de tiempo estimado**: 90-120 minutos  
**Dificultad**: Media  
**Impacto**: Crítico - Resuelve todos los 401 errors  

¡Éxito! 🚀
