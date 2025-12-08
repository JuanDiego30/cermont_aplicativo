// 📁 web/src/app/dashboard/layout.tsx

'use client';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { OfflineIndicator } from '@/components/offline/offline-indicator';
import { Providers } from '@/app/providers';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4 text-4xl animate-spin">⟳</div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Providers>
      <div className="flex h-screen flex-col">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4 sm:p-6">{children}</div>
          </main>
        </div>
        <OfflineIndicator />
      </div>
    </Providers>
  );
}
