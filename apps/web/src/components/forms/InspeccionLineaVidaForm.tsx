/**
 * ARCHIVO: InspeccionLineaVidaForm.tsx
 * FUNCION: Formulario de inspección de líneas de vida vertical según formato OPE-006
 * IMPLEMENTACION: Evaluación de componentes con condiciones C/NC, cálculo automático de estado general
 * DEPENDENCIAS: Button, Input, Textarea, Card, Badge (UI), useCallback para optimización
 * EXPORTS: InspeccionLineaVidaForm, InspeccionLineaVidaFormData, ComponenteLineaVida (tipos)
 */
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Tipos para la inspección
export type EstadoCondicion = 'C' | 'NC';
export type EstadoInspeccion = 'CONFORME' | 'NO_CONFORME' | 'PENDIENTE';

export interface CondicionComponente {
  tipoAfeccion: string;
  descripcion: string;
  estado: EstadoCondicion;
}

export interface ComponenteLineaVida {
  nombre: string;
  condiciones: CondicionComponente[];
  hallazgos: string;
  estado: EstadoCondicion;
  accionCorrectiva: string;
}

export interface InspeccionLineaVidaFormData {
  numeroLinea: string;
  fabricante: string;
  diametroCable: string;
  tipoCable: string;
  ubicacion: string;
  fechaInstalacion?: string;
  fechaUltimoMantenimiento?: string;
  componentes: ComponenteLineaVida[];
  accionesCorrectivas: string;
  observaciones: string;
  fotosEvidencia: string[];
}

interface InspeccionLineaVidaFormProps {
  initialData?: Partial<InspeccionLineaVidaFormData>;
  onSubmit: (data: InspeccionLineaVidaFormData) => Promise<void>;
  isLoading?: boolean;
}

// Componentes estándar según formato OPE-006
const COMPONENTES_LINEA_VIDA = [
  { nombre: 'PLACA_ANCLAJE_SUPERIOR', label: 'Placa de Anclaje Superior' },
  { nombre: 'PLACA_ANCLAJE_INFERIOR', label: 'Placa de Anclaje Inferior' },
  { nombre: 'CABLE_PRINCIPAL', label: 'Cable Principal' },
  { nombre: 'TENSOR_INFERIOR', label: 'Tensor Inferior' },
  { nombre: 'CARRETILLA_ARRESTADOR', label: 'Carretilla/Arrestador de Caídas' },
  { nombre: 'ABSORBEDOR_ENERGIA', label: 'Absorbedor de Energía' },
  { nombre: 'PASACABLES_INTERMEDIOS', label: 'Pasacables Intermedios' },
];

// Condiciones a evaluar por componente
const CONDICIONES = [
  { tipo: 'GRIETAS', descripcion: 'Grietas o fisuras visibles' },
  { tipo: 'CORROSION', descripcion: 'Signos de corrosión u oxidación' },
  { tipo: 'DESGASTE', descripcion: 'Desgaste excesivo' },
  { tipo: 'DEFORMACION', descripcion: 'Deformación o pandeo' },
  { tipo: 'SOLDADURAS', descripcion: 'Estado de soldaduras' },
  { tipo: 'ANCLAJE', descripcion: 'Firmeza del anclaje' },
  { tipo: 'ROTULADO', descripcion: 'Rotulado/marcado legible' },
  { tipo: 'CABLES', descripcion: 'Estado de cables (hilos rotos, nudos)' },
  { tipo: 'CONECTORES', descripcion: 'Estado de conectores y mosquetones' },
  { tipo: 'MECANISMO', descripcion: 'Funcionamiento del mecanismo' },
];

// Inicializar componentes con condiciones
const initializeComponentes = (): ComponenteLineaVida[] => {
  return COMPONENTES_LINEA_VIDA.map(comp => ({
    nombre: comp.nombre,
    estado: 'C' as EstadoCondicion,
    hallazgos: '',
    accionCorrectiva: '',
    condiciones: CONDICIONES.map(cond => ({
      tipoAfeccion: cond.tipo,
      descripcion: cond.descripcion,
      estado: 'C' as EstadoCondicion,
    })),
  }));
};

export function InspeccionLineaVidaForm({
  initialData,
  onSubmit,
  isLoading,
}: InspeccionLineaVidaFormProps) {
  const [formData, setFormData] = useState<InspeccionLineaVidaFormData>({
    numeroLinea: initialData?.numeroLinea || '',
    fabricante: initialData?.fabricante || '',
    diametroCable: initialData?.diametroCable || '8mm',
    tipoCable: initialData?.tipoCable || 'Acero Inoxidable',
    ubicacion: initialData?.ubicacion || '',
    fechaInstalacion: initialData?.fechaInstalacion || '',
    fechaUltimoMantenimiento: initialData?.fechaUltimoMantenimiento || '',
    componentes: initialData?.componentes || initializeComponentes(),
    accionesCorrectivas: initialData?.accionesCorrectivas || '',
    observaciones: initialData?.observaciones || '',
    fotosEvidencia: initialData?.fotosEvidencia || [],
  });

  const [error, setError] = useState('');
  const [activeComponente, setActiveComponente] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.numeroLinea.trim()) {
      setError('El número de línea es requerido');
      return;
    }

    if (!formData.fabricante.trim()) {
      setError('El fabricante es requerido');
      return;
    }

    if (!formData.ubicacion.trim()) {
      setError('La ubicación es requerida');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar la inspección';
      setError(errorMessage);
    }
  };

  // Toggle de condición (C/NC)
  const toggleCondicion = useCallback((componenteIndex: number, condicionIndex: number) => {
    setFormData(prev => {
      const newComponentes = [...prev.componentes];
      const componente = { ...newComponentes[componenteIndex] };
      const condiciones = [...componente.condiciones];
      condiciones[condicionIndex] = {
        ...condiciones[condicionIndex],
        estado: condiciones[condicionIndex].estado === 'C' ? 'NC' : 'C',
      };
      componente.condiciones = condiciones;
      
      // Actualizar estado del componente basado en condiciones
      componente.estado = condiciones.some(c => c.estado === 'NC') ? 'NC' : 'C';
      
      newComponentes[componenteIndex] = componente;
      return { ...prev, componentes: newComponentes };
    });
  }, []);

  // Actualizar hallazgos de componente
  const updateHallazgos = useCallback((index: number, hallazgos: string) => {
    setFormData(prev => {
      const newComponentes = [...prev.componentes];
      newComponentes[index] = { ...newComponentes[index], hallazgos };
      return { ...prev, componentes: newComponentes };
    });
  }, []);

  // Actualizar acción correctiva de componente
  const updateAccionCorrectiva = useCallback((index: number, accionCorrectiva: string) => {
    setFormData(prev => {
      const newComponentes = [...prev.componentes];
      newComponentes[index] = { ...newComponentes[index], accionCorrectiva };
      return { ...prev, componentes: newComponentes };
    });
  }, []);

  // Calcular estado general
  const estadoGeneral = formData.componentes.some(c => c.estado === 'NC') 
    ? 'NO_CONFORME' 
    : 'CONFORME';

  const conformes = formData.componentes.filter(c => c.estado === 'C').length;
  const noConformes = formData.componentes.filter(c => c.estado === 'NC').length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Inspección Línea de Vida Vertical (OPE-006)
          </h2>
          <Badge variant={estadoGeneral === 'CONFORME' ? 'success' : 'destructive'}>
            {estadoGeneral}
          </Badge>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Datos de la línea */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Número de Línea *
            </label>
            <Input
              value={formData.numeroLinea}
              onChange={(e) => setFormData({ ...formData, numeroLinea: e.target.value })}
              placeholder="Ej: LV-001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Fabricante *
            </label>
            <Input
              value={formData.fabricante}
              onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
              placeholder="Nombre del fabricante"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Ubicación *
            </label>
            <Input
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Ubicación de la línea"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Diámetro del Cable
            </label>
            <Input
              value={formData.diametroCable}
              onChange={(e) => setFormData({ ...formData, diametroCable: e.target.value })}
              placeholder="8mm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de Cable
            </label>
            <Input
              value={formData.tipoCable}
              onChange={(e) => setFormData({ ...formData, tipoCable: e.target.value })}
              placeholder="Acero Inoxidable"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de Instalación
            </label>
            <Input
              type="date"
              value={formData.fechaInstalacion}
              onChange={(e) => setFormData({ ...formData, fechaInstalacion: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Navegación de componentes */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Evaluación de Componentes</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {COMPONENTES_LINEA_VIDA.map((comp, index) => {
            const componente = formData.componentes[index];
            return (
              <button
                key={comp.nombre}
                type="button"
                onClick={() => setActiveComponente(index)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeComponente === index
                    ? 'ring-2 ring-offset-2 ring-blue-500'
                    : ''
                } ${
                  componente?.estado === 'NC'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {comp.label.split(' ').slice(0, 2).join(' ')}
                <span className="ml-1">
                  {componente?.estado === 'C' ? '✓' : '✗'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detalle del componente activo */}
        {formData.componentes[activeComponente] && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">
                {COMPONENTES_LINEA_VIDA[activeComponente]?.label}
              </h4>
              <Badge variant={formData.componentes[activeComponente].estado === 'C' ? 'success' : 'destructive'}>
                {formData.componentes[activeComponente].estado === 'C' ? 'CONFORME' : 'NO CONFORME'}
              </Badge>
            </div>

            {/* Grid de condiciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {formData.componentes[activeComponente].condiciones.map((cond, condIndex) => (
                <div
                  key={cond.tipoAfeccion}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-sm">{cond.tipoAfeccion}</span>
                    <p className="text-xs text-gray-500">{cond.descripcion}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCondicion(activeComponente, condIndex)}
                    className={`w-12 h-8 rounded-md font-bold text-sm transition-colors ${
                      cond.estado === 'C'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {cond.estado}
                  </button>
                </div>
              ))}
            </div>

            {/* Hallazgos y acciones correctivas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hallazgos
                </label>
                <Textarea
                  value={formData.componentes[activeComponente].hallazgos}
                  onChange={(e) => updateHallazgos(activeComponente, e.target.value)}
                  placeholder="Describa los hallazgos encontrados"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Acción Correctiva
                </label>
                <Textarea
                  value={formData.componentes[activeComponente].accionCorrectiva}
                  onChange={(e) => updateAccionCorrectiva(activeComponente, e.target.value)}
                  placeholder="Acciones correctivas requeridas"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Observaciones generales */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Acciones Correctivas Generales
            </label>
            <Textarea
              value={formData.accionesCorrectivas}
              onChange={(e) => setFormData({ ...formData, accionesCorrectivas: e.target.value })}
              placeholder="Acciones correctivas generales requeridas"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Observaciones
            </label>
            <Textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Observaciones adicionales"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Resumen y acciones */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Badge variant="success">
              Conformes: {conformes}/{formData.componentes.length}
            </Badge>
            <Badge variant="destructive">
              No Conformes: {noConformes}/{formData.componentes.length}
            </Badge>
            <span className="text-sm text-gray-500">
              Conformidad: {Math.round((conformes / formData.componentes.length) * 100)}%
            </span>
          </div>
          <Button type="submit" disabled={isLoading} variant="default">
            {isLoading ? 'Guardando...' : 'Guardar Inspección'}
          </Button>
        </div>
      </Card>
    </form>
  );
}

export default InspeccionLineaVidaForm;
