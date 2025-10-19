'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle({ className }: { className?: string }) {
  // Importante: usar un estado inicial fijo para evitar mismatch SSR/CSR
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Al montar, sincronizar con localStorage o atributo data-theme del documento
  useEffect(() => {
    try {
      let initial: 'light' | 'dark' = 'light';
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'dark' || attr === 'light') initial = attr;
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') initial = saved;
      if (initial !== theme) setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    } catch {
      // ignorar
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label="Cambiar tema"
      aria-pressed={isDark}
      title={isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'}
      onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
      className={['theme-btn', className].filter(Boolean).join(' ')}
    >
      <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
      <span className="theme-text">{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  );
}



