# FASE 1.4: Auditoría de Utils

## src/shared/utils/ contenido:

| Archivo | Tamaño | Descripción |
|---------|--------|-------------|
| cn.ts | 377 bytes | Utility para clases CSS (classnames) |
| export.ts | 8546 bytes | Exportación a CSV/Excel/PDF/ZIP |
| format.ts | 2592 bytes | Formateo de fechas, moneda, números |
| index.ts | 441 bytes | Barrel export |
| lazyLoad.tsx | 3412 bytes | Componente para lazy loading |

## src/shared/utils/index.ts:
```typescript
export { cn } from './cn';
export {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatTime,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
} from './format';
export {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToZIP,
  generateTableHTML,
  formatters,
  type ExportColumn,
} from './export';
```

## Todas las utils en el proyecto:

### Utils en shared/ (genéricas):
- `shared/utils/cn.ts`
- `shared/utils/export.ts`
- `shared/utils/format.ts`
- `shared/utils/lazyLoad.tsx`
- `shared/utils/index.ts`

### Utils en features/ (específicas de dominio):
- `features/auth/utils/index.ts`
- `features/auth/utils/password-validation.ts`
- `features/auth/utils/session.ts`

## Utils duplicadas:
- [x] Ninguna

## Utils que deberían moverse a shared:
- [x] Ninguna - Las utils de auth son específicas de autenticación

## Observaciones:
- ⚠️ `lazyLoad.tsx` es un componente, no una utilidad pura
  - Considerar mover a `shared/components/` o renombrar

## Estado: ✅ BIEN ORGANIZADO
- Utils genéricas en `shared/utils/`
- Utils de dominio en `features/auth/utils/`
- Tiene barrel export (index.ts)
- No hay duplicados
