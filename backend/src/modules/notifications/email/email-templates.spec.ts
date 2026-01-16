import { renderEmailTemplate } from './email-templates';

describe('email templates', () => {
  it('renders welcome template', () => {
    const out = renderEmailTemplate('welcome', {
      nombre: 'Camilo',
      loginUrl: 'https://cermont.test/login',
    });
    expect(out.html).toContain('Bienvenido');
    expect(out.html).toContain('Camilo');
    expect(out.html).toContain('https://cermont.test/login');
    expect(out.text).toContain('Bienvenido');
  });

  it('renders password-reset template', () => {
    const out = renderEmailTemplate('password-reset', {
      nombre: 'Camilo',
      resetUrl: 'https://cermont.test/reset',
      expiresInMinutes: 10,
    });
    expect(out.html).toContain('restablecer');
    expect(out.html).toContain('https://cermont.test/reset');
    expect(out.html).toContain('10');
  });

  it('renders order-assigned template', () => {
    const out = renderEmailTemplate('order-assigned', {
      ordenNumero: 'OT-123',
      descripcion: 'Revisión',
      orderUrl: 'https://cermont.test/orders/OT-123',
    });
    expect(out.html).toContain('Orden asignada');
    expect(out.html).toContain('OT-123');
  });

  it('renders order-completed template', () => {
    const out = renderEmailTemplate('order-completed', {
      ordenNumero: 'OT-123',
      resumen: 'Completada',
      orderUrl: 'https://cermont.test/orders/OT-123',
    });
    expect(out.html).toContain('Orden completada');
    expect(out.html).toContain('Completada');
  });
});
