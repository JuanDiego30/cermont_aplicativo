
import { Outfit } from 'next/font/google';
import './globals.css';
import './globals-compat.css'; // 🔧 Cross-browser compatibility fixes

import { AppProviders } from '@/core/providers';
import { ErrorBoundary, SkipToContent } from '@/components/common';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: 'Cermont - Sistema de Gestión',
  description: 'Sistema de gestión de órdenes de trabajo y mantenimiento',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logo/cermont-logo.png',
    shortcut: '/images/logo/cermont-logo.png',
    apple: '/images/logo/cermont-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <SkipToContent />
        <ServiceWorkerRegistration />
        <ErrorBoundary>
          <AppProviders>
            {children}
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
