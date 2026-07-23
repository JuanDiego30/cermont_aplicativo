export const metadata = {
  title: "Panel de Control | CERMONT S.A.S.",
  description: "Plataforma operativa para cuadrillas con soporte offline, sincronización y captura de evidencias.",
};

import { DashboardClientShell } from "@/modules/dashboard/ui/DashboardClientShell";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-soft, #F8FAFC)]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        <DashboardClientShell />
      </div>
    </div>
  );
}
