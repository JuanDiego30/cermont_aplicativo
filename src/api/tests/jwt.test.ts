import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_secret_key';
process.env.FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

test('signToken y verifyToken retornan payload consistente', async () => {
  const { signToken, verifyToken } = await import('../utils/jwt');
  const token = signToken({ sub: 'user-1', correo: 'user@example.com', rol: 'admin' });
  const payload = verifyToken(token);

  assert.equal(payload.sub, 'user-1');
  assert.equal(payload.correo, 'user@example.com');
  assert.equal(payload.rol, 'admin');
  assert.ok(payload.exp);
});
