'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { ThemeToggle } from '@/components/shared';
import AnimatedLogo from '@/components/AnimatedLogo';

const links = [
  { href: '/inicio', label: 'Inicio' },
  { href: '/ordenes', label: 'Órdenes' },
  { href: '/usuarios', label: 'Usuarios' },
  { href: '/reportes', label: 'Reportes' },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent){ if (e.key === 'Escape') setOpen(false); }
    function onClick(e: MouseEvent){
      if (!panelRef.current) return;
      if (open && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <header className={cn('navbar', open && 'navbar--open')}>
      <div className="navbar-left">
        <Link href="/inicio" aria-label="Inicio Cermont" className="logo-wrap">
          <AnimatedLogo width={110} height={26} priority />
        </Link>
      </div>

      <nav className="navbar-menu" aria-label="Principal">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={cn('nav-link', pathname === l.href && 'nav-link--active')}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="navbar-right">
        <ThemeToggle className="theme-btn" />
        <button
          className="navbar-toggle"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="mobile-panel"
          onClick={() => setOpen(v => !v)}
        >
          ☰
        </button>
      </div>

      <div
        id="mobile-panel"
        ref={panelRef}
        className={cn('mobile-panel', open && 'mobile-panel--visible')}
        aria-label="Menú móvil"
      >
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={cn('mobile-link', pathname === l.href && 'mobile-link--active')}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
