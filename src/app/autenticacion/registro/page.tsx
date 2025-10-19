"use client";
import RegisterForm from '@/components/forms/RegisterForm';
import Image from 'next/image';

export default function PaginaRegistro() {
  return (
    <main className="login-shell">
      <div className="login-stack">
        <div className="brand-logo" aria-hidden>
          <Image src="/logo.png" alt="Cermont" width={100} height={100} />
        </div>
        <section className="login-card" aria-label="Tarjeta de registro">
          <h1 className="login-title">Crear cuenta</h1>
          <p className="login-subtitle">Únete a la plataforma corporativa</p>
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}
