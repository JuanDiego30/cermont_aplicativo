import type { Metadata } from 'next';
import WeatherPageClient from './WeatherPageClient';

export const metadata: Metadata = {
  title: 'Clima y Pronóstico | CERMONT',
  description: 'Condiciones climáticas y pronóstico para operaciones en campo - Caño Limón y regiones de Colombia',
};

export default function WeatherPage() {
  return <WeatherPageClient />;
}
