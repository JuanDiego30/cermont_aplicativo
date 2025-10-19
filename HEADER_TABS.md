# Header Tabs Component

Componente de navegación profesional inspirado en Mantine UI, adaptado a Next.js + Tailwind CSS + anime.js.

## 🎨 Características

### Diseño
- **Responsive**: Navegación completa en desktop, menú hamburguesa en mobile
- **Dark Mode Ready**: Soporte completo para tema oscuro
- **Animaciones**: Transiciones suaves con anime.js
- **Profesional**: Diseño clean y moderno

### Funcionalidades

#### 1. Navegación Principal
- Tabs con estado activo
- Animación staggered al cargar
- Efecto de clic con escala
- Enrutamiento con Next.js

#### 2. Menú de Usuario
- Avatar circular con border
- Dropdown animado
- Secciones organizadas:
  - Favoritos (Liked, Saved, Comments)
  - Settings (Account, Change, Logout)
  - Danger Zone (Pause, Delete)

#### 3. Mobile Menu
- Burger menu animado
- Slide down transition
- Touch-friendly targets

### Animaciones Implementadas

```typescript
// 1. Tabs entrance (stagger)
animate(tabElements, {
  opacity: [0, 1],
  translateY: [-10, 0],
  delay: (el, i) => i * 50,
  duration: 400,
  easing: 'easeOutQuad',
});

// 2. User button (elastic)
animate(userButton, {
  opacity: [0, 1],
  scale: [0.8, 1],
  duration: 500,
  easing: 'easeOutElastic(1, .6)',
});

// 3. Tab click feedback
animate(clickedTab, {
  scale: [1, 0.95, 1],
  duration: 300,
  easing: 'easeInOutQuad',
});
```

### CSS Animations

```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🚀 Uso

```tsx
import { HeaderTabs } from '@/components/HeaderTabs';

export default function Page() {
  return (
    <div>
      <HeaderTabs />
      {/* Tu contenido */}
    </div>
  );
}
```

## 📋 Personalización

### Modificar Tabs

```typescript
const tabs = [
  { label: 'Inicio', value: '/inicio' },
  { label: 'Órdenes', value: '/ordenes' },
  // Agrega más...
];
```

### Cambiar Colores

El componente usa los colores de Tailwind:
- Activo: `bg-blue-50 text-blue-600`
- Hover: `hover:bg-gray-100`
- Dark: `dark:bg-gray-900`

### User Data

```typescript
const user = {
  name: 'Tu Nombre',
  email: 'tu@email.com',
  image: '/avatar.jpg',
};
```

## 🎯 Iconos

Usa `lucide-react` para todos los iconos:
- ✅ Tree-shakeable
- ✅ Consistente
- ✅ Ligero (~1KB por icono)

## 🔥 Performance

- **Lazy loading**: anime.js se carga dinámicamente
- **GPU acceleration**: Animaciones optimizadas
- **No layout shift**: Dimensiones fijas
- **Fast refresh**: Compatible con HMR

## 🌐 Rutas Integradas

El header está integrado con:
- `/inicio` - Página principal
- `/ordenes` - Gestión de órdenes
- `/usuarios` - Administración
- `/reportes` - Analytics
- `/logo-demo` - Demostración de animaciones
- `/support` - Soporte
- `/account` - Configuración

## 📱 Breakpoints

- **Desktop**: `md:` (≥768px) - Navegación completa
- **Mobile**: `<768px` - Menú hamburguesa

## 🎨 Colores CERMONT

- Azul: `#1976D2`
- Verde: `#4CAF50`
- Rojo: `#FF6B6B` (accents)

---

**Creado con**: Next.js 15 + Tailwind 4 + anime.js 4 + lucide-react
