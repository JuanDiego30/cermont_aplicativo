import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import request from 'supertest';
import { HttpError } from '../middleware/errorHandler';

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_secret_key';
process.env.FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

async function getToken(overrides?: Partial<{ sub: string; correo: string; rol: string }>) {
  const { signToken } = await import('../utils/jwt');
  return signToken({
    sub: overrides?.sub ?? 'user-123',
    correo: overrides?.correo ?? 'user@demo.co',
    rol: overrides?.rol ?? 'admin',
  });
}

type ListOpts = {
  page: number;
  pageSize: number;
  estado?: string;
  cliente?: string;
  q?: string;
};

type UpdateArgs = [string, { estado?: string; responsable_id?: string | null; nota?: string | null }, string];

const CLIENTE_ID = '11111111-2222-4333-8444-555555555555';
const RESPONSABLE_ID = '22222222-3333-4444-8444-666666666666';

const impl: {
  listOrders: (opts: ListOpts) => Promise<any>;
  createOrder: (payload: any, userId: string) => Promise<any>;
  getOrderDetail: (id: string) => Promise<any>;
  updateOrder: (id: string, payload: any, userId: string) => Promise<any>;
} = {
  listOrders: async () => {
    throw new Error('listOrders no configurado');
  },
  createOrder: async () => {
    throw new Error('createOrder no configurado');
  },
  getOrderDetail: async () => {
    throw new Error('getOrderDetail no configurado');
  },
  updateOrder: async () => {
    throw new Error('updateOrder no configurado');
  },
};

const callCount = {
  listOrders: 0,
  createOrder: 0,
  getOrderDetail: 0,
  updateOrder: 0,
};
const orderServicePath = require.resolve('../services/orderService');

require.cache[orderServicePath] = {
  exports: {
    __esModule: true,
    ORDER_PRIORITIES: ['baja', 'normal', 'alta', 'importante', 'uci'],
    ORDER_STATES: ['NUEVA', 'ASIGNADA', 'EN_EJECUCION', 'FINALIZADA', 'CERRADA'],
    ORDER_TYPES: ['mantenimiento', 'obra', 'cctv'],
    listOrders: async (...args: [ListOpts]) => {
      callCount.listOrders += 1;
      return impl.listOrders(...args);
    },
    createOrder: async (...args: [any, string]) => {
      callCount.createOrder += 1;
      return impl.createOrder(...args);
    },
    getOrderDetail: async (...args: [string]) => {
      callCount.getOrderDetail += 1;
      return impl.getOrderDetail(...args);
    },
    updateOrder: async (...args: UpdateArgs) => {
      callCount.updateOrder += 1;
      return impl.updateOrder(...args);
    },
  },
} as unknown as NodeModule;

async function getApp() {
  const mod = await import('../app');
  return mod.default;
}

beforeEach(() => {
  callCount.listOrders = 0;
  callCount.createOrder = 0;
  callCount.getOrderDetail = 0;
  callCount.updateOrder = 0;
  impl.listOrders = async () => {
    throw new Error('listOrders no configurado');
  };
  impl.createOrder = async () => {
    throw new Error('createOrder no configurado');
  };
  impl.getOrderDetail = async () => {
    throw new Error('getOrderDetail no configurado');
  };
  impl.updateOrder = async () => {
    throw new Error('updateOrder no configurado');
  };
});

afterEach(() => {
  callCount.listOrders = 0;
  callCount.createOrder = 0;
  callCount.getOrderDetail = 0;
  callCount.updateOrder = 0;
});

test('GET /v1/ordenes responde 200 con filtros aplicados', async () => {
  impl.listOrders = async (opts) => {
    assert.equal(opts.estado, 'NUEVA');
    assert.equal(opts.q, 'cctv');
    assert.equal(opts.page, 2);
    assert.equal(opts.pageSize, 5);
    return {
      data: [
        {
          id: 'ord-1',
          consecutivo: 'ORD-2025-000001',
          titulo: 'Orden demo',
          descripcion: 'Revisión general',
          estado: 'NUEVA',
          prioridad: 'baja',
          tipo: 'mantenimiento',
          cliente: { id: 'cli-1', nombre: 'Cliente Demo' },
          responsable: null,
          creado_en: new Date().toISOString(),
          mod_en: new Date().toISOString(),
        },
      ],
      total: 1,
    };
  };

  const app = await getApp();
  const token = await getToken();
  const response = await request(app)
    .get('/v1/ordenes?estado=NUEVA&q=cctv&page=2&pageSize=5')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(callCount.listOrders, 1);
  assert.equal(response.body.pagination.total, 1);
  assert.equal(response.body.pagination.page, 2);
  assert.equal(response.body.data[0].consecutivo, 'ORD-2025-000001');
});

test('POST /v1/ordenes crea una orden válida', async () => {
  impl.createOrder = async (payload, userId) => {
    assert.equal(userId, 'user-123');
    assert.equal(payload.cliente_id, CLIENTE_ID);
    assert.equal(payload.tipo, 'mantenimiento');
    return {
      id: 'ord-1',
      consecutivo: 'ORD-2025-000010',
      titulo: 'Revisión CCTV',
      descripcion: 'Descripción demo',
      estado: 'NUEVA',
      prioridad: 'baja',
      tipo: 'mantenimiento',
      cliente: { id: payload.cliente_id, nombre: 'Cliente Demo Cermont' },
      cliente_id: payload.cliente_id,
      contacto: 'Laura Delgado',
      responsable: null,
      creado_en: new Date().toISOString(),
      mod_en: new Date().toISOString(),
      historial: [
        {
          id: 'hist-1',
          estado: 'NUEVA',
          nota: 'Orden creada',
          usuario_id: userId,
          responsable_id: null,
          ts: new Date().toISOString(),
        },
      ],
    };
  };

  const app = await getApp();
  const token = await getToken();
  const response = await request(app)
    .post('/v1/ordenes')
    .set('Authorization', `Bearer ${token}`)
    .send({
      cliente_id: CLIENTE_ID,
      tipo: 'mantenimiento',
      prioridad: 'baja',
      titulo: 'Revisión CCTV',
      descripcion: 'Descripción demo',
      contacto: 'Laura Delgado',
    })
    .expect(201);

  assert.equal(callCount.createOrder, 1);
  assert.equal(response.body.consecutivo, 'ORD-2025-000010');
  assert.equal(response.body.historial.length, 1);
});

test('POST /v1/ordenes responde 422 si faltan campos', async () => {
  const app = await getApp();
  const token = await getToken();
  const response = await request(app)
    .post('/v1/ordenes')
    .set('Authorization', `Bearer ${token}`)
    .send({
      cliente_id: CLIENTE_ID,
      titulo: 'Sin datos',
    })
    .expect(422);

  assert.equal(response.body.code, 'validation_error');
  assert.equal(callCount.createOrder, 0);
});

test('PATCH /v1/ordenes/:id permite transiciones válidas y crece historial', async () => {
  const orderState = {
    estado: 'NUEVA',
    responsable: null as string | null,
    history: 1,
  };

  impl.updateOrder = async (id, payload, _userId) => {
    if (id !== 'ord-1') {
      throw new Error('ID inesperado');
    }

    if (orderState.estado === 'NUEVA' && payload.estado === 'ASIGNADA') {
      orderState.estado = 'ASIGNADA';
      orderState.responsable = payload.responsable_id ?? orderState.responsable;
      orderState.history += 1;
    } else if (orderState.estado === 'ASIGNADA' && payload.estado === 'EN_EJECUCION') {
      orderState.estado = 'EN_EJECUCION';
      orderState.responsable = payload.responsable_id ?? orderState.responsable;
      orderState.history += 1;
    } else {
      throw new Error('Transición no configurada');
    }

    return {
      id: 'ord-1',
      consecutivo: 'ORD-2025-000010',
      titulo: 'Revisión CCTV',
      descripcion: 'Descripción demo',
      estado: orderState.estado,
      prioridad: 'baja',
      tipo: 'mantenimiento',
      cliente: { id: CLIENTE_ID, nombre: 'Cliente Demo Cermont' },
      cliente_id: CLIENTE_ID,
      contacto: 'Laura Delgado',
      responsable: orderState.responsable
        ? { id: orderState.responsable, correo: 'tecnico@demo.co' }
        : null,
      creado_en: new Date().toISOString(),
      mod_en: new Date().toISOString(),
      historial: Array.from({ length: orderState.history }, (_, index) => ({
        id: `hist-${index}`,
        estado: orderState.estado,
        nota: null,
        usuario_id: 'user-123',
        responsable_id: orderState.responsable,
        ts: new Date(Date.now() - index * 1000).toISOString(),
      })),
    };
  };

  const app = await getApp();
  const token = await getToken();

  const first = await request(app)
    .patch('/v1/ordenes/ord-1')
    .set('Authorization', `Bearer ${token}`)
    .send({ estado: 'ASIGNADA', responsable_id: RESPONSABLE_ID })
    .expect(200);

  assert.equal(first.body.estado, 'ASIGNADA');
  assert.equal(first.body.historial.length, 2);

  const second = await request(app)
    .patch('/v1/ordenes/ord-1')
    .set('Authorization', `Bearer ${token}`)
    .send({ estado: 'EN_EJECUCION', nota: 'Arranque de labores' })
    .expect(200);

  assert.equal(second.body.estado, 'EN_EJECUCION');
  assert.equal(second.body.historial.length, 3);
  assert.equal(callCount.updateOrder, 2);
});

test('PATCH /v1/ordenes/:id responde 409 en transición inválida', async () => {
  impl.updateOrder = async (_id, _payload, _userId) => {
    throw new HttpError(409, 'Transición inválida');
  };

  const app = await getApp();
  const token = await getToken();
  const response = await request(app)
    .patch('/v1/ordenes/ord-1')
    .set('Authorization', `Bearer ${token}`)
    .send({ estado: 'EN_EJECUCION' })
    .expect(409);

  assert.equal(response.body.code, 'conflict');
});
