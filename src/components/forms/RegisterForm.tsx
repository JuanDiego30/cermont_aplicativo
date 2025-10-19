'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (pwd.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (pwd !== pwd2) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, pwd, name);

      if (result.error) {
        setError(result.error);
      } else if (result.requiresConfirmation) {
        setSuccess('¡Cuenta creada! Por favor revisa tu correo para confirmar tu cuenta.');
      } else {
        setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
        setTimeout(() => {
          router.push('/cliente/dashboard');
          router.refresh();
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear la cuenta';
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

      {success && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '16px', 
          backgroundColor: '#d1fae5', 
          border: '1px solid #10b981',
          borderRadius: '8px',
          color: '#065f46'
        }} role="alert">
          <strong>✓</strong> {success}
        </div>
      )}

      <div className="form-group">
        <div className="input-wrap">
          <input
            id="name"
            type="text"
            placeholder=" "
            autoComplete="name"
            required
            value={name}
            onChange={e=>setName(e.target.value)}
            disabled={isLoading}
          />
          <label htmlFor="name">Nombre completo</label>
        </div>
      </div>

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
            type={showPwd ? 'text' : 'password'}
            placeholder=" "
            autoComplete="new-password"
            required
            value={pwd}
            onChange={e=>setPwd(e.target.value)}
            minLength={6}
            disabled={isLoading}
          />
          <label htmlFor="password">Contraseña</label>
          <button
            type="button"
            className="password-toggle"
            aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={()=>setShowPwd(s=>!s)}
            disabled={isLoading}
          >☰</button>
        </div>
        <small style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px', display: 'block' }}>
          Mínimo 6 caracteres
        </small>
      </div>

      <div className="form-group">
        <div className="input-wrap">
          <input
            id="password2"
            type={showPwd2 ? 'text' : 'password'}
            placeholder=" "
            autoComplete="new-password"
            required
            value={pwd2}
            onChange={e=>setPwd2(e.target.value)}
            minLength={6}
            disabled={isLoading}
          />
          <label htmlFor="password2">Confirmar contraseña</label>
          <button
            type="button"
            className="password-toggle"
            aria-label={showPwd2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={()=>setShowPwd2(s=>!s)}
            disabled={isLoading}
          >☰</button>
        </div>
      </div>

      <button type="submit" className="login-btn" disabled={isLoading}>
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <div className="divider"><span>o</span></div>

      <button type="button" className="google-btn" onClick={()=>console.log('Google OAuth - signup')} disabled={isLoading}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C35.8 2.4 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.2l8.5 6.6C12.7 13.6 17.9 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8h12.6c-.6 3-2.4 5.6-5.1 7.4l7.8 6c4.5-4.2 6.8-10.4 6.8-17.3z"/>
          <path fill="#FBBC05" d="M11 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-8.5-6.6C.9 14.6 0 19.1 0 23.5c0 4.4.9 8.9 2.5 12.4l8.5-6.6z"/>
          <path fill="#34A853" d="M24 47c6.2 0 11.4-2 15.2-5.5l-7.8-6c-2.1 1.4-4.9 2.3-7.5 2.3-6.1 0-11.3-4.1-13-9.8l-8.5 6.6C6.4 42.6 14.6 47 24 47z"/>
        </svg>
        <span>Registrarme con Google</span>
      </button>

      <p className="auth-cta">
        ¿Ya tienes cuenta? <Link className="auth-link" href="/autenticacion/login">Inicia sesión</Link>
      </p>
    </form>
  );
}
