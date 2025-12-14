'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Wrench, 
  Plus, 
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Bell
} from 'lucide-react';
import Link from 'next/link';

// ============================================
// TYPES
// ============================================

export type TipoMantenimiento = 'PREVENTIVO' | 'CORRECTIVO' | 'PREDICTIVO' | 'EMERGENCIA';
export type EstadoMantenimiento = 'PROGRAMADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO' | 'VENCIDO';

export interface Mantenimiento {
  id: string;
  equipoId: string;
  equipoNombre: string;
  equipoNumero: string;
  tipo: TipoMantenimiento;
  estado: EstadoMantenimiento;
  titulo: string;
  descripcion: string;
  fechaProgramada: string;
  fechaEjecucion?: string;
  frecuenciaDias?: number;
  proximoMantenimiento?: string;
  responsableId?: string;
  responsableNombre?: string;
  ordenId?: string;
  observaciones?: string;
  checklist?: {
    item: string;
    completado: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface MantenimientosPageProps {
  equipoId?: string;
}

// ============================================
// MOCK DATA (En producción vendrá del API)
// ============================================

const MOCK_MANTENIMIENTOS: Mantenimiento[] = [
  {
    id: 'mant-1',
    equipoId: 'equipo-1',
    equipoNombre: 'Torre de Telecomunicaciones T-15',
    equipoNumero: 'T-15',
    tipo: 'PREVENTIVO',
    estado: 'PROGRAMADO',
    titulo: 'Inspección mensual de estructura',
    descripcion: 'Verificación de soldaduras, tornillería y estado general',
    fechaProgramada: '2024-12-10',
    frecuenciaDias: 30,
    proximoMantenimiento: '2025-01-10',
    responsableNombre: 'Carlos Rodríguez',
    createdAt: '2024-11-10T10:00:00Z',
    updatedAt: '2024-11-10T10:00:00Z',
  },
  {
    id: 'mant-2',
    equipoId: 'equipo-2',
    equipoNombre: 'Arnés de Seguridad AS-001',
    equipoNumero: 'AS-001',
    tipo: 'PREVENTIVO',
    estado: 'VENCIDO',
    titulo: 'Inspección semestral EPP',
    descripcion: 'Revisión de costuras, hebillas y estado de cintas',
    fechaProgramada: '2024-12-01',
    frecuenciaDias: 180,
    responsableNombre: 'Ana García',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'mant-3',
    equipoId: 'equipo-3',
    equipoNombre: 'Línea de Vida LV-003',
    equipoNumero: 'LV-003',
    tipo: 'CORRECTIVO',
    estado: 'EN_PROGRESO',
    titulo: 'Reparación de tensor',
    descripcion: 'Reemplazo de tensor inferior por desgaste',
    fechaProgramada: '2024-12-08',
    fechaEjecucion: '2024-12-08',
    responsableNombre: 'Pedro Martínez',
    ordenId: 'OT-2024-005',
    createdAt: '2024-12-07T14:00:00Z',
    updatedAt: '2024-12-08T09:00:00Z',
  },
  {
    id: 'mant-4',
    equipoId: 'equipo-4',
    equipoNombre: 'Camioneta CLM-001',
    equipoNumero: 'CLM-001',
    tipo: 'PREVENTIVO',
    estado: 'COMPLETADO',
    titulo: 'Cambio de aceite y filtros',
    descripcion: 'Mantenimiento rutinario cada 5000 km',
    fechaProgramada: '2024-12-05',
    fechaEjecucion: '2024-12-05',
    frecuenciaDias: 90,
    proximoMantenimiento: '2025-03-05',
    responsableNombre: 'Juan López',
    createdAt: '2024-09-05T10:00:00Z',
    updatedAt: '2024-12-05T16:00:00Z',
  },
];

// ============================================
// COMPONENT
// ============================================

export default function MantenimientosPage({ equipoId }: MantenimientosPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [, setShowNuevoModal] = useState(false);

  // En producción, usar API real
  const { data: mantenimientos = MOCK_MANTENIMIENTOS, isLoading: _isLoading } = useQuery({
    queryKey: ['mantenimientos', equipoId, filterTipo, filterEstado],
    queryFn: async () => {
      // const params = new URLSearchParams();
      // if (equipoId) params.append('equipoId', equipoId);
      // if (filterTipo) params.append('tipo', filterTipo);
      // if (filterEstado) params.append('estado', filterEstado);
      // const res = await apiClient.get(`/mantenimientos?${params}`);
      // return res.data;
      return MOCK_MANTENIMIENTOS;
    },
  });

  // Filtrar mantenimientos
  const filteredMantenimientos = useMemo(() => {
    return mantenimientos.filter(m => {
      const matchSearch = m.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.equipoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.equipoNumero.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = !filterTipo || m.tipo === filterTipo;
      const matchEstado = !filterEstado || m.estado === filterEstado;
      return matchSearch && matchTipo && matchEstado;
    });
  }, [mantenimientos, searchTerm, filterTipo, filterEstado]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = mantenimientos.length;
    const programados = mantenimientos.filter(m => m.estado === 'PROGRAMADO').length;
    const enProgreso = mantenimientos.filter(m => m.estado === 'EN_PROGRESO').length;
    const completados = mantenimientos.filter(m => m.estado === 'COMPLETADO').length;
    const vencidos = mantenimientos.filter(m => m.estado === 'VENCIDO').length;
    return { total, programados, enProgreso, completados, vencidos };
  }, [mantenimientos]);

  // Próximos 7 días
  const proximosSieteDias = useMemo(() => {
    const hoy = new Date();
    const enSieteDias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    return mantenimientos.filter(m => {
      if (m.estado !== 'PROGRAMADO') return false;
      const fecha = new Date(m.fechaProgramada);
      return fecha >= hoy && fecha <= enSieteDias;
    });
  }, [mantenimientos]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-7 h-7 text-blue-600" />
            Control de Mantenimientos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestión de mantenimientos preventivos, correctivos y predictivos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 shadow'
                  : 'text-gray-500'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 shadow'
                  : 'text-gray-500'
              }`}
            >
              Calendario
            </button>
          </div>
          <button
            onClick={() => setShowNuevoModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo Mantenimiento
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.programados}</p>
              <p className="text-xs text-gray-500">Programados</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enProgreso}</p>
              <p className="text-xs text-gray-500">En Progreso</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completados}</p>
              <p className="text-xs text-gray-500">Completados</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.vencidos}</p>
              <p className="text-xs text-gray-500">Vencidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de próximos mantenimientos */}
      {proximosSieteDias.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              Próximos 7 días ({proximosSieteDias.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {proximosSieteDias.map(m => (
              <div 
                key={m.id}
                className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border text-sm"
              >
                <span className="font-medium">{m.equipoNumero}</span>
                <span className="text-gray-500 mx-2">•</span>
                <span>{new Date(m.fechaProgramada).toLocaleDateString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por equipo o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Todos los tipos</option>
          <option value="PREVENTIVO">Preventivo</option>
          <option value="CORRECTIVO">Correctivo</option>
          <option value="PREDICTIVO">Predictivo</option>
          <option value="EMERGENCIA">Emergencia</option>
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Todos los estados</option>
          <option value="PROGRAMADO">Programado</option>
          <option value="EN_PROGRESO">En Progreso</option>
          <option value="COMPLETADO">Completado</option>
          <option value="VENCIDO">Vencido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {/* Vista Lista */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Equipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mantenimiento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Responsable</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMantenimientos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No se encontraron mantenimientos
                    </td>
                  </tr>
                ) : (
                  filteredMantenimientos.map(mant => (
                    <tr key={mant.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{mant.equipoNumero}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{mant.equipoNombre}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-white">{mant.titulo}</p>
                        {mant.ordenId && (
                          <span className="text-xs text-blue-600">{mant.ordenId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getTipoColor(mant.tipo)}`}>
                          {mant.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(mant.fechaProgramada).toLocaleDateString('es-CO')}
                        </p>
                        {mant.frecuenciaDias && (
                          <p className="text-xs text-gray-500">Cada {mant.frecuenciaDias} días</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getEstadoColor(mant.estado)}`}>
                          {getEstadoIcon(mant.estado)}
                          {mant.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {mant.responsableNombre || 'Sin asignar'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/mantenimientos/${mant.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista Calendario */}
      {viewMode === 'calendar' && (
        <CalendarView 
          mantenimientos={filteredMantenimientos}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      )}
    </div>
  );
}

// ============================================
// CALENDAR VIEW COMPONENT
// ============================================

interface CalendarViewProps {
  mantenimientos: Mantenimiento[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

function CalendarView({ mantenimientos, currentMonth, onMonthChange }: CalendarViewProps) {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getMantenimientosByDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return mantenimientos.filter(m => m.fechaProgramada.startsWith(dateStr));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 dark:bg-gray-900" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayMantenimientos = getMantenimientosByDate(day);
    const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

    days.push(
      <div
        key={day}
        className={`h-24 border-t p-1 ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      >
        <p className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
          {day}
        </p>
        <div className="space-y-0.5">
          {dayMantenimientos.slice(0, 2).map(m => (
            <div
              key={m.id}
              className={`text-xs px-1 py-0.5 rounded truncate ${getEstadoColor(m.estado)}`}
            >
              {m.equipoNumero}
            </div>
          ))}
          {dayMantenimientos.length > 2 && (
            <p className="text-xs text-gray-500">+{dayMantenimientos.length - 2} más</p>
          )}
        </div>
      </div>
    );
  }

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
      {/* Header del calendario */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-xs font-semibold text-gray-500 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7">
        {days}
      </div>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function getTipoColor(tipo: TipoMantenimiento): string {
  const colors: Record<TipoMantenimiento, string> = {
    PREVENTIVO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CORRECTIVO: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    PREDICTIVO: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    EMERGENCIA: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[tipo] || 'bg-gray-100 text-gray-700';
}

function getEstadoColor(estado: EstadoMantenimiento): string {
  const colors: Record<EstadoMantenimiento, string> = {
    PROGRAMADO: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    EN_PROGRESO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETADO: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CANCELADO: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    VENCIDO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[estado] || 'bg-gray-100 text-gray-700';
}

function getEstadoIcon(estado: EstadoMantenimiento) {
  switch (estado) {
    case 'PROGRAMADO': return <Clock className="w-3 h-3" />;
    case 'EN_PROGRESO': return <Settings className="w-3 h-3" />;
    case 'COMPLETADO': return <CheckCircle className="w-3 h-3" />;
    case 'CANCELADO': return <XCircle className="w-3 h-3" />;
    case 'VENCIDO': return <AlertTriangle className="w-3 h-3" />;
    default: return null;
  }
}
