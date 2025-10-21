'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';

export default function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn(email, pwd);

      if (result.error) {
        setError(result.error);
      } else {
        if (result.redirectTo) {
          router.push(result.redirectTo);
        } else {
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '16px', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#b91c1c'
        }} role="alert">
          <strong>⚠️</strong> {error}
        </div>
      )}
      
      <div className="form-group">
        <div className="input-wrap">
          <input
            id="email"
            type="email"
            placeholder=" "
            autoComplete="email"
            required
            value={email}
            onChange={e=>setEmail(e.target.value)}
            disabled={isLoading}
          />
          <label htmlFor="email">Correo corporativo</label>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrap">
          <input
            id="password"
            type={show ? 'text' : 'password'}
            placeholder=" "
            autoComplete="current-password"
            required
            value={pwd}
            onChange={e=>setPwd(e.target.value)}
            disabled={isLoading}
          />
          <label htmlFor="password">Contraseña</label>
          <button
            type="button"
            className="password-toggle"
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={()=>setShow(s=>!s)}
            disabled={isLoading}
          >☰</button>
        </div>
      </div>

      <div className="form-options">
        <label><input type="checkbox" disabled={isLoading} /> Recordarme</label>
        <a href="#">¿Olvidaste tu contraseña?</a>
      </div>

      <button type="submit" className="login-btn" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      <p className="auth-cta">
        ¿No tienes cuenta? <Link className="auth-link" href={ROUTES.REGISTER}>Crear cuenta</Link>
      </p>
    </form>
  );
}
