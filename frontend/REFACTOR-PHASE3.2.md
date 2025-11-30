# FASE 3.2: Análisis de Duplicación

## Componentes "Button":
| Archivo | Líneas | Uso |
|---------|--------|-----|
| ui/Button.tsx | 57 | 3 importaciones (workplans, kits) |
| ui/button/Button.tsx | 92 | 7 importaciones (auth, orders, users, kits, checklists) |
| common/ThemeToggleButton.tsx | - | Específico (toggle theme) |

### ⚠️ DUPLICACIÓN CONFIRMADA: Button
- `ui/Button.tsx` - Versión más simple, menos usada
- `ui/button/Button.tsx` - Versión más completa con loading, icons

**Recomendación:** Consolidar en `ui/button/Button.tsx` (versión más completa)

## Componentes "Card":
| Archivo | Propósito |
|---------|-----------|
| common/ActionCard.tsx | Tarjeta con acción |
| common/ComponentCard.tsx | Wrapper para demos |
| common/StatCard.tsx | Estadísticas |
| ui/Card.tsx | Card base |
| user-profile/UserAddressCard.tsx | Específico de usuario |
| user-profile/UserInfoCard.tsx | Específico de usuario |
| user-profile/UserMetaCard.tsx | Específico de usuario |

### ✅ NO HAY DUPLICACIÓN
- Cada Card tiene propósito diferente

## Componentes "Input":
| Archivo | Propósito |
|---------|-----------|
| form/input/Checkbox.tsx | Checkbox |
| form/input/FileInput.tsx | File upload |
| form/input/InputField.tsx | Text input |
| form/input/Radio.tsx | Radio button |
| form/input/RadioSm.tsx | Radio pequeño |
| form/input/TextArea.tsx | Textarea |
| form/group-input/PhoneInput.tsx | Phone específico |

### ✅ NO HAY DUPLICACIÓN
- Cada input es diferente tipo

## Componentes "Form":
| Archivo | Propósito |
|---------|-----------|
| form/Form.tsx | Form wrapper |
| form/FormField.tsx | Field wrapper |

### ✅ NO HAY DUPLICACIÓN

## Duplicados confirmados:
1. ⚠️ `ui/Button.tsx` vs `ui/button/Button.tsx` - CONSOLIDAR

## Para consolidar:
1. Eliminar `ui/Button.tsx`
2. Actualizar 3 imports que usan `@/components/ui/Button`
3. Mantener `ui/button/Button.tsx` como único

## Imports a actualizar:
```
features/workplans/components/WorkPlanSection.tsx
features/workplans/components/ApprovalDialog.tsx  
features/kits/components/KitModal.tsx
```

## Estado: ⚠️ REQUIERE CONSOLIDACIÓN DE BUTTON
