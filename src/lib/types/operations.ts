/**
 * Tipos para Checklist de Herramientas/Equipos y Seguimiento de Costos
 * Resuelven fallas: planeación incompleta, olvido de herramientas, retrasos en actas, facturación y costos reales
 */

// ===== CHECKLIST DE HERRAMIENTAS Y EQUIPOS =====

export type CategoriaHerramienta = 'herramienta_mano' | 'equipo_medicion' | 'equipo_seguridad' | 'material_consumible' | 'vehiculo' | 'otro';

export interface ItemChecklist {
  id: string;
  nombre: string;
  categoria: CategoriaHerramienta;
  descripcion?: string;
  obligatorio: boolean;
  cantidad_sugerida?: number;
  unidad?: string; // 'unidad', 'metro', 'kg', 'caja', etc.
}

export interface PlantillaChecklist {
  id: string;
  nombre: string;
  tipo_equipo: 'CCTV' | 'Radio Enlace' | 'Torre' | 'Otro';
  tipo_orden?: 'Mantenimiento Preventivo' | 'Mantenimiento Correctivo' | 'Instalación' | 'Diagnóstico';
  items: ItemChecklist[];
  notas?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistOrden {
  id: string;
  orden_id: string;
  plantilla_id: string;
  items_verificados: {
    item_id: string;
    verificado: boolean;
    cantidad_real?: number;
    notas?: string;
    verificado_por?: string;
    verificado_en?: string;
  }[];
  completado: boolean;
  porcentaje_completado: number;
  created_at: string;
  updated_at: string;
}

// ===== SEGUIMIENTO DE COSTOS =====

export type TipoCosto = 'mano_obra' | 'transporte' | 'herramientas' | 'materiales' | 'subcontrato' | 'viaticos' | 'otro';

export interface ItemCosto {
  id: string;
  descripcion: string;
  tipo: TipoCosto;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  iva?: number;
  notas?: string;
}

export interface CostosOrden {
  id: string;
  orden_id: string;
  // Estimado (de la propuesta económica)
  estimado: {
    items: ItemCosto[];
    subtotal: number;
    iva_total: number;
    total: number;
  };
  // Real (ejecutado)
  real: {
    items: ItemCosto[];
    subtotal: number;
    iva_total: number;
    total: number;
  };
  // Comparativa
  diferencia: number; // real.total - estimado.total
  porcentaje_variacion: number; // (diferencia / estimado.total) * 100
  rentabilidad: number; // valor_facturado - real.total
  valor_facturado?: number;
  fecha_facturacion?: string;
  factura_numero?: string;
  // Estado
  aprobado: boolean;
  aprobado_por?: string;
  aprobado_en?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

// ===== GESTIÓN DE INFORMES Y ACTAS =====

export type EstadoInforme = 'pendiente' | 'borrador' | 'revision' | 'aprobado' | 'enviado';

export interface InformeOrden {
  id: string;
  orden_id: string;
  tipo: 'acta_inicio' | 'acta_cierre' | 'informe_tecnico' | 'informe_fotografico' | 'factura';
  estado: EstadoInforme;
  fecha_limite?: string;
  fecha_entrega?: string;
  dias_retraso?: number;
  url_documento?: string;
  elaborado_por?: string;
  aprobado_por?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

// ===== ALERTAS Y NOTIFICACIONES =====

export type TipoAlerta = 'costo_sobrepasado' | 'factura_pendiente' | 'informe_retrasado' | 'checklist_incompleto' | 'orden_vencida';
export type SeveridadAlerta = 'info' | 'warning' | 'error';

export interface Alerta {
  id: string;
  orden_id: string;
  tipo: TipoAlerta;
  severidad: SeveridadAlerta;
  titulo: string;
  mensaje: string;
  leida: boolean;
  accionada: boolean;
  fecha_creacion: string;
  fecha_lectura?: string;
}

// ===== DASHBOARD GERENCIAL =====

export interface MetricasGerenciales {
  ordenes_activas: number;
  ordenes_retrasadas: number;
  facturas_pendientes: number;
  informes_retrasados: number;
  costo_real_mes: number;
  costo_estimado_mes: number;
  rentabilidad_promedio: number;
  alertas_criticas: number;
  checklists_incompletos: number;
}
