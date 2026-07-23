# PROMPT CREA: fix/landing-uiux-conversion-v3

## TL;DR

> **Quick Summary**: Refactorización completa de la landing page pública de CERMONT S.A.S. — implementación de mejoras visuales, nuevas secciones de conversión B2B, corrección de colores, y diseño responsive optimizado.
>
> **Deliverables**:
> - Navbar con logo 48px, nav en una fila, CTA verde
> - Hero con CTA verde y gap reducido
> - 100% íconos unificados en verde de marca
> - Service cards con CTA propio
> - Method section con conectores + CTA final
> - StatsBar enriquecido integrado al page flow
> - Sección de Sectores/Industrias (nueva)
> - Testimonios poblados e integrados
> - FAQ expandida con preguntas B2B
> - Galería con 3 imágenes + disclaimer unificado
> - Resources con badges coloreados por tipo
> - CTA section con textura premium
> - Footer con logo grande + botón verde
> - Global spacing optimizado
>
> **Estimated Effort**: Large (19 tareas, 5 waves paralelas)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: T1 → T6 → T7 → T12 → T13 → T14 → T19

---

## Context

### Original Request
Implementar las mejoras identificadas en la auditoría de la landing page de CERMONT S.A.S. para aumentar conversión B2B, coherencia visual y prueba social. El plan solo contiene implementación, refactorización, innovación y mejoras — sin fases de auditoría.

### Referencia Visual
4 imágenes de inspiración (comportamiento UI/UX, NO colores):
- **Minvip**: Barra de métricas, grid proyectos, servicio solutions, testimonials
- **Estafb**: Search functionality, property cards, testimonials, FAQ accordion
- **Civib**: Stats bar, servicios grid, team section, proceso paso a paso, pricing
- **Shoelpv**: Product grid, best sellers, testimonials, FAQ

### Stack Técnico
- Next.js 16 + React 19 + Tailwind CSS 4.2.2 + lucide-react
- Scope exclusivo: `frontend/src/landing/` (1 excepción: `core/ui/ThemeToggle.tsx`)
- Paleta: verde `#16a34a` (green-600), azul `#3b82f6` PROHIBIDO en CTAs

### Hallazgos de la Auditoría (contexto, no para ejecutar)
La auditoría del usuario identificó 30 issues en 4 categorías:
- 6 críticos (CTA azul, gap hero, nav roto, logo pequeño, 0 stats, 0 testimonios)
- 12 importantes (íconos azul marino, footer azul, grid desbalanceado, spacing)
- 8 mejoras (conectores método, About vacío, galería 2 imgs, resources badges, CTA liso)
- 4 contenido nuevo (stats, sectores, testimonios, FAQ expandida)

---

## Work Objectives

### Core Objective
Convertir la landing en una máquina de conversión B2B: el cliente visita, ve credibilidad, y contacta.

### Definition of Done
- Todos los CTAs son verdes (0 blue-500/blue-600 en botones)
- Logo visible a 48px en navbar y footer
- Nav items en una sola fila en desktop
- StatsBar con ≥5 métricas integrado
- TestimonialsSection con contenido integrado
- SectorsSection nueva creada
- ServiceCard con CTA propio
- MethodSection con CTA final
- FAQ con ≥10 preguntas
- Grid servicios 4 columnas
- Resources con badges coloreados
- CTA con textura de fondo

### Must Have
- Verde de marca en todos los CTAs
- Logo 48px navbar + footer
- StatsBar + Testimonials + Sectors integrados
- Service cards con "Solicitar cotización"
- Method con CTA "Contáctenos"
- Resources badges por tipo (Contacto=verde, App=azul, Legal=gris)
- CTA section texturizado

### Must NOT Have
- ❌ blue-500/blue-600/blue-700 en CTAs
- ❌ Modificar archivos fuera de `landing/` (excepto ThemeToggle)
- ❌ Eliminar funcionalidad existente
- ❌ Agregar dependencias nuevas
- ❌ Usar `any`, `unknown`, `null`, `undefined` para ausencia
- ❌ Testimonios de clientes ficticios
- ❌ `console.log` / `debugger` / `alert`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 — Foundation (start immediately):
├── T1: Navbar — logo 48px + nav single row + green CTA [quick]
├── T2: Hero — green CTA + reduced gap [quick]
├── T3: ThemeToggle — fix cyan light mode [quick]
├── T4: landing-data — enrich stats + sectors + testimonials data [quick]
└── T5: Icon unification — 6 components blue→green [quick]

Wave 2 — Core sections (after Wave 1):
├── T6: ServiceCard — add CTA per card [quick]
├── T7: ServicesSection — 4-col grid desktop [quick]
├── T8: MethodSection — horizontal connectors + CTA [quick]
├── T9: AboutSection — fix empty space + green icons [quick]
├── T10: ContactSection — green CTA buttons [quick]
└── T11: Footer — large logo + green button [quick]

Wave 3 — New content (after Wave 2):
├── T12: StatsBar — enrich + integrate into page flow [unspecified-high]
├── T13: SectorsSection — new industrial sectors section [unspecified-high]
├── T14: TestimonialsSection — populate + integrate [unspecified-high]
└── T15: FaqSection — expand with B2B questions [quick]

Wave 4 — Polish (after Wave 3):
├── T16: OperationalEvidence — 3 images + unified disclaimer [quick]
├── T17: Resources — colored badges + icons by type [quick]
├── T18: CTA — textured background pattern [quick]
└── T19: PublicLandingContent — update page flow [quick]
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 (Navbar) | — | T19 |
| T2 (Hero) | — | T19 |
| T3 (ThemeToggle) | — | T19 |
| T4 (Data) | — | T6, T12, T13, T14 |
| T5 (Icons) | — | T6, T9, T10, T11 |
| T6 (ServiceCard) | T4, T5 | T7 |
| T7 (Services grid) | T6 | T19 |
| T8 (Method) | T5 | T19 |
| T9 (About) | T5 | T19 |
| T10 (Contact) | T5 | T19 |
| T11 (Footer) | — | T19 |
| T12 (StatsBar) | T4 | T19 |
| T13 (Sectors) | T4 | T19 |
| T14 (Testimonials) | T4 | T19 |
| T15 (FAQ) | — | T19 |
| T16 (Gallery) | — | T19 |
| T17 (Resources) | — | T19 |
| T18 (CTA texture) | — | T19 |
| T19 (Page flow) | T1-T18 | — |

---

## TODOs

- [ ] 1. Navbar — Logo 48px + nav en una fila + CTA verde

  **What to do**:
  - `frontend/src/landing/components/LandingHeader.tsx`
  - Logo: cambiar `size="md"` (32px) a `size="lg"` (48px)
  - Logo: `hideWordmarkOnMobile={false}` para mostrar "Cermont S.A.S." siempre
  - Nav items: verificar que `gap-1.5` + `text-[11px]` caben en una fila en 1280px — si no, reducir a `gap-1`
  - Botón "Acceso privado": cambiar de `variant="primary"` (azul) a clases directas verdes:
    ```tsx
    // ANTES: <Button asChild size="sm" variant="primary" className="px-5">
    // DESPUÉS:
    <Button asChild size="sm" className="px-5 bg-green-600 hover:bg-green-700 text-white">
    ```

  **Must NOT do**: NO modificar `Logo.tsx`, NO cambiar NAV_ITEMS

  **References**:
  - `LandingHeader.tsx:16` — Logo actual `size="md"` → `size="lg"` (Logo.tsx:16 define lg=48)
  - `LandingHeader.tsx:22` — Nav `gap-1.5 text-[11px]` — verificar single row
  - `LandingHeader.tsx:44` — Button `variant="primary"` → override con `bg-green-600`
  - `landing-constants.ts:22-29` — NAV_ITEMS (6 items)
  - Referencia visual: Minvip/Civib muestran nav compacta con logo grande

  **Commit**: `fix(landing): navbar logo 48px + green CTA + single row nav`

- [ ] 2. Hero — CTA verde + gap reducido

  **What to do**:
  - `frontend/src/landing/components/HeroSection.tsx`
  - Botón "Solicitar información" (línea 42): cambiar a verde:
    ```tsx
    // DESPUÉS:
    <Button asChild size="lg" className="px-8 py-6 text-base bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-md hover:shadow-lg">
    ```
  - Reducir padding de sección: `pt-12 pb-20 lg:pt-20 lg:pb-32` → `pt-12 pb-12 lg:pt-16 lg:pb-20`
  - Reducir grid gap: `gap-16` → `gap-10 lg:gap-16`

  **Must NOT do**: NO cambiar el copy del hero (excelente según auditoría), NO eliminar blur effects

  **References**:
  - `HeroSection.tsx:42` — Button con `variant="primary"` (azul)
  - `HeroSection.tsx:12` — Padding excesivo que causa gap de 2 viewports
  - `HeroSection.tsx:21` — Grid `gap-16`
  - Referencia: Minvip/Civib muestran hero compacto con CTA verde

  **Commit**: `fix(landing): hero green CTA + reduce section gap`

- [ ] 3. ThemeToggle — Fix cyan light mode

  **What to do**:
  - `frontend/src/core/ui/ThemeToggle.tsx` (ÚNICA excepción fuera de `landing/`)
  - Cambiar `bg-surface-secondary` por clases explícitas:
    ```tsx
    // DESPUÉS:
    className="flex size-11 items-center justify-center rounded-full border border-hairline bg-canvas text-charcoal transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
    ```
  - Verificar íconos Sun/Moon/Monitor visibles en ambos temas

  **Must NOT do**: NO cambiar la lógica toggle, NO modificar otros archivos en `core/ui/`

  **References**:
  - `ThemeToggle.tsx:35,47` — `bg-surface-secondary` causa cyan en light mode
  - `ThemeToggle.tsx:51-53` — Renderizado condicional de íconos

  **Commit**: `fix(landing): theme toggle cyan light mode fix`

- [ ] 4. landing-data — Stats enriquecidos + datos de sectores y testimonios

  **What to do**:
  - `frontend/src/landing/landing-data.ts`
  - Enriquecer `LANDING_STATS` de 3 a 5 items:
    ```tsx
    export const LANDING_STATS = [
      { value: 15, suffix: "+", label: "Años de operación técnica" },
      { value: 8, suffix: "", label: "Líneas de servicio integradas" },
      { value: 14, suffix: "", label: "Pasos de trazabilidad operativa" },
      { value: 2, suffix: "", label: "Sedes operativas" },
      { value: 200, suffix: "+", label: "Servicios documentados" },
    ];
    ```
  - Crear `LANDING_SECTORS` (nueva constante):
    ```tsx
    export interface LandingSector {
      title: string;
      description: string;
      icon: ComponentType<{ className?: string }>;
    }
    export const LANDING_SECTORS: LandingSector[] = [
      { title: "Oil & Gas", description: "...", icon: Fuel },
      { title: "Sector Salud", description: "...", icon: Heart },
      { title: "Sector Público", description: "...", icon: Building },
      { title: "Industria", description: "...", icon: Factory },
      { title: "Comercio", description: "...", icon: Store },
    ];
    ```
  - Poblar `LANDING_TESTIMONIALS` con citas internas (código de ética, NO clientes ficticios):
    ```tsx
    export const LANDING_TESTIMONIALS = [
      { name: "Código de Ética Cermont", company: "Cermont S.A.S.",
        role: "Compromiso institucional",
        text: "Actuamos de forma coherente con nuestros compromisos...",
        initials: "CE" },
      { name: "Manual de Procedimientos", company: "Cermont S.A.S.",
        role: "Proceso operativo",
        text: "Cada servicio recorre una secuencia controlada...",
        initials: "MP" },
      { name: "Política de Calidad", company: "Cermont S.A.S.",
        role: "Estándar de calidad",
        text: "Nuestro compromiso es entregar trabajos técnicos...",
        initials: "PC" },
    ];
    ```

  **Must NOT do**: NO inventar testimonios de clientes, NO eliminar datos existentes

  **References**:
  - `landing-data.ts:323-327` — LANDING_STATS actual (3 items)
  - `landing-data.ts:329-335` — LANDING_TESTIMONIALS (array vacío)
  - `landing-data.ts:200-211` — LANDING_METRICS (2 items, mantener)

  **Commit**: `feat(landing): enrich stats + add sectors + testimonials data`

- [ ] 5. Icon Unification — Todos los íconos a verde de marca

  **What to do**:
  - **Verificar componentes que YA son verdes** (no tocar):
    - `cards/PrincipleCard.tsx:13` — `text-brand-green` ✅
    - `cards/ServiceCard.tsx:12` — `text-brand-green` ✅
    - `MethodSection.tsx:27` — `text-brand-green` ✅
    - `ContactSection.tsx:45,58,74,88` — `text-brand-annotate` ✅
  - **Fix AboutSection.tsx** (íconos grises):
    - Línea 37: `Globe className="size-5 text-charcoal"` → `text-green-600 dark:text-green-400`
    - Línea 46: `HardHat className="size-5 text-charcoal"` → `text-green-600 dark:text-green-400`
  - **Fix LandingFooter.tsx** (íconos sin color):
    - Línea 92: `Mail className="size-3.5"` → `className="size-3.5 text-green-600 dark:text-green-400"`
    - Línea 96: `MapPin className="mt-0.5 size-3.5"` → agregar `text-green-600 dark:text-green-400`
    - Línea 103: `PhoneCall className="size-3.5"` → agregar `text-green-600 dark:text-green-400`

  **Must NOT do**: NO cambiar íconos que ya son verdes

  **References**:
  - `AboutSection.tsx:37,46` — Globe/HardHat con `text-charcoal` (gris)
  - `LandingFooter.tsx:92,96,103` — Mail/MapPin/PhoneCall sin color
  - Referencia: Civib/Minvip muestran íconos verdes consistentes

  **Commit**: `fix(landing): unify all icons to brand green`

- [ ] 6. ServiceCard — Agregar CTA "Solicitar cotización"

  **What to do**:
  - `frontend/src/landing/components/cards/ServiceCard.tsx`
  - Agregar link CTA al final de cada tarjeta:
    ```tsx
    import { ArrowRight } from "lucide-react";
    // Después de <p> descripción:
    <div className="mt-4">
      <a href="#contacto"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 transition-colors hover:text-green-700 dark:hover:text-green-300">
        Solicitar cotización
        <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </div>
    ```

  **Must NOT do**: NO cambiar layout existente, NO usar Button component (link inline simple)

  **References**:
  - `cards/ServiceCard.tsx` — Archivo completo (19 líneas)
  - `cards/ResourceCard.tsx:19-27` — Patrón CTA link existente a seguir
  - Referencia: Civib "Learn More →" en cada tarjeta de servicio

  **Commit**: `feat(landing): add CTA to each service card`

- [ ] 7. ServicesSection — Grid 4 columnas desktop

  **What to do**:
  - `frontend/src/landing/components/ServicesSection.tsx`
  - Cambiar línea 21: `lg:grid-cols-3` → `lg:grid-cols-4`
  - 8 servicios / 4 columnas = 2 filas perfectas (sin columna vacía)

  **Must NOT do**: NO agregar servicios, NO cambiar SectionHeading

  **References**:
  - `ServicesSection.tsx:21` — Grid `lg:grid-cols-3` → `lg:grid-cols-4`
  - `landing-data.ts:149-198` — 8 LANDING_SERVICES

  **Commit**: `fix(landing): services 4-col grid desktop`

- [ ] 8. MethodSection — Conectores + CTA final

  **What to do**:
  - `frontend/src/landing/components/MethodSection.tsx`
  - Eliminar líneas verticales sueltas (líneas 39-50): `h-6 w-0.5` y `h-0.5 w-8`
  - Agregar CTA al final del grid:
    ```tsx
    import { ArrowRight } from "lucide-react";
    import { Button } from "@/core/ui/Button";
    // Después del grid de pasos:
    <div className="mt-12 text-center">
      <Button asChild size="lg" className="rounded-full px-8 bg-green-600 hover:bg-green-700 text-white">
        <a href="#contacto">
          ¿Listo para comenzar? Contáctenos
          <ArrowRight className="size-5 ml-2" aria-hidden="true" />
        </a>
      </Button>
    </div>
    ```

  **Must NOT do**: NO cambiar contenido de los 4 pasos, NO agregar pasos

  **References**:
  - `MethodSection.tsx:39-50` — Líneas conectoras a eliminar/reemplazar
  - `MethodSection.tsx:22` — Grid `lg:grid-cols-5`
  - Referencia: Civib "Our Process" con pasos conectados linealmente

  **Commit**: `fix(landing): method horizontal connectors + CTA`

- [ ] 9. AboutSection — Fix espacio vacío + íconos verdes

  **What to do**:
  - `frontend/src/landing/components/AboutSection.tsx`
  - Íconos: Globe y HardHat → `text-green-600 dark:text-green-400` (ya cubierto en T5)
  - Espacio vacío tarjeta derecha (línea 58): agregar encabezado antes de "Canales de referencia":
    ```tsx
    <article className="rounded-[2.25rem] border border-hairline bg-canvas p-8 lg:p-10 shadow-2 flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal">
        Presencia operativa
      </p>
      <h3 className="mt-3 text-xl font-semibold text-ink">Arauca y Bogotá</h3>
      <p className="mt-2 text-sm leading-6 text-charcoal">
        Dos sedes para atender requerimientos técnicos en las principales regiones.
      </p>
      <div className="mt-6 space-y-4">
        {/* contenido existente de direcciones */}
      </div>
    </article>
    ```

  **Must NOT do**: NO cambiar layout 2 columnas, NO eliminar direcciones

  **References**:
  - `AboutSection.tsx:58` — Tarjeta derecha con `justify-center` y espacio vacío
  - `AboutSection.tsx:37,46` — Íconos grises

  **Commit**: `fix(landing): about section empty space + green icons`

- [ ] 10. ContactSection — Botones CTA verdes

  **What to do**:
  - `frontend/src/landing/components/ContactSection.tsx`
  - Botón "Solicitar información" (línea 139): agregar `bg-green-600 hover:bg-green-700 text-white`
  - Botón "Acceso privado" (línea 145-152): mantener outline (ya correcto)

  **Must NOT do**: NO cambiar layout de tarjetas, NO eliminar info contacto

  **References**:
  - `ContactSection.tsx:139` — Button sin variant explícito
  - `ContactSection.tsx:145-152` — Button variant="outline" (correcto)

  **Commit**: `fix(landing): contact green CTA buttons`

- [ ] 11. Footer — Logo 48px + botón verde

  **What to do**:
  - `frontend/src/landing/components/LandingFooter.tsx`
  - Logo (línea 30): `size="md"` → `size="lg"` (48px)
  - Botón "Ingresar al sistema" (línea 121): agregar `bg-green-600 hover:bg-green-700 text-white`
  - Íconos contacto: `text-green-600 dark:text-green-400` (ya cubierto en T5)

  **Must NOT do**: NO cambiar estructura footer, NO eliminar navegación

  **References**:
  - `LandingFooter.tsx:30` — Logo `size="md"` → `"lg"`
  - `LandingFooter.tsx:121-123` — Botón sin color

  **Commit**: `fix(landing): footer logo 48px + green button`

- [ ] 12. StatsBar — Enriquecer + integrar en page flow

  **What to do**:
  - `frontend/src/landing/components/StatsBar.tsx`
  - Grid: `grid-cols-2 sm:grid-cols-4` → `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` (para 5 items)
  - `frontend/src/landing/components/PublicLandingContent.tsx`
  - Agregar `<StatsBar />` después de `<HeroSection />` y antes de `<TrustSection />`

  **Must NOT do**: NO cambiar diseño visual (gradient verde es correcto), NO eliminar countUp

  **References**:
  - `StatsBar.tsx:49` — Grid actual para 4 items
  - `PublicLandingContent.tsx:29-31` — Insertar entre Hero y Trust
  - `hooks/useCountUp.ts` — Hook de animación existente
  - Referencia: Minvip/Civib muestran stats bar después del hero

  **Commit**: `feat(landing): enrich stats bar + integrate into page`

- [ ] 13. SectorsSection — Nueva sección de sectores industriales

  **What to do**:
  - **Crear** `frontend/src/landing/components/SectorsSection.tsx`
  - Usar datos `LANDING_SECTORS` de T4
  - Layout: SectionHeading center + grid 3 cols (2 mobile, 3 desktop)
  - Cada tarjeta: ícono verde wrapper + título + descripción
  - Integrar en `PublicLandingContent.tsx` después de ServicesSection

  **Estructura**:
  ```tsx
  import { LANDING_SECTORS } from "../landing-data";
  import { SectionHeading } from "./SectionHeading";

  export function SectorsSection() {
    return (
      <section id="sectores" data-landing-section aria-labelledby="sectors-heading"
        className="bg-surface py-16 sm:py-20 lg:py-24 scroll-mt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading id="sectors-heading" eyebrow="Sectores"
            title="Industrias que confían en nuestra operación."
            description="Acompañamos requerimientos técnicos en múltiples sectores."
            align="center" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_SECTORS.map((sector) => {
              const Icon = sector.icon;
              return (
                <article key={sector.title}
                  className="rounded-2xl border border-hairline bg-canvas p-6 shadow-1 transition-shadow hover:shadow-2">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950">
                    <Icon className="size-6 text-green-700 dark:text-green-400" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{sector.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal">{sector.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
  ```

  **Must NOT do**: NO inventar clientes, NO crear barrel exports

  **References**:
  - `landing-data.ts` — LANDING_SECTORS (creado en T4)
  - `cards/ServiceCard.tsx` — Patrón de tarjeta con ícono wrapper verde
  - `SectionHeading.tsx` — Componente reutilizable
  - Referencia: Civib "What We Build" con tarjetas de sector

  **Commit**: `feat(landing): new sectors section with 5 industries`

- [ ] 14. TestimonialsSection — Poblar + integrar

  **What to do**:
  - `TestimonialsSection.tsx` YA EXISTE (78 líneas) — NO modificar el componente
  - LANDING_TESTIMONIALS ya poblado en T4 (3 items, citas internas)
  - Integrar en `PublicLandingContent.tsx` después de MethodSection

  **Must NOT do**: NO modificar componente TestimonialsSection, NO inventar testimonios

  **References**:
  - `TestimonialsSection.tsx` — Componente completo con Quote icon, initials avatar, cards
  - `landing-data.ts:329-335` — LANDING_TESTIMONIALS (poblado en T4)

  **Commit**: `feat(landing): integrate testimonials with internal citations`

- [ ] 15. FaqSection — Expandir con preguntas B2B

  **What to do**:
  - `frontend/src/landing/data/faq-data.ts`
  - Agregar 3 preguntas B2B después de las 8 existentes:
    ```tsx
    {
      question: "¿En cuánto tiempo puedo esperar una visita técnica?",
      answer: "El equipo comercial coordina una visita en 3 a 5 días hábiles según zona y disponibilidad.",
      category: "process",
    },
    {
      question: "¿Cermont entrega informes formales al cierre del servicio?",
      answer: "Sí. Cada servicio incluye informe técnico, acta de entrega y soportes documentales.",
      category: "documentation",
    },
    {
      question: "¿Trabajan con empresas del sector petrolero?",
      answer: "Cermont ofrece servicios que pueden aplicar al sector petrolero. La conversación inicial evalúa el alcance.",
      category: "services",
    },
    ```

  **Must NOT do**: NO eliminar preguntas existentes, NO cambiar lógica accordion

  **References**:
  - `data/faq-data.ts` — 8 preguntas existentes (56 líneas)
  - `FaqSection.tsx` — Componente accordion (76 líneas)

  **Commit**: `feat(landing): expand FAQ with 3 B2B questions`

- [ ] 16. OperationalEvidence — 3 imágenes + disclaimer unificado

  **What to do**:
  - `frontend/src/landing/components/OperationalEvidenceSection.tsx`
  - Quitar `.slice(1)` en línea 22 para mostrar las 3 imágenes
  - Grid: `sm:grid-cols-2` → `sm:grid-cols-2 lg:grid-cols-3`
  - Disclaimer unificado en el componente (override de datos):
    ```
    "Imágenes ilustrativas del contexto de trabajo. No constituyen evidencia de servicios, clientes o resultados específicos."
    ```

  **Must NOT do**: NO agregar imágenes nuevas, NO cambiar landing-data.ts

  **References**:
  - `OperationalEvidenceSection.tsx:22` — `.slice(1)` excluye primera imagen
  - `landing-data.ts:294-319` — 3 LandingVisualAssets con disclosures diferentes

  **Commit**: `fix(landing): gallery 3 images + unified disclaimer`

- [ ] 17. Resources — Badges coloreados por tipo + íconos

  **What to do**:
  - `frontend/src/landing/components/cards/ResourceCard.tsx`
  - Badge: mostrar `meta` (Contacto/Aplicación/Legal) en vez de "Acceso"
  - Color por tipo:
    ```tsx
    const badgeClasses: Record<string, string> = {
      Contacto: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      Aplicación: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      Legal: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
    ```
  - Agregar ícono pequeño: Contacto→Mail, Aplicación→LogIn, Legal→Scale

  **Must NOT do**: NO cambiar layout tarjeta, NO eliminar "Abrir recurso"

  **References**:
  - `cards/ResourceCard.tsx:12-14` — Badge actual "Acceso" gris
  - `landing-data.ts:58-64` — LandingResource con `meta` field
  - Referencia: Shoelpv muestra badges coloreados por categoría

  **Commit**: `fix(landing): resource badges colored by type + icons`

- [ ] 18. CTA — Textura/patrón de fondo premium

  **What to do**:
  - `frontend/src/landing/components/CtaSection.tsx`
  - Agregar textura sutil al fondo (reemplazar bg liso):
    ```tsx
    <section className="relative overflow-hidden bg-canvas-dark py-16 sm:py-20 lg:py-24">
      {/* Grid pattern sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--color-hairline)_1px,transparent_1px),linear-gradient(90deg,var(--color-hairline)_1px,transparent_1px)] bg-[size:48px_48px] opacity-15" />
      {/* Glow verde */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in srgb,var(--color-brand-green)_8%,transparent),transparent_70%)] opacity-40" />
      {/* contenido existente */}
    </section>
    ```

  **Must NOT do**: NO cambiar copy, NO agregar imágenes de fondo

  **References**:
  - `CtaSection.tsx:9` — bg-canvas py-20 lg:py-32 (fondo liso)
  - `HeroSection.tsx:18` — Grid pattern existente en hero a replicar

  **Commit**: `fix(landing): CTA textured background pattern`

- [ ] 19. PublicLandingContent — Actualizar page flow completo

  **What to do**:
  - `frontend/src/landing/components/PublicLandingContent.tsx`
  - Reordenar y agregar secciones nuevas:
    ```tsx
    import { StatsBar } from "./StatsBar";
    import { SectorsSection } from "./SectorsSection";
    import { TestimonialsSection } from "./TestimonialsSection";

    // Page flow optimizado para conversión B2B:
    <HeroSection />
    <StatsBar />                    // NUEVO — métricas de impacto
    <TrustSection />
    <ServicesSection />
    <SectorsSection />              // NUEVO — sectores industriales
    <MethodSection />
    <TestimonialsSection />         // NUEVO — prueba social
    <OperationalEvidenceSection />
    <ResourcesSection />
    <AboutSection />
    <MissionVisionSection />
    <FaqSection />
    <CtaSection />
    <ContactSection />
    ```
  - Orden responde las 5 preguntas del cliente B2B:
    1. "¿Qué hace?" → Hero
    2. "¿Tienen experiencia?" → StatsBar + TrustSection
    3. "¿Qué servicios?" → Services + Sectors
    4. "¿Cómo trabajan?" → Method
    5. "¿Cómo los contacto?" → Testimonials → ... → Contact

  **Must NOT do**: NO eliminar secciones, NO cambiar AnalyticsTracker, NO cambiar skip-to-content

  **References**:
  - `PublicLandingContent.tsx` — Page flow actual (47 líneas)
  - Todos los componentes importados deben existir ya

  **Commit**: `feat(landing): reorder page flow for B2B conversion`

---

## Commit Strategy

| Wave | Commits |
|------|---------|
| Wave 1 | `fix(landing): navbar logo 48px + hero green CTA + theme toggle fix + icon unification + data enrichment` |
| Wave 2 | `fix(landing): service CTA + 4-col grid + method connectors + about fix + contact green + footer green` |
| Wave 3 | `feat(landing): stats integration + sectors section + testimonials + FAQ expansion` |
| Wave 4 | `fix(landing): gallery 3 images + resource badges + CTA texture + page flow update` |

---

## Success Criteria

- 0 instancias de `blue-500`/`blue-600`/`blue-700` en CTA buttons
- Logo 48px en navbar y footer
- Nav single row en 1280px
- 5 stats con countUp animation
- 3 testimonios con contenido
- 5 sectores industriales
- 8 service cards con CTA
- Method con CTA final
- 10+ FAQ preguntas
- 3 galería imágenes
- Resources con badges coloreados
- CTA texturizado
- Spacing uniforme (no gaps > 120px entre secciones)
