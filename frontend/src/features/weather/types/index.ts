/**
 * Weather Feature Types
 */

export interface WeatherLocation {
  lat: number;
  lon: number;
  name?: string;
}

export interface CurrentWeather {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_deg: number;
    clouds: number;
    visibility: number;
    description: string;
    icon: string;
    main: string;
  };
  sun: {
    sunrise: string;
    sunset: string;
  };
}

export interface ForecastItem {
  datetime: string;
  date: string;
  time: string;
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  visibility: number;
  pop: number;
  description: string;
  icon: string;
  main: string;
}

export interface WeatherForecastData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  forecast: ForecastItem[];
}

export interface WeatherMapRegion {
  id: string;
  name: string;
  lat: number;
  lon: number;
  weather?: CurrentWeather;
}

// Caño Limón default coordinates
export const CANO_LIMON_COORDS: WeatherLocation = {
  lat: 7.0897,
  lon: -70.7597,
  name: 'Caño Limón, Arauca',
};

// Colombian regions for the map
export const COLOMBIAN_REGIONS: WeatherMapRegion[] = [
  { id: 'cano-limon', name: 'Caño Limón', lat: 7.0897, lon: -70.7597 },
  { id: 'arauca', name: 'Arauca', lat: 7.0903, lon: -70.7594 },
  { id: 'bogota', name: 'Bogotá', lat: 4.711, lon: -74.0721 },
  { id: 'medellin', name: 'Medellín', lat: 6.2476, lon: -75.5658 },
  { id: 'barranquilla', name: 'Barranquilla', lat: 10.9639, lon: -74.7964 },
  { id: 'cartagena', name: 'Cartagena', lat: 10.3932, lon: -75.4832 },
  { id: 'cali', name: 'Cali', lat: 3.4516, lon: -76.532 },
  { id: 'bucaramanga', name: 'Bucaramanga', lat: 7.1193, lon: -73.1227 },
  { id: 'cucuta', name: 'Cúcuta', lat: 7.8939, lon: -72.5078 },
];
