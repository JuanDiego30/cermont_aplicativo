// app/layout.tsx
import '@/styles/globals.css';
import '@/styles/pages/login.css';
import '@/styles/components/forms.css';
import '@/styles/components/navbar.css';
import '@/styles/utils/print.css';
import HeaderTabs from '@/components/HeaderTabs';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'Cermont Web',
  description: 'Plataforma corporativa Cermont',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* data-theme se setea dinámicamente antes de hidratar */}
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try{
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved ? saved : (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }catch(e){}
})();
`}}
        />
        <AuthProvider>
          <HeaderTabs />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}








