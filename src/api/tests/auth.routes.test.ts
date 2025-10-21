import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import request from 'supertest';
import { hashPassword } from '../utils/password';

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_secret_key';
process.env.FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

type ImplFn<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

type ServiceImpl = {
  findUserByCorreo: ImplFn<[string], any>;
  createUser: ImplFn<[ { correo: string; hash: string; rol?: string } ], any>;
  getUserById: ImplFn<[string], any>;
  listUsers: ImplFn<[any], any>;
};

const impl: ServiceImpl = {
  findUserByCorreo: async () => {
    throw new Error('findUserByCorreo no configurado');
  },
  createUser: async () => {
    throw new Error('createUser no configurado');
  },
  getUserById: async () => {
    throw new Error('getUserById no configurado');
  },
  listUsers: async () => ({ data: [], count: 0 }),
};

const callCount = {
  findUserByCorreo: 0,
  createUser: 0,
  getUserById: 0,
  listUsers: 0,
};
const userServicePath = require.resolve('../services/userService');

require.cache[userServicePath] = {
  exports: {
    __esModule: true,
    findUserByCorreo: async (...args: [string]) => {
      callCount.findUserByCorreo += 1;
      return impl.findUserByCorreo(...args);
    },
    createUser: async (...args: [{ correo: string; hash: string; rol?: string }]) => {
      callCount.createUser += 1;
      return impl.createUser(...args);
    },
    getUserById: async (...args: [string]) => {
      callCount.getUserById += 1;
      return impl.getUserById(...args);
    },
    listUsers: async (...args: [any]) => {
      callCount.listUsers += 1;
      return impl.listUsers(...args);
    },
  },
} as unknown as NodeModule;

async function getApp() {
  const mod = await import('../app');
  return mod.default;
}

async function createToken(overrides?: Partial<{ sub: string; correo: string; rol: string }>) {
  const { signToken } = await import('../utils/jwt');
  return signToken({
    sub: overrides?.sub ?? 'user-123',
    correo: overrides?.correo ?? 'user@demo.co',
    rol: overrides?.rol ?? 'tecnico',
  });
}

beforeEach(() => {
  callCount.findUserByCorreo = 0;
  callCount.createUser = 0;
  callCount.getUserById = 0;
  callCount.listUsers = 0;
  impl.findUserByCorreo = async () => {
    throw new Error('findUserByCorreo no configurado');
  };
  impl.createUser = async () => {
    throw new Error('createUser no configurado');
  };
  impl.getUserById = async () => {
    throw new Error('getUserById no configurado');
  };
});

afterEach(() => {
  callCount.findUserByCorreo = 0;
  callCount.createUser = 0;
  callCount.getUserById = 0;
  callCount.listUsers = 0;
});

test('POST /v1/auth/register responde 201 cuando el correo es nuevo', async () => {
  impl.findUserByCorreo = async () => null;
  impl.createUser = async ({ correo, rol }) => ({
    id: 'user-123',
    correo,
    hash: 'hash',
    rol,
    activo: true,
    creado_en: new Date().toISOString(),
    mod_en: new Date().toISOString(),
  });

  const app = await getApp();
  const response = await request(app)
    .post('/v1/auth/register')
    .send({ correo: 'user@demo.co', password: '12345678', rol: 'tecnico' })
    .expect(201);

  assert.deepEqual(response.body, {
    id: 'user-123',
    correo: 'user@demo.co',
    rol: 'tecnico',
  });
  assert.equal(callCount.createUser, 1);
});

test('POST /v1/auth/register responde 409 si el correo existe', async () => {
  impl.findUserByCorreo = async () => ({
    id: 'user-123',
    correo: 'user@demo.co',
    hash: 'hash',
    rol: 'tecnico',
    activo: true,
    creado_en: new Date().toISOString(),
    mod_en: new Date().toISOString(),
  });

  const app = await getApp();
  const response = await request(app)
    .post('/v1/auth/register')
    .send({ correo: 'user@demo.co', password: '12345678', rol: 'tecnico' })
    .expect(409);

  assert.equal(response.body.code, 'conflict');
  assert.match(response.body.message, /correo ya está registrado/i);
  assert.equal(callCount.createUser, 0);
});

test('POST /v1/auth/login responde 200 y token válido', async () => {
  const hashed = await hashPassword('12345678');
  impl.findUserByCorreo = async () => ({
    id: 'user-123',
    correo: 'user@demo.co',
    hash: hashed,
    rol: 'tecnico',
    activo: true,
    creado_en: new Date().toISOString(),
    mod_en: new Date().toISOString(),
  });

  const app = await getApp();
  const response = await request(app)
    .post('/v1/auth/login')
    .send({ correo: 'user@demo.co', password: '12345678' })
    .expect(200);

  assert.ok(response.body.token);
  assert.deepEqual(response.body.user, {
    id: 'user-123',
    correo: 'user@demo.co',
    rol: 'tecnico',
  });
});

test('POST /v1/auth/login responde 401 con credenciales inválidas', async () => {
  impl.findUserByCorreo = async () => null;

  const app = await getApp();
  const response = await request(app)
    .post('/v1/auth/login')
    .send({ correo: 'user@demo.co', password: '12345678' })
    .expect(401);

  assert.equal(response.body.code, 'unauthorized');
});

test('GET /v1/users/me responde 200 con token válido', async () => {
  const token = await createToken();
  impl.getUserById = async () => ({
    id: 'user-123',
    correo: 'user@demo.co',
    hash: 'hash',
    rol: 'tecnico',
    activo: true,
    creado_en: new Date().toISOString(),
    mod_en: new Date().toISOString(),
  });

  const app = await getApp();
  const response = await request(app)
    .get('/v1/users/me')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.deepEqual(response.body, {
    id: 'user-123',
    correo: 'user@demo.co',
    rol: 'tecnico',
  });
  assert.equal(callCount.getUserById, 1);
});

test('GET /v1/users/me responde 401 sin token', async () => {
  const app = await getApp();
  const response = await request(app)
    .get('/v1/users/me')
    .expect(401);

  assert.equal(response.body.code, 'unauthorized');
});
