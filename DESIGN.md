# DESIGN.md — CERMONT UI System 3.0

**Proyecto:** CERMONT S.A.S. — Plataforma Operativa  
**Versión:** 3.0  
**Objetivo:** redefinir el sistema visual del aplicativo para que adopte una estética SaaS limpia y elegante inspirada en la imagen de referencia, pero aterrizada al contexto real del dashboard operativo, KPIs, órdenes, evidencias, recursos, documentos y cierre administrativo.

---

## 1. Intención de diseño

La referencia visual aporta una gramática clara:

- fondo blanco predominante;
- tarjetas limpias y respiradas;
- bordes suaves;
- iconos en contenedores circulares;
- botones redondeados;
- color de marca usado con disciplina;
- secciones separadas con ritmo vertical claro;
- jerarquía tipográfica fuerte;
- estética simple, elegante y muy fácil de leer.

**CERMONT debe adoptar esa limpieza, pero no copiar la landing literalmente.**  
El resultado final debe sentirse como una **plataforma operativa premium**, no como una página promocional ni como un dashboard genérico.

### Traducción de la referencia al contexto CERMONT

| Elemento de la referencia | Traducción al producto CERMONT |
|---|---|
| Hero limpio con CTA | Header + bloque de bienvenida + resumen ejecutivo del día |
| Tarjetas de servicios | Tarjetas KPI / tarjetas de módulos / tarjetas de estados |
| Paso a paso visual | Flujo operativo de 14 pasos |
| Testimonios / tarjetas suaves | Actividad reciente, alertas, órdenes recientes |
| FAQ compacto | Bloques de ayuda, pendientes, documentación |
| Footer oscuro | Pie / banda oscura opcional en páginas institucionales, no en dashboard principal |

---

## 2. Principios rectores

1. **Light-first con soporte dark real.**  
   El modo claro es la presentación principal. El modo oscuro debe verse nativo, no invertido a la fuerza.

2. **Base neutra, acentos de marca.**  
   Los fondos son blancos, grises suaves o negros profundos. Los colores CERMONT viven en iconos, botones, badges, bordes activos, foco y microdetalles.

3. **Elegancia sobria.**  
   Nada de saturación visual, gradientes agresivos ni bloques de color innecesarios.

4. **Las tarjetas son el lenguaje principal.**  
   El dashboard, los módulos, los KPIs, el flujo, la actividad y los estados deben construirse desde un sistema coherente de cards.

5. **Cada pantalla debe respirar.**  
   El problema actual del dashboard no es solo falta de color; es falta de jerarquía, ritmo y agrupación visual.

6. **La UI debe servir al flujo operativo real.**  
   El diseño debe reforzar los 14 pasos, la trazabilidad y los estados documentales.

7. **El color nunca reemplaza el significado.**  
   Todo estado debe tener texto + icono + color.

8. **Mobile-first y field-ready.**  
   Debe poder usarse en escritorio, tablet y móvil sin sentirse roto.

---

## 3. Personalidad de marca

La interfaz debe transmitir:

- ingeniería;
- confianza;
- trazabilidad;
- control;
- limpieza;
- orden;
- profesionalismo;
- operación de campo con soporte documental serio.

No debe transmitir:

- panel improvisado;
- interfaz de plantilla genérica;
- exceso de cajas sin jerarquía;
- formularios duros y aburridos;
- visual recargado;
- UI de “sistema viejo”.

---

## 4. Paleta de color

## 4.1 Colores de marca

| Token | Hex | Uso principal |
|---|---:|---|
| `--cermont-navy` | `#0F2C59` | navegación activa, encabezados técnicos, estados fuertes |
| `--cermont-blue` | `#2154A6` | acción primaria, foco, botones, enlaces clave |
| `--cermont-blue-light` | `#3A78D8` | apoyo visual, tags informativos, hover/focus brand |
| `--cermont-green` | `#4CAF50` | éxito, aprobado, sincronizado, listo |
| `--cermont-lime` | `#7CD966` | acento suave, fondos de icono suaves, highlights ligeros |
| `--cermont-green-deep` | `#1B4212` | texto fuerte sobre fondos verdes suaves |

## 4.2 Neutros light

| Token | Hex |
|---|---:|
| `--bg` | `#FFFFFF` |
| `--bg-soft` | `#F8FAFC` |
| `--bg-muted` | `#F3F6FA` |
| `--card` | `#FFFFFF` |
| `--card-muted` | `#FCFDFE` |
| `--text` | `#0F172A` |
| `--text-soft` | `#475569` |
| `--text-muted` | `#64748B` |
| `--line` | `rgba(15, 23, 42, 0.08)` |
| `--line-strong` | `rgba(15, 23, 42, 0.14)` |

## 4.3 Neutros dark

| Token | Hex |
|---|---:|
| `--bg` | `#05070A` |
| `--bg-soft` | `#0B111A` |
| `--bg-muted` | `#111827` |
| `--card` | `#0F172A` |
| `--card-muted` | `#111B2C` |
| `--text` | `#F8FAFC` |
| `--text-soft` | `#CBD5E1` |
| `--text-muted` | `#94A3B8` |
| `--line` | `rgba(255,255,255,0.08)` |
| `--line-strong` | `rgba(255,255,255,0.14)` |

## 4.4 Semánticos

| Token | Hex | Uso |
|---|---:|---|
| `--success` | `#4CAF50` | completado, aprobado, sincronizado |
| `--success-soft` | `rgba(76,175,80,0.12)` | badge o fondo de éxito |
| `--warning` | `#F59E0B` | pendiente, alerta, próximo a vencer |
| `--warning-soft` | `rgba(245,158,11,0.14)` | fondo de alerta |
| `--danger` | `#EF4444` | bloqueo, rechazado, vencido |
| `--danger-soft` | `rgba(239,68,68,0.12)` | fondo de error |
| `--info` | `#3A78D8` | estado informativo |
| `--info-soft` | `rgba(58,120,216,0.12)` | fondo informativo |
| `--brand-soft` | `rgba(33,84,166,0.10)` | contenedores suaves de marca |

---

## 5. Regla de aplicación del color

### Correcto
- fondo blanco o negro como base;
- card blanca / card dark como superficie principal;
- iconos de color dentro de círculos suaves;
- botón primario azul CERMONT;
- estados con badge suave;
- numerales KPI en tinta oscura o blanca, no en color saturado;
- acento de color en bordes activos, tabs activas, selected state y focus.

### Incorrecto
- pintar cada tarjeta KPI de un color distinto;
- usar fondos azules sólidos en paneles grandes;
- usar gradientes como recurso decorativo principal;
- saturar el dashboard con verde y azul sin jerarquía;
- usar colores por módulo sin sistema semántico.

---

## 6. Tipografía

### Familia tipográfica
- **Inter** para todo el sistema UI.
- **Geist Mono** o monospace equivalente para códigos, IDs, estados técnicos compactos y cifras especiales.

### Escala tipográfica

| Token | Tamaño | Peso | Uso |
|---|---:|---:|---|
| `display-xl` | 52px | 700 | títulos hero / bienvenida principal |
| `display-lg` | 40px | 700 | encabezados de secciones premium |
| `h1` | 32px | 700 | título de página |
| `h2` | 24px | 700 | encabezado de bloque |
| `h3` | 20px | 600 | título de card o subsección |
| `h4` | 18px | 600 | título de componente |
| `body-lg` | 16px | 400/500 | cuerpo principal |
| `body-md` | 14px | 400/500 | texto normal de dashboard |
| `body-sm` | 13px | 400/500 | ayuda, metadata, filtros |
| `caption` | 12px | 500 | labels, chips, ayudas cortas |
| `micro` | 11px | 600 | tiny labels, uppercase tags |

### Reglas
- títulos con tracking ligeramente negativo;
- subtítulos en tono secundario, no gris demasiado débil;
- números KPI con gran protagonismo visual;
- labels pequeños, pero siempre legibles;
- evitar bloques largos de texto dentro del dashboard.

---

## 7. Espaciado y layout

### Escala de spacing
- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.

### Reglas de layout
- contenedor principal desktop: `max-width: 1440px`;
- gutter horizontal: 24px desktop / 16px móvil;
- cards con padding 20px–24px;
- separación entre bloques del dashboard: 24px–32px;
- separación vertical de páginas: 32px–40px;
- dentro de una card KPI: 12px–16px entre icono, título, número y pie.

### Grid recomendado dashboard
- **desktop:** 12 columnas;
- **tablet:** 6 columnas;
- **mobile:** 1 columna.

Ejemplos:
- Header / filtros: 12 columnas.
- Bloque hero operativo: 12 columnas.
- KPIs principales: 4 cards x 3 columnas c/u.
- Flujo 14 pasos: 2 columnas de cards o carrusel horizontal en móvil.
- Gráficos: 2 columnas grandes.
- Actividad, órdenes recientes, alertas: 3 columnas o stack.

---

## 8. Border radius, bordes y sombras

### Radius
| Token | Valor |
|---|---:|
| `radius-xs` | 6px |
| `radius-sm` | 8px |
| `radius-md` | 12px |
| `radius-lg` | 16px |
| `radius-xl` | 24px |
| `radius-full` | 9999px |

### Bordes
- borde estándar: `1px solid var(--line)`
- borde fuerte: `1px solid var(--line-strong)`
- borde activo: `1px solid var(--cermont-blue-light)`

### Sombras
- `shadow-soft`: `0 1px 2px rgba(15,23,42,0.04)`
- `shadow-card`: `0 8px 24px rgba(15,23,42,0.06)`
- `shadow-brand`: `0 10px 30px rgba(33,84,166,0.10)`

**Regla:** sombras muy suaves; la jerarquía la da el layout, no un shadow exagerado.

---

## 9. Iconografía

### Estilo
- usar un único set: Lucide, Tabler o equivalente outline;
- líneas limpias, grosor consistente;
- sin mezcla de filled + outline + emojis.

### Tamaños
- icono micro: 16px;
- icono estándar: 18px–20px;
- icono card: 22px–24px;
- icono destacado: 28px.

### Contenedores de icono
- 40px, 44px o 48px;
- forma circular o rounded-md;
- fondos suaves, no saturados.

### Mapeo semántico sugerido
| Dominio | Color |
|---|---|
| Órdenes / flujo | azul CERMONT |
| Evidencias / cámara | verde CERMONT |
| Vehículos / recursos | navy / azul |
| Alertas / bloqueos | amarillo / rojo |
| Documentos | azul claro / slate |
| Finanzas | navy / verde según estado |
| Sincronización / PWA | verde / info |

---

## 10. Componentes base

## 10.1 Buttons

### `button-primary`
- fondo azul CERMONT;
- texto blanco;
- radio pill;
- padding `10px 18px` o `12px 20px`;
- uso: acción principal de pantalla.

### `button-secondary`
- fondo blanco o transparente;
- borde sutil;
- texto oscuro;
- radio pill;
- uso: acción secundaria.

### `button-ghost`
- fondo transparente;
- texto secundario;
- uso: acciones menos prominentes.

### `button-success`
- fondo verde;
- texto blanco;
- uso: confirmar, aprobar, sincronizar.

### `button-danger`
- fondo rojo;
- texto blanco;
- uso: rechazar, eliminar.

### Regla general
- toda pantalla debe tener **solo una prioridad primaria clara**.

## 10.2 Cards

### `card-base`
- fondo card;
- borde sutil;
- radio 16px;
- padding 24px;
- shadow suave opcional.

### `card-soft`
- fondo `bg-soft` o `surface-soft`;
- borde sutil;
- radio 16px;
- uso: agrupación secundaria.

### `card-highlight`
- card base con borde/acento superior o lateral de color;
- uso: card destacada, resumen premium, alerta o hero KPI.

### `card-empty`
- fondo limpio;
- icono suave;
- texto amable;
- CTA corto.

## 10.3 Badges / chips
- altura compacta;
- radio full;
- icono opcional;
- color suave + texto fuerte.

Estados estándar:
- success / approved;
- warning / pending;
- danger / blocked;
- info / in-progress;
- neutral / draft.

## 10.4 Inputs
- fondo blanco o card;
- borde sutil;
- foco azul claro;
- altura 40–44px;
- placeholder discreto;
- labels siempre visibles.

---

## 11. Sistema visual del dashboard

El dashboard actual tiene buen contenido base, pero visualmente está plano.  
La meta no es meter más cajas, sino **dar estructura narrativa**.

## 11.1 Estructura ideal del dashboard

### A. Header superior
Debe incluir:
- breadcrumb o ruta;
- título “Panel de Control”;
- saludo de bienvenida con rol;
- filtros globales (fecha, cliente, estado, sede);
- acciones rápidas.

**Diseño:**
- bloque limpio, no recargado;
- filtros alineados en una card horizontal o toolbar suave;
- saludo y contexto visualmente separados.

### B. Hero operativo / resumen ejecutivo
Debe reemplazar la sensación aburrida del dashboard.

Contenido:
- título contextual: “Pulso operativo de CERMONT” o similar;
- subtítulo: resumen del estado actual;
- 3 a 4 KPIs principales;
- microindicador de tendencia;
- CTA o acceso rápido.

**Apariencia:**
- gran card destacada;
- fondo blanco con un bloque de acento muy sutil o fondo oscuro en dark;
- iconos suaves;
- numerales grandes;
- layout de 2 zonas: texto y métricas.

### C. KPIs principales
Los KPIs no deben ser números sueltos.

Cada KPI debe mostrar:
1. icono;
2. label corto;
3. valor grande;
4. subtítulo explicativo;
5. delta / tendencia opcional;
6. estado de interpretación.

#### KPIs prioritarios sugeridos
- Órdenes activas.
- Mantenimientos abiertos.
- Completados del mes.
- Ingresos / presupuesto del mes.
- Casos en ejecución.
- Bloqueados.
- Listos para facturar.
- Recursos en uso.

### D. Flujo Operativo de 14 pasos
No debe ser una grilla plana solamente.

Debe convertirse en un bloque potente con:
- encabezado;
- tabs o filtros por etapa: Comercial, Operativo, Cierre, Financiero;
- cards por paso;
- contador por paso;
- microdescripción;
- color tag de etapa.

**Desktop:** cards ordenadas en grid.  
**Móvil:** carrusel horizontal o accordion.

### E. Cadena documental
Debe verse como una línea de avance o stepper avanzado.

Mostrar:
- pasos documentales clave;
- porcentaje o cobertura;
- cuántas órdenes alimentan ese flujo;
- dónde se está atascando.

### F. Gráficos
Los gráficos actuales están vacíos y sin presencia.

Diseño recomendado:
- contenedores grandes con título, subtítulo y acción;
- chart area con placeholder elegante cuando no hay datos;
- una gráfica de tendencia mensual;
- una dona o barras de órdenes por estado;
- pequeñas leyendas claras.

### G. Actividad reciente / órdenes recientes / alertas
En vez de texto plano, usar:
- cards de feed;
- timeline vertical;
- mini avatars o iconos;
- timestamps;
- CTA “ver más”.

### H. Estados vacíos
Todos los bloques sin datos deben verse bien.

Un empty state correcto debe tener:
- icono;
- título corto;
- explicación breve;
- CTA opcional.

Ejemplo:
- “No hay órdenes recientes.”
- “Cuando se creen nuevas órdenes, aparecerán aquí.”
- botón “Crear orden”.

---

## 12. Diseño específico para KPIs

### Estructura visual de una KPI card

```txt
[icono circular]   [chip opcional]
Label KPI
Valor principal grande
Texto de apoyo / comparación
Mini tendencia o barra
```

### Reglas de una buena KPI
- valor grande y visible;
- label breve;
- no meter párrafos;
- un solo insight secundario;
- icono relacionado;
- contraste fuerte;
- interpretación inmediata.

### Ejemplo de semántica
- azul: actividad operativa;
- verde: resultados positivos / ingresos / cierre correcto;
- amarillo: alertas / pendientes;
- rojo: bloqueos / retrasos;
- gris: neutral / sin actividad.

---

## 13. Diseño de tablas y listas

Las tablas deben verse ligeras.

### Reglas
- encabezados suaves;
- filas con altura cómoda;
- zebra sutil opcional;
- acciones al final;
- badges de estado;
- avatar o icono cuando aplique;
- columna de fecha legible;
- overflow horizontal controlado en móvil.

### Órdenes recientes
Cada fila debe mostrar:
- código de orden;
- cliente;
- etapa actual;
- estado;
- fecha;
- responsable;
- acción.

---

## 14. Navegación

### Sidebar / bottom nav
La navegación debe adoptar la limpieza de la referencia.

#### Sidebar desktop
- fondo limpio;
- logo arriba;
- grupos claros;
- ícono + label;
- item activo con fondo suave y borde/acento azul;
- no demasiados niveles a la vez.

#### Bottom nav móvil
- 4–5 acciones principales;
- íconos claros;
- label corto;
- active state fuerte pero limpio.

---

## 15. Modo dark

Dark mode debe respetar la misma jerarquía.

### Reglas
- fondo muy oscuro, no gris lavado;
- cards ligeramente elevadas;
- bordes visibles pero sutiles;
- acentos azules y verdes conservados;
- numerales KPI con alto contraste;
- evitar fondos saturados.

---

## 16. Accesibilidad y UX

1. Contraste AA mínimo.
2. Focus visible.
3. Targets táctiles mínimos de 44px.
4. No depender solo del color.
5. Labels explícitos.
6. Feedback inmediato en filtros, carga y errores.
7. Skeletons elegantes para loading.
8. Empty states bien resueltos.
9. Tooltips solo cuando agregan valor.
10. Navegación por teclado para escritorio.

---

## 17. Reglas de implementación

1. No hardcodear colores fuera de tokens.
2. No crear variantes arbitrarias de card.
3. Toda pantalla debe usar el mismo sistema de spacing.
4. Toda card KPI debe seguir la misma anatomía.
5. Toda vista sin datos debe tener empty state.
6. Toda vista con datos debe tener jerarquía clara.
7. El dashboard debe contar una historia: estado general → KPIs → flujo → gráficos → actividad → detalles.
8. No usar estilos inline salvo casos excepcionales.
9. Crear componentes reutilizables.
10. Respetar light/dark desde los tokens.

---

## 18. Componentes que deben existir sí o sí

- `DashboardHero`
- `KpiCard`
- `KpiGrid`
- `SectionHeader`
- `FlowStepCard`
- `FlowStageTabs`
- `DocumentChainCard`
- `EmptyStateCard`
- `RecentOrdersTable`
- `RecentActivityFeed`
- `AlertSummaryCard`
- `ChartCard`
- `FilterToolbar`
- `StatusBadge`
- `MetricDelta`

---

## 19. Anti-patrones a evitar

- dashboard con cajas todas iguales sin jerarquía;
- KPIs sin icono, sin subtítulo y sin contexto;
- cards con demasiada descripción;
- muchas líneas divisorias innecesarias;
- fondos coloreados en exceso;
- gráficos sin contenedor claro;
- tablas duras y densas;
- diseño tipo “admin template” genérico;
- exceso de sombras;
- colores no pertenecientes a marca o sistema semántico.

---

## 20. Resumen ejecutivo de la transformación

**Objetivo final:**
Convertir el dashboard y el sistema visual de CERMONT en una interfaz que combine:

- la limpieza de la referencia visual;
- la seriedad de un SaaS profesional;
- la claridad de un sistema operativo-documental;
- una lectura ejecutiva fuerte para KPIs;
- una lectura operativa clara para el flujo de 14 pasos.

En resumen:

> CERMONT no debe verse como una app académica con tarjetas básicas, sino como una plataforma operativa profesional, sobria, elegante, clara y lista para crecer.

