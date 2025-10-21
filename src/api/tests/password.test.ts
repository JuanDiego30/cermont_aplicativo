import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hashPassword, verifyPassword } from '../utils/password';

test('hashPassword genera hash distinto y verificable', async () => {
  const password = 'Secret123!';
  const hash = await hashPassword(password);

  assert.notEqual(hash, password);
  assert.ok(await verifyPassword(password, hash));
  assert.equal(await verifyPassword('otro', hash), false);
});
