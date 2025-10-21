import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { query, withTransaction, type DbClient } from '../db/client';
import { HttpError } from '../middleware/errorHandler';

export interface EvidenceRecord {
  id: string;
  orden_id: string;
  url: string;
  tipo: string;
  meta_json: Record<string, unknown> | null;
  ts: string;
}

export interface CreateEvidenceInput {
  orden_id: string;
  tipo: string;
  filePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploaderId: string;
}

const BASE_DIR = path.resolve(process.cwd(), 'data', 'evidencias');

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function saveFile(ordenId: string, tempPath: string, originalName: string): Promise<{ storagePath: string; url: string }>
{
  const fileId = randomUUID();
  const orderDir = path.join(BASE_DIR, ordenId);
  await ensureDir(orderDir);

  const ext = path.extname(originalName);
  const filename = `${fileId}${ext}`;
  const destination = path.join(orderDir, filename);

  await fs.rename(tempPath, destination);

  return {
    storagePath: destination,
    url: `/data/evidencias/${ordenId}/${filename}`,
  };
}

export async function createEvidence(input: CreateEvidenceInput): Promise<EvidenceRecord> {
  return withTransaction(async (client: DbClient) => {
    const orderExists = await client.query('select 1 from ordenes where id = $1', [input.orden_id]);
    if (orderExists.rowCount === 0) {
      await fs.unlink(input.filePath).catch(() => undefined);
      throw new HttpError(404, 'Orden no encontrada');
    }

    const { storagePath, url } = await saveFile(input.orden_id, input.filePath, input.originalName);

    try {
      const meta: Record<string, unknown> = {
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: input.size,
        storagePath,
        uploaderId: input.uploaderId,
      };

      const { rows } = await client.query<EvidenceRecord>(
        `insert into evidencias (orden_id, url, tipo, meta_json)
         values ($1, $2, $3, $4::jsonb)
         returning id, orden_id, url, tipo, meta_json, ts`,
        [input.orden_id, url, input.tipo, JSON.stringify(meta)],
      );

      return rows[0];
    } catch (error) {
      await fs.unlink(storagePath).catch(() => undefined);
      throw error;
    }
  });
}

export async function listEvidence(ordenId: string): Promise<EvidenceRecord[]> {
  const { rows } = await query<EvidenceRecord>(
    `select id, orden_id, url, tipo, meta_json, ts
     from evidencias
     where orden_id = $1
     order by ts desc`,
    [ordenId],
  );

  return rows;
}

export async function deleteEvidence(ordenId: string, evidenceId: string): Promise<void> {
  await withTransaction(async (client) => {
    const { rows } = await client.query<{ meta_json: Record<string, unknown> | null; orden_id: string }>(
      `select orden_id, meta_json
       from evidencias
       where id = $1 and orden_id = $2
       for update`,
      [evidenceId, ordenId],
    );

    const record = rows[0];
    if (!record) {
      throw new HttpError(404, 'Evidencia no encontrada');
    }

    let storagePath: string | null = null;
    if (record.meta_json && typeof record.meta_json === 'object') {
      const candidate = (record.meta_json as Record<string, unknown>).storagePath;
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        storagePath = candidate;
      }
    }

    await client.query('delete from evidencias where id = $1 and orden_id = $2', [evidenceId, ordenId]);

    if (storagePath) {
      await fs.unlink(storagePath).catch(() => undefined);
    }
  });
}