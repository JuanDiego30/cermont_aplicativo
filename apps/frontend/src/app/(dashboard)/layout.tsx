'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('token') || localStorage.getItem('accessToken'))
      : null;
    
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppShell>{children}</AppShell>
    </div>
  );
}