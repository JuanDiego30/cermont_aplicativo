# 🔧 CORRECCIONES FRONTEND - CERMONT

## 🎯 PROBLEMAS IDENTIFICADOS

### 1. ❌ 401 Unauthorized - No hay token en peticiones

```
GET http://localhost:3001/api/dashboard/metricas 401 (Unauthorized)
POST http://localhost:3001/api/auth/refresh 400 (Bad Request)
```

**CAUSA**: El cliente HTTP no está enviando tokens de autenticación en las peticiones.

---

## 📋 SOLUCIONES

### SOLUCIÓN 1: Corregir API Client para incluir tokens

**Archivo**: `apps/web/src/lib/api-client.ts`

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { authStore } from '@/stores/auth.store';

// Crear instancia de Axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ CRÍTICO: Incluir cookies en todas las peticiones
  withCredentials: true,
});

// Interceptor para agregar token en headers
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ Obtener token del store
    const { token } = authStore.getState();
    
    if (token) {
      // ✅ Agregar Bearer token al header
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si es 401 y no es el endpoint de refresh
    if (error.response?.status === 401 && !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/refresh')) {
      
      originalRequest._retry = true;

      try {
        // ✅ Intentar refrescar el token
        const response = await axiosInstance.post('/auth/refresh', {});
        
        if (response.data?.access_token) {
          // ✅ Actualizar token en store
          authStore.setState({ token: response.data.access_token });
          
          // ✅ Reintentar petición original con nuevo token
          originalRequest.headers.Authorization = \`Bearer \${response.data.access_token}\`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // ✅ Si falla refresh, limpiar y redirigir a login
        authStore.clearAuth();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Cliente unificado
export const apiClient = {
  get: <T = any>(url: string, config?: any) => axiosInstance.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => axiosInstance.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => axiosInstance.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => axiosInstance.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => axiosInstance.delete<T>(url, config),
  upload: async <T = any>(url: string, file: File, fieldName = 'file') => {
    const formData = new FormData();
    formData.append(fieldName, file);
    return axiosInstance.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export class ApiException extends Error {
  constructor(public code: string, public status: number, message: string) {
    super(message);
  }
}

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};
```

---

### SOLUCIÓN 2: Corregir Auth Store para manejar tokens

**Archivo**: `apps/web/src/stores/auth.store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'supervisor' | 'tecnico' | 'administrativo';
  estado: 'activo' | 'inactivo';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  logout: () => void;
}

// ✅ Crear store con persistencia
export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },

      setIsLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      logout: async () => {
        try {
          // Opcional: Llamar al backend para logout
          // await apiClient.post('/auth/logout');
        } catch (error) {
          console.error('Error en logout:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage', // Nombre del localStorage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook personalizado para usar auth
export const useAuth = () => authStore((state) => state);
```

---

### SOLUCIÓN 3: Corregir Hook useDashboard

**Archivo**: `apps/web/src/hooks/useDashboard.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiException } from '@/lib/api-client';
import { useAuth } from '@/stores/auth.store';

export interface DashboardMetrics {
  totalOrdenes: number;
  ordenesCompletas: number;
  ordenesPendientes: number;
  ordenesEnEjecucion: number;
  eficiencia: number;
  tasa_cumplimiento: number;
}

export const useDashboardMetrics = () => {
  // ✅ Verificar que el usuario esté autenticado
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      try {
        // ✅ Validar que hay token antes de hacer la petición
        if (!token) {
          throw new ApiException('NO_TOKEN', 401, 'No autorizado');
        }

        const response = await apiClient.get<DashboardMetrics>('/dashboard/metricas');
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          throw new ApiException('UNAUTHORIZED', 401, 'Token expirado o inválido');
        }
        throw error;
      }
    },
    // ✅ No hacer query si no está autenticado
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 30 * 1000, // Refrescar cada 30 segundos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useKpiData = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'kpi'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/kpi');
      return response.data;
    },
    enabled: isAuthenticated,
  });
};
```

---

### SOLUCIÓN 4: Corregir Login para guardar token

**Archivo**: `apps/web/src/features/auth/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { authStore } from '@/stores/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = authStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Hacer petición de login
      const response = await apiClient.post('/auth/login', { email, password });

      // ✅ Guardar token en store
      if (response.data.access_token) {
        setToken(response.data.access_token);
      }

      // ✅ Guardar usuario en store
      if (response.data.user) {
        setUser(response.data.user);
      }

      // ✅ Redirigir al dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Iniciar Sesión</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
```

---

### SOLUCIÓN 5: Corregir Provider para inicializar auth

**Archivo**: `apps/web/src/app/providers.tsx`

```typescript
'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (cache time)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // ✅ Inicializar auth al cargar la app
    const initAuth = async () => {
      const { token } = authStore.getState();
      
      if (token) {
        try {
          // Verificar que el token es válido haciendo una petición
          await apiClient.get('/auth/me');
        } catch (error) {
          // Si falla, limpiar auth
          authStore.getState().clearAuth();
        }
      }
    };

    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

### SOLUCIÓN 6: Corregir Protected Route

**Archivo**: `apps/web/src/components/ProtectedRoute.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth.store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    // ✅ Si no está autenticado, redirigir a login
    if (!isAuthenticated || !token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, token, router]);

  // ✅ Si no está autenticado, no renderizar
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

### SOLUCIÓN 7: Usar ProtectedRoute en layouts

**Archivo**: `apps/web/src/app/(dashboard)/layout.tsx`

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
      {/* Tu layout aquí */}
      {children}
    </ProtectedRoute>
  );
}
```

---

## 🔄 ARCHIVOS A ACTUALIZAR - ORDEN DE PRIORIDAD

### PASO 1: Corregir Store (Crítico)
```
1. ✅ apps/web/src/stores/auth.store.ts
```

### PASO 2: Corregir API Client (Crítico)
```
2. ✅ apps/web/src/lib/api-client.ts
```

### PASO 3: Corregir Hooks
```
3. ✅ apps/web/src/hooks/useDashboard.ts
```

### PASO 4: Corregir Login
```
4. ✅ apps/web/src/features/auth/login/page.tsx
```

### PASO 5: Corregir Providers
```
5. ✅ apps/web/src/app/providers.tsx
```

### PASO 6: Proteger Rutas
```
6. ✅ apps/web/src/components/ProtectedRoute.tsx
7. ✅ apps/web/src/app/(dashboard)/layout.tsx
```

---

## ⚡ COMANDOS PARA APLICAR CAMBIOS

```bash
# 1. Backup de archivos actuales
cp -r apps/web/src apps/web/src.backup

# 2. Aplicar correcciones
# Copiar y pegar cada solución en su archivo correspondiente

# 3. Reinstalar dependencias (si es necesario)
cd apps/web
npm install

# 4. Limpiar cache Next.js
rm -rf .next

# 5. Reiniciar servidor
cd apps/web
npm run dev
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] ✅ `auth.store.ts` corregido con persistencia
- [ ] ✅ `api-client.ts` con interceptores y token
- [ ] ✅ `useDashboard.ts` con verificación de token
- [ ] ✅ `login/page.tsx` guardando token
- [ ] ✅ `providers.tsx` inicializando auth
- [ ] ✅ `ProtectedRoute.tsx` protegiendo rutas
- [ ] ✅ `(dashboard)/layout.tsx` usando ProtectedRoute
- [ ] ✅ npm run dev ejecutándose sin errores
- [ ] ✅ Login funciona y guarda token
- [ ] ✅ Dashboard carga sin 401 errors
- [ ] ✅ Token se envía en headers Authorization
- [ ] ✅ Cookies se envían en peticiones (withCredentials: true)

---

## 🧪 TEST DE FUNCIONAMIENTO

### Test 1: Login
```
1. Ir a http://localhost:3000/auth/login
2. Ingresar credenciales válidas
3. Verificar que redirige a /dashboard
4. Verificar que el token se guarda en localStorage
```

### Test 2: API Peticiones
```
1. Abrir DevTools → Network
2. Ir a /dashboard
3. Verificar peticiones a /api/dashboard/metricas
4. Verificar header: Authorization: Bearer <token>
5. Verificar status 200 (no 401)
```

### Test 3: Token Refresh
```
1. Esperar a que token expire (15 min)
2. Hacer una petición
3. Verificar que intenta refrescar token
4. Verificar que reintentos funcionan
```

---

## 🆘 TROUBLESHOOTING

### Error: "Module HMR update error"
**Solución**: Reiniciar servidor
```bash
# En terminal, Ctrl+C y luego:
npm run dev
```

### Error: "401 Unauthorized después de correcciones"
**Verificar**:
1. ¿El token se guardó en localStorage?
2. ¿El backend está devolviendo `access_token`?
3. ¿CORS está bien configurado?

### Error: "Cannot read property 'token' of undefined"
**Solución**: Usar `authStore.getState()` en lugar de `authStore`

---

**Versión**: 1.0  
**Estado**: Listo para implementar  
**Impacto**: Resuelve 401 errors y falta de autenticación
