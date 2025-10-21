'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';

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

    if (pwd.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
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
      } else {
        setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
        const destination = result.redirectTo ?? ROUTES.ROLES.CLIENTE.DASHBOARD;
        setTimeout(() => {
          router.push(destination);
        }, 1200);
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
            minLength={8}
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
          Mínimo 8 caracteres
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
            minLength={8}
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

      <p className="auth-cta">
        ¿Ya tienes cuenta? <Link className="auth-link" href={ROUTES.LOGIN}>Inicia sesión</Link>
      </p>
    </form>
  );
}
