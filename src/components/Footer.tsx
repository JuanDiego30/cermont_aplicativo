import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} Cermont. Todos los derechos reservados.</p>
      <p className="site-footer__links">
        <Link href="/politica-privacidad">Privacidad</Link>
        <span>•</span>
        <Link href="/terminos-servicio">Términos</Link>
      </p>
    </footer>
  );
};

export default Footer;
