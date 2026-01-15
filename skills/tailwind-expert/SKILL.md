---
name: tailwind-expert
description: Experto en Tailwind CSS para aplicaciones Angular y React. Usar para estilización, componentes UI, responsive design, dark mode y configuración avanzada.
triggers:
  - Tailwind
  - CSS
  - styling
  - responsive
  - dark mode
  - utility-first
  - design system
  - UI components
role: specialist
scope: styling
output-format: code
---

# Tailwind CSS Expert

Especialista en estilización con Tailwind CSS para aplicaciones modernas.

## Rol

Diseñador/desarrollador frontend con 6+ años de experiencia en CSS y sistemas de diseño. Experto en Tailwind CSS, responsive design, accesibilidad y optimización.

## Cuándo Usar Este Skill

- Configurar Tailwind en proyectos
- Crear componentes UI estilizados
- Implementar responsive design
- Configurar dark mode
- Crear design systems
- Optimizar bundle size
- Animaciones y transiciones
- Formularios y layouts

## Configuración (Tailwind v4)

```javascript
// tailwind.config.js (v4 compatible)
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,tsx,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          // Custom secondary palette
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07)',
        'hard': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

## Componentes Base

### Botones

```html
<!-- Primary Button -->
<button class="
  inline-flex items-center justify-center
  px-4 py-2
  text-sm font-medium
  text-white bg-primary-600
  border border-transparent rounded-lg
  shadow-sm
  hover:bg-primary-700
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-200
">
  <span>Primary Button</span>
</button>

<!-- Secondary Button -->
<button class="
  inline-flex items-center justify-center
  px-4 py-2
  text-sm font-medium
  text-gray-700 bg-white
  border border-gray-300 rounded-lg
  shadow-sm
  hover:bg-gray-50
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700
  transition-colors duration-200
">
  Secondary
</button>

<!-- Icon Button -->
<button class="
  p-2 rounded-full
  text-gray-500 hover:text-gray-700
  hover:bg-gray-100
  focus:outline-none focus:ring-2 focus:ring-primary-500
  dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700
  transition-colors duration-200
">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- icon path -->
  </svg>
</button>

<!-- Button Group -->
<div class="inline-flex rounded-lg shadow-sm">
  <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50">
    Left
  </button>
  <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300 hover:bg-gray-50">
    Middle
  </button>
  <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50">
    Right
  </button>
</div>
```

### Cards

```html
<!-- Basic Card -->
<div class="
  bg-white rounded-xl shadow-soft
  overflow-hidden
  dark:bg-gray-800
">
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      Card Title
    </h3>
    <p class="mt-2 text-gray-600 dark:text-gray-300">
      Card description goes here.
    </p>
  </div>
</div>

<!-- Card with Image -->
<div class="bg-white rounded-xl shadow-soft overflow-hidden dark:bg-gray-800">
  <img 
    class="w-full h-48 object-cover" 
    src="image.jpg" 
    alt="Card image"
  >
  <div class="p-6">
    <span class="text-xs font-semibold text-primary-600 uppercase tracking-wide">
      Category
    </span>
    <h3 class="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
      Card Title
    </h3>
    <p class="mt-3 text-gray-600 dark:text-gray-300">
      Description text here.
    </p>
    <div class="mt-4 flex items-center gap-4">
      <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">
        Learn more →
      </a>
    </div>
  </div>
</div>

<!-- Interactive Card -->
<div class="
  group
  bg-white rounded-xl shadow-soft
  overflow-hidden
  cursor-pointer
  transition-all duration-300
  hover:shadow-lg hover:-translate-y-1
  dark:bg-gray-800
">
  <div class="p-6">
    <div class="
      w-12 h-12 rounded-lg
      bg-primary-100 dark:bg-primary-900
      flex items-center justify-center
      group-hover:bg-primary-200 dark:group-hover:bg-primary-800
      transition-colors duration-300
    ">
      <svg class="w-6 h-6 text-primary-600 dark:text-primary-400">
        <!-- icon -->
      </svg>
    </div>
    <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
      Feature Title
    </h3>
    <p class="mt-2 text-gray-600 dark:text-gray-300">
      Feature description.
    </p>
  </div>
</div>
```

### Formularios

```html
<!-- Text Input -->
<div>
  <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Email
  </label>
  <div class="mt-1 relative">
    <input
      type="email"
      id="email"
      class="
        block w-full
        px-4 py-2
        text-gray-900 placeholder-gray-400
        bg-white dark:bg-gray-800
        border border-gray-300 dark:border-gray-600
        rounded-lg
        shadow-sm
        focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        dark:text-white dark:placeholder-gray-500
        transition-colors duration-200
      "
      placeholder="you@example.com"
    >
  </div>
</div>

<!-- Input with Error -->
<div>
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Password
  </label>
  <input
    type="password"
    class="
      mt-1 block w-full
      px-4 py-2
      border-2 border-red-300
      rounded-lg
      focus:ring-red-500 focus:border-red-500
      dark:bg-gray-800 dark:border-red-500
    "
  >
  <p class="mt-1 text-sm text-red-600 dark:text-red-400">
    Password must be at least 8 characters.
  </p>
</div>

<!-- Select -->
<div>
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Country
  </label>
  <select class="
    mt-1 block w-full
    px-4 py-2
    bg-white dark:bg-gray-800
    border border-gray-300 dark:border-gray-600
    rounded-lg
    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    dark:text-white
  ">
    <option>Select a country</option>
    <option>Colombia</option>
    <option>Mexico</option>
  </select>
</div>

<!-- Checkbox -->
<div class="flex items-center">
  <input
    type="checkbox"
    id="remember"
    class="
      h-4 w-4
      text-primary-600
      border-gray-300 dark:border-gray-600
      rounded
      focus:ring-primary-500
      dark:bg-gray-800
    "
  >
  <label for="remember" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
    Remember me
  </label>
</div>

<!-- Toggle Switch -->
<button
  type="button"
  class="
    relative inline-flex h-6 w-11
    flex-shrink-0 cursor-pointer
    rounded-full border-2 border-transparent
    bg-gray-200 dark:bg-gray-700
    transition-colors duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    aria-checked:bg-primary-600
  "
  role="switch"
  aria-checked="false"
>
  <span class="
    pointer-events-none inline-block h-5 w-5
    transform rounded-full
    bg-white shadow ring-0
    transition duration-200 ease-in-out
    translate-x-0 aria-checked:translate-x-5
  "></span>
</button>
```

### Layout Grid

```html
<!-- Responsive Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div class="bg-white p-4 rounded-lg shadow">Item 1</div>
  <div class="bg-white p-4 rounded-lg shadow">Item 2</div>
  <div class="bg-white p-4 rounded-lg shadow">Item 3</div>
  <div class="bg-white p-4 rounded-lg shadow">Item 4</div>
</div>

<!-- Auto-fit Grid -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
  <!-- Cards auto-adjust -->
</div>

<!-- Sidebar Layout -->
<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="
    w-64 flex-shrink-0
    bg-gray-900 text-white
    hidden lg:block
  ">
    <!-- Sidebar content -->
  </aside>
  
  <!-- Main content -->
  <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Content -->
    </div>
  </main>
</div>
```

## Dark Mode

```html
<!-- Container with dark mode -->
<div class="bg-white dark:bg-gray-900 min-h-screen">
  <header class="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <h1 class="text-gray-900 dark:text-white">Title</h1>
  </header>
  
  <main class="p-6">
    <p class="text-gray-600 dark:text-gray-300">Content</p>
    <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">
      Link
    </a>
  </main>
</div>
```

```typescript
// Angular: Toggle dark mode
@Component({
  selector: 'app-dark-mode-toggle',
  template: `
    <button (click)="toggleDarkMode()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
      <svg *ngIf="isDark()" class="w-5 h-5 text-yellow-400"><!-- sun --></svg>
      <svg *ngIf="!isDark()" class="w-5 h-5 text-gray-600"><!-- moon --></svg>
    </button>
  `,
})
export class DarkModeToggleComponent {
  isDark = signal(false);

  constructor() {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme');
    this.isDark.set(stored === 'dark' || (!stored && prefersDark));
    this.applyTheme();
  }

  toggleDarkMode(): void {
    this.isDark.update(v => !v);
    this.applyTheme();
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }

  private applyTheme(): void {
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
```

## Responsive Utilities

```html
<!-- Hide/Show by breakpoint -->
<div class="hidden sm:block">Visible on sm+</div>
<div class="block sm:hidden">Visible on mobile only</div>

<!-- Responsive padding -->
<div class="p-4 sm:p-6 lg:p-8 xl:p-12">
  <!-- Increases padding on larger screens -->
</div>

<!-- Responsive text -->
<h1 class="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">
  Responsive Heading
</h1>

<!-- Responsive flex direction -->
<div class="flex flex-col sm:flex-row gap-4">
  <div class="flex-1">Column on mobile, row on sm+</div>
  <div class="flex-1">Second item</div>
</div>
```

## Animaciones

```html
<!-- Fade in on load -->
<div class="animate-fade-in">
  Content fades in
</div>

<!-- Hover animations -->
<button class="
  transform transition-all duration-300
  hover:scale-105 hover:shadow-lg
  active:scale-95
">
  Animated Button
</button>

<!-- Skeleton loading -->
<div class="animate-pulse">
  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
</div>

<!-- Spin loader -->
<svg class="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
</svg>
```

## Restricciones

### DEBE HACER
- Usar clases utilitarias de Tailwind
- Extraer componentes repetidos a clases @apply
- Configurar purge/content para producción
- Mantener consistencia en spacing
- Usar design tokens del tema

### NO DEBE HACER
- Escribir CSS custom innecesario
- Usar !important
- Mezclar Tailwind con CSS modules sin razón
- Ignorar accesibilidad (focus states)
- Hardcodear colores fuera del tema

## Skills Relacionados

- **angular-architect** - Componentes Angular
- **frontend-ui-integration** - Integración UI
- **clean-architecture** - Componentes reutilizables
