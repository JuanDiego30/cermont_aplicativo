// PWA Components
export { BottomNavigation } from './BottomNavigation';
export { CameraCapture } from './CameraCapture';
export { LocationPicker } from './LocationPicker';

// Re-export hooks for convenience
export { useCamera } from '@/hooks/useCamera';
export { useGeolocation } from '@/hooks/useGeolocation';
export type { CapturedPhoto, CameraOptions, UseCameraReturn } from '@/hooks/useCamera';
export type { GeolocationPosition, GeolocationOptions, UseGeolocationReturn } from '@/hooks/useGeolocation';
