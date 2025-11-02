// src/app/(auth)/login/layout.tsx
import AppBackground from '@/components/shared/AppBackground';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBackground />
      {children}
    </>
  );
}