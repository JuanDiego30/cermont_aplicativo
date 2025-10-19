// Validaciones para órdenes de trabajo
import * as z from 'zod';

export const esquemaOrden = z.object({
  titulo: z.string().min(3, 'El título es obligatorio'),
  descripcion: z.string().min(10, 'La descripción es obligatoria'),
  fecha: z.string(),
  estado: z.enum(['pendiente', 'en progreso', 'finalizada']),
});
