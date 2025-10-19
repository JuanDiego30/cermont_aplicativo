import { z } from "zod";

export const cctvSchema = z.object({
  // A. Generalidades
  lugar: z.string().min(2, "Lugar requerido"),
  fecha: z.string().min(1, "Fecha requerida"), // ISO yyyy-mm-dd
  camaraNo: z.union([z.string(), z.number()]).optional(),
  rutinaNo: z.union([z.string(), z.number()]).optional(),
  alturaEstructura: z.union([z.string(), z.number()]).optional(),
  alturaCamara: z.union([z.string(), z.number()]).optional(),
  ubicacion: z.string().optional(),

  // B. CCTV
  camara: z.object({
    tipo: z.string().optional(),
    modelo: z.string().optional(),
    serial: z.string().optional(),
  }),

  // C. Conexión remota
  encoderPoe: z.object({
    tipo: z.string().optional(),
    modelo: z.string().optional(),
    serial: z.string().optional(),
  }),
  radio: z.object({
    tipo: z.string().optional(),
    modelo: z.string().optional(),
    serial: z.string().optional(),
  }),
  antenaExterna: z.object({
    nombre: z.string().optional(),
    tipo: z.string().optional(),
    serial: z.string().optional(),
  }),
  switchEquipo: z.object({
    tipo: z.string().optional(),
    modelo: z.string().optional(),
    serial: z.string().optional(),
  }),

  // D. Conexión master
  master: z.object({
    radio: z.object({
      tipo: z.string().optional(),
      modelo: z.string().optional(),
      serial: z.string().optional(),
    }),
  }).optional(),

  // E. Sistema eléctrico / fotovoltaico / PAT
  electrico: z.object({
  ac110: z.boolean().optional(),
  fotovoltaico: z.boolean().optional(),
  cajaConexion: z.boolean().optional(),
  transferenciaAutomatica: z.boolean().optional(),
  puestaTierraOk: z.boolean().optional(),
  activoAC: z.boolean().optional(),
  activoSol: z.boolean().optional(),
    alimentacionOrigen: z.string().optional(),
    sistemaActivo: z.enum(["AC", "SOL"]).optional(),
    gabineteBaseTorre: z.string().optional(),
    tbt: z.string().optional(),
    lucesObstruccion: z.string().optional(),
  }),

  // F. Distancias
  distanciaCamCaja: z.union([z.string(), z.number()]).optional(),

  // G. Observaciones
  observaciones: z.string().optional(),
  alcance: z.string().optional(),

  // H. Registro fotográfico (a futuro: URLs/ids; por ahora FileList)
  fotos: z.object({
    camaraAntes: z.any().optional(),
    camaraDespues: z.any().optional(),
    radioAntes: z.any().optional(),
    radioDespues: z.any().optional(),
    cajaAntes: z.any().optional(),
    cajaDespues: z.any().optional(),
    electricaAntes: z.any().optional(),
    electricaDespues: z.any().optional(),
    patAntes: z.any().optional(),
    patDespues: z.any().optional(),
    generalAntes: z.any().optional(),
    generalDespues: z.any().optional(),
  }).optional(),
});

export type CctvFormData = z.infer<typeof cctvSchema>;
