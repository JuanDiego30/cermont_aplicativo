/**
 * Shared UI Components
 * Re-exports from main components directory for convenience
 */

// ============================================================================
// UI Components
// ============================================================================
export { Button } from './button';
export { Card, CardHeader, CardTitle, CardContent } from './Card';
export { Modal } from './modal';
export { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from './table';
export { Input } from './input';
export { default as Badge } from './badge/Badge';
export { default as Avatar } from './avatar/Avatar';
export { Dropdown } from './dropdown/Dropdown';
export { DropdownItem } from './dropdown/DropdownItem';
export { default as ResponsiveImage } from './images/ResponsiveImage';
export { default as ThreeColumnImageGrid } from './images/ThreeColumnImageGrid';
export { default as TwoColumnImageGrid } from './images/TwoColumnImageGrid';
export { default as FloatingAssistant } from './FloatingAssistant';
export { default as FloatingWeather } from './FloatingWeather';
export { default as OfflineIndicator } from './OfflineIndicator';

// ============================================================================
// Form Components
// ============================================================================
export {
	Input as FormInput,
	Checkbox,
	Radio,
	RadioSm,
	TextArea,
	FileInput,
	Select,
	MultiSelect,
	Label,
	Switch,
	DatePicker,
	Form,
	FormField,
} from '@/shared/components/form';

// ============================================================================
// Common Components
// ============================================================================
export * from '@/components/common';
