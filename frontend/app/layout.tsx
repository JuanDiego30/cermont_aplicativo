import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from './theme-provider';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CERMONT ATG - Sistema de Gestión',
    template: '%s | CERMONT ATG',
  },
  description:
    'Sistema integral de gestión de órdenes de trabajo para CERMONT S.A.S. Administración, seguimiento y control de procesos operativos en el sector petrolero.',
  keywords: [
    'CERMONT',
    'gestión de órdenes',
    'trabajo de campo',
    'sistema de gestión',
    'ATG',
    'sector petrolero',
  ],
  authors: [{ name: 'CERMONT S.A.S.' }],
  creator: 'Juan Diego Arévalo',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    title: 'CERMONT ATG - Sistema de Gestión',
    description: 'Sistema integral de gestión de órdenes de trabajo',
    siteName: 'CERMONT ATG',
  },
  robots: {
    index: false,
    follow: false,
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1D5FA8',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CERMONT ATG" />
      </head>
      <body
        className={`min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-50 ${inter.className}`}
      >
        <ThemeProvider>
          <Providers>
            {children}
            <OfflineIndicator />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}


