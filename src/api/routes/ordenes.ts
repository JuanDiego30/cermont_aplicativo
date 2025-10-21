import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authRequired } from '../middleware/authRequired';
import { HttpError } from '../middleware/errorHandler';
import {
  ORDER_PRIORITIES,
  ORDER_STATES,
  ORDER_TYPES,
  type OrderState,
  createOrder,
  getOrderDetail,
  listOrders,
  updateOrder,
} from '../services/orderService';
import { createEvidence, deleteEvidence, listEvidence } from '../services/evidenceService';

const router = Router();

const TEMP_DIR = path.join(os.tmpdir(), 'cermont_evidencias');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.diskStorage({
    destination: TEMP_DIR,
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new HttpError(415, 'Tipo de archivo no permitido'));
      return;
    }
    cb(null, true);
  },
});

const querySchema = z.object({
  estado: z.enum(ORDER_STATES).optional(),
  cliente: z.string().uuid().optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const createSchema = z.object({
  cliente_id: z.string().uuid({ message: 'cliente_id inválido' }),
  tipo: z.enum(ORDER_TYPES, { message: 'tipo inválido' }),
  prioridad: z.enum(ORDER_PRIORITIES, { message: 'prioridad inválida' }),
  titulo: z.string().trim().min(3, 'El título es obligatorio'),
  descripcion: z.string().trim().min(10, 'La descripción es obligatoria'),
  contacto: z.string().trim().min(3, 'El contacto es obligatorio'),
});

const patchSchema = z.object({
  estado: z.enum(ORDER_STATES).optional(),
  responsable_id: z.union([z.string().uuid(), z.null()]).optional(),
  nota: z.string().trim().max(1000, 'La nota no puede superar los 1000 caracteres').optional(),
}).refine((data) => data.estado !== undefined || data.responsable_id !== undefined, {
  message: 'Debe enviar al menos estado o responsable_id',
  path: ['estado'],
});

router.use(authRequired);

router.get('/', async (req, res, next) => {
  try {
    const parsed = querySchema.parse(req.query);
    const page = parsed.page ?? 1;
    const pageSize = parsed.pageSize ?? 10;

    const result = await listOrders({
      page,
      pageSize,
      estado: parsed.estado as OrderState | undefined,
      cliente: parsed.cliente,
      q: parsed.q,
    });

    const totalPages = pageSize > 0 ? Math.ceil(result.total / pageSize) : 0;

    return res.json({
      data: result.data,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new HttpError(422, 'Parámetros de consulta inválidos', error.flatten()));
    }
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpError(401, 'Autenticación requerida');
    }

    const order = await createOrder(body, userId);
    return res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new HttpError(422, 'Datos inválidos para la orden', error.flatten()));
    }
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new HttpError(400, 'ID de la orden requerido');
    }

    const order = await getOrderDetail(id);
    if (!order) {
      throw new HttpError(404, 'Orden no encontrada');
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new HttpError(400, 'ID de la orden requerido');
    }
    const body = patchSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpError(401, 'Autenticación requerida');
    }

    const order = await updateOrder(id, body, userId);
    return res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new HttpError(422, 'Datos inválidos para la actualización', error.flatten()));
    }
    return next(error);
  }
});

router.get('/:id/evidencias', async (req, res, next) => {
  try {
    const { id } = req.params;
    const evidencias = await listEvidence(id);
    return res.json({ data: evidencias });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/evidencias', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err instanceof HttpError) {
        return next(err);
      }
      if ((err as { code?: string }).code === 'LIMIT_FILE_SIZE') {
        return next(new HttpError(413, 'El archivo excede el límite de 10MB'));
      }
      return next(new HttpError(400, 'Error al procesar el archivo', err instanceof Error ? err.message : err));
    }

    const file = req.file;
    if (!file) {
      return next(new HttpError(400, 'Debe adjuntar un archivo en el campo "file"'));
    }

    const userId = req.user?.id;
    if (!userId) {
      await fsPromises.unlink(file.path).catch(() => undefined);
      return next(new HttpError(401, 'Autenticación requerida'));
    }

    try {
      const evidencia = await createEvidence({
        orden_id: req.params.id,
        tipo: typeof req.body.tipo === 'string' && req.body.tipo.trim() ? req.body.tipo.trim() : file.mimetype,
        filePath: file.path,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploaderId: userId,
      });

      return res.status(201).json({
        id: evidencia.id,
        url: evidencia.url,
        tipo: evidencia.tipo,
        ts: evidencia.ts,
        meta: evidencia.meta_json ?? null,
      });
    } catch (error) {
      await fsPromises.unlink(file.path).catch(() => undefined);
      return next(error);
    }
  });
});

router.delete('/:id/evidencias/:evidenceId', async (req, res, next) => {
  try {
    const { id, evidenceId } = req.params;
    await deleteEvidence(id, evidenceId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/informe', async (_req, res) => {
  return res.json({ message: 'Endpoint de informe pendiente de implementación' });
});

export default router;
