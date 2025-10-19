# Logo Animado CERMONT 🎨

## Descripción

Componente React que muestra el logo de CERMONT con un efecto SVG animado detrás, utilizando técnicas de `feTurbulence` y `feDisplacementMap` con anime.js.

El efecto crea un hexágono animado con gradiente dinámico en los colores corporativos de CERMONT (azul #1976D2 y verde #4CAF50), simulando el movimiento fluido y la transformación continua característicos de la empresa.

---

## 🎯 Características

- ✅ **Animación fluida** con anime.js (feTurbulence + feDisplacementMap)
- ✅ **Gradiente dinámico** con colores corporativos CERMONT
- ✅ **Hexágono animado** inspirado en el logo circular de CERMONT
- ✅ **Intensidad personalizable** (0-1)
- ✅ **Velocidad ajustable** (1000-8000ms)
- ✅ **Toggle para mostrar/ocultar** el efecto
- ✅ **Optimizado para rendimiento** (GPU accelerated)
- ✅ **Compatible con modo claro/oscuro**
- ✅ **Responsive** y adaptable a cualquier tamaño

---

## 📦 Instalación

El componente ya está instalado. Las dependencias necesarias son:

```bash
npm install animejs @types/animejs
```

---

## 🚀 Uso Básico

### Importación

```tsx
import AnimatedLogo from '@/components/AnimatedLogo';
```

### Ejemplo Simple

```tsx
<AnimatedLogo />
```

### Con Props Personalizadas

```tsx
<AnimatedLogo 
  width={220} 
  height={52}
  intensity={0.3}
  speed={4000}
  showEffect={true}
  priority={true}
  className="my-logo"
/>
```

---

## 🎛️ Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `width` | `number` | `110` | Ancho del logo en píxeles |
| `height` | `number` | `26` | Alto del logo en píxeles |
| `priority` | `boolean` | `true` | Prioridad de carga de Next.js Image |
| `className` | `string` | `''` | Clases CSS adicionales |
| `intensity` | `number` | `0.2` | Intensidad de la animación (0-1) |
| `speed` | `number` | `3000` | Velocidad de animación en milisegundos |
| `showEffect` | `boolean` | `true` | Mostrar/ocultar el efecto animado |

---

## 📐 Tamaños Recomendados

### Navbar (Default)
```tsx
<AnimatedLogo width={110} height={26} />
```
- Uso: Barra de navegación principal
- Aspecto: Compacto y discreto

### Hero Section
```tsx
<AnimatedLogo width={220} height={52} />
```
- Uso: Página de inicio, landing page
- Aspecto: Grande y prominente

### Card/Modal
```tsx
<AnimatedLogo width={165} height={39} />
```
- Uso: Tarjetas, modales, sidebars
- Aspecto: Balance entre tamaño y espacio

---

## 🎨 Configuración de Intensidad

La intensidad controla cuán pronunciado es el efecto de turbulencia:

| Valor | Efecto | Uso Recomendado |
|-------|--------|-----------------|
| `0.1` | Muy sutil | Contextos formales, documentos |
| `0.2` | Sutil (default) | Navbar, headers estándar |
| `0.3-0.4` | Moderado | Landing pages, hero sections |
| `0.5-0.7` | Notorio | Páginas promocionales |
| `0.8-1.0` | Intenso | Splash screens, efectos especiales |

**Ejemplo:**
```tsx
{/* Logo sutil para navbar */}
<AnimatedLogo intensity={0.15} />

{/* Logo llamativo para hero */}
<AnimatedLogo intensity={0.5} width={220} height={52} />
```

---

## ⚡ Configuración de Velocidad

La velocidad se mide en milisegundos para un ciclo completo de animación:

| Valor | Sensación | Uso Recomendado |
|-------|-----------|-----------------|
| `1000-2000` | Rápido/Energético | Contextos dinámicos, dashboards |
| `3000` | Balanceado (default) | Uso general |
| `4000-5000` | Relajado | Páginas corporativas, presentaciones |
| `6000-8000` | Lento/Elegante | Sitios premium, luxury branding |

**Ejemplo:**
```tsx
{/* Animación rápida y dinámica */}
<AnimatedLogo speed={2000} />

{/* Animación lenta y elegante */}
<AnimatedLogo speed={6000} />
```

---

## 🖼️ Implementación Actual

### Navbar (`src/components/Navbar.tsx`)

```tsx
import AnimatedLogo from '@/components/AnimatedLogo';

<Link href="/inicio" aria-label="Inicio Cermont" className="logo-wrap">
  <AnimatedLogo width={110} height={26} priority />
</Link>
```

### Header (`src/components/layout/Header.tsx`)

```tsx
import AnimatedLogo from '@/components/AnimatedLogo';

<Link href="/" aria-label="Inicio Cermont" className="logo-wrap">
  <AnimatedLogo width={110} height={26} priority />
</Link>
```

---

## 🎭 Página de Demostración

Visita `/logo-demo` para ver el logo animado en acción con controles interactivos:

**Características de la demo:**
- ✅ Vista en vivo del logo animado
- ✅ Controles de intensidad (slider 0-1)
- ✅ Controles de velocidad (slider 1000-8000ms)
- ✅ Toggle para mostrar/ocultar efecto
- ✅ Ejemplos en diferentes tamaños
- ✅ Prueba en fondos claros y oscuros

**URL:** `http://localhost:3001/logo-demo`

---

## 🔧 Detalles Técnicos

### Tecnologías Utilizadas

1. **anime.js**: Librería de animación JavaScript
   - Control preciso de timing y easing
   - Animación de atributos SVG
   - Loops y direcciones alternadas

2. **SVG Filters**:
   - `feTurbulence`: Genera ruido Perlin para efecto orgánico
   - `feDisplacementMap`: Desplaza píxeles según el ruido
   - `linearGradient`: Colores dinámicos CERMONT

3. **React Hooks**:
   - `useRef`: Referencias a elementos SVG para anime.js
   - `useEffect`: Inicialización de animaciones en mount

### Estructura del Efecto

```svg
<svg>
  <defs>
    <!-- Filtro de desplazamiento -->
    <filter id="cermontDisplacementFilter">
      <feTurbulence baseFrequency="0" /> <!-- Animado con anime.js -->
      <feDisplacementMap scale="1" />     <!-- Animado con anime.js -->
    </filter>
    
    <!-- Gradiente con colores CERMONT -->
    <linearGradient id="cermontGradient">
      <stop offset="0%" stop-color="#1976D2" /> <!-- Azul -->
      <stop offset="50%" stop-color="#4CAF50" /> <!-- Verde -->
      <stop offset="100%" stop-color="#1976D2" /> <!-- Azul -->
    </linearGradient>
  </defs>
  
  <!-- Hexágono animado -->
  <polygon 
    points="..." 
    fill="url(#cermontGradient)"
    filter="url(#cermontDisplacementFilter)"
  />
</svg>
```

### Animaciones Simultáneas

El componente ejecuta **3 animaciones** en paralelo:

1. **baseFrequency** (turbulencia): Controla la frecuencia del ruido
2. **scale** (desplazamiento): Controla la intensidad del efecto
3. **points** (hexágono): Transforma la forma del polígono

Todas usan `direction: 'alternate'` y `loop: true` para movimiento continuo y fluido.

---

## 🎨 Colores CERMONT

El gradiente utiliza los colores oficiales de la marca:

| Color | Hex | Uso |
|-------|-----|-----|
| Azul Primario | `#1976D2` | Inicio y fin del gradiente |
| Verde Secundario | `#4CAF50` | Centro del gradiente |
| Variaciones | `#2196F3`, `#1E88E5`, `#66BB6A` | Animaciones de color |

Los colores se animan sutilmente con `<animate>` SVG nativo para agregar profundidad.

---

## ⚙️ Optimización

### Rendimiento

- **GPU Acceleration**: Las transformaciones SVG usan aceleración por hardware
- **Lazy Loading**: El efecto solo se renderiza cuando `showEffect={true}`
- **Pointer Events**: `pointer-events: none` en el SVG para evitar bloqueos de interacción
- **Blur Sutil**: `blur(0.5px)` agrega suavidad sin impacto significativo

### Accesibilidad

- **aria-hidden**: El SVG de fondo no interfiere con lectores de pantalla
- **Priority Loading**: La imagen del logo se carga con prioridad
- **Alt Text**: Texto alternativo "Cermont" en la imagen

---

## 🎯 Casos de Uso

### 1. Navbar Animado (Actual)
```tsx
<AnimatedLogo width={110} height={26} />
```
- Efecto sutil que añade vida al header
- No distrae de la navegación principal

### 2. Landing Page Hero
```tsx
<AnimatedLogo 
  width={300} 
  height={70} 
  intensity={0.4}
  speed={4000}
/>
```
- Logo prominente con animación moderada
- Captura atención al cargar la página

### 3. Login Screen
```tsx
<AnimatedLogo 
  width={220} 
  height={52} 
  intensity={0.25}
  speed={5000}
/>
```
- Balance entre elegancia y dinamismo
- Transmite profesionalismo con personalidad

### 4. Dashboard Header
```tsx
<AnimatedLogo 
  width={165} 
  height={39}
  intensity={0.15}
  speed={3500}
/>
```
- Suficientemente sutil para uso diario
- Mantiene identidad de marca sin distraer

### 5. Email Signature (Sin efecto)
```tsx
<AnimatedLogo 
  width={110} 
  height={26}
  showEffect={false}
/>
```
- Solo el logo sin animación
- Compatible con clientes de email

---

## 🚫 Cuándo NO Usar el Efecto

Desactiva el efecto (`showEffect={false}`) en:

- **Emails**: Animaciones no soportadas
- **PDFs/Impresos**: Solo imagen estática necesaria
- **Contextos muy formales**: Propuestas, contratos
- **Performance crítico**: Dispositivos de bajo rendimiento
- **Accesibilidad estricta**: Usuarios sensibles a movimiento

---

## 🔄 Actualizaciones Futuras

Posibles mejoras planeadas:

- [ ] Modo "reducido de movimiento" (respeta `prefers-reduced-motion`)
- [ ] Efecto de "hover" para interactividad
- [ ] Variantes de color para diferentes secciones (admin/tecnico/cliente)
- [ ] Exportación a GIF/WebP animado para redes sociales
- [ ] Versión con logo SVG inline (no PNG) para mejor escalado

---

## 📚 Referencias

- [anime.js Documentation](https://animejs.com/)
- [SVG Filters - MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter)
- [feTurbulence Reference](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence)
- [Material Design Color System](https://m3.material.io/styles/color/system/overview)

---

## 🤝 Contribución

Para modificar el efecto:

1. Edita `src/components/AnimatedLogo.tsx`
2. Ajusta parámetros en `anime()` calls
3. Prueba en `/logo-demo` con diferentes configuraciones
4. Actualiza esta documentación si cambias props o comportamiento

---

**Desarrollado para CERMONT** 🏗️  
Logo Animado con Efecto SVG Turbulento • anime.js + React
