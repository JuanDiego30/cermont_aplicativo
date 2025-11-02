import AppBackground from '@/components/shared/AppBackground';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppBackground />
      <div className="relative z-10">
        {children}
      </div>
    </>
  );
}