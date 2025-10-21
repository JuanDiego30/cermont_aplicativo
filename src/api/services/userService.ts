import { query } from '../db/client';
import { HttpError } from '../middleware/errorHandler';

export interface UserRecord {
  id: string;
  correo: string;
  hash: string;
  rol: string;
  activo: boolean;
  creado_en: string;
  mod_en: string;
}

export async function findUserByCorreo(correo: string): Promise<UserRecord | null> {
  try {
    const { rows } = await query<UserRecord>(
      `select id, correo, hash, rol, activo, creado_en, mod_en
       from usuarios
       where correo = $1
       limit 1`,
      [correo],
    );

    return rows[0] ?? null;
  } catch (error) {
    throw new HttpError(500, 'Error consultando usuario por correo', error instanceof Error ? error.message : undefined);
  }
}

export async function createUser(payload: { correo: string; hash: string; rol?: string }): Promise<UserRecord> {
  try {
    const rol = payload.rol ?? 'cliente';
    const { rows } = await query<UserRecord>(
      `insert into usuarios (correo, hash, rol, activo)
       values ($1, $2, $3, true)
       returning id, correo, hash, rol, activo, creado_en, mod_en`,
      [payload.correo, payload.hash, rol],
    );

    return rows[0];
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '23505') {
      throw new HttpError(409, 'El correo ya está registrado');
    }

    throw new HttpError(500, 'Error creando el usuario', error instanceof Error ? error.message : undefined);
  }
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  try {
    const { rows } = await query<UserRecord>(
      `select id, correo, hash, rol, activo, creado_en, mod_en
       from usuarios
       where id = $1
       limit 1`,
      [id],
    );

    return rows[0] ?? null;
  } catch (error) {
    throw new HttpError(500, 'Error consultando usuario por id', error instanceof Error ? error.message : undefined);
  }
}

export interface ListUsersOptions {
  page: number;
  limit: number;
  search?: string;
  rol?: string;
  activo?: boolean;
}

export async function listUsers(options: ListUsersOptions) {
  const filters: string[] = [];
  const params: unknown[] = [];

  if (options.search) {
    params.push(`%${options.search}%`);
    filters.push(`correo ILIKE $${params.length}`);
  }

  if (options.rol) {
    params.push(options.rol);
    filters.push(`rol = $${params.length}`);
  }

  if (typeof options.activo === 'boolean') {
    params.push(options.activo);
    filters.push(`activo = $${params.length}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const limitIndex = params.length + 1;
  const offsetIndex = params.length + 2;
  const limit = options.limit;
  const offset = (options.page - 1) * options.limit;

  try {
    const { rows } = await query<UserRecord>(
      `select id, correo, hash, rol, activo, creado_en, mod_en
       from usuarios
       ${whereClause}
       order by creado_en desc
       limit $${limitIndex}
       offset $${offsetIndex}`,
      [...params, limit, offset],
    );

    const { rows: countRows } = await query<{ total: number }>(
      `select count(1)::int as total
       from usuarios
       ${whereClause}`,
      params,
    );

    return {
      data: rows,
      count: countRows[0]?.total ?? 0,
    };
  } catch (error) {
    throw new HttpError(500, 'Error al listar usuarios', error instanceof Error ? error.message : undefined);
  }
}
