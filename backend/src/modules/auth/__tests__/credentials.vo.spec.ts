import * as bcrypt from 'bcryptjs';
import { Credentials } from '../domain/value-objects/credentials.vo';

describe('Credentials VO', () => {
  it('validateEmail: retorna true para email válido', () => {
    expect(Credentials.validateEmail('Test@Example.com')).toBe(true);
  });

  it('validateEmail: retorna false para email inválido', () => {
    expect(Credentials.validateEmail('no-es-email')).toBe(false);
  });

  it('validatePassword: detecta password débil (OWASP básico)', () => {
    const result = Credentials.validatePassword('abc');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validatePassword: reporta reglas específicas (espacios y símbolo)', () => {
    const result = Credentials.validatePassword('Password1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Debe contener al menos un carácter especial');

    const resultWithSpace = Credentials.validatePassword('Password1! ');
    expect(resultWithSpace.valid).toBe(false);
    expect(resultWithSpace.errors).toContain('No debe contener espacios');
  });

  it('validatePassword: acepta password fuerte', () => {
    const result = Credentials.validatePassword('Password1!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('create: normaliza email y valida password', () => {
    const creds = Credentials.create(' Test@Example.com ', 'Password1!');
    expect(creds.email).toBe('test@example.com');
    expect(creds.isHashed).toBe(false);
  });

  it('fromHashed + verify: usa bcrypt.compare cuando está hasheada', async () => {
    const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

    const creds = Credentials.fromHashed('a@b.com', 'hashed');
    await expect(creds.verify('plain')).resolves.toBe(true);
    expect(compareSpy).toHaveBeenCalledWith('plain', 'hashed');
  });

  it('hash: si ya está hasheada no re-hashea', async () => {
    const hashSpy = jest.spyOn(bcrypt, 'hash');

    const creds = Credentials.fromHashed('a@b.com', 'already');
    const result = await creds.hash(10);

    expect(hashSpy).not.toHaveBeenCalled();
    expect(result.password).toBe('already');
    expect(result.isHashed).toBe(true);
  });

  it('equals: compara por email normalizado', () => {
    const a = Credentials.create('A@B.com', 'Password1!');
    const b = Credentials.create('a@b.com', 'Password1!');
    const c = Credentials.create('x@y.com', 'Password1!');

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
