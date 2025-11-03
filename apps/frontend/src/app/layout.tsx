import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/features/auth/components/AuthContext';
import { RQProvider } from '@/lib/query/react-query';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CERMONT ATG - Sistema de Gestión',
  description: 'Sistema de gestión de trabajos para CERMONT SAS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <RQProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </RQProvider>
      </body>
    </html>
  );
}