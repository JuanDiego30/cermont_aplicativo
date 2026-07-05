# CAVERNICOLA UI/UX COMPONENT MAP — Cermont S.A.S.

## 1. Visual Token Alignment (Mintlify + Cermont)

This index catalogs Cermont's premium, custom-calibrated UI components. Spacing follows the 4px base increment system from `DESIGN.md`.

```css
/* Color Palette SSOT */
--color-cermont-blue: #2154A6;       /* Primary Accent */
--color-cermont-blue-deep: #0F2C59;  /* Pressed state */
--color-cermont-green: #4CAF50;      /* Success Accent */
--color-cermont-green-soft: #7CD966; /* Background success */
--color-brand-blue-bg: rgba(33, 84, 166, 0.05);
```

---

## 2. Core UI Component Inventory

| Component Name | File Path | Stylings / Shape | Interaction Behavior | Accessibility / Aria |
|----------------|-----------|------------------|----------------------|----------------------|
| **Button** | `frontend/src/components/common/Button.tsx` | Full pill (`rounded-full`), `#2154A6` primary, outline secondary | Tactile depress (`-1px` translate on active), focus ring in green | `aria-label` for icons, proper screen reader text |
| **Card** | `frontend/src/components/common/Card.tsx` | Diffused whisper shadow, `12px` rounded corners (`rounded-lg`), Off-White base | Subtle hover lift (`translateY -2px` with shadow scale) | Semantic `<section>` or `<article>` structure |
| **FormField** | `frontend/src/components/common/FormField.tsx` | Stacked labels above inputs, error messages below in red | Smooth transitions, Cermont Green active focus ring | Unique `id` mapped to `<label htmlFor="...">` |
| **NetworkStatusChip**| `frontend/src/components/sync/NetworkStatusChip.tsx` | Tactile pill, custom border highlights, green/amber/blue/rose | Interactive click toggles `SyncStatusPopover` | Mapped to offline status, focus outline accessible |
| **SyncStatusPopover**| Inline dropdown in `NetworkStatusChip.tsx` | Compact grid popover, showing connection status and outbox count | Click triggers manual sync or reveals drawer | Accessible focus, keydown events handled |
| **OfflineQueueDrawer**| Inline modal dialog in `NetworkStatusChip.tsx`| Centered backdrop layout, detail table of pending queue entries | Allows discarding or re-syncing specific outbox items | Accessible focus trap, Escape closes, Tab focus |
| **StepTimeline** | `frontend/src/modules/dashboard/ui/StepTimeline.tsx` | Harmonious grid timeline, responsive 14-step operational tracker | Categorization tabs, hover translate-up, active badges | Semantic list structure, screen reader friendly |

---

## 3. Empty & Error State Compositions

Per **docs/design/CERMONT_UIUX_GUIDE.md**, empty and error states are treated as full layouts rather than mere annotations:
*   **Empty State Pattern**: Includes a contextual SVG illustration (e.g. cloud upload), a clean title (e.g. *"Sin actas de entrega"*), a descriptive paragraph detailing the required predecessor stage, and a primary CTA (e.g. *"Adjuntar soporte documental"*).
*   **Error State Pattern**: Composed of a warm red bordered card containing an AlertTriangle icon, a description of the error (e.g. *"Session expired"*) with its stable error code, and a discrete `RefreshCw` retry button.
