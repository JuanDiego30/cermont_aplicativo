
import { Outfit } from 'next/font/google';
import './globals.css';

import { AppProviders } from '@/core/providers';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: 'Cermont - Sistema de Gestión',
  description: 'Sistema de gestión de órdenes de trabajo y mantenimiento',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
