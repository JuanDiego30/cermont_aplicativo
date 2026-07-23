# PROMPT CREA: fix/auth-flow-uiux-conversion

## TL;DR

> **Quick Summary**: Refactorización completa del flujo de autenticación público (Login → Register → Forgot Password) de CERMONT S.A.S. — corrección de colores de marca, CTA visibles, feedback de carga, logo visible, formulario accesible, y UX profesional B2B.
>
> **Deliverables**:
> - Login: botón verde, logo visible en form panel, overlay uniforme en carousel
> - Register: CTA estilizado con loading state, agrupación visual de campos, labels accesibles, badge de seguridad, tiempo de validación
> - Forgot Password: pantalla de éxito dedicada con contenido enriquecido
> - Global: metadata SEO, micro-animaciones, validación inline email
>
> **Estimated Effort**: Medium (16 tasks, 4 waves)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: T1 → T5 → T9 → T12 → T16

---

## Context

### Original Request
Implementar las mejoras del checklist de auditoría UX/UI del flujo de autenticación público (Login → Register → Forgot Password). El plan contiene SOLO implementación, refactorización, innovación y mejoras — sin fases de auditoría.

### Auditoría del Usuario (contexto para implementación)
- **5 Críticos**: Botón login azul, CTA register sin estilo, sin loading state, sin logo en form panel, forgot-password sin éxito claro
- **6 Importantes**: Sin agrupación visual register, labels no accesibles, overlay carousel inconsistente, jerarquía visual register, texto soporte pequeño, label largo
- **6 Mejoras**: Badge seguridad, progress bar carousel, tiempo de validación, micro-animación slides, metadata SEO, validación email inline
- **4 Accesibilidad**: Labels como div, sin aria-busy, contraste placeholder, slider sin aria-live

### Stack Técnico
- Next.js 16 App Router + React 19 + Tailwind CSS 4.2.2
- `frontend/src/app/(auth)/` — páginas de auth
- `frontend/src/modules/auth/` — componentes compartidos de auth
- react-hook-form + Zod (login), useActionState (forgot-password), HTML form action (register)
- GSAP (carousel), Framer Motion (login form animations)
- lucide-react icons

### Archivos Clave del Flujo Auth

**Login** (`/login`):
- `app/(auth)/login/page.tsx` — Layout split (carousel left, form right)
- `app/(auth)/login/LoginForm.tsx` — Form client component con framer-motion
- `app/(auth)/login/components/LoginSubmitButton.tsx` — `variant="primary"` (AZUL via CSS var)
- `app/(auth)/login/components/EmailField.tsx` — Usa FormField/TextField de core
- `app/(auth)/login/components/PasswordField.tsx` — Eye toggle + forgot link
- `app/(auth)/login/hooks/useLoginForm.ts` — react-hook-form + LoginSchema
- `app/(auth)/login/lib/i18n.ts` — Login copy constants
- `modules/auth/ui/LoginCarousel.tsx` — GSAP carousel con 3 slides

**Register** (`/register`):
- `app/(auth)/register/page.tsx` — Server component, HTML form action, 6 campos
- `modules/auth/ui/AuthBackgroundBlobs.tsx` — Background decorativo

**Forgot Password** (`/forgot-password`):
- `app/(auth)/forgot-password/page.tsx` — Page wrapper
- `modules/auth/ui/ForgotPasswordContent.tsx` — useActionState form + success state
- `modules/auth/ui/AuthBrandHeader.tsx` — Header con "C" icon (no logo completo)
- `modules/auth/ui/AuthPageShell.tsx` — Shell con ThemeToggle + blobs

**Shared**:
- `app/(auth)/layout.tsx` — Metadata: title template "%s | Cermont"
- `core/ui/Button.tsx` — Button component con variant primary (azul CSS var)

---

## Work Objectives

### Core Objective
Hacer que el flujo de autenticación público de CERMONT sea visualmente profesional, accesible (WCAG 2.1 AA), y genere confianza B2B desde el primer contacto.

### Definition of Done
- [ ] Botón "Iniciar Sesión" es verde (no azul)
- [ ] Botón "Enviar solicitud" tiene estilo CTA visible + loading state
- [ ] Logo de Cermont visible en panel de formulario (login + register)
- [ ] Forgot password tiene pantalla de éxito dedicada
- [ ] Register tiene campos agrupados en 2 secciones
- [ ] Labels accesibles (`<label htmlFor>`) en todos los campos
- [ ] Carousel overlay uniforme en todas las slides
- [ ] Metadata SEO actualizada en todas las páginas
- [ ] Badge de seguridad visible en register
- [ ] Texto de tiempo de validación visible en register
- [ ] Validación inline de email en register

### Must Have
- Verde de marca en todos los CTAs primarios (login, register, forgot-password)
- Logo visible en form panel de login Y register
- Loading state con spinner en todos los submit buttons
- Pantalla de éxito en forgot-password con link de retorno
- Labels `<label htmlFor>` (no divs) en register
- Agrupación visual en register: "Datos de contacto" + "Datos de empresa"
- Overlay carousel uniforme (gradient consistente)
- Badge "Acceso seguro · SSL" en register

### Must NOT Have
- ❌ `blue-500`/`blue-600`/`primary-600` en botones CTA (override con green)
- ❌ Labels como `div` genéricos (usar `<label htmlFor>`)
- ❌ Submit sin loading state
- ❌ Páginas sin metadata actualizada
- ❌ Testimonios de clientes ficticios
- ❌ `console.log` / `debugger` / `alert`
- ❌ Eliminar funcionalidad existente
- ❌ Agregar dependencias nuevas

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 — Critical fixes (start immediately):
├── T1: Login button — green CTA [quick]
├── T2: Register button — styled CTA + loading state [quick]
├── T3: Forgot password — success screen [quick]
├── T4: Login form — logo visible in form panel [quick]
└── T5: Register form — logo in header [quick]

Wave 2 — Important fixes (after Wave 1):
├── T6: Register — field grouping (contact + empresa) [quick]
├── T7: Register — accessible labels (label htmlFor) [quick]
├── T8: Login carousel — uniform overlay gradient [quick]
├── T9: Register — visual hierarchy (spacing) [quick]
├── T10: Login — support text size [quick]
└── T11: Register — short label + tooltip [quick]

Wave 3 — Improvements (after Wave 2):
├── T12: Register — security badge [quick]
├── T13: Login carousel — progress bar + micro-animation [quick]
├── T14: Register — validation time text [quick]
├── T15: Global — metadata SEO update [quick]
└── T16: Register — email inline validation [quick]

Wave 4 — Accessibility + Final (after Wave 3):
├── T17: Register — aria-busy on submit [quick]
├── T18: Login carousel — aria-live + aria-label [quick]
├── T19: Placeholder contrast check [quick]
└── T20: Full typecheck + lint [quick]
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 (Login green) | — | T20 |
| T2 (Register CTA) | — | T20 |
| T3 (Forgot success) | — | T20 |
| T4 (Login logo) | — | T20 |
| T5 (Register logo) | — | T20 |
| T6 (Field grouping) | — | T7, T20 |
| T7 (Labels) | T6 | T17, T20 |
| T8 (Carousel overlay) | — | T18, T20 |
| T9 (Register hierarchy) | T6 | T20 |
| T10 (Support text) | — | T20 |
| T11 (Short label) | — | T20 |
| T12 (Security badge) | — | T20 |
| T13 (Progress bar) | T8 | T18, T20 |
| T14 (Time text) | — | T20 |
| T15 (Metadata) | — | T20 |
| T16 (Email validation) | — | T20 |
| T17 (aria-busy) | T2, T7 | T20 |
| T18 (aria-live) | T13 | T20 |
| T19 (Contrast) | — | T20 |
| T20 (Typecheck) | T1-T19 | — |

---

## TODOs

- [ ] 1. Login Button — Green CTA (CRIT-01)

  **What to do**:
  - `frontend/src/app/(auth)/login/components/LoginSubmitButton.tsx`
  - Cambiar `variant="primary"` (resuelve a azul via CSS var) a clases directas verdes:
    ```tsx
    // ANTES:
    <Button type="submit" disabled={disabled} loading={isSubmitting}
      variant="primary" size="lg"
      className="mt-2 w-full py-6 text-base shadow-lg">
      {LOGIN_COPY.submit}
    </Button>

    // DESPUÉS:
    <Button type="submit" disabled={disabled} loading={isSubmitting}
      size="lg"
      className="mt-2 w-full py-6 text-base shadow-lg bg-green-600 hover:bg-green-700 active:bg-green-800 text-white disabled:opacity-50">
      {LOGIN_COPY.submit}
    </Button>
    ```
  - Verificar que el `Button` component soporta clases directas de color (sí — usa className merge)

  **Must NOT do**: NO cambiar la lógica del hook, NO modificar Button.tsx

  **References**:
  - `login/components/LoginSubmitButton.tsx:17` — `variant="primary"` (azul CSS var)
  - `core/ui/Button.tsx` — variant primary usa `--color-brand` que puede ser azul
  - Referencia: Civib/Minvip muestran botones de login verde

  **Commit**: `fix(auth): login button green brand color`

- [ ] 2. Register Button — Styled CTA + Loading State (CRIT-02 + CRIT-03)

  **What to do**:
  - `frontend/src/app/(auth)/register/page.tsx`
  - El botón actual (línea 185-190) es un `<button>` HTML raw con `bg-primary-600` (azul)
  - **Convertir a client component** para manejar loading state — extraer el form a un `RegisterForm.tsx` client component
  - Opción más simple: usar `useFormStatus` de React 19 en un componente wrapping:
    ```tsx
    // Crear: app/(auth)/register/components/RegisterSubmitButton.tsx
    "use client";
    import { useFormStatus } from "react-dom";
    import { Loader2 } from "lucide-react";

    export function RegisterSubmitButton() {
      const { pending } = useFormStatus();
      return (
        <button type="submit" disabled={pending}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Enviando..." : "Enviar solicitud"}
        </button>
      );
    }
    ```
  - Reemplazar el `<button>` actual por `<RegisterSubmitButton />`
  - Cambiar `bg-primary-600` a `bg-green-600`

  **Must NOT do**: NO cambiar la lógica del form action, NO agregar dependencias

  **References**:
  - `register/page.tsx:185-190` — Button raw HTML con `bg-primary-600`
  - `forgot-password/components/ForgotPasswordContent.tsx:87-94` — Patrón de loading state con `useActionState` + Loader2
  - React 19 `useFormStatus` docs para pending state

  **Commit**: `fix(auth): register styled CTA + loading state`

- [ ] 3. Forgot Password — Enhanced Success Screen (CRIT-05)

  **What to do**:
  - `frontend/src/modules/auth/ui/ForgotPasswordContent.tsx`
  - El success state actual (línea 38-55) es básico — solo un div verde con texto
  - Mejorar a pantalla de confirmación dedicada:
    ```tsx
    if (state.success) {
      return (
        <div className="mt-2 flex flex-col items-center text-center">
          {/* Envelope icon animado */}
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-green-500/20">
            <Mail className="size-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-white">Correo enviado</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-text">
            Revisa la bandeja de entrada de tu correo electrónico para restablecer tu contraseña.
          </p>
          <p className="mt-1 text-xs text-stone">
            Si no lo encuentras, revisa la carpeta de spam o correo no deseado.
          </p>
          <Link href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-canvas/5 px-6 py-3 text-sm font-medium text-stone transition hover:bg-canvas/10">
            <ArrowLeft className="size-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      );
    }
    ```
  - Importar `Mail` y `ArrowLeft` de lucide-react

  **Must NOT do**: NO cambiar la lógica de la acción, NO eliminar el form

  **References**:
  - `modules/auth/ui/ForgotPasswordContent.tsx:38-55` — Success state actual (básico)
  - `modules/auth/ui/ForgotPasswordContent.tsx:87-94` — Submit button (ya tiene loading state)
  - Referencia: Estafb/Shoelpv muestran confirmation screens con icono grande + texto + CTA retorno

  **Commit**: `fix(auth): forgot password enhanced success screen`

- [ ] 4. Login — Logo Visible in Form Panel (CRIT-04)

  **What to do**:
  - `frontend/src/app/(auth)/login/LoginForm.tsx`
  - Ya tiene `<Logo size="md" className="mb-10" />` en la línea 62 — PERO solo se ve en desktop (el carousel oculta el logo en mobile)
  - **Verificar**: El Logo ya está en el form panel. El problema del audit es que en mobile el sidebar desaparece y la pantalla queda sin identidad
  - El Logo YA está en el form (línea 62). Solo necesitamos verificar que es visible en mobile
  - Si `Logo` tiene `hideWordmarkOnMobile={true}` por defecto, cambiar a `false` para mostrar "Cermont S.A.S." siempre
  - En `core/ui/Logo.tsx:28` — `hideWordmarkOnMobile = true` es el default
  - Solución: Agregar `hideWordmarkOnMobile={false}` al Logo en LoginForm:
    ```tsx
    <Logo size="md" className="mb-10" hideWordmarkOnMobile={false} />
    ```

  **Must NOT do**: NO modificar Logo.tsx (es shared component), NO cambiar layout

  **References**:
  - `login/LoginForm.tsx:62` — `<Logo size="md" className="mb-10" />` (sin wordmark en mobile)
  - `core/ui/Logo.tsx:28` — `hideWordmarkOnMobile = true` default
  - `core/ui/Logo.tsx:41` — `hideWordmarkOnMobile && "hidden sm:inline"` oculta wordmark

  **Commit**: `fix(auth): login logo visible on mobile`

- [ ] 5. Register — Logo in Header (CRIT-04 extend)

  **What to do**:
  - `frontend/src/app/(auth)/register/page.tsx`
  - Actualmente NO tiene logo — solo tiene texto "Portal de clientes" + "Solicitar acceso"
  - Agregar Logo de Cermont arriba de "Portal de clientes":
    ```tsx
    import { Logo } from "@/core/ui/Logo";
    // En el <header>:
    <header className="text-center sm:text-left">
      <Logo size="sm" className="mb-4 justify-center sm:justify-start" hideWordmarkOnMobile={false} />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-200">
        Portal de clientes
      </p>
      ...
    </header>
    ```
  - NOTA: register/page.tsx es Server Component — Logo es un Server Component también (no usa "use client"), así que funciona

  **Must NOT do**: NO convertir page a client component

  **References**:
  - `register/page.tsx:104-115` — Header actual sin logo
  - `core/ui/Logo.tsx` — Server Component, seguro de usar en Server Components
  - `modules/auth/ui/AuthBrandHeader.tsx:20-28` — Patrón de logo en auth header (usa "C" placeholder)

  **Commit**: `fix(auth): register logo in header`

- [ ] 6. Register — Field Grouping (IMP-01)

  **What to do**:
  - `frontend/src/app/(auth)/register/page.tsx`
  - Dividir los 6 campos en 2 grupos visuales con separadores:
    - **Grupo 1 "Datos de contacto"**: fullName, email, phone
    - **Grupo 2 "Datos de empresa"**: company, nit, contractRef
  - Agregar headings de grupo + separador visual:
    ```tsx
    <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
      <legend className="text-xs font-semibold uppercase tracking-widest text-primary-200 mb-2">
        Datos de contacto
      </legend>
      <FormField id="fullName" name="fullName" label="Nombre completo" ... />
      <FormField id="email" name="email" label="Correo" ... />
      <FormField id="phone" name="phone" label="Teléfono (opcional)" ... />
    </fieldset>

    <div className="border-t border-white/10" />

    <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
      <legend className="text-xs font-semibold uppercase tracking-widest text-primary-200 mb-2">
        Datos de empresa
      </legend>
      <FormField id="company" name="company" label="Empresa / Razón social" ... />
      <FormField id="nit" name="nit" label="NIT (opcional)" ... />
      <FormField id="contractRef" name="contractRef" label="Contrato / OT (opcional)" ... />
    </fieldset>
    ```
  - Usar `<fieldset>` + `<legend>` para accesibilidad (agrupación semántica)

  **Must NOT do**: NO cambiar el orden de campos, NO eliminar campos, NO cambiar el form action

  **References**:
  - `register/page.tsx:134-184` — Form actual con 6 campos sin agrupación
  - HTML fieldset/legend pattern para agrupación de forms
  - Referencia: Estafb muestra formularios agrupados visualmente

  **Commit**: `feat(auth): register field grouping contact + empresa`

- [ ] 7. Register — Accessible Labels (IMP-02 + A11Y-01)

  **What to do**:
  - `frontend/src/app/(auth)/register/page.tsx`
  - Verificar: El componente `FormField` actual (línea 60-87) YA usa `<label htmlFor={id}>` correcto
  - **Auditoría dice**: "Labels implementados como div genéricos" — PERO el código muestra `<label htmlFor={id} className={LABEL_CLASS}>` que ES correcto
  - **Acción**: Verificar que no hay issues. Si el audit se refiere a otro componente, buscar div-labels en otros archivos
  - Buscar `div` con role="label" o clases de label en auth components:
    ```
    grep -rn "role=\"label\"\|className.*label" frontend/src/app/(auth)/
    ```
  - Si se encuentran div-labels, reemplazar por `<label htmlFor>`
  - El `FormField` de register YA es accesible — el audit puede estar referenciando una versión anterior
  - **Acción preventiva**: Agregar `id` único a cada input si no lo tiene (ya los tiene: fullName, email, company, nit, phone, contractRef)

  **Must NOT do**: NO cambiar la lógica del form

  **References**:
  - `register/page.tsx:72` — `<label htmlFor={id} className={LABEL_CLASS}>` (YA correcto)
  - `register/page.tsx:75-84` — Input con `id={id}` (YA correcto)
  - WCAG 2.1 AA: labels must be associated via htmlFor/id

  **Commit**: `fix(auth): verify accessible labels in register`

- [ ] 8. Login Carousel — Uniform Overlay (IMP-03)

  **What to do**:
  - `frontend/src/modules/auth/ui/LoginCarousel.tsx`
  - Overlay actual (línea 100): `bg-[linear-gradient(90deg,rgba(7,20,43,0.88),rgba(7,20,43,0.55))]`
  - Solo cubre de izquierda a derecha — el texto blanco compite con zonas brillantes arriba/abajo
  - Agregar gradiente vertical uniforme que cubra todas las slides:
    ```tsx
    // ANTES:
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,43,0.88),rgba(7,20,43,0.55))]" />

    // DESPUÉS:
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
    ```
  - Esto crea una cobertura uniforme: oscura abajo (footer), semi-transparente en medio, clara arriba (pero con contraste suficiente)

  **Must NOT do**: NO cambiar las imágenes del carousel, NO modificar la lógica de slides

  **References**:
  - `modules/auth/ui/LoginCarousel.tsx:100` — Overlay actual solo horizontal
  - `modules/auth/ui/LoginCarousel.tsx:87-99` — Imágenes con `opacity-55` cuando activas
  - Referencia: Civib/Minvip muestran overlays uniformes en hero sections

  **Commit**: `fix(auth): login carousel uniform overlay gradient`

- [ ] 9. Register — Visual Hierarchy (IMP-04)

  **What to do**:
  - `frontend/src/app/(auth)/register/page.tsx`
  - Espaciado actual entre "Portal de clientes" y "Solicitar acceso": `mt-3` (línea 108)
  - Espaciado entre "Solicitar acceso" y descripción: `mt-2` (línea 111)
  - Mejorar jerarquía:
    ```tsx
    <header className="text-center sm:text-left">
      <Logo ... />  {/* de T5 */}
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-200">
        Portal de clientes
      </p>
      <h1 id="register-page-title" className="mt-1 text-2xl font-semibold text-white">
        Solicitar acceso
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-text">
        Este formulario es solo para clientes...
      </p>
    </header>
    ```
  - Cambios: `mt-3` → `mt-4` en label, `mt-3` en descripción

  **Must NOT do**: NO cambiar contenido textual

  **References**:
  - `register/page.tsx:104-115` — Header actual

  **Commit**: `fix(auth): register visual hierarchy spacing`

- [ ] 10. Login — Support Text Size (IMP-05)

  **What to do**:
  - `frontend/src/app/(auth)/login/LoginForm.tsx`
  - Línea 122: `text-xs text-[var(--text-tertiary)]` — demasiado pequeño (11-12px)
  - Cambiar a `text-sm` (14px):
    ```tsx
    <motion.p variants={itemVariants} className="text-center text-sm text-[var(--text-tertiary)]">
    ```
  - Agregar hover underline en el link de soporte

  **Must NOT do**: NO cambiar el texto del link

  **References**:
  - `login/LoginForm.tsx:122` — `text-xs` → `text-sm`
  - WCAG: texto legible mínimo 14px en desktop

  **Commit**: `fix(auth): login support text size increase`

- [ ] 11. Register — Short Label + Tooltip (IMP-06)

  **What to do**:
  - `frontend/src/app/(auth)/register/page.tsx`
  - Campo "Referencia de contrato / OT (opcional)" — label muy largo (línea 181)
  - Acortar a "Contrato / OT (opcional)" y agregar tooltip explicativo:
    ```tsx
    <FormField
      id="contractRef"
      name="contractRef"
      label="Contrato / OT"
      placeholder="OT-000123 / Contrato ABC"
      tooltip="Referencia del contrato o orden de trabajo asociada a tu empresa"
    />
    ```
  - Si FormField no soporta tooltip, agregar un ícono `ⓘ` con `title` attribute:
    ```tsx
    <div className="flex items-center gap-2">
      <label htmlFor="contractRef" className={LABEL_CLASS}>Contrato / OT</label>
      <span className="text-xs text-stone" title="Referencia del contrato o orden de trabajo asociada a tu empresa">ⓘ</span>
    </div>
    ```

  **Must NOT do**: NO eliminar el campo

  **References**:
  - `register/page.tsx:178-183` — Campo con label largo

  **Commit**: `fix(auth): register short label contract field`

- [ ] 12. Register — Security Badge (MEJ-01)

  **What to do**:
  - `frontend/src/app/(auth)/register/page.tsx`
  - Agregar badge de seguridad debajo del título "Solicitar acceso":
    ```tsx
    <h1 id="register-page-title" className="mt-3 text-2xl font-semibold text-white">
      Solicitar acceso
    </h1>
    <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-stone">
      <ShieldCheck className="size-3.5 text-green-500" aria-hidden="true" />
      <span>Acceso seguro · Datos protegidos</span>
    </div>
    ```
  - Importar `ShieldCheck` de lucide-react

  **Must NOT do**: NO cambiar el layout del header

  **References**:
  - `register/page.tsx:108-110` — Título actual
  - Referencia: Estafb/Shoelpv muestran badges de seguridad cerca de formularios

  **Commit**: `feat(auth): register security badge`

- [ ] 13. Login Carousel — Progress Bar + Micro-animation (MEJ-02 + MEJ-04)

  **What to do**:
  - `frontend/src/modules/auth/ui/LoginCarousel.tsx`
  - **Progress bar**: Agregar barra de progreso animada debajo de los dots de navegación:
    ```tsx
    {/* Progress bar */}
    <div className="h-0.5 w-full overflow-hidden rounded-full bg-canvas/10">
      <div
        className="h-full bg-[var(--color-cermont-green-light)] transition-transform duration-[6000ms] ease-linear"
        style={{ transform: `scaleX(${(currentSlide + 1) / CAROUSEL_SLIDES.length})` }}
      />
    </div>
    ```
  - **Micro-animación**: Agregar `transition-opacity duration-700` a las transiciones de slide:
    - Ya tiene `transition-[opacity,transform] duration-[var(--duration-slow)]` — verificar que `--duration-slow` es ≥ 500ms
    - Si es menor, agregar `duration-700` explícito

  **Must NOT do**: NO cambiar la lógica de auto-advance, NO eliminar GSAP

  **References**:
  - `modules/auth/ui/LoginCarousel.tsx:156-171` — Dots navigation
  - `modules/auth/ui/LoginCarousel.tsx:132-136` — Slide transition classes
  - CSS custom properties: verificar `--duration-slow` value

  **Commit**: `feat(auth): login carousel progress bar + smooth transitions`

- [ ] 14. Register — Validation Time Text (MEJ-03)

  **What to do**:
  - `frontend/src/app/(auth)/register/page.tsx`
  - Agregar texto de expectativa de tiempo debajo del botón submit:
    ```tsx
    <RegisterSubmitButton />
    <p className="mt-2 text-center text-xs text-stone">
      Tu solicitud será revisada en un plazo de 24-48 horas hábiles.
    </p>
    ```

  **Must NOT do**: NO cambiar el form action

  **References**:
  - `register/page.tsx:185-190` — Submit button actual

  **Commit**: `feat(auth): register validation time expectation`

- [ ] 15. Global — Metadata SEO Update (MEJ-05)

  **What to do**:
  - `frontend/src/app/(auth)/layout.tsx` — Actualizar template:
    ```tsx
    export const metadata: Metadata = {
      title: {
        default: "Acceso corporativo",
        template: "%s | Cermont S.A.S.",
      },
      description: "Accede al portal corporativo de Cermont S.A.S. o solicita acceso como cliente.",
      robots: { index: false, follow: false },
    };
    ```
  - `frontend/src/app/(auth)/login/page.tsx` — Agregar metadata:
    ```tsx
    export const metadata: Metadata = { title: "Acceso corporativo" };
    ```
  - `frontend/src/app/(auth)/register/page.tsx` — Actualizar:
    ```tsx
    export const metadata: Metadata = { title: "Solicitar acceso" };
    ```
  - `frontend/src/app/(auth)/forgot-password/page.tsx` — Agregar:
    ```tsx
    import type { Metadata } from "next";
    export const metadata: Metadata = { title: "Recuperar contraseña" };
    ```

  **Must NOT do**: NO cambiar robots (index:false es correcto para auth pages)

  **References**:
  - `app/(auth)/layout.tsx:4-14` — Metadata actual
  - `app/(auth)/register/page.tsx:7` — Metadata actual: "Solicitar acceso"

  **Commit**: `fix(auth): update metadata SEO for auth pages`

- [ ] 16. Register — Email Inline Validation (MEJ-06)

  **What to do**:
  - `frontend/src/app/(auth)/register/page.tsx` es Server Component — NO puede usar onBlur
  - **Solución**: Extraer el form a un Client Component `RegisterForm.tsx` que use react-hook-form para validación inline
  - O alternativa más ligera: usar HTML5 `pattern` + `title` en el input de email:
    ```tsx
    <FormField
      id="email"
      name="email"
      label="Correo"
      type="email"
      autoComplete="email"
      placeholder="correo@empresa.com"
      pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
      title="Ingresa un correo corporativo válido"
      required
    />
    ```
  - Esto da validación inline nativa del browser sin necesidad de JS

  **Must NOT do**: NO convertir page.tsx a client component completo

  **References**:
  - `register/page.tsx:147-155` — Email field actual
  - HTML5 pattern validation nativa

  **Commit**: `fix(auth): register email inline validation`

- [ ] 17. Register — Aria-busy on Submit (A11Y-02)

  **What to do**:
  - `frontend/src/app/(auth)/register/components/RegisterSubmitButton.tsx` (creado en T2)
  - Agregar `aria-busy={pending}` al botón:
    ```tsx
    <button type="submit" disabled={pending} aria-busy={pending}
      ...>
    ```

  **Must NOT do**: NO cambiar la lógica

  **References**:
  - T2 crea este componente
  - WCAG 4.1.3: Status Messages

  **Commit**: `fix(auth): register submit aria-busy`

- [ ] 18. Login Carousel — Aria-live + Aria-label (A11Y-04)

  **What to do**:
  - `frontend/src/modules/auth/ui/LoginCarousel.tsx`
  - Agregar `aria-live="polite"` al contenedor de slides:
    ```tsx
    <div className="relative min-h-[160px]" data-login-slide aria-live="polite" aria-label="Contenido del carrusel">
    ```
  - Cada slide button ya tiene `aria-label={`Ir a slide ${index + 1}`}` — OK
  - Agregar `role="tablist"` a los dots y `role="tab"` a cada dot

  **Must NOT do**: NO cambiar la lógica de slides

  **References**:
  - `modules/auth/ui/LoginCarousel.tsx:128` — Slide container
  - `modules/auth/ui/LoginCarousel.tsx:158-170` — Dot buttons

  **Commit**: `fix(auth): carousel aria-live + aria-label`

- [ ] 19. Placeholder Contrast Check (A11Y-03)

  **What to do**:
  - Verificar contraste de placeholder text (`placeholder-zinc-500` ≈ #6b7280) sobre fondo oscuro (`bg-background/5` o `bg-canvas/5`)
  - `zinc-500` = #71717a sobre fondo oscuro ≈ #0B1121 → ratio ≈ 4.8:1 (cumple AA para text-sm)
  - Si no cumple, cambiar a `placeholder-zinc-400` (#a1a1aa) → ratio ≈ 7.2:1
  - Verificar en: register, forgot-password, login (via FormField)

  **Must NOT do**: NO cambiar placeholders que ya cumplen

  **References**:
  - `register/page.tsx:10` — `placeholder-zinc-500`
  - `forgot-password/components/ForgotPasswordContent.tsx:83` — `placeholder-zinc-500`
  - WCAG 1.4.3: Contrast minimum 4.5:1 for normal text

  **Commit**: `fix(auth): placeholder contrast accessibility`

- [ ] 20. Full Typecheck + Lint Verification

  **What to do**:
  - Ejecutar quality gates:
    ```bash
    npx tsc --noEmit           # TypeScript
    npm run lint -w frontend   # Biome lint
    ```
  - Si hay errores, arreglarlos
  - Verificar que no se introdujeron `any`, `unknown`, `console.log`

  **Must NOT do**: NO deshabilitar lint, NO usar @ts-ignore

  **Commit**: `chore(auth): final typecheck + lint pass`

---

## Commit Strategy

| Wave | Commits |
|------|---------|
| Wave 1 | `fix(auth): login green CTA + register styled CTA + loading + forgot success + logos` |
| Wave 2 | `feat(auth): register field grouping + labels + carousel overlay + hierarchy + support text` |
| Wave 3 | `feat(auth): security badge + carousel progress bar + validation time + metadata + email validation` |
| Wave 4 | `fix(auth): aria-busy + aria-live + placeholder contrast + typecheck` |

---

## Success Criteria

- Botón login verde (no azul)
- Botón register con estilo CTA + spinner durante carga
- Logo visible en form panel (login mobile + register header)
- Forgot password con pantalla de éxito enriquecida
- Register con 2 grupos de campos separados visualmente
- Labels `<label htmlFor>` en todos los campos register
- Carousel overlay uniforme en todas las slides
- Progress bar animada en carousel
- Badge "Acceso seguro" en register
- Texto "24-48 horas hábiles" en register
- Email validation inline en register
- Metadata SEO actualizada en todas las páginas auth
- Aria-busy en submit register
- Aria-live en carousel
- Placeholder contrast ≥ 4.5:1
- `npx tsc --noEmit` pasa
- `npm run lint -w frontend` pasa
