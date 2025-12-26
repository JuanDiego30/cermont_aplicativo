# PALETA DE COLORES PROFESIONAL Y COMPONENTES CERMONT

## 🎨 IDENTIDAD VISUAL CERMONT

### Fundamento del Diseño

La paleta se basa en:
- **Sector Petrolero:** Confiabilidad y profesionalismo (Teal/Azul-Verde)
- **Tecnología Moderna:** Innovación y eficiencia (Naranja para acciones)
- **Accesibilidad:** WCAG AA compliant (contraste suficiente)

---

## 🌈 PALETA DE COLORES DEFINITIVA

### PRIMARIO - Teal Profesional

```
Teal 50:   #f0fdfa - Fondos ligeros
Teal 100:  #d1faf6 - Hover ligero
Teal 200:  #a3f4ed - Bordes claros
Teal 300:  #69eae1 - Elementos secundarios
Teal 400:  #2dd4cf - Elementos activos
Teal 500:  #14b8a6 - ⭐ COLOR PRINCIPAL
Teal 600:  #0d9488 - Hover estados
Teal 700:  #0f766e - Estados activos
Teal 800:  #155e59 - Textos oscuros
Teal 900:  #134e4a - Fondos muy oscuros
```

**Uso:**
- Botones primarios
- Links y acciones
- Headers
- Barras de progreso
- Estados activos

### SECUNDARIO - Slate Gris

```
Slate 50:   #f8fafc - Fondos muy claros
Slate 100:  #f1f5f9 - Fondos alternos
Slate 200:  #e2e8f0 - Bordes ligeros
Slate 300:  #cbd5e1 - Bordes estándar
Slate 400:  #94a3b8 - Texto secundario
Slate 500:  #64748b - Texto terciario
Slate 600:  #475569 - Texto principal
Slate 700:  #334155 - Textos oscuros
Slate 800:  #1e293b - Backgrounds oscuros
Slate 900:  #0f172a - Backgrounds muy oscuros
```

**Uso:**
- Texto base
- Bordes
- Backgrounds
- Elementos neutrales

### ACENTUADA - Naranja Cálido

```
Orange 50:   #fff7ed - Fondos claros
Orange 100:  #ffedd5 - Hover ligero
Orange 200:  #fed7aa - Elemento secundario
Orange 300:  #fdba74 - Elemento medio
Orange 400:  #fb923c - Elemento activo
Orange 500:  #f97316 - ⭐ COLOR ACENTUADO
Orange 600:  #ea580c - Hover/Peligro
Orange 700:  #c2410c - Estados críticos
Orange 800:  #92400e - Textos oscuros
Orange 900:  #78350f - Backgrounds oscuros
```

**Uso:**
- Botones de acción/primarios alternos
- Llamadas a la acción
- Avisos importantes
- Elementos que requieren atención

### ESTADOS

```
✅ SUCCESS (Verde)
  Green 50:   #f0fdf4
  Green 500:  #22c55e
  Green 600:  #16a34a
  Green 700:  #15803d

⚠️ WARNING (Amarillo)
  Amber 50:   #fffbeb
  Amber 500:  #eab308
  Amber 600:  #ca8a04
  Amber 700:  #a16207

❌ DANGER (Rojo)
  Red 50:     #fef2f2
  Red 500:    #ef4444
  Red 600:    #dc2626
  Red 700:    #b91c1c

ℹ️ INFO (Azul)
  Blue 50:    #f0f9ff
  Blue 500:   #3b82f6
  Blue 600:   #2563eb
  Blue 700:   #1d4ed8
```

---

## 💻 EJEMPLOS DE COMPONENTES

### 1. BOTONES ESTÁNDAR

```html
<!-- Botón Primario -->
<button class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
  Crear Orden
</button>

<!-- Botón Secundario -->
<button class="border-2 border-primary-500 text-primary-500 hover:bg-primary-50 px-6 py-2 rounded-lg font-semibold transition-colors">
  Cancelar
</button>

<!-- Botón Peligro -->
<button class="bg-danger-500 hover:bg-danger-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
  Eliminar
</button>

<!-- Botón Deshabilitado -->
<button class="bg-gray-300 text-gray-600 px-6 py-2 rounded-lg font-semibold cursor-not-allowed opacity-50">
  Guardando...
</button>
```

### 2. CARDS

```html
<!-- Card Estándar -->
<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
  <h3 class="text-lg font-semibold text-slate-900 mb-2">Título de Card</h3>
  <p class="text-slate-600 mb-4">Contenido descriptivo...</p>
  <button class="text-primary-500 hover:text-primary-600 font-semibold">Acción</button>
</div>

<!-- Card con indicador de estado -->
<div class="bg-white rounded-lg shadow-md border-l-4 border-l-success-500 p-6">
  <div class="flex justify-between items-start mb-3">
    <h3 class="text-lg font-semibold text-slate-900">Orden Completada</h3>
    <span class="px-3 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold">
      Completada
    </span>
  </div>
  <p class="text-slate-600">Contenido...</p>
</div>
```

### 3. TABLAS

```html
<div class="bg-white rounded-lg shadow-md overflow-hidden">
  <table class="w-full">
    <!-- Header -->
    <thead class="bg-slate-50 border-b border-gray-200">
      <tr>
        <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">
          # Orden
        </th>
        <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">
          Estado
        </th>
        <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">
          Cliente
        </th>
        <th class="px-6 py-3 text-right text-sm font-semibold text-slate-900">
          Acciones
        </th>
      </tr>
    </thead>
    
    <!-- Body -->
    <tbody class="divide-y divide-gray-200">
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-medium text-primary-600">OT-20251226-0001</td>
        <td class="px-6 py-4 text-sm">
          <span class="px-3 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold">
            Completada
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-slate-600">SIERRACOL ENERGY</td>
        <td class="px-6 py-4 text-sm text-right space-x-3">
          <button class="text-primary-500 hover:text-primary-600 font-semibold">
            Ver
          </button>
          <button class="text-blue-500 hover:text-blue-600 font-semibold">
            Editar
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 4. FORMULARIOS

```html
<form class="space-y-6 bg-white p-6 rounded-lg shadow">
  <!-- Input Text -->
  <div>
    <label class="block text-sm font-semibold text-slate-700 mb-2">
      Descripción del Trabajo
    </label>
    <input 
      type="text" 
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
      placeholder="Ingrese descripción..."
    />
  </div>

  <!-- Select -->
  <div>
    <label class="block text-sm font-semibold text-slate-700 mb-2">
      Tipo de Servicio
    </label>
    <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
      <option>Seleccione...</option>
      <option>Mantenimiento</option>
      <option>Instalación</option>
      <option>Reparación</option>
    </select>
  </div>

  <!-- Textarea -->
  <div>
    <label class="block text-sm font-semibold text-slate-700 mb-2">
      Observaciones
    </label>
    <textarea 
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      rows="4"
      placeholder="Notas adicionales..."
    ></textarea>
  </div>

  <!-- Checkbox -->
  <div class="flex items-center">
    <input 
      type="checkbox" 
      id="agree"
      class="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
    />
    <label for="agree" class="ml-2 text-sm text-slate-700">
      Acepto términos y condiciones
    </label>
  </div>

  <!-- Botones -->
  <div class="flex gap-4 pt-4">
    <button class="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-semibold transition">
      Guardar
    </button>
    <button class="flex-1 border-2 border-gray-300 text-slate-700 hover:bg-gray-50 py-2 rounded-lg font-semibold transition">
      Cancelar
    </button>
  </div>
</form>
```

### 5. BADGES Y ETIQUETAS

```html
<!-- Success -->
<span class="px-3 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold">
  Completada
</span>

<!-- Warning -->
<span class="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-xs font-semibold">
  Pendiente
</span>

<!-- Danger -->
<span class="px-3 py-1 bg-danger-100 text-danger-700 rounded-full text-xs font-semibold">
  Cancelada
</span>

<!-- Info -->
<span class="px-3 py-1 bg-info-100 text-info-700 rounded-full text-xs font-semibold">
  En Progreso
</span>

<!-- Default -->
<span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
  Borrador
</span>
```

### 6. ALERTAS

```html
<!-- Alert Success -->
<div class="p-4 bg-success-50 border-l-4 border-l-success-500 rounded">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.586 7.7 9.286a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"/>
      </svg>
    </div>
    <div class="ml-3">
      <p class="text-sm font-semibold text-success-800">¡Operación exitosa!</p>
      <p class="text-sm text-success-700 mt-1">La orden fue creada correctamente.</p>
    </div>
  </div>
</div>

<!-- Alert Warning -->
<div class="p-4 bg-warning-50 border-l-4 border-l-warning-500 rounded">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="w-5 h-5 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
      </svg>
    </div>
    <div class="ml-3">
      <p class="text-sm font-semibold text-warning-800">Advertencia</p>
      <p class="text-sm text-warning-700 mt-1">La orden tiene campos pendientes de completar.</p>
    </div>
  </div>
</div>

<!-- Alert Error -->
<div class="p-4 bg-danger-50 border-l-4 border-l-danger-500 rounded">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="w-5 h-5 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
      </svg>
    </div>
    <div class="ml-3">
      <p class="text-sm font-semibold text-danger-800">Error</p>
      <p class="text-sm text-danger-700 mt-1">No se pudo completar la acción.</p>
    </div>
  </div>
</div>
```

### 7. NAVBAR

```html
<nav class="bg-primary-900 text-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 py-4">
    <div class="flex justify-between items-center">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary-300 rounded-lg flex items-center justify-center">
          <span class="font-bold text-primary-900">C</span>
        </div>
        <span class="text-xl font-bold">CERMONT</span>
      </div>

      <!-- Menu -->
      <div class="flex items-center gap-8">
        <a href="#" class="hover:text-primary-200 transition">Dashboard</a>
        <a href="#" class="hover:text-primary-200 transition">Órdenes</a>
        <a href="#" class="hover:text-primary-200 transition">Reportes</a>
      </div>

      <!-- User Menu -->
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
          <span>JD</span>
        </div>
        <button class="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition">
          Logout
        </button>
      </div>
    </div>
  </div>
</nav>
```

### 8. FOOTER

```html
<footer class="bg-slate-900 text-white mt-16">
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="grid grid-cols-4 gap-8 mb-8">
      <!-- Company Info -->
      <div>
        <h3 class="font-bold mb-4">CERMONT</h3>
        <p class="text-gray-400 text-sm">
          Sistema de gestión de órdenes de trabajo para empresas contratistas petroleras.
        </p>
      </div>

      <!-- Links -->
      <div>
        <h4 class="font-semibold mb-4">Producto</h4>
        <ul class="space-y-2 text-gray-400">
          <li><a href="#" class="hover:text-white transition">Características</a></li>
          <li><a href="#" class="hover:text-white transition">Documentación</a></li>
          <li><a href="#" class="hover:text-white transition">Precios</a></li>
        </ul>
      </div>

      <!-- Support -->
      <div>
        <h4 class="font-semibold mb-4">Soporte</h4>
        <ul class="space-y-2 text-gray-400">
          <li><a href="#" class="hover:text-white transition">Centro de Ayuda</a></li>
          <li><a href="#" class="hover:text-white transition">Contacto</a></li>
          <li><a href="#" class="hover:text-white transition">Estado del Servicio</a></li>
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h4 class="font-semibold mb-4">Legal</h4>
        <ul class="space-y-2 text-gray-400">
          <li><a href="#" class="hover:text-white transition">Términos</a></li>
          <li><a href="#" class="hover:text-white transition">Privacidad</a></li>
          <li><a href="#" class="hover:text-white transition">Cookies</a></li>
        </ul>
      </div>
    </div>

    <!-- Bottom -->
    <div class="border-t border-gray-700 pt-8">
      <p class="text-gray-400 text-center">
        © 2025 CERMONT S.A.S. Todos los derechos reservados.
      </p>
    </div>
  </div>
</footer>
```

---

## 📐 TIPOGRAFÍA

```css
/* Headings */
h1 { @apply text-3xl font-bold text-slate-900; }
h2 { @apply text-2xl font-semibold text-slate-900; }
h3 { @apply text-xl font-semibold text-slate-900; }
h4 { @apply text-lg font-semibold text-slate-900; }

/* Body */
body { @apply text-base text-slate-700 leading-relaxed; }
p { @apply text-base text-slate-700; }
small { @apply text-sm text-slate-600; }

/* Links */
a { @apply text-primary-500 hover:text-primary-600 underline; }
a.no-underline { @apply no-underline; }
```

---

## 🎯 SPACING & LAYOUT

```css
/* Contenedores */
.container { @apply max-w-7xl mx-auto px-4; }
.container-sm { @apply max-w-3xl mx-auto px-4; }
.container-lg { @apply max-w-full px-4; }

/* Grillas */
.grid-cols-1-2 { @apply grid grid-cols-1 md:grid-cols-2 gap-6; }
.grid-cols-1-3 { @apply grid grid-cols-1 md:grid-cols-3 gap-6; }
.grid-cols-1-4 { @apply grid grid-cols-1 md:grid-cols-4 gap-6; }

/* Espaciado */
.section { @apply py-16 px-4; }
.section-sm { @apply py-8 px-4; }
```

---

## 🌙 DARK MODE (Opcional para Fase 2)

```css
@media (prefers-color-scheme: dark) {
  body {
    @apply bg-slate-900 text-gray-100;
  }
  
  .card {
    @apply bg-slate-800 border-slate-700;
  }
  
  input, select, textarea {
    @apply bg-slate-800 text-white border-slate-600;
  }
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Tailwind breakpoints estándar */
xs:  0px     /* Mobile */
sm:  640px   /* Tablet Pequeña */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop Pequeño */
xl:  1280px  /* Desktop */
2xl: 1536px  /* Desktop Grande */

/* Ejemplo de uso */
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  <!-- Contenido responsivo -->
</div>
```

---

**Paleta de colores finalizada y lista para implementar en Tailwind**
**Todos los componentes están basados en esta paleta**
