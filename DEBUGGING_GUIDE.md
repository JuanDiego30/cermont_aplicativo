# 🐛 GUÍA COMPLETA DE DEBUGGING

## 🔴 PROBLEMA ACTUAL: Login se cierra inmediatamente

### Síntomas
- Login exitoso (200 OK en backend)
- Dashboard intenta cargar
- Página se cierra/recarga inmediatamente
- Errores 401 en API calls

### Causa Más Probable
**Error de JavaScript que rompe la aplicación después del login.**

---

## 🔍 PASO 1: CAPTURAR EL ERROR REAL

### Instrucciones:

1. **Abrir navegador en modo incógnito** (CTRL + SHIFT + N)
   - Esto elimina caché y cookies antiguas

2. **Abrir DevTools ANTES de navegar**
   - Presionar F12
   - Ir a pestaña **Console**
   - Activar "Preserve log" (checkbox arriba)

3. **Navegar a login**
   - Ir a `http://localhost:3000/signin`

4. **Hacer login**
   - Email: `admin@cermont.com`
   - Password: `admin123`

5. **INMEDIATAMENTE después de click en "Iniciar Sesión"**
   - Observar la consola
   - Buscar errores en ROJO
   - Tomar screenshot o copiar TODO el texto

### Qué buscar:

```javascript
// Errores comunes que rompen la app:

❌ TypeError: Cannot read property 'X' of undefined
❌ ReferenceError: X is not defined
❌ Uncaught Error: Hydration failed
❌ Error: Objects are not valid as a React child
❌ Maximum update depth exceeded
```

---

## 🔧 PASO 2: VERIFICAR FLUJO DE AUTENTICACIÓN

### 2.1 Verificar Token en LocalStorage

**En DevTools:**
1. F12 → Application → Local Storage → `http://localhost:3000`
2. Buscar claves:
   - `cermont_access_token`
   - `cermont_refresh_token`
   - `cermont_user_role`

**Verificar:**
- ✅ Las claves existen después del login
- ✅ Los valores NO están vacíos
- ✅ El token es un JWT válido (3 partes separadas por puntos)

### 2.2 Verificar Network Requests

**En DevTools:**
1. F12 → Network
2. Activar "Preserve log"
3. Hacer login

**Secuencia esperada:**
```
1. POST /api/auth/login         → 200 OK
2. GET /api/notifications       → 200 OK (debe tener token en header)
3. GET /api/dashboard/metrics   → 200 OK (debe tener token en header)
```

**Si ves 401:**
- Click en la request que falló
- Ir a pestaña "Headers"
- Verificar si tiene `Authorization: Bearer [token]`

### 2.3 Verificar Headers de Autenticación

**Para cada request 401:**

1. **Request Headers** (lo que envía el frontend):
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   ✅ Debe existir este header
   ❌ Si NO existe → Problema en `apiClient.ts`

2. **Response Headers** (lo que responde el backend):
   ```
   HTTP/1.1 401 Unauthorized
   ```
   
   Ver el body de la respuesta para el mensaje de error

---

## 📝 PASO 3: LOGS DEL BACKEND

### Qué buscar en los logs:

```bash
# Login exitoso:
✅ POST /api/auth/login HTTP/1.1" 200
✅ Refresh token generated

# Error de autenticación:
❌ warn: Authentication failed
❌ error: Error handler caught exception
```

### Si ves "Authentication failed":

**Posibles causas:**
1. Token no se está enviando en el header
2. Token es inválido o expiró
3. Middleware de autenticación tiene un bug

---

## 🔍 PASO 4: DEBUGGING ESPECÍFICO

### A. Si el error es "Cannot read property..."

**Ejemplo:**
```
TypeError: Cannot read property 'user' of undefined
```

**Causa:** Componente intenta acceder a datos antes de que estén disponibles.

**Solución:**
```typescript
// ❌ ANTES
const userName = response.user.name;

// ✅ DESPUÉS
const userName = response?.user?.name || 'Guest';
```

### B. Si el error es "Hydration failed"

**Causa:** Diferencia entre HTML del servidor y cliente.

**Solución:**
1. Verificar que no uses `localStorage` durante el render inicial
2. Usar `useEffect` para operaciones del lado cliente
3. Agregar `'use client'` al inicio de componentes que usen hooks

### C. Si el error es "Objects are not valid as a React child"

**Causa:** Intentando renderizar un objeto directamente.

**Ejemplo problemático:**
```typescript
// ❌ MAL
<div>{user}</div>

// ✅ BIEN
<div>{user?.name}</div>
```

### D. Si hay "Maximum update depth exceeded"

**Causa:** Loop infinito de re-renders.

**Solución:**
```typescript
// ❌ MAL - causa loop infinito
useEffect(() => {
  setCount(count + 1); // Re-render en cada render
});

// ✅ BIEN - solo ejecuta cuando cambia count
useEffect(() => {
  // ...
}, [count]);
```

---

## 🛠️ PASO 5: CORRECCIONES COMUNES

### Archivo 1: `frontend/src/core/api/client.ts`

**Verificar que el interceptor agrega el token:**

```typescript
// Debe existir algo como esto:
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Archivo 2: `frontend/src/features/auth/utils/session.ts`

**Verificar funciones:**

```typescript
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cermont_access_token');
}

export function setSession(data: SessionData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cermont_access_token', data.accessToken);
  localStorage.setItem('cermont_refresh_token', data.refreshToken);
  localStorage.setItem('cermont_user_role', data.userRole);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cermont_access_token');
  localStorage.removeItem('cermont_refresh_token');
  localStorage.removeItem('cermont_user_role');
}
```

### Archivo 3: `frontend/src/features/dashboard/hooks/useDashboard.ts`

**Verificar que solo hace fetch cuando está autenticado:**

```typescript
export function useDashboard() {
  const { isAuthenticated, isInitialized } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getMetrics(),
    enabled: isAuthenticated && isInitialized, // 👉 IMPORTANTE
    retry: 1,
  });
}
```

---

## 🧠 PASO 6: DEBUGGING AVANZADO

### Agregar console.logs estratégicos

**En `AuthContext.tsx`:**

```typescript
const login = useCallback(async ({ email, password }) => {
  console.log('🔑 Login iniciado');
  
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    console.log('✅ Login response:', response);
    
    const { accessToken, refreshToken, user } = response;
    console.log('🔐 Token recibido:', accessToken?.substring(0, 20) + '...');
    
    setSession({ accessToken, refreshToken, userRole: user.role });
    console.log('💾 Session guardada');
    
    setUser(user);
    setIsAuthenticated(true);
    console.log('✅ Estado actualizado');
    
    console.log('🛤️ Navegando a dashboard...');
    router.replace('/dashboard');
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}, [router]);
```

### Verificar orden de ejecución

**Secuencia esperada en consola:**
```
🔑 Login iniciado
✅ Login response: { accessToken: '...', user: {...} }
🔐 Token recibido: eyJhbGciOiJIUzI1NiIs...
💾 Session guardada
✅ Estado actualizado
🛤️ Navegando a dashboard...
```

**Si falta alguno:** Indica dónde está el problema.

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Frontend:
- [ ] No hay errores en consola (rojo)
- [ ] Token se guarda en localStorage
- [ ] Token se envía en headers de API calls
- [ ] `isAuthenticated` se vuelve `true` después del login
- [ ] Navigation a `/dashboard` funciona
- [ ] Dashboard NO hace API calls antes de estar autenticado

### Backend:
- [ ] Login retorna 200 OK
- [ ] Token generado es válido
- [ ] Middleware de autenticación valida correctamente
- [ ] Endpoints protegidos retornan 200 (no 401)
- [ ] No hay errores en logs del servidor

### Network:
- [ ] POST /api/auth/login → 200
- [ ] GET /api/notifications → 200 (con Authorization header)
- [ ] GET /api/dashboard/metrics → 200 (con Authorization header)
- [ ] No hay requests sin Authorization header a endpoints protegidos

---

## 🎯 SOLUCIÓN RÁPIDA

Si después de todo esto el problema persiste:

### Opción 1: Reset completo

```bash
# 1. Detener servidores
CTRL + C (en ambas terminales)

# 2. Limpiar cachés
cd frontend
rm -rf .next node_modules/.cache
cd ../backend
rm -rf dist

# 3. Reinstalar dependencias
cd ..
pnpm install

# 4. Limpiar navegador
# CTRL + SHIFT + DELETE → Clear all

# 5. Reiniciar
pnpm run dev
```

### Opción 2: Probar en navegador diferente

- Si funciona en Chrome pero no en Edge: problema de caché
- Si no funciona en ninguno: problema de código

### Opción 3: Verificar versiones

```bash
node --version  # Debe ser 18+
npm --version
pnpm --version
```

---

## 📧 INFORMACIÓN PARA COMPARTIR

Si necesitas ayuda, comparte:

1. **Screenshot de Console (F12 → Console)**
   - Con "Preserve log" activado
   - Después de intentar login

2. **Screenshot de Network (F12 → Network)**
   - Mostrando la secuencia de requests
   - Con detalles del request 401 (si hay)

3. **Logs del backend**
   - Desde el inicio del login hasta el error

4. **Contenido de localStorage**
   - F12 → Application → Local Storage

5. **Versión de Node.js**
   ```bash
   node --version
   ```

---

**Última actualización:** 30 de Noviembre de 2025 - 16:35 COT
