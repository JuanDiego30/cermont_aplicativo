import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const FALLAS_PATH = path.join(__dirname, '../../data/fallas.json');
const ORDEN_FALLAS_PATH = path.join(__dirname, '../../data/orden_fallas.json');

function readJson(filePath: string): any[] {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function writeJson(filePath: string, data: any[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Listar fallas con filtros
router.get('/', (req, res) => {
  let fallas = readJson(FALLAS_PATH);
  const { tipo_equipo, severidad, search } = req.query;
  if (tipo_equipo) fallas = fallas.filter((f: any) => f.tipo_equipo === tipo_equipo);
  if (severidad) fallas = fallas.filter((f: any) => f.severidad === severidad);
  if (search) {
    const s = String(search).toLowerCase();
    fallas = fallas.filter((f: any) => f.nombre.toLowerCase().includes(s) || f.codigo.toLowerCase().includes(s));
  }
  res.json(fallas.filter((f: any) => f.activo !== false));
});

// Obtener una falla por id
router.get('/:id', (req, res) => {
  const fallas = readJson(FALLAS_PATH);
  const falla = fallas.find((f: any) => f.id === req.params.id);
  if (!falla) return res.status(404).json({ error: 'Falla no encontrada' });
  res.json(falla);
});

// Crear una nueva falla
router.post('/', (req, res) => {
  const fallas = readJson(FALLAS_PATH);
  const { codigo, nombre, tipo_equipo, severidad, descripcion, causas_probables, acciones_sugeridas } = req.body;
  if (fallas.some((f: any) => f.codigo === codigo)) {
    return res.status(400).json({ error: 'Código de falla ya existe' });
  }
  const id = String(Date.now());
  const now = new Date().toISOString();
  const nuevaFalla = {
    id,
    codigo,
    nombre,
    tipo_equipo,
    severidad,
    descripcion,
    causas_probables,
    acciones_sugeridas,
    activo: true,
    created_at: now,
    updated_at: now
  };
  fallas.push(nuevaFalla);
  writeJson(FALLAS_PATH, fallas);
  res.status(201).json(nuevaFalla);
});

// Editar una falla
router.patch('/:id', (req, res) => {
  const fallas = readJson(FALLAS_PATH);
  const idx = fallas.findIndex((f: any) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Falla no encontrada' });
  const now = new Date().toISOString();
  fallas[idx] = { ...fallas[idx], ...req.body, updated_at: now };
  writeJson(FALLAS_PATH, fallas);
  res.json(fallas[idx]);
});

// Eliminar (soft delete) una falla
router.delete('/:id', (req, res) => {
  const fallas = readJson(FALLAS_PATH);
  const idx = fallas.findIndex((f: any) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Falla no encontrada' });
  fallas[idx].activo = false;
  fallas[idx].updated_at = new Date().toISOString();
  writeJson(FALLAS_PATH, fallas);
  res.json({ success: true });
});

// Asociar fallas a una orden
router.post('/assign', (req, res) => {
  const { orden_id, falla_ids } = req.body;
  if (!orden_id || !Array.isArray(falla_ids)) return res.status(400).json({ error: 'Datos inválidos' });
  let ordenFallas = readJson(ORDEN_FALLAS_PATH);
  const now = new Date().toISOString();
  // Elimina asociaciones previas de esa orden
  ordenFallas = ordenFallas.filter((of: any) => of.orden_id !== orden_id);
  // Agrega nuevas asociaciones
  falla_ids.forEach(falla_id => {
    ordenFallas.push({ orden_id, falla_id, creado_en: now });
  });
  writeJson(ORDEN_FALLAS_PATH, ordenFallas);
  res.json({ success: true });
});

// Listar fallas por orden
router.get('/by-order/:ordenId', (req, res) => {
  const ordenFallas = readJson(ORDEN_FALLAS_PATH);
  const fallas = readJson(FALLAS_PATH);
  const ids = ordenFallas.filter((of: any) => of.orden_id === req.params.ordenId).map((of: any) => of.falla_id);
  const result = fallas.filter((f: any) => ids.includes(f.id));
  res.json(result);
});

export default router;
