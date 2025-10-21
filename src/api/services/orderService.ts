import { type QueryResult, type QueryResultRow } from 'pg';
import { type DbClient, query, withTransaction } from '../db/client';
import { HttpError } from '../middleware/errorHandler';

export const ORDER_STATES = ['NUEVA', 'ASIGNADA', 'EN_EJECUCION', 'FINALIZADA', 'CERRADA'] as const;
export type OrderState = (typeof ORDER_STATES)[number];

export const ORDER_PRIORITIES = ['baja', 'normal', 'alta', 'importante', 'uci'] as const;
export type OrderPriority = (typeof ORDER_PRIORITIES)[number];

export const ORDER_TYPES = ['mantenimiento', 'obra', 'cctv'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export interface OrderSummary {
  id: string;
  consecutivo: string;
  titulo: string;
  descripcion: string;
  estado: OrderState;
  prioridad: OrderPriority;
  tipo: OrderType;
  cliente: {
    id: string;
    nombre: string;
  } | null;
  responsable: {
    id: string;
    correo: string;
  } | null;
  creado_en: string;
  mod_en: string;
}

export interface OrderHistoryEntry {
  id: string;
  estado: OrderState;
  nota: string | null;
  usuario_id: string;
  responsable_id: string | null;
  ts: string;
  usuario?: {
    id: string;
    correo: string;
    rol?: string;
  } | null;
}

export interface OrderDetail extends OrderSummary {
  cliente_id: string;
  contacto: string;
  historial: OrderHistoryEntry[];
}

export interface ListOrdersOptions {
  page: number;
  pageSize: number;
  estado?: OrderState;
  cliente?: string;
  q?: string;
}

export interface ListOrdersResult {
  data: OrderSummary[];
  total: number;
}

export interface CreateOrderInput {
  cliente_id: string;
  tipo: OrderType;
  prioridad: OrderPriority;
  titulo: string;
  descripcion: string;
  contacto: string;
}

export interface UpdateOrderInput {
  estado?: OrderState;
  responsable_id?: string | null;
  nota?: string | null;
}

const ORDER_TRANSITIONS: Record<OrderState, OrderState[]> = {
  NUEVA: ['ASIGNADA'],
  ASIGNADA: ['EN_EJECUCION'],
  EN_EJECUCION: ['FINALIZADA'],
  FINALIZADA: ['CERRADA'],
  CERRADA: [],
};

async function generateConsecutivo(client: DbClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;
  const likeValue = `${prefix}%`;

  const { rows } = await client.query<{ consecutivo: string }>(
    `select consecutivo
     from ordenes
     where consecutivo like $1
     order by consecutivo desc
     limit 1`,
    [likeValue],
  );

  const last = rows[0]?.consecutivo;
  const lastNumber = last ? Number.parseInt(last.replace(prefix, ''), 10) : 0;
  const nextNumber = Number.isNaN(lastNumber) ? 1 : lastNumber + 1;
  return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
}

type OrderSummaryRow = {
  id: string;
  consecutivo: string;
  titulo: string;
  descripcion: string;
  estado: OrderState;
  prioridad: OrderPriority;
  tipo: OrderType;
  cliente_id: string | null;
  cliente_nombre: string | null;
  responsable_id: string | null;
  responsable_correo: string | null;
  creado_en: string;
  mod_en: string;
};

type OrderDetailRow = OrderSummaryRow & {
  cliente_id: string;
  contacto: string;
};

type OrderHistoryRow = {
  id: string;
  estado: OrderState;
  nota: string | null;
  usuario_id: string;
  responsable_id: string | null;
  ts: string;
  usuario_id_full: string | null;
  usuario_correo: string | null;
  usuario_rol: string | null;
};

function mapSummary(row: OrderSummaryRow): OrderSummary {
  return {
    id: row.id,
    consecutivo: row.consecutivo,
    titulo: row.titulo,
    descripcion: row.descripcion,
    estado: row.estado,
    prioridad: row.prioridad,
    tipo: row.tipo,
    cliente: row.cliente_id
      ? {
          id: row.cliente_id,
          nombre: row.cliente_nombre ?? row.cliente_id,
        }
      : null,
    responsable: row.responsable_id
      ? {
          id: row.responsable_id,
          correo: row.responsable_correo ?? row.responsable_id,
        }
      : null,
    creado_en: row.creado_en,
    mod_en: row.mod_en,
  };
}

function mapDetail(row: OrderDetailRow, history: OrderHistoryEntry[]): OrderDetail {
  const summary = mapSummary(row);
  return {
    ...summary,
    cliente_id: row.cliente_id,
    contacto: row.contacto,
    historial: history,
  };
}

function mapHistory(rows: OrderHistoryRow[]): OrderHistoryEntry[] {
  return rows.map((row) => ({
    id: row.id,
    estado: row.estado,
    nota: row.nota,
    usuario_id: row.usuario_id,
    responsable_id: row.responsable_id,
    ts: row.ts,
    usuario: row.usuario_id_full
      ? {
          id: row.usuario_id_full,
          correo: row.usuario_correo ?? row.usuario_id_full,
          rol: row.usuario_rol ?? undefined,
        }
      : null,
  }));
}

async function runQuery<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[],
  client?: DbClient,
): Promise<QueryResult<T>> {
  if (client) {
    return client.query<T>(sql, params);
  }
  return query<T>(sql, params);
}

async function fetchOrderHistory(orderId: string, client?: DbClient): Promise<OrderHistoryEntry[]> {
  const { rows } = await runQuery<OrderHistoryRow>(
    `select h.id,
            h.estado,
            h.nota,
            h.usuario_id,
            h.responsable_id,
            h.ts,
            u.id as usuario_id_full,
            u.correo as usuario_correo,
            u.rol as usuario_rol
     from orden_estado_hist h
     left join usuarios u on u.id = h.usuario_id
     where h.orden_id = $1
     order by h.ts desc`,
    [orderId],
    client,
  );

  return mapHistory(rows);
}

export async function listOrders(options: ListOrdersOptions): Promise<ListOrdersResult> {
  const filters: string[] = ['o.eliminado_en is null'];
  const params: unknown[] = [];

  if (options.estado) {
    params.push(options.estado);
    filters.push(`o.estado = $${params.length}`);
  }

  if (options.cliente) {
    params.push(options.cliente);
    filters.push(`o.cliente_id = $${params.length}`);
  }

  if (options.q) {
    params.push(`%${options.q}%`);
    filters.push(`(o.titulo ilike $${params.length} or o.descripcion ilike $${params.length})`);
  }

  const whereClause = filters.length ? `where ${filters.join(' and ')}` : '';
  const limitIndex = params.length + 1;
  const offsetIndex = params.length + 2;
  const offset = (options.page - 1) * options.pageSize;

  try {
    const { rows } = await query<OrderSummaryRow>(
      `select o.id,
              o.consecutivo,
              o.titulo,
              o.descripcion,
              o.estado,
              o.prioridad,
              o.tipo,
              o.cliente_id,
              c.nombre as cliente_nombre,
              o.responsable_id,
              r.correo as responsable_correo,
              o.creado_en,
              o.mod_en
       from ordenes o
       left join clientes c on c.id = o.cliente_id
       left join usuarios r on r.id = o.responsable_id
       ${whereClause}
       order by o.creado_en desc
       limit $${limitIndex}
       offset $${offsetIndex}`,
      [...params, options.pageSize, offset],
    );

    const { rows: countRows } = await query<{ total: number }>(
      `select count(1)::int as total
       from ordenes o
       ${whereClause}`,
      params,
    );

    return {
      data: rows.map(mapSummary),
      total: countRows[0]?.total ?? 0,
    };
  } catch (error) {
    throw new HttpError(500, 'No se pudieron listar las órdenes', error instanceof Error ? error.message : undefined);
  }
}

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  try {
    const { rows } = await query<OrderDetailRow>(
      `select o.id,
              o.consecutivo,
              o.titulo,
              o.descripcion,
              o.estado,
              o.prioridad,
              o.tipo,
              o.cliente_id,
              c.nombre as cliente_nombre,
              o.contacto,
              o.responsable_id,
              r.correo as responsable_correo,
              o.creado_en,
              o.mod_en
       from ordenes o
       left join clientes c on c.id = o.cliente_id
       left join usuarios r on r.id = o.responsable_id
       where o.id = $1 and o.eliminado_en is null
       limit 1`,
      [id],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    const history = await fetchOrderHistory(id);
    return mapDetail(row, history);
  } catch (error) {
    throw new HttpError(500, 'No se pudo obtener la orden', error instanceof Error ? error.message : undefined);
  }
}

async function insertHistoryEntry(
  client: DbClient,
  payload: {
    orden_id: string;
    estado: OrderState;
    usuario_id: string;
    nota?: string | null;
    responsable_id?: string | null;
  },
) {
  await client.query(
    `insert into orden_estado_hist (orden_id, estado, usuario_id, nota, responsable_id)
     values ($1, $2, $3, $4, $5)`,
    [payload.orden_id, payload.estado, payload.usuario_id, payload.nota ?? null, payload.responsable_id ?? null],
  );
}

export async function createOrder(payload: CreateOrderInput, userId: string): Promise<OrderDetail> {
  const orderId = await withTransaction(async (client) => {
    let attempts = 0;
    while (attempts < 3) {
      const consecutivo = await generateConsecutivo(client);
      try {
        const { rows } = await client.query<{ id: string }>(
          `insert into ordenes (
             consecutivo,
             cliente_id,
             tipo,
             prioridad,
             titulo,
             descripcion,
             contacto,
             estado,
             creado_por
           ) values ($1, $2, $3, $4, $5, $6, $7, 'NUEVA', $8)
           returning id`,
          [
            consecutivo,
            payload.cliente_id,
            payload.tipo,
            payload.prioridad,
            payload.titulo,
            payload.descripcion,
            payload.contacto,
            userId,
          ],
        );

        const insertedId = rows[0]?.id;
        if (!insertedId) {
          throw new HttpError(500, 'No se pudo crear la orden');
        }

        await insertHistoryEntry(client, {
          orden_id: insertedId,
          estado: 'NUEVA',
          usuario_id: userId,
          nota: 'Orden creada',
        });

        return insertedId;
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
          const code = (error as { code?: string }).code;
          if (code === '23505') {
            attempts += 1;
            continue;
          }
          if (code === '23503') {
            throw new HttpError(400, 'El cliente o responsable indicado no existe');
          }
        }
        throw error;
      }
    }

    throw new HttpError(409, 'No se pudo generar un consecutivo único para la orden');
  });

  const detail = await getOrderDetail(orderId);
  if (!detail) {
    throw new HttpError(500, 'No se pudo obtener la orden recién creada');
  }

  return detail;
}

export async function updateOrder(id: string, payload: UpdateOrderInput, userId: string): Promise<OrderDetail> {
  if (!payload.estado && payload.responsable_id === undefined) {
    throw new HttpError(400, 'No hay cambios para aplicar en la orden');
  }

  const existing = await getOrderDetail(id);
  if (!existing) {
    throw new HttpError(404, 'Orden no encontrada');
  }

  const updates: string[] = [];
  const params: unknown[] = [];
  const historyEntries: Array<{ estado: OrderState; nota?: string | null; responsable_id?: string | null }> = [];

  if (payload.estado && payload.estado !== existing.estado) {
    const allowed = ORDER_TRANSITIONS[existing.estado];
    if (!allowed.includes(payload.estado)) {
      throw new HttpError(409, `Transición inválida de ${existing.estado} a ${payload.estado}`);
    }
    params.push(payload.estado);
    updates.push(`estado = $${params.length}`);
    historyEntries.push({
      estado: payload.estado,
      nota: payload.nota ?? null,
      responsable_id: existing.responsable?.id ?? null,
    });
  }

  if (payload.responsable_id !== undefined && payload.responsable_id !== existing.responsable?.id) {
    params.push(payload.responsable_id);
    updates.push(`responsable_id = $${params.length}`);
    const targetState = (payload.estado as OrderState | undefined) ?? existing.estado;
    historyEntries.push({
      estado: targetState,
      nota: payload.nota ?? 'Responsable actualizado',
      responsable_id: payload.responsable_id ?? null,
    });
  }

  if (updates.length === 0) {
    return existing;
  }

  await withTransaction(async (client) => {
    try {
      const assignments = `${updates.join(', ')}, mod_en = now()`;
      const { rowCount } = await client.query(
        `update ordenes
         set ${assignments}
         where id = $${params.length + 1} and eliminado_en is null`,
        [...params, id],
      );

      if (!rowCount) {
        throw new HttpError(404, 'Orden no encontrada');
      }

      for (const entry of historyEntries) {
        await insertHistoryEntry(client, {
          orden_id: id,
          estado: entry.estado,
          usuario_id: userId,
          nota: entry.nota ?? null,
          responsable_id: entry.responsable_id ?? null,
        });
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '23503') {
        throw new HttpError(400, 'Responsable inválido para la orden');
      }
      throw error;
    }
  });

  const detail = await getOrderDetail(id);
  if (!detail) {
    throw new HttpError(500, 'No se pudo obtener la orden actualizada');
  }

  return detail;
}
