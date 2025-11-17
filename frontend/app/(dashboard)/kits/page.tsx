// app/kits/page.tsx
'use client';

// ============================================================================
// IMPORTS
// ============================================================================
import { useState } from 'react';
import { useKits } from '@/lib/hooks/useKits';
import { KitCard } from '@/components/kits/KitCard';
import { KitModal } from '@/components/kits/KitModal';

// Universal Components
import { PageContainer } from '@/components/patterns/PageContainer';
import { PageHeader } from '@/components/patterns/PageHeader';
import { StatsCard } from '@/components/patterns/StatsCard';
import { FormCard } from '@/components/patterns/FormCard';
import { LoadingState } from '@/components/patterns/LoadingState';
import { ErrorState } from '@/components/patterns/ErrorState';
import { EmptyState } from '@/components/patterns/EmptyState';

// UI Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

// Types & Icons
import type { Kit } from '@/lib/types/kit';
import {
  Package,
  Wrench,
  HardHat,
  Filter,
  Plus,
  Sparkles,
  Search,
  Activity,
  X,
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================
const CATEGORY_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'ELECTRICIDAD', label: 'Electricidad' },
  { value: 'INSTRUMENTACION', label: 'Instrumentación' },
  { value: 'MECANICA', label: 'Mecánica' },
  { value: 'CIVIL', label: 'Civil' },
  { value: 'SEGURIDAD', label: 'Seguridad' },
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function KitsPage() {
  // ------------------------------------
  // Hooks & State
  // ------------------------------------
  const { data: kits = [], isLoading, error } = useKits();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create' | null>(null);

  // ------------------------------------
  // Computed Values
  // ------------------------------------
  const filteredKits = kits.filter((kit) => {
    const matchesSearch =
      kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || kit.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    {
      label: 'Kits Totales',
      value: kits.length,
      icon: Package,
      bgColor: 'bg-primary-50 dark:bg-primary-950',
      iconColor: 'text-primary-600 dark:text-primary-400',
      borderColor: 'border-primary-200 dark:border-primary-800',
    },
    {
      label: 'Filtrados',
      value: filteredKits.length,
      icon: Filter,
      bgColor: 'bg-secondary-50 dark:bg-secondary-950',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      borderColor: 'border-secondary-200 dark:border-secondary-800',
    },
    {
      label: 'Herramientas',
      value: kits.reduce((sum, k) => sum + k.tools.length, 0),
      icon: Wrench,
      bgColor: 'bg-warning-50 dark:bg-warning-950',
      iconColor: 'text-warning-600 dark:text-warning-400',
      borderColor: 'border-warning-200 dark:border-warning-800',
    },
    {
      label: 'Equipos',
      value: kits.reduce((sum, k) => sum + k.equipment.length, 0),
      icon: HardHat,
      bgColor: 'bg-info-50 dark:bg-info-950',
      iconColor: 'text-info-600 dark:text-info-400',
      borderColor: 'border-info-200 dark:border-info-800',
    },
  ];

  // ------------------------------------
  // Event Handlers
  // ------------------------------------
  const handleCreate = () => {
    setSelectedKit(null);
    setModalMode('create');
  };

  const handleEdit = (kit: Kit) => {
    setSelectedKit(kit);
    setModalMode('edit');
  };

  const handleView = (kit: Kit) => {
    setSelectedKit(kit);
    setModalMode('view');
  };

  const handleCloseModal = () => {
    setSelectedKit(null);
    setModalMode(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // ------------------------------------
  // Loading State
  // ------------------------------------
  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <LoadingState message="Cargando kits..." subMessage="Sincronizando catálogo" />
      </PageContainer>
    );
  }

  // ------------------------------------
  // Error State
  // ------------------------------------
  if (error) {
    return (
      <PageContainer className="flex items-center justify-center">
        <ErrorState
          title="Error al cargar los kits"
          message={error.message}
          action={{
            label: 'Reintentar',
            onClick: () => window.location.reload(),
          }}
        />
      </PageContainer>
    );
  }

  // ------------------------------------
  // Main Content
  // ------------------------------------
  return (
    <PageContainer>
      <div className="space-y-8 animate-fade-in">
        {/* ========================================
            SECTION: Page Header
        ========================================== */}
        <PageHeader
          icon={Package}
          title="Kits Típicos"
          description="Gestiona los kits estándar de herramientas, equipos y documentos organizados por tipo de actividad industrial"
          badge={{ text: 'Gestión de Kits', variant: 'primary' }}
          action={
            <Button
              variant="primary"
              onClick={handleCreate}
              className="group flex items-center gap-2 shadow-xl"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              Crear Kit
            </Button>
          }
        />

        {/* ========================================
            SECTION: Stats Grid
        ========================================== */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <StatsCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                bgColor={stat.bgColor}
                iconColor={stat.iconColor}
                borderColor={stat.borderColor}
              />
            </div>
          ))}
        </div>

        {/* ========================================
            SECTION: Filters
        ========================================== */}
        <FormCard title="Buscar y Filtrar" icon={Sparkles}>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Search Input */}
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>
                <Input
                  label=""
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-12"
                />
              </div>

              {/* Category Filter */}
              <div className="w-full md:w-64">
                <Select
                  label=""
                  options={CATEGORY_OPTIONS}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Active Filters Badge */}
            {(searchTerm || categoryFilter) && (
              <div className="animate-slide-up flex items-center gap-3 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-800">
                <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Mostrando {filteredKits.length} de {kits.length} kits
                </span>
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-2 font-bold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
                >
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </FormCard>

        {/* ========================================
            SECTION: Kits Grid
        ========================================== */}
        {filteredKits.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredKits.map((kit, i) => (
              <div
                key={kit.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <KitCard kit={kit} onEdit={handleEdit} onView={handleView} />
              </div>
            ))}
          </div>
        ) : (
          /* ========================================
              SECTION: Empty State
          ========================================== */
          <EmptyState
            icon={Package}
            title={
              searchTerm || categoryFilter ? 'No se encontraron kits' : 'No hay kits disponibles'
            }
            description={
              searchTerm || categoryFilter
                ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que necesitas'
                : 'Crea tu primer kit típico para comenzar a organizar herramientas y equipos por tipo de actividad'
            }
            action={
              !searchTerm && !categoryFilter
                ? {
                    label: 'Crear Primer Kit',
                    onClick: handleCreate,
                    icon: Plus,
                  }
                : undefined
            }
          />
        )}

        {/* ========================================
            SECTION: Modal
        ========================================== */}
        {modalMode && (
          <KitModal
            kit={selectedKit}
            mode={modalMode}
            isOpen={!!modalMode}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </PageContainer>
  );
}





