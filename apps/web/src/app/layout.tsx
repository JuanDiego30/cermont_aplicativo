/**
 * 📁 app/layout.tsx
 *
 * ✨ Root Layout - Next.js 16 App Router
 * Server Component con configuración optimizada
 */

import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Configuración de fuente optimizada
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  preload: true,
});

// Metadata global de la aplicación
export const metadata: Metadata = {
  title: {
    template: '%s | CERMONT S.A.S',
    default: 'CERMONT S.A.S - Sistema de Gestión de Órdenes',
  },
  description:
    'Sistema integral de gestión de órdenes de trabajo para refrigeración industrial. Optimiza tus procesos de mantenimiento y servicio técnico.',
  keywords: [
    'CERMONT',
    'refrigeración industrial',
    'órdenes de trabajo',
    'mantenimiento',
    'gestión',
    'servicio técnico',
  ],
  authors: [{ name: 'CERMONT S.A.S' }],
  creator: 'CERMONT S.A.S',
  publisher: 'CERMONT S.A.S',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'CERMONT S.A.S',
    title: 'CERMONT S.A.S - Sistema de Gestión de Órdenes',
    description:
      'Sistema integral de gestión de órdenes de trabajo para refrigeración industrial.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CERMONT S.A.S',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CERMONT S.A.S - Sistema de Gestión',
    description: 'Gestión de órdenes de trabajo para refrigeración industrial.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#101828' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning className={outfit.variable}>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${outfit.className} antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
