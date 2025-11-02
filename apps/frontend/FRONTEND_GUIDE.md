# Frontend - Cermont Aplicativo

## 📁 Estructura del Proyecto

```
src/
├── app/                      # App Router de Next.js
│   ├── (auth)/              # Grupo de rutas de autenticación
│   ├── (dashboard)/         # Grupo de rutas del dashboard
│   ├── layout.tsx           # Layout raíz
│   └── page.tsx             # Página principal
├── components/              # Componentes React
│   ├── dashboard/          # Componentes específicos del dashboard
│   ├── layout/             # Componentes de layout (Header, Sidebar)
│   ├── shared/             # Componentes compartidos
│   └── ui/                 # Componentes UI base (shadcn/ui)
├── hooks/                  # Hooks personalizados
│   ├── useAsync.ts         # Hook para operaciones asíncronas
│   ├── useDebounce.ts      # Hook de debounce
│   ├── useLocalStorage.ts  # Hook para localStorage
│   └── useMediaQuery.ts    # Hook para media queries
├── lib/                    # Utilidades y configuraciones
│   ├── api/               # Cliente API y configuración
│   ├── auth/              # Contexto de autenticación
│   ├── query/             # Configuración de React Query
│   ├── utils/             # Funciones utilitarias
│   └── constants.ts       # Constantes globales
├── services/              # Servicios de API
│   ├── auth.service.ts    # Servicio de autenticación
│   └── dashboard.service.ts # Servicio del dashboard
└── types/                 # Tipos TypeScript
    ├── common.types.ts    # Tipos comunes
    ├── dashboard.types.ts # Tipos del dashboard
    └── user.types.ts      # Tipos de usuario
```

## 🚀 Mejoras Implementadas

### 1. **Estructura Optimizada**
- ✅ Organización clara por funcionalidad
- ✅ Barrel exports para importaciones limpias
- ✅ Separación de concerns (UI, lógica, tipos)

### 2. **TypeScript Mejorado**
- ✅ Tipos específicos y bien definidos
- ✅ Interfaces claras y reutilizables
- ✅ Eliminación de `any` y tipos imprecisos

### 3. **Rendimiento**
- ✅ Memoización con `React.memo`, `useMemo`, `useCallback`
- ✅ Code splitting por rutas
- ✅ Lazy loading de componentes
- ✅ Optimización de React Query con cache

### 4. **Hooks Personalizados**
- ✅ `useAsync`: Manejo de estados asíncronos
- ✅ `useLocalStorage`: Sincronización con localStorage
- ✅ `useDebounce`: Optimización de inputs
- ✅ `useMediaQuery`: Responsive design

### 5. **Best Practices**
- ✅ Loading y error boundaries en rutas
- ✅ Constantes centralizadas
- ✅ Utilidades reutilizables
- ✅ Componentes modulares y testeables

## 📝 Convenciones de Código

### Imports
```typescript
// 1. Dependencias de React
import { useState, useEffect } from 'react';

// 2. Dependencias de Next.js
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 3. Dependencias externas
import { useQuery } from '@tanstack/react-query';

// 4. Imports internos (paths absolutos con @/)
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import type { User } from '@/types';
```

### Nomenclatura
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Servicios**: camelCase con sufijo `.service` (`auth.service.ts`)
- **Tipos**: PascalCase con sufijo `Type` o interfaz (`UserType`, `interface User`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Estructura de Componentes
```typescript
'use client'; // Solo si es necesario

import { memo, useMemo } from 'react';
import type { ComponentProps } from './types';

// 1. Tipos e interfaces
interface Props {
  title: string;
  onClick: () => void;
}

// 2. Constantes del componente
const DEFAULT_VALUE = 'default';

// 3. Componente con memo si es necesario
const Component = memo(function Component({ title, onClick }: Props) {
  // 4. Hooks
  const value = useMemo(() => computeValue(), []);

  // 5. Handlers
  const handleClick = () => {
    onClick();
  };

  // 6. Render
  return <div onClick={handleClick}>{title}</div>;
});

export default Component;
```

## 🔧 Utilidades Disponibles

### Formateo
- `formatNumber(value)`: Formatea números con separadores
- `formatDate(date, options)`: Formatea fechas
- `formatRelativeTime(date)`: Tiempo relativo ("hace 2 horas")
- `truncate(str, length)`: Trunca strings

### Validación
- `isValidEmail(email)`: Valida emails
- `cn(...classes)`: Combina clases de Tailwind

### Helpers
- `copyToClipboard(text)`: Copia al portapapeles
- `downloadBlob(blob, filename)`: Descarga archivos
- `generateId()`: Genera IDs únicos
- `debounce(fn, wait)`: Debounce de funciones
- `throttle(fn, limit)`: Throttle de funciones

## 🎯 Próximos Pasos

1. **Testing**
   - Configurar Jest y React Testing Library
   - Agregar tests unitarios para componentes
   - Tests de integración para flujos críticos

2. **Accesibilidad**
   - Auditoría de accesibilidad con Lighthouse
   - Implementar navegación por teclado
   - Agregar atributos ARIA

3. **Documentación**
   - Storybook para componentes UI
   - Documentación de APIs con JSDoc
   - Guías de uso para desarrolladores

4. **Optimización Adicional**
   - Implementar Service Workers
   - Optimización de imágenes con Next/Image
   - Análisis de bundle size

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
