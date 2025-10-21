'use client';

import { PropsWithChildren, useEffect } from 'react';
import { CSSVariablesResolver, MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from '@/lib/auth';

const theme = createTheme({
  fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: '"Lexend", "Inter", "Segoe UI", sans-serif',
    fontWeight: '600',
  },
  fontFamilyMonospace: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  primaryShade: { light: 5, dark: 6 },
  primaryColor: 'cerBlue',
  defaultRadius: 'lg',
  defaultGradient: {
    from: 'cerBlue.5',
    to: 'cerGreen.4',
    deg: 120,
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  shadows: {
    xs: '0 4px 12px rgba(15, 23, 42, 0.04)',
    sm: '0 8px 22px rgba(15, 23, 42, 0.06)',
    md: '0 16px 32px rgba(41, 104, 210, 0.08)',
    lg: '0 24px 48px rgba(41, 104, 210, 0.12)',
    xl: '0 32px 72px rgba(15, 23, 42, 0.18)',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'lg',
        size: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.015em',
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'xl',
        padding: 'lg',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
        shadow: 'md',
        padding: 'lg',
      },
    },
    Title: {
      styles: {
        root: {
          letterSpacing: '-0.01em',
        },
      },
    },
  },
  colors: {
    cerBlue: [
      '#e6f1ff',
      '#c9e0ff',
      '#9ec7ff',
      '#72aeff',
      '#4e97ff',
      '#3c87f4',
      '#2968d2',
      '#1e52ab',
      '#193f84',
      '#122c5e',
    ],
    cerGreen: [
      '#f1f9ea',
      '#dff0d0',
      '#c3e1ab',
      '#a7d386',
      '#8ec666',
      '#77b24d',
      '#5f8f39',
      '#477027',
      '#31501b',
      '#1c3210',
    ],
    cerSlate: [
      '#f6f8fb',
      '#e3e8f1',
      '#c9d1de',
      '#b0bacb',
      '#96a3b8',
      '#7d8da6',
      '#647491',
      '#4d5a71',
      '#374250',
      '#212931',
    ],
  },
});

const cssVariablesResolver: CSSVariablesResolver = (themeInstance) => ({
  variables: {
    '--c-blue': themeInstance.colors.cerBlue[6],
    '--c-blue-soft': themeInstance.colors.cerBlue[3],
    '--c-green': themeInstance.colors.cerGreen[4],
    '--c-green-strong': themeInstance.colors.cerGreen[5],
    '--c-slate': themeInstance.colors.cerSlate[4],
    '--focus-ring': 'rgba(57, 132, 255, 0.28)',
  },
  light: {
    '--bg': '#f7f8fa',
    '--surface': '#ffffff',
    '--text': '#0f172a',
    '--text-secondary': '#475569',
    '--muted': '#94a3b8',
    '--border': '#d9e0ea',
    '--border-light': '#e8ecf5',
    '--nav-bg': 'linear-gradient(135deg, #2968d2, #77b24d)',
    '--nav-text': '#ffffff',
    '--nav-link-active-bg': 'rgba(255,255,255,0.12)',
    '--nav-link-active-ring': 'rgba(255,255,255,0.2)',
    '--mobile-panel-bg': 'rgba(255,255,255,0.92)',
  },
  dark: {
    '--bg': '#080d1a',
    '--surface': '#0f172a',
    '--text': '#e5e7eb',
    '--text-secondary': '#cbd5f5',
    '--muted': '#7c8bb3',
    '--border': '#1f2937',
    '--border-light': '#1c2433',
    '--nav-bg': 'linear-gradient(135deg, #1e52ab, #5f8f39)',
    '--nav-text': '#f8fafc',
    '--nav-link-active-bg': 'rgba(255,255,255,0.18)',
    '--nav-link-active-ring': 'rgba(255,255,255,0.3)',
    '--mobile-panel-bg': 'rgba(13,18,35,0.92)',
    '--focus-ring': 'rgba(125, 178, 109, 0.3)',
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      const scheme = root.getAttribute('data-mantine-color-scheme');
      if (scheme) {
        root.setAttribute('data-theme', scheme);
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-mantine-color-scheme'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"
      cssVariablesResolver={cssVariablesResolver}
      classNamesPrefix="cer"
    >
      <Notifications position="top-right" zIndex={4000} />
      <ModalsProvider>
        <AuthProvider>{children}</AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default AppProviders;
