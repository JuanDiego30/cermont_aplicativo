# UI/Shared Migration Map

> Guía viva para consolidar `src/components` dentro de `src/shared/components` siguiendo el plan maestro.
>
> Marca cada elemento cuando el código haya sido movido, los imports actualizados y los tests/verificaciones ejecutados.

## Leyenda

- ☐ Pendiente
- ☐➡️ En progreso (agrega nota)
- ☑ Completado

## 1. UI Primitives (`src/components/ui` → `src/shared/components/ui`)

| Estado | Origen                                  | Destino                                           | Notas |
| ------ | --------------------------------------- | ------------------------------------------------- | ----- |
| ☑      | `src/components/ui/button/`              | `src/shared/components/ui/button/`                | Mantener API actual de `Button`.
| ☑      | `src/components/ui/input.tsx`            | `src/shared/components/ui/Input.tsx`              | Revisar colisión con versión existente en `@/components/ui`.
| ☑      | `src/components/ui/dropdown/`            | `src/shared/components/ui/dropdown/`              | Validar dependencias en `features/kits`.
| ☑      | `src/components/ui/modal/`               | `src/shared/components/ui/modal/`                 | Integrar con modal usado en archives.
| ☑      | `src/components/ui/images/`              | `src/shared/components/ui/images/`                | Confirmar uso en marketing pages.
| ☑      | `src/components/ui/alert/`               | `src/shared/components/ui/alert/`                 | Unificar con alerta utilizada en Admin.
| ☑      | `src/components/ui/badge/`               | `src/shared/components/ui/badge/`                 | Revisar estilos tailwind personalizados.
| ☑      | `src/components/ui/avatar/`              | `src/shared/components/ui/avatar/`                | Mantener soporte para iniciales.
| ☑      | `src/components/ui/FloatingAssistant.tsx`| `src/shared/components/ui/FloatingAssistant.tsx`  | Determinar si se mantiene feature.
| ☑      | `src/components/ui/FloatingWeather.tsx`  | `src/shared/components/ui/FloatingWeather.tsx`    | Depende de datos en tiempo real.

## 2. Form System (`src/components/form` → `src/shared/components/form`)

| Estado | Origen                                    | Destino                                           | Notas |
| ------ | ----------------------------------------- | ------------------------------------------------- | ----- |
| ☑      | `src/components/form/Form.tsx`            | `src/shared/components/form/Form.tsx`             | Revisar compatibilidad con React Hook Form.
| ☑      | `src/components/form/date-picker.tsx`     | `src/shared/components/form/DatePicker.tsx`       | Confirmar dependencia de `react-day-picker`.
| ☑      | `src/components/form/group-input/`        | `src/shared/components/form/group-input/`         | Validar localización en PhoneInput.
| ☑      | `src/components/form/input/`              | `src/shared/components/form/input/`               | Agrupar TextArea, Radio, FileInput.
| ☑      | `src/components/form/switch/`             | `src/shared/components/form/switch/`              | Mantener tokens de diseño.
| ☑      | `src/components/form/MultiSelect.tsx`     | `src/shared/components/form/MultiSelect.tsx`      | Revisar dependencia de `react-select`.

## 3. Common/Pattern Library (`src/components/common|patterns|dashboard|charts|videos|calendar` → `src/shared/components/patterns`)

| Estado | Origen                                           | Destino                                                    | Notas |
| ------ | ------------------------------------------------ | ---------------------------------------------------------- | ----- |
| ☐      | `src/components/common/ActionCard.tsx`           | `src/shared/components/patterns/ActionCard.tsx`            | Usado en dashboards.
| ☐      | `src/components/common/ErrorBoundary.tsx`        | `src/shared/components/patterns/ErrorBoundary.tsx`         | Integrar con Sentry config.
| ☐      | `src/components/common/StatCard.tsx`             | `src/shared/components/patterns/StatCard.tsx`              | Reutilizable en Billing.
| ☐      | `src/components/dashboard/*`                     | `src/shared/components/patterns/dashboard/*`                | Requiere ajustes de data props.
| ☐      | `src/components/patterns/index.ts`               | `src/shared/components/patterns/index.ts`                  | Consolidar export barrel.
| ☐      | `src/components/charts/(bar|line)/*`             | `src/shared/components/patterns/charts/(bar|line)/*`       | Confirmar dependencias charting.
| ☐      | `src/components/calendar/Calendar.tsx`           | `src/shared/components/patterns/Calendar.tsx`              | Determinar si sigue vigente.
| ☐      | `src/components/videos/*`                        | `src/shared/components/patterns/media/*`                   | Evaluar eliminación si no se usan.

## 4. Layout & Navigation (`src/components/pwa/*`, `bottom navigation`, etc.)

| Estado | Origen                                | Destino                                              | Notas |
| ------ | ------------------------------------- | ---------------------------------------------------- | ----- |
| ☐      | `src/components/pwa/BottomNavigation.tsx` | `src/shared/components/layout/BottomNavigation.tsx` | Depende de modo PWA.
| ☐      | `src/components/pwa/CameraCapture.tsx`    | `src/shared/components/layout/CameraCapture.tsx`    | Requiere permisos móviles.
| ☐      | `src/components/pwa/LocationPicker.tsx`   | `src/shared/components/layout/LocationPicker.tsx`   | Necesita revisar hooks de geolocalización.

## 5. Export/Tracking

- [ ] Ejecutar script `scripts/analyze-unused.js` después de cada movimiento.
- [ ] Actualizar `CLEANUP_REPORT.md` y esta tabla.
- [ ] Documentar decisiones en `docs/REFACTORIZACION_COMPLETADA_ANALISIS.md`.
