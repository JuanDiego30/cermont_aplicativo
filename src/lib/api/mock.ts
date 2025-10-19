// Modo Mock para desarrollo frontend sin backend
// Persiste en localStorage: mock_fallas, mock_orden_fallas, mock_plantillas_checklist, mock_checklists_orden, mock_costos_orden

import type { Falla } from './failures';
import type { PlantillaChecklist, ChecklistOrden, CostosOrden } from '@/lib/types/operations';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function getStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function setStore<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function seedIfEmpty() {
  const fallas = getStore<Falla[]>('mock_fallas', []);
  if (fallas.length === 0) {
    const seed: Falla[] = [
      {
        id: '1', codigo: 'CCTV-001', nombre: 'Pérdida de señal', tipo_equipo: 'CCTV', severidad: 'alta',
        descripcion: 'El sistema deja de transmitir imagen por completo.', causas_probables: 'Corte de energía, cable dañado, cámara defectuosa.', acciones_sugeridas: 'Verificar alimentación, revisar cableado, cambiar cámara si es necesario.',
        activo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: '2', codigo: 'CCTV-002', nombre: 'Imagen borrosa', tipo_equipo: 'CCTV', severidad: 'media',
        descripcion: 'La imagen se ve desenfocada o poco nítida.', causas_probables: 'Lente sucio, condensación, mala configuración de enfoque.', acciones_sugeridas: 'Limpiar lente, ajustar enfoque, revisar sellado de la cámara.',
        activo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: '3', codigo: 'RAD-001', nombre: 'Atenuación de señal', tipo_equipo: 'Radio Enlace', severidad: 'alta',
        descripcion: 'La señal de radio pierde intensidad.', causas_probables: 'Interferencia, alineación incorrecta, obstáculos físicos.', acciones_sugeridas: 'Revisar alineación, eliminar obstáculos, cambiar frecuencia.',
        activo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: '4', codigo: 'TOR-001', nombre: 'Corrosión estructural', tipo_equipo: 'Torre', severidad: 'media',
        descripcion: 'Partes metálicas de la torre presentan óxido o corrosión.', causas_probables: 'Exposición a humedad, falta de mantenimiento.', acciones_sugeridas: 'Aplicar tratamiento anticorrosivo, realizar inspección periódica.',
        activo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
    ];
    setStore('mock_fallas', seed);
  }
  const of = getStore<any[]>('mock_orden_fallas', []);
  if (of.length === 0) setStore('mock_orden_fallas', []);
  
  // Seed plantillas checklist desde public/data si aún no existen
  const plantillas = getStore<PlantillaChecklist[]>('mock_plantillas_checklist', []);
  if (plantillas.length === 0) {
    // En producción se cargaría async desde /data/plantillas-checklist.json
    // Por simplicidad mock, dejamos vacío o seedeamos básico
    setStore('mock_plantillas_checklist', []);
  }
  const checklists = getStore<ChecklistOrden[]>('mock_checklists_orden', []);
  if (checklists.length === 0) setStore('mock_checklists_orden', []);
  
  const costos = getStore<CostosOrden[]>('mock_costos_orden', []);
  if (costos.length === 0) setStore('mock_costos_orden', []);
}

export async function handleMockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<any> {
  seedIfEmpty();
  const method = ((options.method || 'GET').toUpperCase()) as Method;
  const url = new URL(endpoint, 'http://localhost');

  // Parse body si viene
  let body: any = undefined;
  try { body = options.body ? JSON.parse(String(options.body)) : undefined; } catch {}

  // Recursos soportados: /failures, /failures/:id, /failures/assign, /failures/by-order/:id
  if (url.pathname === '/failures' && method === 'GET') {
    const all = getStore<Falla[]>('mock_fallas', []);
    const tipo_equipo = url.searchParams.get('tipo_equipo') || undefined;
    const severidad = url.searchParams.get('severidad') || undefined;
    const search = url.searchParams.get('search')?.toLowerCase() || '';

    let filtered = all.filter(f => f.activo !== false);
    if (tipo_equipo) filtered = filtered.filter(f => f.tipo_equipo === tipo_equipo);
    if (severidad) filtered = filtered.filter(f => f.severidad === severidad);
    if (search) filtered = filtered.filter(f => f.nombre.toLowerCase().includes(search) || f.codigo.toLowerCase().includes(search));

    return { data: { data: filtered, pagination: { page: 1, limit: filtered.length, total: filtered.length, totalPages: 1 } } };
  }

  if (url.pathname === '/failures' && method === 'POST') {
    const all = getStore<Falla[]>('mock_fallas', []);
    if (all.some(f => f.codigo === body?.codigo)) return { error: 'Código de falla ya existe' };
    const now = new Date().toISOString();
    const nueva: Falla = { id: String(Date.now()), activo: true, created_at: now, updated_at: now, ...body };
    all.push(nueva);
    setStore('mock_fallas', all);
    return { data: nueva };
  }

  if (url.pathname.startsWith('/failures/') && method === 'GET') {
    const id = url.pathname.split('/')[2];
    const all = getStore<Falla[]>('mock_fallas', []);
    const f = all.find(x => x.id === id);
    if (!f) return { error: 'Falla no encontrada' };
    return { data: f };
  }

  if (url.pathname.startsWith('/failures/') && method === 'PATCH') {
    const id = url.pathname.split('/')[2];
    const all = getStore<Falla[]>('mock_fallas', []);
    const idx = all.findIndex(x => x.id === id);
    if (idx === -1) return { error: 'Falla no encontrada' };
    all[idx] = { ...all[idx], ...body, updated_at: new Date().toISOString() };
    setStore('mock_fallas', all);
    return { data: all[idx] };
  }

  if (url.pathname.startsWith('/failures/') && method === 'DELETE') {
    const id = url.pathname.split('/')[2];
    const all = getStore<Falla[]>('mock_fallas', []);
    const idx = all.findIndex(x => x.id === id);
    if (idx === -1) return { error: 'Falla no encontrada' };
    all[idx].activo = false; all[idx].updated_at = new Date().toISOString();
    setStore('mock_fallas', all);
    return { data: all[idx] };
  }

  if (url.pathname === '/failures/assign' && method === 'POST') {
    const { orden_id, falla_ids } = body || {};
    if (!orden_id || !Array.isArray(falla_ids)) return { error: 'Datos inválidos' };
    let of = getStore<any[]>('mock_orden_fallas', []);
    of = of.filter(x => x.orden_id !== orden_id);
    const now = new Date().toISOString();
    falla_ids.forEach((fid: string) => of.push({ orden_id, falla_id: fid, creado_en: now }));
    setStore('mock_orden_fallas', of);
    return { message: 'Asociaciones actualizadas' };
  }

  if (url.pathname.startsWith('/failures/by-order/') && method === 'GET') {
    const ordenId = url.pathname.split('/')[3];
    const of = getStore<any[]>('mock_orden_fallas', []);
    const fallas = getStore<Falla[]>('mock_fallas', []);
    const ids = of.filter(x => x.orden_id === ordenId).map(x => x.falla_id);
    const result = fallas.filter(f => ids.includes(f.id));
    return { data: result };
  }

  // ===== PLANTILLAS CHECKLIST =====
  if (url.pathname === '/checklists/plantillas' && method === 'GET') {
    const all = getStore<PlantillaChecklist[]>('mock_plantillas_checklist', []);
    const tipo_equipo = url.searchParams.get('tipo_equipo') || undefined;
    const tipo_orden = url.searchParams.get('tipo_orden') || undefined;
    let filtered = all.filter(p => p.activo !== false);
    if (tipo_equipo) filtered = filtered.filter(p => p.tipo_equipo === tipo_equipo);
    if (tipo_orden) filtered = filtered.filter(p => !p.tipo_orden || p.tipo_orden === tipo_orden);
    return { data: { data: filtered, pagination: { page: 1, limit: filtered.length, total: filtered.length, totalPages: 1 } } };
  }

  if (url.pathname === '/checklists/plantillas' && method === 'POST') {
    const all = getStore<PlantillaChecklist[]>('mock_plantillas_checklist', []);
    const now = new Date().toISOString();
    const nueva: PlantillaChecklist = { id: `tpl-${Date.now()}`, activo: true, created_at: now, updated_at: now, ...body };
    all.push(nueva);
    setStore('mock_plantillas_checklist', all);
    return { data: nueva };
  }

  if (url.pathname.startsWith('/checklists/plantillas/') && method === 'GET') {
    const id = url.pathname.split('/')[3];
    const all = getStore<PlantillaChecklist[]>('mock_plantillas_checklist', []);
    const p = all.find(x => x.id === id);
    if (!p) return { error: 'Plantilla no encontrada' };
    return { data: p };
  }

  if (url.pathname.startsWith('/checklists/plantillas/') && method === 'PATCH') {
    const id = url.pathname.split('/')[3];
    const all = getStore<PlantillaChecklist[]>('mock_plantillas_checklist', []);
    const idx = all.findIndex(x => x.id === id);
    if (idx === -1) return { error: 'Plantilla no encontrada' };
    all[idx] = { ...all[idx], ...body, updated_at: new Date().toISOString() };
    setStore('mock_plantillas_checklist', all);
    return { data: all[idx] };
  }

  if (url.pathname.startsWith('/checklists/plantillas/') && method === 'DELETE') {
    const id = url.pathname.split('/')[3];
    const all = getStore<PlantillaChecklist[]>('mock_plantillas_checklist', []);
    const idx = all.findIndex(x => x.id === id);
    if (idx === -1) return { error: 'Plantilla no encontrada' };
    all[idx].activo = false; all[idx].updated_at = new Date().toISOString();
    setStore('mock_plantillas_checklist', all);
    return { data: all[idx] };
  }

  // ===== CHECKLISTS DE ORDEN =====
  if (url.pathname.startsWith('/checklists/orden/') && method === 'GET') {
    const ordenId = url.pathname.split('/')[3];
    const all = getStore<ChecklistOrden[]>('mock_checklists_orden', []);
    const ch = all.find(x => x.orden_id === ordenId);
    if (!ch) return { error: 'Checklist no encontrado' };
    return { data: ch };
  }

  if (url.pathname === '/checklists/orden' && method === 'POST') {
    const all = getStore<ChecklistOrden[]>('mock_checklists_orden', []);
    const now = new Date().toISOString();
    const nuevo: ChecklistOrden = { 
      id: `ch-${Date.now()}`, 
      completado: false, 
      porcentaje_completado: 0,
      items_verificados: [],
      created_at: now, 
      updated_at: now, 
      ...body 
    };
    all.push(nuevo);
    setStore('mock_checklists_orden', all);
    return { data: nuevo };
  }

  if (url.pathname.startsWith('/checklists/orden/') && method === 'PATCH') {
    const ordenId = url.pathname.split('/')[3];
    const all = getStore<ChecklistOrden[]>('mock_checklists_orden', []);
    const idx = all.findIndex(x => x.orden_id === ordenId);
    if (idx === -1) return { error: 'Checklist no encontrado' };
    all[idx] = { ...all[idx], ...body, updated_at: new Date().toISOString() };
    setStore('mock_checklists_orden', all);
    return { data: all[idx] };
  }

  // ===== COSTOS DE ORDEN =====
  if (url.pathname.startsWith('/costos/orden/') && method === 'GET') {
    const ordenId = url.pathname.split('/')[3];
    const all = getStore<CostosOrden[]>('mock_costos_orden', []);
    const c = all.find(x => x.orden_id === ordenId);
    if (!c) return { error: 'Costos no encontrados' };
    return { data: c };
  }

  if (url.pathname === '/costos/orden' && method === 'POST') {
    const all = getStore<CostosOrden[]>('mock_costos_orden', []);
    const now = new Date().toISOString();
    const nuevo: CostosOrden = { 
      id: `cost-${Date.now()}`,
      aprobado: false,
      diferencia: 0,
      porcentaje_variacion: 0,
      rentabilidad: 0,
      estimado: { items: [], subtotal: 0, iva_total: 0, total: 0 },
      real: { items: [], subtotal: 0, iva_total: 0, total: 0 },
      created_at: now, 
      updated_at: now, 
      ...body 
    };
    all.push(nuevo);
    setStore('mock_costos_orden', all);
    return { data: nuevo };
  }

  if (url.pathname.startsWith('/costos/orden/') && method === 'PATCH') {
    const ordenId = url.pathname.split('/')[3];
    const all = getStore<CostosOrden[]>('mock_costos_orden', []);
    const idx = all.findIndex(x => x.orden_id === ordenId);
    if (idx === -1) return { error: 'Costos no encontrados' };
    all[idx] = { ...all[idx], ...body, updated_at: new Date().toISOString() };
    setStore('mock_costos_orden', all);
    return { data: all[idx] };
  }

  // Fallback: no mock implementado
  return { error: `Mock no implementado para ${method} ${url.pathname}` };
}
