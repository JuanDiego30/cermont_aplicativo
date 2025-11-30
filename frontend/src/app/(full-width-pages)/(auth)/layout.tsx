import { GridShape, ThemeTogglerTwo, CermontLogoWithTagline } from "@/components/common";
import { ThemeProvider } from "@/core/providers";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-white z-1 dark:bg-gray-900">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full min-h-screen justify-center flex-col dark:bg-gray-900">
          {children}
          <div className="lg:w-1/2 w-full bg-brand-950 dark:bg-white/5 lg:flex items-center justify-center hidden">
            <div className="relative items-center justify-center flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <CermontLogoWithTagline
                href="/dashboard"
                size="xl"
                frame="circle"
                withShadow
                variant="default"
              />
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
