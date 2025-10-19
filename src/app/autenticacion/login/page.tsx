"use client";
import LoginForm from '@/components/forms/LoginForm';
import Image from 'next/image';

export default function PaginaLogin() {
  return (
    <main className="login-shell">
      <div className="login-stack">
        <div className="brand-logo" aria-hidden>
          <Image src="/logo.png" alt="Cermont" width={100} height={100} />
        </div>
        <section className="login-card" aria-label="Tarjeta de inicio de sesión">
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Ingresa con tu cuenta corporativa</p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
