// app/layout.tsx
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@/styles/globals.css';
import '@/styles/pages/login.css';
import '@/styles/components/forms.css';
import '@/styles/components/assistant-widget.css';
import '@/styles/utils/print.css';
import { ColorSchemeScript } from '@mantine/core';
import AppProviders from '@/components/AppProviders';
import HeaderTabs from '@/components/HeaderTabs';
import Footer from '@/components/Footer';
import AssistantWidget from '@/components/assistant/AssistantWidget';

export const metadata = {
  title: 'Cermont Web',
  description: 'Plataforma corporativa Cermont',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try{
    var root = document.documentElement;
    var saved = localStorage.getItem('mantine-color-scheme');
    var inferred = root.getAttribute('data-mantine-color-scheme');
    if(!inferred){
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      inferred = prefersDark ? 'dark' : 'light';
    }
    var theme = saved ? saved : inferred;
    root.setAttribute('data-theme', theme);
  }catch(e){}
})();
`}}
        />
        <AppProviders>
          <HeaderTabs />
          <main className="app-main">{children}</main>
          <Footer />
          <AssistantWidget />
        </AppProviders>
      </body>
    </html>
  );
}








