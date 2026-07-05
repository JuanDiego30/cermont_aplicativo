# Cermont S.A.S. — Frontend Motion & Visual Guidelines

Esta guía documenta los principios de diseño, tokens de animación, comportamiento de scroll y accesibilidad adoptados para la interfaz del aplicativo web de Cermont S.A.S., garantizando que toda interacción sea fluida, corporativa y accesible.

---

## 1. Principios de Movimiento

* **Funcionalidad sobre Delite:** Toda animación debe tener una justificación de interacción (ej: confirmar que se pulsó un botón o suavizar una carga de datos). Se evitan rebotes exagerados o animaciones tipo landing page publicitaria.
* **Velocidad e Interrupción:** Las duraciones se mantienen bajas (< 300ms) y se prefieren transiciones CSS sobre keyframes para permitir que el usuario interrumpa la animación rápidamente (ej: cerrar un modal antes de que termine de abrir).
* **Prevención de Saltos Visuales (Layout Shifts):** Nunca se animan propiedades de dimensionamiento de caja (`width`, `height`, `margin`, `padding`). Las animaciones se limitan a `opacity` y `transform` acelerados por GPU.

---

## 2. Tokens de Animación

Definidos centralmente en `frontend/src/styles/motion.css`:

### Duraciones
* `--duration-instant` (80ms): Feedback táctil, escalas de botones `:active`.
* `--duration-fast` (150ms): Hover de enlaces, menús y badges.
* `--duration-normal` (220ms): Modales rápidos, cambio de estados.
* `--duration-slow` (320ms): Drawers laterales, transiciones de rutas.

### Curvas de Easing (Estilo Emil Kowalski)
* `--ease-standard`: `cubic-bezier(0.4, 0, 0.2, 1)` (Transición por defecto).
* `--ease-enter`: `cubic-bezier(0, 0, 0.2, 1)` (Entrada rápida y punchy).
* `--ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` (Suave desaceleración).
* `--ease-in-out`: `cubic-bezier(0.77, 0, 0.175, 1)` (Aceleración y desaceleración fluida).

---

## 3. Patrones de Interacción

### Formularios Extensos
* **Scroll a Errores:** En lugar de dejar que el usuario busque qué campo falló la validación de Zod, se incluye un hook que desplaza la vista suavemente al primer input con error y le da el foco de entrada:
  ```typescript
  useEffect(() => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const errorElement = document.getElementById(`form-${firstErrorKey}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus({ preventScroll: true });
      }
    }
  }, [errors]);
  ```
* **Estructura por Fieldsets:** Los campos se agrupan en fieldsets con sombras ligeras y bordes suaves que entran con una escala de `scale-in` de `0.95` a `1.0` para evitar fatiga de lectura.

### Tablas y Listados
* **Sticky Headers:** Los encabezados de las tablas grandes se fijan arriba con `sticky top-0 z-10 bg-[var(--surface-primary)]` para mantener el contexto del dato al hacer scroll.
* **Skeletons Estructurados:** Los skeletons de carga deben coincidir en columnas y forma con la tabla final para eliminar el layout shift.

---

## 4. Accesibilidad (a11y)

* **Reduced Motion:** Si el usuario tiene habilitada la reducción de movimiento en su sistema operativo, todas las duraciones de animación y transiciones cambian a `0.01ms` de forma global para prevenir cinetosis o fatiga.
* **Navegación de Teclado:** Las transiciones respetan los estados `:focus-visible` de los navegadores y no alteran el orden de tabulación de la página.
