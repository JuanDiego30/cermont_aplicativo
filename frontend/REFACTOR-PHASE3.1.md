# FASE 3.1: Inventario de Components

## Estructura completa (62 archivos .tsx):

### calendar/ (1)
- Calendar.tsx

### charts/ (2)
- bar/BarChartOne.tsx
- line/LineChartOne.tsx

### common/ (13)
- ActionCard.tsx
- CermontLogo.tsx
- ChartTab.tsx
- ComponentCard.tsx
- ErrorBoundary.tsx
- GridShape.tsx
- PageBreadCrumb.tsx
- Skeleton.tsx
- SkipToContent.tsx
- StatCard.tsx
- StatusBadge.tsx
- ThemeToggleButton.tsx
- ThemeTogglerTwo.tsx

### dashboard/ (4)
- ActivityTimeline.tsx
- NotificationBadge.tsx
- ProgressRing.tsx
- QuickStats.tsx

### form/ (13)
- date-picker.tsx
- Form.tsx
- FormField.tsx
- Label.tsx
- MultiSelect.tsx
- Select.tsx
- group-input/PhoneInput.tsx
- input/Checkbox.tsx
- input/FileInput.tsx
- input/InputField.tsx
- input/Radio.tsx
- input/RadioSm.tsx
- input/TextArea.tsx
- switch/Switch.tsx

### patterns/ (2)
- ErrorState.tsx
- LoadingState.tsx

### tables/ (2)
- BasicTableOne.tsx
- Pagination.tsx

### ui/ (17)
- Button.tsx
- Card.tsx
- FloatingAssistant.tsx
- FloatingWeather.tsx
- alert/Alert.tsx
- avatar/Avatar.tsx
- avatar/AvatarText.tsx
- badge/Badge.tsx
- button/Button.tsx
- dropdown/Dropdown.tsx
- dropdown/DropdownItem.tsx
- images/ResponsiveImage.tsx
- images/ThreeColumnImageGrid.tsx
- images/TwoColumnImageGrid.tsx
- modal/index.tsx
- table/index.tsx
- video/VideosExample.tsx
- video/YouTubeEmbed.tsx

### user-profile/ (3)
- UserAddressCard.tsx
- UserInfoCard.tsx
- UserMetaCard.tsx

### videos/ (4)
- FourIsToThree.tsx
- OneIsToOne.tsx
- SixteenIsToNine.tsx
- TwentyOneIsToNine.tsx

## Total de componentes: 62 archivos .tsx

## Subdirectorios sin index.ts (10 total):
- ❌ form/group-input/
- ❌ form/input/
- ❌ form/switch/
- ❌ ui/alert/
- ❌ ui/avatar/
- ❌ ui/badge/
- ❌ ui/button/
- ❌ ui/dropdown/
- ❌ ui/images/
- ❌ ui/video/

## Componentes sospechosos de duplicación:
- `ui/Button.tsx` vs `ui/button/Button.tsx` ⚠️ DUPLICADO
- `auth/` en components? (revisar si hay) - NO existe
- `ThemeToggleButton.tsx` vs `ThemeTogglerTwo.tsx` - ¿duplicado funcional?

## Componentes que deberían estar en features:
- [ ] dashboard/* → features/dashboard/components/
- [ ] user-profile/* → features/users/components/

## Estado: ⚠️ NECESITA LIMPIEZA
- 10 subdirectorios sin index.ts
- Al menos 1 duplicado confirmado (Button)
- Componentes de dashboard y user-profile podrían moverse a features
